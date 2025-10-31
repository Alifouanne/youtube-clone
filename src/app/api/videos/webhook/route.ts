// Imports required for database interaction, data schema for videos, Mux integration library, webhook event types from Mux, query builder, and utility for getting HTTP headers.
import { db } from "@/database";
import { videoTable } from "@/database/schema";
import { mux } from "@/lib/mux";
import {
  VideoAssetCreatedWebhookEvent,
  VideoAssetDeletedWebhookEvent,
  VideoAssetErroredWebhookEvent,
  VideoAssetReadyWebhookEvent,
  VideoAssetTrackReadyWebhookEvent,
} from "@mux/mux-node/resources/webhooks";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { UTApi } from "uploadthing/server";

// Loads the Mux webhook secret, used to verify incoming webhook signatures.
const SIGNING_SECRET = process.env.Mux_WEBHOOK_SIGNING_SECRET!;

// Union type containing all supported Mux webhook event types handled by this endpoint.
type WebhookEvent =
  | VideoAssetCreatedWebhookEvent
  | VideoAssetErroredWebhookEvent
  | VideoAssetReadyWebhookEvent
  | VideoAssetTrackReadyWebhookEvent
  | VideoAssetDeletedWebhookEvent;

// Handles webhook POST requests from Mux (main API entry point).
export async function POST(req: Request) {
  // Reject if the webhook secret is not configured in environment variables.
  if (!SIGNING_SECRET) {
    return new Response("Mux webhook signing secret not configured", {
      status: 500,
    });
  }

  // Retrieves all HTTP headers from the incoming request.
  const heaadersPayload = await headers();
  // Gets the 'mux-signature' value needed for webhook verification. Mux signs all webhook requests with this header.
  const signature = heaadersPayload.get("mux-signature");

  // Rejects the request if the Mux signature header is missing, preventing unauthorized calls.
  if (!signature) {
    return new Response("Missing Mux signature", { status: 401 });
  }

  // Parses and stringifies the request body payload for signature verification.
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Verifies request authenticity using Mux utilities, signature, and signing secret.
  mux.webhooks.verifySignature(
    body,
    { "mux-signature": signature },
    SIGNING_SECRET
  );

  // Routes the webhook event to the appropriate handler logic based on the received webhook type.
  switch (payload.type as WebhookEvent["type"]) {
    case "video.asset.created": {
      // Handles 'video.asset.created', triggered when a new video asset is created in Mux.
      const data = payload.data as VideoAssetCreatedWebhookEvent["data"];
      // Fails if the required upload ID is missing from the payload.
      if (!data.upload_id) {
        return new Response("Missing upload ID in webhook payload", {
          status: 400,
        });
      }
      // Updates the corresponding video row with the Mux asset ID and current status for tracking.
      await db
        .update(videoTable)
        .set({
          muxAssetId: data.id,
          muxStatus: data.status,
        })
        .where(eq(videoTable.muxUploadId, data.upload_id));
      break;
    }
    case "video.asset.ready": {
      // Processes 'video.asset.ready', indicating a video asset has finished processing and is playable.
      const data = payload.data as VideoAssetReadyWebhookEvent["data"];
      const playbackId = data.playback_ids?.[0].id;
      // Verifies that upload ID and playback ID exist in the payload.
      if (!data.upload_id) {
        return new Response("Missing upload ID in webhook payload", {
          status: 400,
        });
      }
      if (!playbackId) {
        return new Response("Missing playback ID in webhook payload", {
          status: 400,
        });
      }
      // Assembles the video thumbnail and preview image URLs, and calculates duration in milliseconds.
      const tempThumbnailUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg`;
      const tempPreviewUrl = `https://image.mux.com/${playbackId}/animated.gif`;
      const duration = data.duration ? Math.round(data.duration * 1000) : 0;

      //add a way to upload the original preview and url to uploadthing and set the keys and url in db
      const utapi = new UTApi();
      const [uploadedThumbnail, uploadedPreview] =
        await utapi.uploadFilesFromUrl([tempThumbnailUrl, tempPreviewUrl]);

      //check if I got the files uploaded
      if (!uploadedThumbnail.data || !uploadedPreview.data) {
        return new Response(
          "Failed to upload thumbnail or preview to uploadthing",
          { status: 500 }
        );
      }
      //get the keys and data from the uploaded
      const { key: thumbnailKey, ufsUrl: thumbnailUrl } =
        uploadedThumbnail.data;
      const { key: previewKey, ufsUrl: previewUrl } = uploadedPreview.data;

      // Updates the corresponding video entry with playback and asset IDs, thumbnail, preview, and duration.
      await db
        .update(videoTable)
        .set({
          muxStatus: data.status,
          muxAssetId: data.id,
          muxPlaybackId: playbackId,
          thumbnailUrl,
          previewUrl,
          thumbnailKey,
          previewKey,
          duration,
        })
        .where(eq(videoTable.muxUploadId, data.upload_id));
      break;
    }
    case "video.asset.errored": {
      // Handles 'video.asset.errored', when video processing fails in Mux.
      const data = payload.data as VideoAssetErroredWebhookEvent["data"];

      // Ensures required upload ID is present.
      if (!data.upload_id) {
        return new Response("Missing upload ID in webhook payload", {
          status: 400,
        });
      }

      // Marks the muxStatus for the given video as errored.
      await db
        .update(videoTable)
        .set({ muxStatus: data.status })
        .where(eq(videoTable.muxUploadId, data.upload_id));
      break;
    }
    case "video.asset.deleted": {
      // Handles 'video.asset.deleted' webhook, which means the asset was removed from Mux.
      const data = payload.data as VideoAssetDeletedWebhookEvent["data"];
      // Requires the upload ID to match the correct database row.
      if (!data.upload_id) {
        return new Response("Missing upload ID in webhook payload", {
          status: 400,
        });
      }

      // Deletes the associated video row in the database if the upload ID matches.
      await db
        .delete(videoTable)
        .where(eq(videoTable.muxUploadId, data.upload_id));
      break;
    }
    case "video.asset.track.ready": {
      // Handles 'video.asset.track.ready', usually for audio/subtitle tracks becoming available.
      const data = payload.data as VideoAssetTrackReadyWebhookEvent["data"] & {
        asset_id: string;
      };
      // Checks that the asset ID exists before updating video info.
      if (!data.asset_id) {
        return new Response("Missing asset ID in webhook payload", {
          status: 400,
        });
      }

      // Updates the video row with track-specific info like ID and status.
      await db
        .update(videoTable)
        .set({
          muxTrackId: data.id,
          muxTrackState: data.status,
        })
        .where(eq(videoTable.muxAssetId, data.asset_id));
      break;
    }
    // Add additional cases here to support more webhook event types if necessary.
  }

  // Returns a generic successful response after event handling completes.
  return new Response("Webhook processed", { status: 200 });
}

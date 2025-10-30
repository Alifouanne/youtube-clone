/**
 * File upload API routes using UploadThing for handling file uploads in Next.js.
 * This file defines the file router and relevant handlers/middleware for thumbnail uploads.
 */

import { db } from "@/database";
import { usersTable, videoTable } from "@/database/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import z from "zod";

// Initialize the UploadThing factory for route creation
const f = createUploadthing();

/**
 * ourFileRouter:
 * This object defines all file upload routes for the app using UploadThing's router.
 * Each route describes the allowed upload(s), input validation, permission (middleware), and what happens after upload.
 */
export const ourFileRouter = {
  /**
   * Route: "thumbnailUploader"
   * Handles the uploading of a single image (intended as a video thumbnail).
   * Expects a 'videoId' as input, only allows authenticated users to upload,
   * and updates the thumbnailUrl for the corresponding video in the database after upload.
   */
  thumbnailUploader: f({
    image: {
      // Restricts to one image per request, max size 4MB.
      // For available options and details, see:
      // https://docs.uploadthing.com/file-routes#route-config
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    // Validate and require input: videoId must be a UUID
    .input(
      z.object({
        videoId: z.uuid(),
      })
    )
    // Middleware to ensure only authenticated users can upload
    .middleware(async ({ input }) => {
      // Authenticate and get user's Clerk id
      const { userId: clerkUserId } = await auth();

      // Reject unauthenticated requests
      if (!clerkUserId) throw new UploadThingError("Unauthorized");

      // Look up the user in database using Clerk user id
      const [user] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.clerkId, clerkUserId));

      // If user not found in database, deny upload
      if (!user) throw new UploadThingError("Unauthorized");

      // Pass user info and videoId as metadata to the next handler
      return { user, ...input };
    })
    // Handler that runs after a successful upload
    .onUploadComplete(async ({ metadata, file }) => {
      /**
       * This handler updates the specified video's thumbnailUrl in the database,
       * ensuring only the video's uploader can update that video.
       */
      await db
        .update(videoTable)
        .set({
          thumbnailUrl: file.ufsUrl,
        })
        .where(
          and(
            eq(videoTable.id, metadata.videoId),
            eq(videoTable.uploaderId, metadata.user.id)
          )
        );

      // Log upload completion for backend debugging
      console.log("Upload complete for userId:", metadata.user.id);
      console.log("file url", file.ufsUrl);

      // *** The returned value is sent to the client in `onClientUploadComplete`
      return { uploadedBy: metadata.user.id };
    }),
} satisfies FileRouter;

// Export the type of our file router for use throughout the app.
export type OurFileRouter = typeof ourFileRouter;

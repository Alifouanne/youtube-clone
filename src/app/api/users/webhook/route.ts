// Import required modules and utilities
import { db } from "@/database";
import { usersTable } from "@/database/schema";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

// The POST handler processes webhook events from Clerk.
// It inserts, updates, or deletes users in the database based on the event type.
export async function POST(req: NextRequest) {
  try {
    // Verify the webhook request and parse the event data
    const evt = await verifyWebhook(req);

    // Handle user creation event
    if (evt.type === "user.created") {
      // Insert the new user into the database
      await db.insert(usersTable).values({
        clerkId: evt.data.id,
        name: `${evt.data.first_name} ${evt.data.last_name}`,
        imageUrl: evt.data.image_url,
      });
    }
    // Handle user deletion event
    if (evt.type === "user.deleted") {
      // If no user id is provided in the webhook event, return an error
      if (!evt.data.id) {
        return new Response("No user id found", { status: 400 });
      }
      // Delete the user from the database based on the Clerk ID
      await db.delete(usersTable).where(eq(usersTable.clerkId, evt.data.id));
    }

    // Handle user update event
    if (evt.type === "user.updated") {
      // If no user id is provided in the webhook event, return an error
      if (!evt.data.id) {
        return new Response("No user id found", { status: 400 });
      }
      // Update the user's name and image URL in the database
      await db
        .update(usersTable)
        .set({
          name: `${evt.data.first_name} ${evt.data.last_name}`,
          imageUrl: evt.data.image_url,
        })
        .where(eq(usersTable.clerkId, evt.data.id));
    }
    // Respond that the webhook was received and processed successfully
    return new Response("Webhook received", { status: 200 });
  } catch (error) {
    // Log any errors that occurred during processing or verification
    console.error("Error verifying webhook:", error);
    // Respond with an error status
    return new Response("Webhook Error", { status: 400 });
  }
}

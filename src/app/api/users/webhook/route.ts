import { db } from "@/database";
import { usersTable } from "@/database/schema";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);

    if (evt.type === "user.created") {
      await db.insert(usersTable).values({
        clerkId: evt.data.id,
        name: `${evt.data.first_name} ${evt.data.last_name}`,
        imageUrl: evt.data.image_url,
      });
    }
    if (evt.type === "user.deleted") {
      if (!evt.data.id) {
        return new Response("No user id found", { status: 400 });
      }
      await db.delete(usersTable).where(eq(usersTable.clerkId, evt.data.id));
    }

    if (evt.type === "user.updated") {
      if (!evt.data.id) {
        return new Response("No user id found", { status: 400 });
      }
      await db
        .update(usersTable)
        .set({
          name: `${evt.data.first_name} ${evt.data.last_name}`,
          imageUrl: evt.data.image_url,
        })
        .where(eq(usersTable.clerkId, evt.data.id));
    }
    return new Response("Webhook received", { status: 200 });
  } catch (error) {
    console.error("Error verifying webhook:", error);
    return new Response("Webhook Error", { status: 400 });
  }
}

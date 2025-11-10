import { db } from "@/database";
import { subscriptionTable } from "@/database/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import z from "zod";

/**
 * TRPC router handling subscription operations.
 * Currently exposes the "toggle" mutation for subscribing/unsubscribing to a channel.
 */
export const subscriptionRouter = createTRPCRouter({
  /**
   * Toggle subscription between the current user (subscriber) and a given channel (another user).
   * If the user is already subscribed, this will unsubscribe them; otherwise, it will subscribe them.
   *
   * - Throws BAD_REQUEST if a user tries to subscribe to themselves.
   * - Returns { subscribed: true } if subscription was created.
   * - Returns { subscribed: false } if subscription was removed.
   */
  toggle: protectedProcedure
    .input(z.object({ channelId: z.uuid() })) // Requires a valid UUID for the channel/user being subscribed to
    .mutation(async ({ ctx, input }) => {
      const subscriberId = ctx.user.id; // Current authenticated user's id
      const { channelId } = input; // Channel being subscribed/unsubscribed

      // Prevent users from subscribing to themselves
      if (subscriberId === channelId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot subscribe to yourself.",
        });
      }

      // Check if a subscription already exists between this user and the specified channel
      const [existingSubscription] = await db
        .select()
        .from(subscriptionTable)
        .where(
          and(
            eq(subscriptionTable.channelId, channelId),
            eq(subscriptionTable.subscriberId, subscriberId)
          )
        );

      // If subscription exists, delete it (unsubscribe)
      if (existingSubscription) {
        await db
          .delete(subscriptionTable)
          .where(
            and(
              eq(subscriptionTable.subscriberId, subscriberId),
              eq(subscriptionTable.channelId, channelId)
            )
          );
        return { subscribed: false }; // Return unsubscribed status
      }

      // Otherwise, create a new subscription (subscribe)
      await db.insert(subscriptionTable).values({
        subscriberId,
        channelId,
      });

      return { subscribed: true }; // Return subscribed status
    }),
});

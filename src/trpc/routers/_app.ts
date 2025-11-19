/**
 * This file defines the root tRPC router for the application.
 *
 * The `appRouter` combines all sub-routers for different features/modules.
 * Currently, it exposes the `categories` API, which is implemented in
 * `@/modules/categories/server/procedures`.
 *
 * - `appRouter`: The main tRPC router for the app.
 * - `AppRouter`: Type definition of the API for type-safety and client inference.
 */

import { categoriesRouter } from "@/modules/categories/server/procedures";
import { commentsRouter } from "@/modules/comments/server/procedure";
import { studioRouter } from "@/modules/studio/server/procedures";
import { subscriptionRouter } from "@/modules/subscription/server/procedure";
import { videoRouter } from "@/modules/videos/server/procedures";
import { createTRPCRouter } from "../init";

/**
 * appRouter aggregates all relevant procedure routers for the API.
 * Add new routers here to expand the API.
 */
export const appRouter = createTRPCRouter({
  categories: categoriesRouter,
  studio: studioRouter,
  videos: videoRouter,
  subscriptions: subscriptionRouter,
  comments: commentsRouter,
});

// Export type definition of API for strong typing on the client
export type AppRouter = typeof appRouter;

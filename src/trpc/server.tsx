import "server-only"; // <-- ensure this file cannot be imported from the client

import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { cache } from "react";
import { createCallerFactory, createTRPCContext } from "./init";
import { makeQueryClient } from "./query-client";
import { appRouter } from "./routers/_app";

/**
 * Creates a *request-scoped* singleton instance of QueryClient.
 * This ensures cache (for SSR hydration) is stable throughout a single server request,
 * and that a fresh client is used for every new request (react's `cache()` achieves this).
 */
export const getQueryClient = cache(makeQueryClient);

/**
 * Builds a tRPC caller. This "caller" can resolve tRPC procedure methods
 * on the server, using the current authenticated context (via createTRPCContext).
 */
const caller = createCallerFactory(appRouter)(createTRPCContext);

/**
 * Hydration helpers for tRPC on the server:
 *   - `trpc`: provides server helpers for creating queries/mutations and for SSR.
 *   - `HydrateClient`: React component to rehydrate queries on the client.
 *
 * These helpers bridge server tRPC calls (for SSR/SSG/server-components) and client-side React Query.
 */
export const { trpc, HydrateClient } = createHydrationHelpers<typeof appRouter>(
  caller,
  getQueryClient
);

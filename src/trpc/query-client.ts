// Import the default dehydration logic and QueryClient from React Query
import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from "@tanstack/react-query";
// Import superjson for robust (de)serialization of query data (handles Dates, Maps, etc)
import superjson from "superjson";

/**
 * Helper function to create a new QueryClient preconfigured for tRPC + superjson.
 * - Applies a reasonable default `staleTime` (30 seconds) for cache freshness.
 * - Uses superjson to serialize/deserialize queries for SSR/SSG/cache hydration.
 * - Customizes dehydration to include pending queries.
 */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Queries stay fresh for 30 seconds before becoming stale in the cache
        staleTime: 30 * 1000,
      },
      dehydrate: {
        // Use superjson to serialize data for transport/hydration (SSR, SSG, etc.)
        serializeData: superjson.serialize,
        // Dehydrate queries if they would normally be dehydrated, or if status is "pending"
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
      hydrate: {
        // Use superjson to deserialize data back into its original structure
        deserializeData: superjson.deserialize,
      },
    },
  });
}

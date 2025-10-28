/**
 * This file sets up the tRPC client and React Query integration on the client side of the application.
 *
 * - Exports the `trpc` object, which provides hooks for calling backend procedures defined in the type-safe tRPC router.
 * - Ensures correct QueryClient instantiation both on the server and browser to enable SSR/SSG and client-side caching.
 * - Automatically configures server/client URLs for tRPC, supporting Vercel deployment URL and local development.
 * - Sets up the `TRPCProvider` React component to wrap your app in the necessary tRPC and React Query providers.
 *
 * Usage:
 *    Wrap your application's root with <TRPCProvider> to enable data fetching via tRPC hooks.
 */

"use client";
// ^-- to make sure we can mount the Provider from a server component

// Import required dependencies for React Query and tRPC
import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { useState } from "react";
import { makeQueryClient } from "./query-client";
import type { AppRouter } from "./routers/_app";
import superjson from "superjson";
import { useAuth } from "@clerk/nextjs";

// Create the tRPC React helper, typed by the AppRouter
export const trpc = createTRPCReact<AppRouter>();

// Singleton for the client-side QueryClient (to persist cache between renders)
let clientQueryClientSingleton: QueryClient;

/**
 * Obtain a QueryClient instance.
 * - On the server: always create a new QueryClient (to prevent shared state between requests).
 * - In the browser: use a singleton to persist the cache across the app lifespan.
 */
function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient();
  }
  // Browser: use singleton pattern to keep the same query client
  return (clientQueryClientSingleton ??= makeQueryClient());
}

/**
 * Computes the tRPC HTTP endpoint URL.
 * - On the client: use relative path.
 * - On the server: use deployment or dev URL (for SSR/SSG/fetching).
 */
function getUrl() {
  const base = (() => {
    if (typeof window !== "undefined") return "";
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return "http://localhost:3000";
  })();
  return `${base}/api/trpc`;
}

/**
 * React Context Provider for tRPC and React Query.
 * - Should wrap your application's root (e.g., in layout.tsx/_app.tsx).
 * - Supplies all descendant components with access to tRPC/React Query caches and hooks.
 */
export function TRPCProvider(
  props: Readonly<{
    children: React.ReactNode;
  }>
) {
  const { getToken } = useAuth();
  // NOTE: Avoid useState when initializing the query client if you don't
  //       have a suspense boundary between this and the code that may
  //       suspend because React will throw away the client on the initial
  //       render if it suspends and there is no boundary
  const queryClient = getQueryClient();
  // `trpcClient` is created once per app (per process or browser session)
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          transformer: superjson,
          url: getUrl(),
          async headers() {
            const token = await getToken({ skipCache: true });
            return {
              authorization: token ? `Bearer ${token}` : undefined,
            };
          },
          fetch(url, options) {
            return fetch(url as RequestInfo, {
              ...(options as RequestInit),
              credentials: "include", // This ensures Clerk auth cookies are sent with every request
            });
          },
        }),
      ],
    })
  );
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}

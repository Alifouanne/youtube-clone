// Import necessary modules and dependencies for database, authentication, TRPC, etc.
import { db } from "@/database";
import { usersTable } from "@/database/schema";
import { ratelimit } from "@/lib/ratelimit";
import { auth } from "@clerk/nextjs/server";
import { initTRPC, TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import superjson from "superjson";

/**
 * Creates a cached TRPC context containing the authenticated user's Clerk ID.
 * - Uses Clerk's `auth()` to determine current user authentication.
 * - Memoized via React's `cache()` to avoid re-running on every call.
 * - Returns an object with the authenticated Clerk user id (or undefined if not authenticated).
 */
export const createTRPCContext = async () => {
  const { userId } = await auth();
  return { clerkUserId: userId };
};

/**
 * Utility type representing the resolved context shape.
 */
export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

/**
 * Initializes the main TRPC helper.
 * - Configures the TRPC context type.
 * - Applies superjson for serialization of complex types.
 * - We intentionally avoid exporting the raw "t" object, for clarity and to avoid naming collisions.
 */
const t = initTRPC.context<Context>().create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,
});

// Export helpers for constructing routers and procedures
/**
 * Helper to create a TRPC router with the proper context type.
 */
export const createTRPCRouter = t.router;
/**
 * Helper for creating a caller factory for TRPC routers.
 */
export const createCallerFactory = t.createCallerFactory;
/**
 * Base procedure object to define new procedures (query/mutation/middleware).
 */
export const baseProcedure = t.procedure;

/**
 * Middleware: Secures a procedure to be accessible only for authenticated, registered, and rate-limited users.
 *
 * - Checks if the user is authenticated, throws UNAUTHORIZED if not.
 * - Looks up the user in the database, throws UNAUTHORIZED if registration missing.
 * - Checks rate limits using Upstash; throws TOO_MANY_REQUESTS if exceeded.
 * - On success, adds the user object to the context for downstream procedures.
 */

export const protectedProcedure = t.procedure.use(async function isAuthed(
  opts
) {
  const { ctx } = opts;

  // User must be authenticated (Clerk session exists)
  if (!ctx.clerkUserId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "User is not authenticated",
    });
  }

  // Look up the user in our database by Clerk ID
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.clerkId, ctx.clerkUserId))
    .limit(1);

  // User must be registered in our database
  if (!user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "User is not registered",
    });
  }

  // Check if user is within rate limits
  const { success } = await ratelimit.limit(user.id);
  if (!success) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "You are sending requests too quickly. Please slow down.",
    });
  }

  // All checks passed; continue and inject the user object into context
  return opts.next({
    ctx: {
      ...ctx,
      user,
    },
  });
});

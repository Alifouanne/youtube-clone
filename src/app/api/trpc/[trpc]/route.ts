// Import the function to create the tRPC context for requests
import { createTRPCContext } from "@/trpc/init";

// Import the root app router definition for tRPC
import { appRouter } from "@/trpc/routers/_app";

// Import the fetch adapter to handle HTTP requests via tRPC
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

// Define the route handler for both GET and POST requests
// It delegates incoming requests to tRPC via the fetch adapter
const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc", // tRPC endpoint path
    req, // Incoming HTTP request
    router: appRouter, // tRPC router instance
    createContext: createTRPCContext, // Context creation function
  });

// Export the handler for GET and POST HTTP methods
export { handler as GET, handler as POST };

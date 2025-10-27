// Import the database instance (for making queries)
import { db } from "@/database";
// Import the categories table definition (typed for queries)
import { categoriesTable } from "@/database/schema";
// Import helpers for procedure and router creation from the trpc context
import { baseProcedure, createTRPCRouter } from "@/trpc/init";

// Create a tRPC router for category-related procedures
export const categoriesRouter = createTRPCRouter({
  // "getMany" procedure: returns all categories in the table
  getMany: baseProcedure.query(async () => {
    // Query the database for all rows in the categories table
    const data = await db.select().from(categoriesTable);
    // Return the result to the client
    return data;
  }),
});

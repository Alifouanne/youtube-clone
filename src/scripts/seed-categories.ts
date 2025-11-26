// Import the database client
import { db } from "@/database";
// Import the table schema for categories
import { categoriesTable } from "@/database/schema";

// List of category names to seed into the database
const categoryNames = [
  "Cars and Vehicles",
  "Comedy",
  "Education",
  "Gaming",
  "Entertainment",
  "Film and animation",
  "How-to and style",
  "Music",
  "News and politics",
  "People and blogs",
  "Pets and animals",
  "Science and technology",
  "Sports",
  "Travel and events",
];

// Async function to seed the categories into the database
async function seedCategories() {
  console.log("Seeding categories...");
  try {
    // Prepare the values to insert - each includes a name and a simple description
    const values = categoryNames.map((name) => ({
      name,
      description: `All about ${name.toLowerCase()}`,
    }));
    // Insert the prepared category records into the categories table
    await db.insert(categoriesTable).values(values);
    console.log("Categories seeded successfully.");
  } catch (error) {
    // If an error occurs, log and exit the process with error code 1
    console.error("Error seeding categories:", error);
    process.exit(1);
  }
}

// Execute the seedCategories function when the script runs
seedCategories();

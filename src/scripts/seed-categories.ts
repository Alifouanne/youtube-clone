import { db } from "@/database";
import { categoriesTable } from "@/database/schema";
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

async function seedCategories() {
  console.log("Seeding categories...");
  try {
    const values = categoryNames.map((name) => ({
      name,
      description: `All about ${name.toLowerCase()}`,
    }));
    await db.insert(categoriesTable).values(values);
    console.log("Categories seeded successfully.");
  } catch (error) {
    console.error("Error seeding categories:", error);
    process.exit(1);
  }
}
seedCategories();

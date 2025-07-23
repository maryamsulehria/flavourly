import { seedRoles } from "../lib/auth-helpers";

async function main() {
  try {
    await seedRoles();
    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

main();

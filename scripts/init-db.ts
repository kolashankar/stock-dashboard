import { runMigrations } from "./migrate"
import { seedDatabase } from "./seed"

async function initializeDatabase(): Promise<void> {
  try {
    console.log("🚀 Initializing database...")

    // Run migrations first
    await runMigrations()

    // Then seed the database
    await seedDatabase()

    console.log("🎉 Database initialization completed successfully!")
  } catch (error) {
    console.error("❌ Database initialization failed:", error)
    process.exit(1)
  }
}

// Run initialization if this script is executed directly
if (require.main === module) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Database initialization failed:", error)
      process.exit(1)
    })
}

export { initializeDatabase }

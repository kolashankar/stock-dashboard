import { query, checkDatabaseConnection } from "../lib/database"

async function resetDatabase(): Promise<void> {
  try {
    console.log("⚠️  Resetting database...")

    // Check database connection
    const isConnected = await checkDatabaseConnection()
    if (!isConnected) {
      throw new Error("Database connection failed")
    }

    console.log("Dropping all tables...")

    // Drop tables in reverse order of dependencies
    await query(`DROP TABLE IF EXISTS stock_data CASCADE`)
    await query(`DROP TABLE IF EXISTS companies CASCADE`)
    await query(`DROP TABLE IF EXISTS migrations CASCADE`)

    // Drop views and functions
    await query(`DROP VIEW IF EXISTS latest_stock_prices CASCADE`)
    await query(`DROP VIEW IF EXISTS stock_performance CASCADE`)
    await query(`DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE`)
    await query(`DROP FUNCTION IF EXISTS get_company_stock_summary(INTEGER) CASCADE`)

    console.log("✅ Database reset completed successfully!")
    console.log("💡 Run 'npm run db:init' to reinitialize the database")
  } catch (error) {
    console.error("❌ Database reset failed:", error)
    process.exit(1)
  }
}

// Run reset if this script is executed directly
if (require.main === module) {
  resetDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Database reset failed:", error)
      process.exit(1)
    })
}

export { resetDatabase }

import { readFileSync } from "fs"
import { join } from "path"
import { query, checkDatabaseConnection } from "../lib/database"

interface Migration {
  id: number
  filename: string
  executed_at: Date
}

async function createMigrationsTable(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `)
}

async function getExecutedMigrations(): Promise<string[]> {
  const result = await query<Migration>(`
    SELECT filename FROM migrations ORDER BY id
  `)
  return result.map((row) => row.filename)
}

async function executeMigration(filename: string): Promise<void> {
  const migrationPath = join(process.cwd(), "migrations", filename)
  const sql = readFileSync(migrationPath, "utf-8")

  console.log(`Executing migration: ${filename}`)

  // Execute the migration SQL
  await query(sql)

  // Record the migration as executed
  await query(
    `
    INSERT INTO migrations (filename) VALUES ($1)
  `,
    [filename],
  )

  console.log(`✓ Migration ${filename} completed`)
}

async function runMigrations(): Promise<void> {
  try {
    console.log("Starting database migrations...")

    // Check database connection
    const isConnected = await checkDatabaseConnection()
    if (!isConnected) {
      throw new Error("Database connection failed")
    }

    // Create migrations table if it doesn't exist
    await createMigrationsTable()

    // Get list of executed migrations
    const executedMigrations = await getExecutedMigrations()

    // Define migration files in order
    const migrationFiles = [
      "001_create_companies_table.sql",
      "002_create_stock_data_table.sql",
      "003_create_functions_and_triggers.sql",
      "004_create_indexes_and_constraints.sql",
    ]

    // Execute pending migrations
    for (const filename of migrationFiles) {
      if (!executedMigrations.includes(filename)) {
        await executeMigration(filename)
      } else {
        console.log(`⏭ Skipping already executed migration: ${filename}`)
      }
    }

    console.log("✅ All migrations completed successfully!")
  } catch (error) {
    console.error("❌ Migration failed:", error)
    process.exit(1)
  }
}

// Run migrations if this script is executed directly
if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Migration script failed:", error)
      process.exit(1)
    })
}

export { runMigrations }

import { Pool, type PoolClient } from "pg"

// Database connection pool
let pool: Pool | null = null

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })

    // Handle pool errors
    pool.on("error", (err) => {
      console.error("Unexpected error on idle client", err)
      process.exit(-1)
    })
  }

  return pool
}

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const pool = getPool()
  const client = await pool.connect()

  try {
    const result = await client.query(text, params)
    return result.rows
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  } finally {
    client.release()
  }
}

export async function getClient(): Promise<PoolClient> {
  const pool = getPool()
  return await pool.connect()
}

export async function checkDatabaseConnection(): Promise<{ connected: boolean; error?: string }> {
  try {
    console.log("[v0] Testing database connection...")
    const result = await query("SELECT NOW() as current_time")
    console.log("[v0] Database connected successfully:", result[0])
    return { connected: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("[v0] Database connection failed:", errorMessage)
    return { connected: false, error: errorMessage }
  }
}

export async function checkTablesExist(): Promise<{ tablesExist: boolean; missingTables: string[] }> {
  try {
    const result = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('companies', 'stock_data')
    `)

    const existingTables = result.map((row) => row.table_name)
    const requiredTables = ["companies", "stock_data"]
    const missingTables = requiredTables.filter((table) => !existingTables.includes(table))

    console.log("[v0] Existing tables:", existingTables)
    console.log("[v0] Missing tables:", missingTables)

    return {
      tablesExist: missingTables.length === 0,
      missingTables,
    }
  } catch (error) {
    console.error("[v0] Error checking tables:", error)
    return { tablesExist: false, missingTables: ["companies", "stock_data"] }
  }
}

export const testConnection = checkDatabaseConnection

// Close database connection (for cleanup)
export async function closeDatabaseConnection(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = null
  }
}

export async function withTransaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getClient()

  try {
    await client.query("BEGIN")
    const result = await callback(client)
    await client.query("COMMIT")
    return result
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }
}

// Enhanced query function with better error handling
export async function queryWithErrorHandling<T = any>(
  text: string,
  params?: any[],
  errorContext?: string,
): Promise<T[]> {
  try {
    return await query<T>(text, params)
  } catch (error) {
    console.error(`Database query error${errorContext ? ` in ${errorContext}` : ""}:`, {
      query: text,
      params,
      error: error instanceof Error ? error.message : error,
    })
    throw new Error(`Database operation failed${errorContext ? ` in ${errorContext}` : ""}`)
  }
}

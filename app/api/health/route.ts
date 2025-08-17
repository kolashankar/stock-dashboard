import { NextResponse } from "next/server"
import { checkDatabaseConnection } from "@/lib/database"
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils"

export async function GET() {
  try {
    const isHealthy = await checkDatabaseConnection()

    if (isHealthy) {
      return NextResponse.json(
        createSuccessResponse({
          status: "healthy",
          database: "connected",
          timestamp: new Date().toISOString(),
        }),
      )
    } else {
      return NextResponse.json(createErrorResponse("Database connection failed"), { status: 503 })
    }
  } catch (error) {
    console.error("Health check failed:", error)
    return NextResponse.json(createErrorResponse("Health check failed"), { status: 503 })
  }
}

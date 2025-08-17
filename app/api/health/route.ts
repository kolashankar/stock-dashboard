import { NextResponse } from "next/server"

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: {
        status: "healthy",
        database: "mock-mode",
        timestamp: new Date().toISOString(),
      },
      message: "Service is healthy",
    })
  } catch (error) {
    console.error("Health check failed:", error)
    return NextResponse.json(
      {
        success: false,
        data: {
          status: "degraded",
          timestamp: new Date().toISOString(),
        },
        message: "Health check failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 200 }, // Return 200 to avoid HTML error pages
    )
  }
}

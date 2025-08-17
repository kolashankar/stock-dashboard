import { NextResponse } from "next/server"
import { StockRepository } from "@/lib/repositories/stock-repository"
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils"

export async function GET() {
  try {
    const overview = await StockRepository.getMarketOverview()
    return NextResponse.json(createSuccessResponse(overview))
  } catch (error) {
    console.error("Error fetching market overview:", error)
    return NextResponse.json(createErrorResponse("Failed to fetch market overview"), { status: 500 })
  }
}

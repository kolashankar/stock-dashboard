import { NextResponse } from "next/server"
import { StockRepository } from "@/lib/repositories/stock-repository"
import { createSuccessResponse, createErrorResponse, validateCompanyId } from "@/lib/api-utils"
import { generateStockData, companies } from "@/lib/mock-data"

export async function GET(request: Request, { params }: { params: { companyId: string } }) {
  try {
    const { companyId } = params

    if (!validateCompanyId(companyId)) {
      return NextResponse.json(createErrorResponse("Invalid company ID"), { status: 400 })
    }

    try {
      const chartData = await StockRepository.getChartData(companyId, 30)

      if (chartData.length === 0) {
        return NextResponse.json(createErrorResponse("No stock data found for this company"), { status: 404 })
      }

      return NextResponse.json(createSuccessResponse(chartData))
    } catch (dbError) {
      console.log("[v0] Database error, falling back to mock data:", dbError)

      const company = companies.find((c) => c.id === Number.parseInt(companyId))
      if (!company) {
        return NextResponse.json(createErrorResponse("Company not found"), { status: 404 })
      }

      const mockStockData = generateStockData(company.symbol, 30)
      return NextResponse.json(createSuccessResponse(mockStockData))
    }
  } catch (error) {
    console.error("Error fetching stock data:", error)
    return NextResponse.json(createErrorResponse("Failed to fetch stock data"), { status: 500 })
  }
}

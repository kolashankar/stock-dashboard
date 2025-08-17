import { NextResponse } from "next/server"
import { stockData, companies } from "@/lib/mock-data"
import { createSuccessResponse, createErrorResponse, validateCompanyId } from "@/lib/api-utils"

interface StockSummary {
  companyId: string
  companyName: string
  symbol: string
  currentPrice: number
  previousClose: number
  change: number
  changePercent: number
  dayHigh: number
  dayLow: number
  volume: number
  marketCap: number
}

export async function GET(request: Request, { params }: { params: { companyId: string } }) {
  try {
    const { companyId } = params

    if (!validateCompanyId(companyId)) {
      return NextResponse.json(createErrorResponse("Invalid company ID"), { status: 400 })
    }

    const company = companies.find((c) => c.id === companyId)
    if (!company) {
      return NextResponse.json(createErrorResponse("Company not found"), { status: 404 })
    }

    const companyStockData = stockData.filter((stock) => stock.companyId === companyId)
    if (companyStockData.length === 0) {
      return NextResponse.json(createErrorResponse("No stock data available"), { status: 404 })
    }

    // Sort by date to get latest data
    const sortedData = companyStockData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    const latestData = sortedData[0]
    const previousData = sortedData[1]

    const currentPrice = latestData.close
    const previousClose = previousData ? previousData.close : currentPrice
    const change = currentPrice - previousClose
    const changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0

    const summary: StockSummary = {
      companyId,
      companyName: company.name,
      symbol: company.symbol,
      currentPrice,
      previousClose,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
      dayHigh: latestData.high,
      dayLow: latestData.low,
      volume: latestData.volume,
      marketCap: company.marketCap,
    }

    return NextResponse.json(createSuccessResponse(summary))
  } catch (error) {
    console.error("Error fetching stock summary:", error)
    return NextResponse.json(createErrorResponse("Failed to fetch stock summary"), { status: 500 })
  }
}

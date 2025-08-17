import { NextResponse } from "next/server"
import { stockData } from "@/lib/mock-data"
import type { StockDataPoint } from "@/lib/types"

export async function GET(request: Request, { params }: { params: { companyId: string } }) {
  try {
    const { companyId } = params

    // Filter stock data for the specific company
    const companyStockData = stockData.filter((stock) => stock.companyId === companyId)

    if (companyStockData.length === 0) {
      return NextResponse.json({ success: false, error: "Company not found" }, { status: 404 })
    }

    // Transform data for chart consumption
    const chartData: StockDataPoint[] = companyStockData.map((stock) => ({
      date: stock.date,
      price: stock.close,
      volume: stock.volume,
    }))

    return NextResponse.json({
      success: true,
      data: chartData,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch stock data" }, { status: 500 })
  }
}

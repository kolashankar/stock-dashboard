import { NextResponse } from "next/server"

const mockCompanies = [
  { id: "1", name: "Reliance Industries", symbol: "RELIANCE" },
  { id: "2", name: "Tata Consultancy Services", symbol: "TCS" },
  { id: "3", name: "HDFC Bank", symbol: "HDFCBANK" },
  { id: "4", name: "Infosys", symbol: "INFY" },
  { id: "5", name: "ICICI Bank", symbol: "ICICIBANK" },
]

function generateMockStockData(symbol: string, days = 30) {
  const data = []
  const basePrice = 1000 + Math.random() * 2000
  let currentPrice = basePrice

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)

    const change = (Math.random() - 0.5) * 0.1
    currentPrice = currentPrice * (1 + change)

    const validPrice = isFinite(currentPrice) ? currentPrice : basePrice
    const price = Math.round(validPrice * 100) / 100
    const high = Math.round(validPrice * 1.02 * 100) / 100
    const low = Math.round(validPrice * 0.98 * 100) / 100
    const open = Math.round(validPrice * 0.99 * 100) / 100
    const close = Math.round(validPrice * 100) / 100
    const volume = Math.floor(Math.random() * 1000000) + 100000

    // Ensure all values are finite numbers
    if (
      !isFinite(price) ||
      !isFinite(high) ||
      !isFinite(low) ||
      !isFinite(open) ||
      !isFinite(close) ||
      !isFinite(volume)
    ) {
      console.log("[v0] Invalid numeric values detected, skipping data point")
      continue
    }

    data.push({
      date: date.toISOString().split("T")[0],
      price,
      volume,
      high,
      low,
      open,
      close,
    })
  }

  return data
}

export async function GET(request: Request, { params }: { params: { companyId: string } }) {
  try {
    console.log("[v0] Stocks API called")

    const resolvedParams = params
    console.log("[v0] Resolved params:", resolvedParams)

    const companyId = resolvedParams?.companyId
    console.log("[v0] Extracted companyId:", companyId)

    if (!companyId || companyId === "undefined" || companyId === "null") {
      console.log("[v0] Invalid companyId detected")
      return NextResponse.json(
        {
          success: false,
          data: [],
          message: "Invalid company ID",
        },
        { status: 200 }, // Changed from 400 to 200 to avoid HTML error pages
      )
    }

    const company = mockCompanies.find((c) => c.id === companyId)
    console.log("[v0] Found company:", company)

    if (!company) {
      console.log("[v0] Company not found for ID:", companyId)
      return NextResponse.json(
        {
          success: false,
          data: [],
          message: "Company not found",
        },
        { status: 200 }, // Changed from 404 to 200 to avoid HTML error pages
      )
    }

    console.log("[v0] Generating stock data for:", company.symbol)
    const stockData = generateMockStockData(company.symbol, 30)
    console.log("[v0] Generated", stockData.length, "stock data points")

    console.log("[v0] Sample stock data point:", stockData[0])

    // Validate the data can be serialized to JSON
    try {
      JSON.stringify(stockData)
      console.log("[v0] Stock data JSON serialization test passed")
    } catch (jsonError) {
      console.error("[v0] JSON serialization failed:", jsonError)
      return NextResponse.json(
        {
          success: false,
          data: [],
          message: "Data serialization error",
        },
        { status: 500 },
      )
    }

    const response = {
      success: true,
      data: stockData,
      message: "Stock data fetched successfully",
    }

    console.log("[v0] Returning response with", stockData.length, "data points")
    return NextResponse.json(response)
  } catch (error) {
    console.error("[v0] Error in stocks API:", error)
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")

    return NextResponse.json(
      {
        success: false,
        data: [],
        message: "Error fetching stock data",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 200 },
    )
  }
}

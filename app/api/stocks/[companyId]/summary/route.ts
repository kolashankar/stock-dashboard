import { NextResponse } from "next/server"

const mockCompanies = [
  { id: "1", name: "Reliance Industries", symbol: "RELIANCE", marketCap: 1500000000000 },
  { id: "2", name: "Tata Consultancy Services", symbol: "TCS", marketCap: 1200000000000 },
  { id: "3", name: "HDFC Bank", symbol: "HDFCBANK", marketCap: 800000000000 },
  { id: "4", name: "Infosys", symbol: "INFY", marketCap: 650000000000 },
  { id: "5", name: "ICICI Bank", symbol: "ICICIBANK", marketCap: 550000000000 },
]

function generateMockSummary(companyId: string, company: any) {
  const currentPrice = 1000 + Math.random() * 2000
  const previousClose = currentPrice * (0.95 + Math.random() * 0.1)
  const change = currentPrice - previousClose
  const changePercent = (change / previousClose) * 100

  return {
    companyId,
    companyName: company.name,
    symbol: company.symbol,
    currentPrice: Math.round(currentPrice * 100) / 100,
    previousClose: Math.round(previousClose * 100) / 100,
    change: Math.round(change * 100) / 100,
    changePercent: Math.round(changePercent * 100) / 100,
    dayHigh: Math.round(currentPrice * 1.02 * 100) / 100,
    dayLow: Math.round(currentPrice * 0.98 * 100) / 100,
    volume: Math.floor(Math.random() * 1000000) + 100000,
    marketCap: company.marketCap,
    latestDate: new Date().toISOString().split("T")[0],
  }
}

export async function GET(request: Request, { params }: { params: { companyId: string } }) {
  try {
    const { companyId } = params

    if (!companyId || companyId === "undefined" || companyId === "null") {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: "Invalid company ID",
        },
        { status: 200 }, // Return 200 to avoid HTML error pages
      )
    }

    const company = mockCompanies.find((c) => c.id === companyId)
    if (!company) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: "Company not found",
        },
        { status: 200 }, // Return 200 to avoid HTML error pages
      )
    }

    const summary = generateMockSummary(companyId, company)

    return NextResponse.json({
      success: true,
      data: summary,
      message: "Stock summary fetched successfully",
    })
  } catch (error) {
    console.error("Error fetching stock summary:", error)
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "Error fetching stock summary",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 200 }, // Return 200 to avoid HTML error pages
    )
  }
}

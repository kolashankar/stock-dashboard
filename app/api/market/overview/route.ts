import { NextResponse } from "next/server"

const mockMarketOverview = {
  totalCompanies: 5,
  totalMarketCap: 5000000000000,
  topGainers: [
    { id: "1", name: "Reliance Industries", symbol: "RELIANCE", changePercent: 2.5, currentPrice: 2450 },
    { id: "3", name: "HDFC Bank", symbol: "HDFCBANK", changePercent: 1.8, currentPrice: 1520 },
    { id: "5", name: "ICICI Bank", symbol: "ICICIBANK", changePercent: 1.2, currentPrice: 785 },
  ],
  topLosers: [
    { id: "2", name: "TCS", symbol: "TCS", changePercent: -0.8, currentPrice: 3280 },
    { id: "4", name: "Infosys", symbol: "INFY", changePercent: -0.5, currentPrice: 1580 },
  ],
  sectorDistribution: {
    Technology: 2,
    Banking: 2,
    Energy: 1,
  },
}

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: mockMarketOverview,
      message: "Market overview fetched successfully",
    })
  } catch (error) {
    console.error("Error fetching market overview:", error)
    return NextResponse.json(
      {
        success: false,
        data: mockMarketOverview,
        message: "Error fetching market overview, returning mock data",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 200 }, // Return 200 to avoid HTML error pages
    )
  }
}

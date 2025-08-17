import { NextResponse } from "next/server"

const mockCompanies = [
  {
    id: "1",
    name: "Reliance Industries",
    symbol: "RELIANCE",
    sector: "Energy",
    marketCap: 1500000000000,
    currentPrice: 2450.75,
    change: 25.3,
    changePercent: 1.04,
  },
  {
    id: "2",
    name: "Tata Consultancy Services",
    symbol: "TCS",
    sector: "Technology",
    marketCap: 1200000000000,
    currentPrice: 3280.5,
    change: -15.25,
    changePercent: -0.46,
  },
  {
    id: "3",
    name: "HDFC Bank",
    symbol: "HDFCBANK",
    sector: "Banking",
    marketCap: 800000000000,
    currentPrice: 1520.25,
    change: 12.75,
    changePercent: 0.85,
  },
  {
    id: "4",
    name: "Infosys",
    symbol: "INFY",
    sector: "Technology",
    marketCap: 650000000000,
    currentPrice: 1580.9,
    change: -8.4,
    changePercent: -0.53,
  },
  {
    id: "5",
    name: "ICICI Bank",
    symbol: "ICICIBANK",
    sector: "Banking",
    marketCap: 550000000000,
    currentPrice: 785.6,
    change: 18.2,
    changePercent: 2.37,
  },
]

export async function GET() {
  try {
    console.log("[v0] Companies API called - returning mock data")

    return NextResponse.json({
      success: true,
      data: mockCompanies,
      message: "Companies fetched successfully",
    })
  } catch (error) {
    console.error("[v0] Error in companies API:", error)

    return NextResponse.json(
      {
        success: false,
        data: mockCompanies,
        message: "Fallback to mock data due to error",
      },
      { status: 200 },
    ) // Return 200 to avoid HTML error pages
  }
}

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

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!id || id === "undefined" || id === "null") {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: "Invalid company ID",
        },
        { status: 200 }, // Return 200 to avoid HTML error pages
      )
    }

    const company = mockCompanies.find((c) => c.id === id)

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

    return NextResponse.json({
      success: true,
      data: company,
      message: "Company fetched successfully",
    })
  } catch (error) {
    console.error("Error fetching company:", error)
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "Error fetching company",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 200 }, // Return 200 to avoid HTML error pages
    )
  }
}

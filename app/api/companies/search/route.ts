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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const sector = searchParams.get("sector")

    let companies = mockCompanies

    if (query) {
      companies = mockCompanies.filter(
        (company) =>
          company.name.toLowerCase().includes(query.toLowerCase()) ||
          company.symbol.toLowerCase().includes(query.toLowerCase()),
      )
    }

    if (sector) {
      companies = companies.filter((company) => company.sector.toLowerCase() === sector.toLowerCase())
    }

    return NextResponse.json({
      success: true,
      data: companies,
      message: `Found ${companies.length} companies`,
    })
  } catch (error) {
    console.error("Error searching companies:", error)
    return NextResponse.json(
      {
        success: false,
        data: mockCompanies,
        message: "Search failed, returning all companies",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 200 },
    )
  }
}

import { NextResponse } from "next/server"
import { companies, stockData } from "@/lib/mock-data"
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils"

interface MarketOverview {
  totalCompanies: number
  totalMarketCap: number
  topGainers: Array<{
    id: string
    name: string
    symbol: string
    changePercent: number
    currentPrice: number
  }>
  topLosers: Array<{
    id: string
    name: string
    symbol: string
    changePercent: number
    currentPrice: number
  }>
  sectorDistribution: Record<string, number>
}

export async function GET() {
  try {
    const totalMarketCap = companies.reduce((sum, company) => sum + company.marketCap, 0)

    // Calculate performance for each company
    const companyPerformance = companies.map((company) => {
      const companyStockData = stockData.filter((stock) => stock.companyId === company.id)
      const sortedData = companyStockData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      const currentPrice = sortedData[0]?.close || 0
      const previousPrice = sortedData[1]?.close || currentPrice
      const changePercent = previousPrice !== 0 ? ((currentPrice - previousPrice) / previousPrice) * 100 : 0

      return {
        id: company.id,
        name: company.name,
        symbol: company.symbol,
        changePercent: Math.round(changePercent * 100) / 100,
        currentPrice: Math.round(currentPrice * 100) / 100,
      }
    })

    // Get top gainers and losers
    const sortedByPerformance = [...companyPerformance].sort((a, b) => b.changePercent - a.changePercent)
    const topGainers = sortedByPerformance.slice(0, 3)
    const topLosers = sortedByPerformance.slice(-3).reverse()

    // Calculate sector distribution
    const sectorDistribution = companies.reduce(
      (acc, company) => {
        acc[company.sector] = (acc[company.sector] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const overview: MarketOverview = {
      totalCompanies: companies.length,
      totalMarketCap,
      topGainers,
      topLosers,
      sectorDistribution,
    }

    return NextResponse.json(createSuccessResponse(overview))
  } catch (error) {
    console.error("Error fetching market overview:", error)
    return NextResponse.json(createErrorResponse("Failed to fetch market overview"), { status: 500 })
  }
}

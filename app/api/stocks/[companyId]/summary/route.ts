import { NextResponse } from "next/server"
import { StockRepository } from "@/lib/repositories/stock-repository"
import { CompanyRepository } from "@/lib/repositories/company-repository"
import { createSuccessResponse, createErrorResponse, validateCompanyId } from "@/lib/api-utils"

export async function GET(request: Request, { params }: { params: { companyId: string } }) {
  try {
    const { companyId } = params

    if (!validateCompanyId(companyId)) {
      return NextResponse.json(createErrorResponse("Invalid company ID"), { status: 400 })
    }

    const company = await CompanyRepository.findById(companyId)
    if (!company) {
      return NextResponse.json(createErrorResponse("Company not found"), { status: 404 })
    }

    const summary = await StockRepository.getStockSummary(companyId)
    if (!summary) {
      return NextResponse.json(createErrorResponse("No stock data available"), { status: 404 })
    }

    const enhancedSummary = {
      ...summary,
      companyName: company.name,
      symbol: company.symbol,
      marketCap: company.marketCap,
    }

    return NextResponse.json(createSuccessResponse(enhancedSummary))
  } catch (error) {
    console.error("Error fetching stock summary:", error)
    return NextResponse.json(createErrorResponse("Failed to fetch stock summary"), { status: 500 })
  }
}

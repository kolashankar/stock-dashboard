import { NextResponse } from "next/server"
import { companies } from "@/lib/mock-data"
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const sector = searchParams.get("sector")

    let filteredCompanies = companies

    // Filter by search query (name or symbol)
    if (query) {
      const searchTerm = query.toLowerCase()
      filteredCompanies = filteredCompanies.filter(
        (company) =>
          company.name.toLowerCase().includes(searchTerm) || company.symbol.toLowerCase().includes(searchTerm),
      )
    }

    // Filter by sector
    if (sector) {
      filteredCompanies = filteredCompanies.filter((company) => company.sector.toLowerCase() === sector.toLowerCase())
    }

    return NextResponse.json(createSuccessResponse(filteredCompanies, `Found ${filteredCompanies.length} companies`))
  } catch (error) {
    console.error("Error searching companies:", error)
    return NextResponse.json(createErrorResponse("Failed to search companies"), { status: 500 })
  }
}

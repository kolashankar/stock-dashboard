export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server"
import { CompanyRepository } from "@/lib/repositories/company-repository"
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const sector = searchParams.get("sector")

    let companies

    if (query) {
      companies = await CompanyRepository.search(query, sector || undefined)
    } else if (sector) {
      companies = await CompanyRepository.findBySector(sector)
    } else {
      companies = await CompanyRepository.findAll()
    }

    return NextResponse.json(createSuccessResponse(companies, `Found ${companies.length} companies`))
  } catch (error) {
    console.error("Error searching companies:", error)
    return NextResponse.json(createErrorResponse("Failed to search companies"), { status: 500 })
  }
}

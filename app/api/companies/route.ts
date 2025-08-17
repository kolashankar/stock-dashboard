import { NextResponse } from "next/server"
import { CompanyRepository } from "@/lib/repositories/company-repository"
import { createSuccessResponse } from "@/lib/api-utils"
import { checkDatabaseConnection, checkTablesExist } from "@/lib/database"

import { companies as mockCompanies } from "@/lib/mock-data"

export async function GET() {
  try {
    console.log("[v0] Starting companies API request")

    const dbStatus = await checkDatabaseConnection()
    console.log("[v0] Database connection status:", dbStatus)

    if (!dbStatus.connected) {
      console.log("[v0] Database not connected, using mock data")
      return NextResponse.json(createSuccessResponse(mockCompanies))
    }

    const tablesStatus = await checkTablesExist()
    if (!tablesStatus.tablesExist) {
      console.log("[v0] Missing database tables, using mock data")
      return NextResponse.json(createSuccessResponse(mockCompanies))
    }

    console.log("[v0] Fetching companies from repository")
    const companies = await CompanyRepository.findAll()
    console.log("[v0] Successfully fetched companies:", companies.length)

    return NextResponse.json(createSuccessResponse(companies))
  } catch (error) {
    console.error("[v0] Error in companies API:", error)
    console.log("[v0] Falling back to mock data due to error")
    return NextResponse.json(createSuccessResponse(mockCompanies))
  }
}

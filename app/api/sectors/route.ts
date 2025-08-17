import { NextResponse } from "next/server"
import { CompanyRepository } from "@/lib/repositories/company-repository"
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils"

export async function GET() {
  try {
    const sectors = await CompanyRepository.getSectors()
    return NextResponse.json(createSuccessResponse(sectors))
  } catch (error) {
    console.error("Error fetching sectors:", error)
    return NextResponse.json(createErrorResponse("Failed to fetch sectors"), { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { CompanyRepository } from "@/lib/repositories/company-repository"
import { createSuccessResponse, createErrorResponse, validateCompanyId } from "@/lib/api-utils"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!validateCompanyId(id)) {
      return NextResponse.json(createErrorResponse("Invalid company ID"), { status: 400 })
    }

    const company = await CompanyRepository.findById(id)

    if (!company) {
      return NextResponse.json(createErrorResponse("Company not found"), { status: 404 })
    }

    return NextResponse.json(createSuccessResponse(company))
  } catch (error) {
    console.error("Error fetching company:", error)
    return NextResponse.json(createErrorResponse("Internal server error"), { status: 500 })
  }
}

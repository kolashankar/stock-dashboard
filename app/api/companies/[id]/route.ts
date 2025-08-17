import { NextResponse } from "next/server"
import { companies } from "@/lib/mock-data"
import { createSuccessResponse, createErrorResponse, validateCompanyId } from "@/lib/api-utils"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!validateCompanyId(id)) {
      return NextResponse.json(createErrorResponse("Invalid company ID"), { status: 400 })
    }

    const company = companies.find((c) => c.id === id)

    if (!company) {
      return NextResponse.json(createErrorResponse("Company not found"), { status: 404 })
    }

    return NextResponse.json(createSuccessResponse(company))
  } catch (error) {
    console.error("Error fetching company:", error)
    return NextResponse.json(createErrorResponse("Internal server error"), { status: 500 })
  }
}

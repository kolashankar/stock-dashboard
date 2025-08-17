import { NextResponse } from "next/server"
import { companies } from "@/lib/mock-data"

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: companies,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch companies" }, { status: 500 })
  }
}

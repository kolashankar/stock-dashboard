import { NextResponse } from "next/server"

const mockSectors = [
  { name: "Technology", count: 2 },
  { name: "Banking", count: 2 },
  { name: "Energy", count: 1 },
]

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: mockSectors,
      message: "Sectors fetched successfully",
    })
  } catch (error) {
    console.error("Error fetching sectors:", error)
    return NextResponse.json(
      {
        success: false,
        data: mockSectors,
        message: "Error fetching sectors, returning mock data",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 200 }, // Return 200 to avoid HTML error pages
    )
  }
}

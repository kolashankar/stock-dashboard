import { testConnection } from "../lib/database"
import { CompanyRepository } from "../lib/repositories/company-repository"
import { StockRepository } from "../lib/repositories/stock-repository"

async function testDatabaseSetup() {
  console.log("[v0] Testing database connection...")

  try {
    // Test basic connection
    const isConnected = await testConnection()
    console.log("[v0] Database connection:", isConnected ? "SUCCESS" : "FAILED")

    if (!isConnected) {
      throw new Error("Database connection failed")
    }

    // Test repositories
    const companyRepo = new CompanyRepository()
    const stockRepo = new StockRepository()

    console.log("[v0] Testing company repository...")
    const companies = await companyRepo.findAll()
    console.log("[v0] Found companies:", companies.length)

    if (companies.length > 0) {
      const firstCompany = companies[0]
      console.log("[v0] First company:", firstCompany.name, firstCompany.symbol)

      console.log("[v0] Testing stock repository...")
      const stockData = await stockRepo.findByCompanyId(firstCompany.id, 7)
      console.log("[v0] Stock data points:", stockData.length)

      if (stockData.length > 0) {
        console.log("[v0] Latest stock price:", stockData[0].close_price)
      }
    }

    console.log("[v0] All tests passed successfully!")
  } catch (error) {
    console.error("[v0] Test failed:", error)
    process.exit(1)
  }
}

testDatabaseSetup()

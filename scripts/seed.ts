import { CompanyRepository } from "../lib/repositories/company-repository"
import { StockRepository } from "../lib/repositories/stock-repository"
import { checkDatabaseConnection } from "../lib/database"
import type { Company, StockData } from "../lib/db-types"

// Company seed data
const companySeedData: Omit<Company, "id">[] = [
  {
    name: "Reliance Industries Ltd",
    symbol: "RELIANCE",
    sector: "Oil & Gas",
    marketCap: 1500000000000,
  },
  {
    name: "Tata Consultancy Services",
    symbol: "TCS",
    sector: "Information Technology",
    marketCap: 1200000000000,
  },
  {
    name: "HDFC Bank Ltd",
    symbol: "HDFCBANK",
    sector: "Banking",
    marketCap: 800000000000,
  },
  {
    name: "Infosys Ltd",
    symbol: "INFY",
    sector: "Information Technology",
    marketCap: 700000000000,
  },
  {
    name: "ICICI Bank Ltd",
    symbol: "ICICIBANK",
    sector: "Banking",
    marketCap: 650000000000,
  },
  {
    name: "Hindustan Unilever Ltd",
    symbol: "HINDUNILVR",
    sector: "FMCG",
    marketCap: 600000000000,
  },
  {
    name: "State Bank of India",
    symbol: "SBIN",
    sector: "Banking",
    marketCap: 550000000000,
  },
  {
    name: "Bharti Airtel Ltd",
    symbol: "BHARTIARTL",
    sector: "Telecommunications",
    marketCap: 500000000000,
  },
  {
    name: "ITC Ltd",
    symbol: "ITC",
    sector: "FMCG",
    marketCap: 450000000000,
  },
  {
    name: "Kotak Mahindra Bank",
    symbol: "KOTAKBANK",
    sector: "Banking",
    marketCap: 400000000000,
  },
  {
    name: "Larsen & Toubro Ltd",
    symbol: "LT",
    sector: "Construction",
    marketCap: 350000000000,
  },
  {
    name: "Asian Paints Ltd",
    symbol: "ASIANPAINT",
    sector: "Paints",
    marketCap: 300000000000,
  },
]

// Base prices for stock data generation
const basePrices: Record<string, number> = {
  "1": 2500, // Reliance
  "2": 3800, // TCS
  "3": 1650, // HDFC Bank
  "4": 1450, // Infosys
  "5": 950, // ICICI Bank
  "6": 2400, // HUL
  "7": 580, // SBI
  "8": 850, // Bharti Airtel
  "9": 420, // ITC
  "10": 1800, // Kotak Bank
  "11": 2200, // L&T
  "12": 3200, // Asian Paints
}

function generateStockData(companyId: string, basePrice: number, days = 30): Omit<StockData, "id">[] {
  const data: Omit<StockData, "id">[] = []
  const today = new Date()
  let currentPrice = basePrice

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    // Generate realistic price movements
    const volatility = 0.02 // 2% daily volatility
    const change = (Math.random() - 0.5) * 2 * volatility
    currentPrice = currentPrice * (1 + change)

    const open = currentPrice * (1 + (Math.random() - 0.5) * 0.01)
    const close = currentPrice
    const high = Math.max(open, close) * (1 + Math.random() * 0.02)
    const low = Math.min(open, close) * (1 - Math.random() * 0.02)
    const volume = Math.floor(Math.random() * 10000000) + 1000000

    data.push({
      companyId,
      date: date.toISOString().split("T")[0],
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume,
    })
  }

  return data
}

async function seedCompanies(): Promise<Company[]> {
  console.log("Seeding companies...")

  const companies: Company[] = []

  for (const companyData of companySeedData) {
    try {
      // Check if company already exists
      const existingCompany = await CompanyRepository.findBySymbol(companyData.symbol)

      if (existingCompany) {
        console.log(`⏭ Company ${companyData.symbol} already exists, skipping...`)
        companies.push(existingCompany)
      } else {
        const company = await CompanyRepository.create(companyData)
        console.log(`✓ Created company: ${company.name} (${company.symbol})`)
        companies.push(company)
      }
    } catch (error) {
      console.error(`❌ Failed to create company ${companyData.symbol}:`, error)
    }
  }

  console.log(`✅ Seeded ${companies.length} companies`)
  return companies
}

async function seedStockData(companies: Company[]): Promise<void> {
  console.log("Seeding stock data...")

  for (const company of companies) {
    try {
      // Check if stock data already exists for this company
      const existingData = await StockRepository.findByCompanyId(company.id, 1)

      if (existingData.length > 0) {
        console.log(`⏭ Stock data for ${company.symbol} already exists, skipping...`)
        continue
      }

      const basePrice = basePrices[company.id] || 1000
      const stockData = generateStockData(company.id, basePrice, 30)

      await StockRepository.batchCreate(stockData)
      console.log(`✓ Created ${stockData.length} stock data entries for ${company.symbol}`)
    } catch (error) {
      console.error(`❌ Failed to create stock data for ${company.symbol}:`, error)
    }
  }

  console.log("✅ Stock data seeding completed")
}

async function seedDatabase(): Promise<void> {
  try {
    console.log("Starting database seeding...")

    // Check database connection
    const isConnected = await checkDatabaseConnection()
    if (!isConnected) {
      throw new Error("Database connection failed")
    }

    // Seed companies first
    const companies = await seedCompanies()

    // Then seed stock data
    await seedStockData(companies)

    console.log("✅ Database seeding completed successfully!")
  } catch (error) {
    console.error("❌ Database seeding failed:", error)
    process.exit(1)
  }
}

// Run seeding if this script is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Seeding script failed:", error)
      process.exit(1)
    })
}

export { seedDatabase }

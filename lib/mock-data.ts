import type { Company, StockData } from "./types"

export const companies: Company[] = [
  {
    id: "1",
    name: "Reliance Industries Ltd",
    symbol: "RELIANCE",
    sector: "Oil & Gas",
    marketCap: 1500000000000,
  },
  {
    id: "2",
    name: "Tata Consultancy Services",
    symbol: "TCS",
    sector: "Information Technology",
    marketCap: 1200000000000,
  },
  {
    id: "3",
    name: "HDFC Bank Ltd",
    symbol: "HDFCBANK",
    sector: "Banking",
    marketCap: 800000000000,
  },
  {
    id: "4",
    name: "Infosys Ltd",
    symbol: "INFY",
    sector: "Information Technology",
    marketCap: 700000000000,
  },
  {
    id: "5",
    name: "ICICI Bank Ltd",
    symbol: "ICICIBANK",
    sector: "Banking",
    marketCap: 650000000000,
  },
  {
    id: "6",
    name: "Hindustan Unilever Ltd",
    symbol: "HINDUNILVR",
    sector: "FMCG",
    marketCap: 600000000000,
  },
  {
    id: "7",
    name: "State Bank of India",
    symbol: "SBIN",
    sector: "Banking",
    marketCap: 550000000000,
  },
  {
    id: "8",
    name: "Bharti Airtel Ltd",
    symbol: "BHARTIARTL",
    sector: "Telecommunications",
    marketCap: 500000000000,
  },
  {
    id: "9",
    name: "ITC Ltd",
    symbol: "ITC",
    sector: "FMCG",
    marketCap: 450000000000,
  },
  {
    id: "10",
    name: "Kotak Mahindra Bank",
    symbol: "KOTAKBANK",
    sector: "Banking",
    marketCap: 400000000000,
  },
  {
    id: "11",
    name: "Larsen & Toubro Ltd",
    symbol: "LT",
    sector: "Construction",
    marketCap: 350000000000,
  },
  {
    id: "12",
    name: "Asian Paints Ltd",
    symbol: "ASIANPAINT",
    sector: "Paints",
    marketCap: 300000000000,
  },
]

// Generate mock stock data for the last 30 days
function generateStockData(companyId: string, basePrice: number): StockData[] {
  const data: StockData[] = []
  const today = new Date()
  let currentPrice = basePrice

  for (let i = 29; i >= 0; i--) {
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
      id: `${companyId}-${i}`,
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

// Base prices for different companies
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

export const stockData: StockData[] = companies.flatMap((company) =>
  generateStockData(company.id, basePrices[company.id] || 1000),
)

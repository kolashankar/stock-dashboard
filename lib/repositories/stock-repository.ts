import { queryWithErrorHandling } from "../database"
import type { StockData, DatabaseStockData, StockDataPoint } from "../db-types"

export interface StockSummary {
  companyId: string
  currentPrice: number
  previousClose: number
  change: number
  changePercent: number
  dayHigh: number
  dayLow: number
  volume: number
  latestDate: string
}

export interface MarketOverview {
  totalCompanies: number
  totalMarketCap: number
  topGainers: Array<{
    id: string
    name: string
    symbol: string
    changePercent: number
    currentPrice: number
  }>
  topLosers: Array<{
    id: string
    name: string
    symbol: string
    changePercent: number
    currentPrice: number
  }>
  sectorDistribution: Record<string, number>
}

function generateMockStockData(companyId: string, limit = 30): StockData[] {
  const data: StockData[] = []
  const basePrice = 1000 + Math.random() * 2000
  let currentPrice = basePrice

  for (let i = limit - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)

    const change = (Math.random() - 0.5) * 0.1
    currentPrice = currentPrice * (1 + change)

    const validPrice = isFinite(currentPrice) ? currentPrice : basePrice
    const price = Math.round(validPrice * 100) / 100
    const high = Math.round(validPrice * 1.02 * 100) / 100
    const low = Math.round(validPrice * 0.98 * 100) / 100
    const open = Math.round(validPrice * 0.99 * 100) / 100
    const close = Math.round(validPrice * 100) / 100
    const volume = Math.floor(Math.random() * 1000000) + 100000

    data.push({
      id: `${companyId}-${i}`,
      companyId,
      date: date.toISOString().split("T")[0],
      open,
      high,
      low,
      close,
      volume,
      createdAt: date.toISOString(),
    })
  }

  return data.reverse() // Most recent first
}

function generateMockStockSummary(companyId: string): StockSummary {
  const currentPrice = 1000 + Math.random() * 2000
  const previousClose = currentPrice * (0.95 + Math.random() * 0.1)
  const change = currentPrice - previousClose
  const changePercent = (change / previousClose) * 100

  return {
    companyId,
    currentPrice: Math.round(currentPrice * 100) / 100,
    previousClose: Math.round(previousClose * 100) / 100,
    change: Math.round(change * 100) / 100,
    changePercent: Math.round(changePercent * 100) / 100,
    dayHigh: Math.round(currentPrice * 1.02 * 100) / 100,
    dayLow: Math.round(currentPrice * 0.98 * 100) / 100,
    volume: Math.floor(Math.random() * 1000000) + 100000,
    latestDate: new Date().toISOString().split("T")[0],
  }
}

export class StockRepository {
  private static async checkTablesExist(): Promise<boolean> {
    try {
      const result = await queryWithErrorHandling<{ exists: boolean }>(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'stock_data'
        ) as exists`,
        [],
        "StockRepository.checkTablesExist",
      )
      return result[0]?.exists || false
    } catch (error) {
      console.warn("Could not check table existence:", error)
      return false
    }
  }

  // Get stock data for a company
  static async findByCompanyId(companyId: string, limit?: number): Promise<StockData[]> {
    try {
      const tablesExist = await this.checkTablesExist()
      if (!tablesExist) {
        console.log("[v0] Stock tables don't exist, using mock data")
        return generateMockStockData(companyId, limit || 30)
      }

      let query_text = `
        SELECT id, company_id, date, open, high, low, close, volume, created_at
        FROM stock_data 
        WHERE company_id = $1 
        ORDER BY date DESC
      `
      const params: any[] = [companyId]

      if (limit) {
        query_text += ` LIMIT $2`
        params.push(limit)
      }

      const stockData = await queryWithErrorHandling<DatabaseStockData>(
        query_text,
        params,
        "StockRepository.findByCompanyId",
      )

      return stockData.map(this.mapToStockData)
    } catch (error) {
      console.warn("Database query failed, using mock data:", error)
      return generateMockStockData(companyId, limit || 30)
    }
  }

  // Get chart data for a company (simplified format)
  static async getChartData(companyId: string, days = 30): Promise<StockDataPoint[]> {
    try {
      const tablesExist = await this.checkTablesExist()
      if (!tablesExist) {
        console.log("[v0] Stock tables don't exist, generating mock chart data")
        const mockData = generateMockStockData(companyId, days)
        return mockData.map((stock) => ({
          date: stock.date,
          price: stock.close,
          volume: stock.volume,
        }))
      }

      const stockData = await queryWithErrorHandling<{
        date: string
        close: number
        volume: number
      }>(
        `SELECT date, close, volume 
         FROM stock_data 
         WHERE company_id = $1 
         ORDER BY date DESC 
         LIMIT $2`,
        [companyId, days],
        "StockRepository.getChartData",
      )

      return stockData
        .reverse() // Reverse to get chronological order for charts
        .map((row) => ({
          date: row.date,
          price: Number(row.close),
          volume: Number(row.volume),
        }))
    } catch (error) {
      console.warn("Chart data query failed, using mock data:", error)
      const mockData = generateMockStockData(companyId, days)
      return mockData.map((stock) => ({
        date: stock.date,
        price: stock.close,
        volume: stock.volume,
      }))
    }
  }

  // Get stock summary using database function
  static async getStockSummary(companyId: string): Promise<StockSummary | null> {
    try {
      const tablesExist = await this.checkTablesExist()
      if (!tablesExist) {
        console.log("[v0] Stock tables don't exist, generating mock summary")
        return generateMockStockSummary(companyId)
      }

      const result = await queryWithErrorHandling<{
        company_id: number
        current_price: number
        previous_close: number
        change: number
        change_percent: number
        day_high: number
        day_low: number
        volume: number
        latest_date: string
      }>(`SELECT * FROM get_company_stock_summary($1)`, [companyId], "StockRepository.getStockSummary")

      if (result.length === 0) return generateMockStockSummary(companyId)

      const row = result[0]
      return {
        companyId: row.company_id.toString(),
        currentPrice: Number(row.current_price),
        previousClose: Number(row.previous_close),
        change: Number(row.change),
        changePercent: Number(row.change_percent),
        dayHigh: Number(row.day_high),
        dayLow: Number(row.day_low),
        volume: Number(row.volume),
        latestDate: row.latest_date,
      }
    } catch (error) {
      console.warn("Stock summary query failed, using mock data:", error)
      return generateMockStockSummary(companyId)
    }
  }

  // Get market overview
  static async getMarketOverview(): Promise<MarketOverview> {
    try {
      const tablesExist = await this.checkTablesExist()
      if (!tablesExist) {
        console.log("[v0] Stock tables don't exist, generating mock market overview")
        return {
          totalCompanies: 5,
          totalMarketCap: 5000000000000,
          topGainers: [
            { id: "1", name: "Reliance Industries", symbol: "RELIANCE", changePercent: 2.5, currentPrice: 2450 },
            { id: "3", name: "HDFC Bank", symbol: "HDFCBANK", changePercent: 1.8, currentPrice: 1520 },
            { id: "5", name: "ICICI Bank", symbol: "ICICIBANK", changePercent: 1.2, currentPrice: 785 },
          ],
          topLosers: [
            { id: "2", name: "TCS", symbol: "TCS", changePercent: -0.8, currentPrice: 3280 },
            { id: "4", name: "Infosys", symbol: "INFY", changePercent: -0.5, currentPrice: 1580 },
          ],
          sectorDistribution: {
            Technology: 2,
            Banking: 2,
            Energy: 1,
          },
        }
      }

      // Get total companies and market cap
      const totals = await queryWithErrorHandling<{
        total_companies: number
        total_market_cap: number
      }>(
        `SELECT COUNT(*) as total_companies, SUM(market_cap) as total_market_cap FROM companies`,
        [],
        "StockRepository.getMarketOverview.totals",
      )

      // Get top gainers and losers
      const performance = await queryWithErrorHandling<{
        id: number
        name: string
        symbol: string
        current_price: number
        change_percent: number
      }>(
        `SELECT 
           c.id, c.name, c.symbol,
           sp.current_price, sp.change_percent
         FROM companies c
         JOIN stock_performance sp ON c.id = sp.company_id
         ORDER BY sp.change_percent DESC`,
        [],
        "StockRepository.getMarketOverview.performance",
      )

      // Get sector distribution
      const sectors = await queryWithErrorHandling<{
        sector: string
        count: number
      }>(
        `SELECT sector, COUNT(*) as count FROM companies GROUP BY sector`,
        [],
        "StockRepository.getMarketOverview.sectors",
      )

      const topGainers = performance.slice(0, 3).map((row) => ({
        id: row.id.toString(),
        name: row.name,
        symbol: row.symbol,
        changePercent: Number(row.change_percent),
        currentPrice: Number(row.current_price),
      }))

      const topLosers = performance
        .slice(-3)
        .reverse()
        .map((row) => ({
          id: row.id.toString(),
          name: row.name,
          symbol: row.symbol,
          changePercent: Number(row.change_percent),
          currentPrice: Number(row.current_price),
        }))

      const sectorDistribution = sectors.reduce(
        (acc, row) => {
          acc[row.sector] = Number(row.count)
          return acc
        },
        {} as Record<string, number>,
      )

      return {
        totalCompanies: Number(totals[0].total_companies),
        totalMarketCap: Number(totals[0].total_market_cap),
        topGainers,
        topLosers,
        sectorDistribution,
      }
    } catch (error) {
      console.warn("Market overview query failed, using mock data:", error)
      return {
        totalCompanies: 5,
        totalMarketCap: 5000000000000,
        topGainers: [],
        topLosers: [],
        sectorDistribution: {},
      }
    }
  }

  // Create stock data entry
  static async create(stockData: Omit<StockData, "id">): Promise<StockData> {
    try {
      const tablesExist = await this.checkTablesExist()
      if (!tablesExist) {
        console.warn("Cannot create stock data: tables don't exist")
        throw new Error("Database tables not available")
      }

      const result = await queryWithErrorHandling<DatabaseStockData>(
        `INSERT INTO stock_data (company_id, date, open, high, low, close, volume) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING id, company_id, date, open, high, low, close, volume, created_at`,
        [
          stockData.companyId,
          stockData.date,
          stockData.open,
          stockData.high,
          stockData.low,
          stockData.close,
          stockData.volume,
        ],
        "StockRepository.create",
      )

      return this.mapToStockData(result[0])
    } catch (error) {
      console.error("Failed to create stock data:", error)
      throw error
    }
  }

  // Batch insert stock data
  static async batchCreate(stockDataArray: Omit<StockData, "id">[]): Promise<void> {
    if (stockDataArray.length === 0) return

    try {
      const tablesExist = await this.checkTablesExist()
      if (!tablesExist) {
        console.warn("Cannot batch create stock data: tables don't exist")
        return
      }

      const values = stockDataArray
        .map((_, index) => {
          const base = index * 7
          return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7})`
        })
        .join(", ")

      const params = stockDataArray.flatMap((stock) => [
        stock.companyId,
        stock.date,
        stock.open,
        stock.high,
        stock.low,
        stock.close,
        stock.volume,
      ])

      await queryWithErrorHandling(
        `INSERT INTO stock_data (company_id, date, open, high, low, close, volume) 
         VALUES ${values} 
         ON CONFLICT (company_id, date) DO NOTHING`,
        params,
        "StockRepository.batchCreate",
      )
    } catch (error) {
      console.error("Failed to batch create stock data:", error)
      throw error
    }
  }

  // Helper method to map database stock data to domain stock data
  private static mapToStockData(dbStock: DatabaseStockData): StockData {
    return {
      id: dbStock.id.toString(),
      companyId: dbStock.company_id.toString(),
      date: dbStock.date,
      open: Number(dbStock.open),
      high: Number(dbStock.high),
      low: Number(dbStock.low),
      close: Number(dbStock.close),
      volume: Number(dbStock.volume),
      createdAt: dbStock.created_at,
    }
  }
}

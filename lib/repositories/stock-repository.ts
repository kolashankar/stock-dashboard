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

export class StockRepository {
  // Get stock data for a company
  static async findByCompanyId(companyId: string, limit?: number): Promise<StockData[]> {
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
  }

  // Get chart data for a company (simplified format)
  static async getChartData(companyId: string, days = 30): Promise<StockDataPoint[]> {
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
  }

  // Get stock summary using database function
  static async getStockSummary(companyId: string): Promise<StockSummary | null> {
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

    if (result.length === 0) return null

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
  }

  // Get market overview
  static async getMarketOverview(): Promise<MarketOverview> {
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
  }

  // Create stock data entry
  static async create(stockData: Omit<StockData, "id">): Promise<StockData> {
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
  }

  // Batch insert stock data
  static async batchCreate(stockDataArray: Omit<StockData, "id">[]): Promise<void> {
    if (stockDataArray.length === 0) return

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

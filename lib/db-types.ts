export interface Company {
  id: string
  name: string
  symbol: string
  sector: string
  marketCap: number
  createdAt?: Date
  updatedAt?: Date
}

export interface StockData {
  id: string
  companyId: string
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
  createdAt?: Date
}

export interface StockDataPoint {
  date: string
  price: number
  volume: number
}

// Database-specific interfaces
export interface DatabaseCompany extends Omit<Company, "marketCap"> {
  market_cap: number
}

export interface DatabaseStockData extends Omit<StockData, "companyId"> {
  company_id: string
}

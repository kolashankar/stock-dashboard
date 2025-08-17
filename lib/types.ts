export interface Company {
  id: string
  name: string
  symbol: string
  sector: string
  marketCap: number
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
}

export interface StockDataPoint {
  date: string
  price: number
  volume: number
}

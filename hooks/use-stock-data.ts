"use client"

import { useState, useEffect } from "react"
import type { StockDataPoint } from "@/lib/types"

interface StockSummary {
  companyId: string
  companyName: string
  symbol: string
  currentPrice: number
  previousClose: number
  change: number
  changePercent: number
  dayHigh: number
  dayLow: number
  volume: number
  marketCap: number
}

interface UseStockDataReturn {
  stockData: StockDataPoint[]
  summary: StockSummary | null
  loading: boolean
  error: string | null
}

export function useStockData(companyId: string | null): UseStockDataReturn {
  const [stockData, setStockData] = useState<StockDataPoint[]>([])
  const [summary, setSummary] = useState<StockSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!companyId) {
      setStockData([])
      setSummary(null)
      setError(null)
      return
    }

    const fetchStockData = async () => {
      try {
        setLoading(true)
        setError(null)

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

        const [stockResponse, summaryResponse] = await Promise.all([
          fetch(`/api/stocks/${companyId}`, { signal: controller.signal }),
          fetch(`/api/stocks/${companyId}/summary`, { signal: controller.signal }),
        ])

        clearTimeout(timeoutId)

        const stockResult = await stockResponse.json()
        const summaryResult = await summaryResponse.json()

        if (stockResult.success) {
          setStockData(stockResult.data)
        } else {
          setError(stockResult.error || "Failed to fetch stock data")
        }

        if (summaryResult.success) {
          setSummary(summaryResult.data)
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          setError("Request timed out. Please try again.")
        } else {
          setError("Network error occurred. Please check your connection.")
        }
        console.error("Error fetching stock data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchStockData()
  }, [companyId])

  return { stockData, summary, loading, error }
}

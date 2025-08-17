"use client"

import { useState, useEffect, useRef } from "react"
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

  const currentCompanyIdRef = useRef<string | null>(null)

  useEffect(() => {
    currentCompanyIdRef.current = companyId

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

        console.log("[v0] useStockData: Fetching data for company:", companyId)

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)

        const [stockResponse, summaryResponse] = await Promise.all([
          fetch(`/api/stocks/${companyId}`, { signal: controller.signal }),
          fetch(`/api/stocks/${companyId}/summary`, { signal: controller.signal }),
        ])

        clearTimeout(timeoutId)

        if (currentCompanyIdRef.current !== companyId) {
          console.log("[v0] useStockData: CompanyId changed during fetch, ignoring response")
          return
        }

        if (!stockResponse.ok) {
          const errorText = await stockResponse.text()
          console.error("Stock API error:", errorText)
          throw new Error(`Stock API returned ${stockResponse.status}: ${errorText}`)
        }

        const stockResult = await stockResponse.json()
        let summaryResult = null

        if (summaryResponse.ok) {
          try {
            summaryResult = await summaryResponse.json()
          } catch (summaryError) {
            console.warn("Failed to parse summary JSON:", summaryError)
          }
        }

        console.log("[v0] Stock API response:", stockResult.success ? "Success" : "Failed")
        console.log("[v0] Summary API response:", summaryResult?.success ? "Success" : "Failed")

        if (currentCompanyIdRef.current === companyId) {
          if (stockResult.success && Array.isArray(stockResult.data)) {
            console.log("[v0] Setting stock data:", stockResult.data.length, "points")
            setStockData(stockResult.data)
          } else {
            console.log("[v0] Stock API failed:", stockResult.message)
            setError(stockResult.message || "Failed to fetch stock data")
            setStockData([]) // Clear data on error
          }

          if (summaryResult && summaryResult.success) {
            console.log("[v0] Setting summary data:", summaryResult.data)
            setSummary(summaryResult.data)
          }
        }
      } catch (err) {
        if (currentCompanyIdRef.current === companyId) {
          if (err instanceof Error && err.name === "AbortError") {
            setError("Request timed out. Please try again.")
          } else if (err instanceof Error) {
            if (err.message.includes("Failed to execute 'json'")) {
              setError("Server returned invalid response. Please try again.")
            } else {
              setError(err.message || "Network error occurred. Please check your connection.")
            }
          } else {
            setError("An unexpected error occurred. Please try again.")
          }
          console.error("Error fetching stock data:", err)
        }
      } finally {
        if (currentCompanyIdRef.current === companyId) {
          setLoading(false)
        }
      }
    }

    fetchStockData()
  }, [companyId])

  return { stockData, summary, loading, error }
}

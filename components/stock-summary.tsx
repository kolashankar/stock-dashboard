"use client"

import { TrendingUp, TrendingDown, Activity, BarChart3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatMarketCap } from "@/lib/api-utils"

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

interface StockSummaryProps {
  summary: StockSummary | null
  loading: boolean
}

export function StockSummary({ summary, loading }: StockSummaryProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-20"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-24 mb-2"></div>
              <div className="h-4 bg-muted rounded w-16"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="mb-6">
        <Card className="p-8 text-center">
          <div className="text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Select a company to view stock details</p>
          </div>
        </Card>
      </div>
    )
  }

  const isPositive = summary.change >= 0
  const changeColor = isPositive ? "text-chart-2" : "text-destructive"
  const TrendIcon = isPositive ? TrendingUp : TrendingDown

  return (
    <div className="mb-6">
      {/* Company Header */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-foreground">{summary.companyName}</h1>
          <Badge variant="outline" className="text-sm">
            {summary.symbol}
          </Badge>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-3xl font-bold text-foreground">{formatCurrency(summary.currentPrice)}</span>
          <div className={`flex items-center gap-1 ${changeColor}`}>
            <TrendIcon className="h-5 w-5" />
            <span className="font-semibold">
              {formatCurrency(Math.abs(summary.change))} ({Math.abs(summary.changePercent).toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Previous Close</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.previousClose)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Day Range</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {formatCurrency(summary.dayLow)} - {formatCurrency(summary.dayHigh)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">{summary.volume.toLocaleString("en-IN")}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Market Cap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">{formatMarketCap(summary.marketCap)}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

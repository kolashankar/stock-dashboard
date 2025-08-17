"use client"

import { useMemo } from "react"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"
import type { StockDataPoint } from "@/lib/types"

interface StockChartProps {
  data: StockDataPoint[]
  companyName?: string
  symbol?: string
  loading?: boolean
}

interface ChartDataPoint extends StockDataPoint {
  formattedDate: string
  priceChange?: number
}

export function StockChart({ data, companyName, symbol, loading }: StockChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []

    return data.map((point, index) => {
      const date = new Date(point.date)
      const formattedDate = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })

      // Calculate price change from previous day
      const priceChange = index > 0 ? point.price - data[index - 1].price : 0

      return {
        ...point,
        formattedDate,
        priceChange,
      }
    })
  }, [data])

  const priceRange = useMemo(() => {
    if (chartData.length === 0) return { min: 0, max: 0, trend: 0 }

    const prices = chartData.map((d) => d.price)
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    const firstPrice = prices[0]
    const lastPrice = prices[prices.length - 1]
    const trend = ((lastPrice - firstPrice) / firstPrice) * 100

    return { min, max, trend }
  }, [chartData])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-popover-foreground">{label}</p>
          <p className="text-lg font-bold text-accent">₹{data.price.toFixed(2)}</p>
          <p className="text-sm text-muted-foreground">Volume: {data.volume.toLocaleString()}</p>
          {data.priceChange !== 0 && (
            <p
              className={`text-sm flex items-center gap-1 ${
                data.priceChange > 0 ? "text-chart-2" : "text-destructive"
              }`}
            >
              {data.priceChange > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {data.priceChange > 0 ? "+" : ""}
              {data.priceChange.toFixed(2)}
            </p>
          )}
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Price Chart</CardTitle>
            <div className="animate-pulse">
              <div className="h-6 bg-muted rounded w-20"></div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-muted animate-pulse rounded"></div>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Price Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p>No chart data available</p>
              <p className="text-sm mt-2">Select a company to view its price chart</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const isPositiveTrend = priceRange.trend >= 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">Price Chart</CardTitle>
            {symbol && (
              <Badge variant="outline" className="text-sm">
                {symbol}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1 text-sm font-medium ${
                isPositiveTrend ? "text-chart-2" : "text-destructive"
              }`}
            >
              {isPositiveTrend ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {isPositiveTrend ? "+" : ""}
              {priceRange.trend.toFixed(2)}%
            </div>
          </div>
        </div>
        {companyName && <p className="text-sm text-muted-foreground">{companyName} - 30 Day Performance</p>}
      </CardHeader>
      <CardContent>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={isPositiveTrend ? "hsl(var(--chart-2))" : "hsl(var(--destructive))"}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={isPositiveTrend ? "hsl(var(--chart-2))" : "hsl(var(--destructive))"}
                    stopOpacity={0.05}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
              <XAxis
                dataKey="formattedDate"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={["dataMin - 10", "dataMax + 10"]}
                tickFormatter={(value) => `₹${value.toFixed(0)}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="price"
                stroke={isPositiveTrend ? "hsl(var(--chart-2))" : "hsl(var(--destructive))"}
                strokeWidth={2}
                fill="url(#priceGradient)"
                dot={false}
                activeDot={{
                  r: 4,
                  fill: isPositiveTrend ? "hsl(var(--chart-2))" : "hsl(var(--destructive))",
                  stroke: "hsl(var(--background))",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

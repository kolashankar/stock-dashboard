"use client"

import { useMemo, useEffect, useState } from "react"
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
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return []
    }

    return data.map((point, index) => {
      const date = new Date(point.date)
      const formattedDate = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })

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
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-gray-900">{label}</p>
          <p className="text-lg font-bold text-blue-600">₹{data.price.toFixed(2)}</p>
          <p className="text-sm text-gray-600">Volume: {data.volume.toLocaleString()}</p>
          {data.priceChange !== 0 && (
            <p
              className={`text-sm flex items-center gap-1 ${data.priceChange > 0 ? "text-green-600" : "text-red-600"}`}
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
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Price Chart</CardTitle>
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-gray-100 animate-pulse rounded"></div>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Price Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center text-gray-500">
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

  if (!isMounted) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Price Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-gray-50 rounded flex items-center justify-center">
            <div className="text-gray-500">Loading chart...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const isPositiveTrend = priceRange.trend >= 0

  return (
    <Card className="w-full">
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
                isPositiveTrend ? "text-green-600" : "text-red-600"
              }`}
            >
              {isPositiveTrend ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {isPositiveTrend ? "+" : ""}
              {priceRange.trend.toFixed(2)}%
            </div>
          </div>
        </div>
        {companyName && <p className="text-sm text-gray-600">{companyName} - 30 Day Performance</p>}
      </CardHeader>
      <CardContent>
        <div className="h-96 w-full bg-white rounded border" style={{ minHeight: "384px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.7} />
              <XAxis
                dataKey="formattedDate"
                stroke="#374151"
                fontSize={12}
                tickLine={true}
                axisLine={true}
                tick={{ fill: "#374151" }}
              />
              <YAxis
                stroke="#374151"
                fontSize={12}
                tickLine={true}
                axisLine={true}
                domain={["dataMin - 10", "dataMax + 10"]}
                tickFormatter={(value) => `₹${value.toFixed(0)}`}
                tick={{ fill: "#374151" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#3B82F6"
                strokeWidth={3}
                fill="url(#priceGradient)"
                dot={false}
                activeDot={{
                  r: 6,
                  fill: "#3B82F6",
                  stroke: "#ffffff",
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

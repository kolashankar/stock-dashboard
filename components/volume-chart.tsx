"use client"

import { useMemo, useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity } from "lucide-react"
import type { StockDataPoint } from "@/lib/types"

interface VolumeChartProps {
  data: StockDataPoint[]
  loading?: boolean
}

export function VolumeChart({ data, loading }: VolumeChartProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return []
    }

    return data.map((point) => {
      const date = new Date(point.date)
      const formattedDate = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })

      return {
        ...point,
        formattedDate,
        volumeInMillions: point.volume / 1000000,
      }
    })
  }, [data])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-gray-900">{label}</p>
          <p className="text-lg font-bold text-orange-600">{data.volume.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Volume</p>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Volume
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-100 animate-pulse rounded"></div>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Volume
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <p>No volume data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!isMounted) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Volume
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
            <div className="text-gray-500">Loading chart...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Trading Volume
        </CardTitle>
        <p className="text-sm text-gray-600">Daily trading volume over 30 days</p>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full bg-white rounded border" style={{ minHeight: "256px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
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
                tickFormatter={(value) => `${value.toFixed(1)}M`}
                tick={{ fill: "#374151" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="volumeInMillions"
                fill="#F97316"
                radius={[4, 4, 0, 0]}
                opacity={0.8}
                stroke="#EA580C"
                strokeWidth={1}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

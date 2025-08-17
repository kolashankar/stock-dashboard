"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="h-6 bg-muted rounded w-32 animate-pulse"></div>
          <div className="h-5 bg-muted rounded w-16 animate-pulse"></div>
        </div>
        <div className="h-4 bg-muted rounded w-48 animate-pulse"></div>
      </CardHeader>
      <CardContent>
        <div className="h-96 bg-muted rounded animate-pulse"></div>
      </CardContent>
    </Card>
  )
}

export function SummarySkeleton() {
  return (
    <div className="mb-6">
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-8 bg-muted rounded w-64 animate-pulse"></div>
          <div className="h-6 bg-muted rounded w-16 animate-pulse"></div>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-10 bg-muted rounded w-32 animate-pulse"></div>
          <div className="h-6 bg-muted rounded w-24 animate-pulse"></div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-24 mb-2 animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

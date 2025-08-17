"use client"

import { useState, useEffect } from "react"
import { CompanyList } from "@/components/company-list"
import { StockSummary } from "@/components/stock-summary"
import { StockChart } from "@/components/stock-chart"
import { VolumeChart } from "@/components/volume-chart"
import { MobileNav } from "@/components/mobile-nav"
import { ChartSkeleton, SummarySkeleton } from "@/components/loading-skeleton"
import { ErrorDisplay } from "@/components/error-boundary"
import { useStockData } from "@/hooks/use-stock-data"
import { TrendingUp } from "lucide-react"
import type { Company } from "@/lib/types"

export default function StockDashboard() {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const { stockData, summary, loading, error } = useStockData(selectedCompany?.id || null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company)
  }

  const getDeviceMessage = () => {
    if (!isMounted) return "sidebar" // Default for SSR
    return typeof window !== "undefined" && window.innerWidth < 768 ? "menu" : "sidebar"
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden md:block w-80 flex-shrink-0">
        <CompanyList selectedCompanyId={selectedCompany?.id || null} onCompanySelect={handleCompanySelect} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-muted border-b border-border px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MobileNav selectedCompanyId={selectedCompany?.id || null} onCompanySelect={handleCompanySelect} />
              <div className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-accent" />
                <h1 className="text-lg md:text-xl font-bold text-foreground">Stock Market Dashboard</h1>
              </div>
            </div>
            <div className="hidden sm:block text-sm text-muted-foreground">Real-time market data</div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {error ? (
            <ErrorDisplay
              title="Failed to load stock data"
              message={error}
              onRetry={() => {
                if (typeof window !== "undefined") {
                  window.location.reload()
                }
              }}
            />
          ) : loading && !selectedCompany ? (
            <SummarySkeleton />
          ) : (
            <StockSummary summary={summary} loading={loading} />
          )}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
            <div className="xl:col-span-2">
              {error ? (
                <ErrorDisplay message="Unable to load price chart" />
              ) : loading && selectedCompany ? (
                <ChartSkeleton />
              ) : (
                <StockChart
                  data={stockData}
                  companyName={selectedCompany?.name}
                  symbol={selectedCompany?.symbol}
                  loading={loading}
                />
              )}
            </div>
            <div>
              {error ? (
                <ErrorDisplay message="Unable to load volume data" />
              ) : loading && selectedCompany ? (
                <ChartSkeleton />
              ) : (
                <VolumeChart data={stockData} loading={loading} />
              )}
            </div>
          </div>

          {!selectedCompany && !loading && (
            <div className="mt-8 text-center">
              <div className="max-w-md mx-auto">
                <TrendingUp className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">Welcome to Stock Dashboard</h2>
                <p className="text-muted-foreground">
                  Select a company from the {getDeviceMessage()} to view detailed stock analysis, price charts, and
                  trading volume data.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

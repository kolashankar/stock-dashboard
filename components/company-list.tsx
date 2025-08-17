"use client"

import { useState } from "react"
import { Search, Building2 } from "lucide-react"
import { Input } from "@components/ui/input"
import { Card } from "@components/ui/card"
import { Badge } from "@components/ui/badge"
import { useCompanies } from "@hooks/use-companies"
import { ErrorDisplay } from "@components/error-boundary"
import type { Company } from "@lib/types"
import { formatMarketCap } from "@lib/api-utils"

interface CompanyListProps {
  selectedCompanyId: string | null
  onCompanySelect: (company: Company) => void
}

export function CompanyList({ selectedCompanyId, onCompanySelect }: CompanyListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const { companies, loading, error, searchCompanies } = useCompanies()

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      await searchCompanies(query)
    } else {
      await searchCompanies("")
    }
  }

  if (error) {
    return (
      <div className="h-full bg-sidebar border-r border-sidebar-border">
        <div className="p-4">
          <ErrorDisplay message={error} onRetry={() => window.location.reload()} />
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-sidebar border-r border-sidebar-border">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="h-5 w-5 text-sidebar-foreground" />
          <h2 className="text-lg font-semibold text-sidebar-foreground">Companies</h2>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search companies..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 bg-background border-sidebar-border transition-all duration-200 focus:ring-2 focus:ring-sidebar-accent"
          />
        </div>
      </div>

      {/* Company List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4">
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-muted rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>
        ) : companies.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No companies found</p>
            {searchQuery && <p className="text-sm">Try a different search term</p>}
          </div>
        ) : (
          <div className="p-2">
            {companies.map((company) => (
              <Card
                key={company.id}
                className={`p-3 mb-2 cursor-pointer transition-all duration-200 hover:bg-sidebar-accent/50 hover:scale-[1.02] ${
                  selectedCompanyId === company.id
                    ? "bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-accent shadow-md"
                    : "bg-card hover:border-sidebar-border hover:shadow-sm"
                }`}
                onClick={() => onCompanySelect(company)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm truncate">{company.name}</h3>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {company.symbol}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{formatMarketCap(company.marketCap)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{company.sector}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

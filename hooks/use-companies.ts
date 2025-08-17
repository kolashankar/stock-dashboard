"use client"

import { useState, useEffect } from "react"
import type { Company } from "@/lib/types"

interface UseCompaniesReturn {
  companies: Company[]
  loading: boolean
  error: string | null
  searchCompanies: (query: string) => Promise<void>
}

export function useCompanies(): UseCompaniesReturn {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCompanies = async (searchQuery?: string) => {
    try {
      setLoading(true)
      setError(null)

      const url = searchQuery ? `/api/companies/search?q=${encodeURIComponent(searchQuery)}` : "/api/companies"

      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        setCompanies(data.data)
      } else {
        setError(data.error || "Failed to fetch companies")
      }
    } catch (err) {
      setError("Network error occurred")
      console.error("Error fetching companies:", err)
    } finally {
      setLoading(false)
    }
  }

  const searchCompanies = async (query: string) => {
    await fetchCompanies(query)
  }

  useEffect(() => {
    fetchCompanies()
  }, [])

  return { companies, loading, error, searchCompanies }
}

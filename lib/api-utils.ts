export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export function createSuccessResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
  }
}

export function createErrorResponse(error: string, status?: number): ApiResponse<never> {
  return {
    success: false,
    error,
  }
}

export function validateCompanyId(companyId: string): boolean {
  return /^[1-9]\d*$/.test(companyId) && Number.parseInt(companyId) <= 12
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1e12) {
    return `₹${(marketCap / 1e12).toFixed(2)}T`
  } else if (marketCap >= 1e9) {
    return `₹${(marketCap / 1e9).toFixed(2)}B`
  } else if (marketCap >= 1e6) {
    return `₹${(marketCap / 1e6).toFixed(2)}M`
  }
  return `₹${marketCap.toLocaleString("en-IN")}`
}

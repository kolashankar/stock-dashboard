"use client"

import { useState } from "react"
import { Menu, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { CompanyList } from "@/components/company-list"
import type { Company } from "@/lib/types"

interface MobileNavProps {
  selectedCompanyId: string | null
  onCompanySelect: (company: Company) => void
}

export function MobileNav({ selectedCompanyId, onCompanySelect }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleCompanySelect = (company: Company) => {
    onCompanySelect(company)
    setIsOpen(false) // Close the sheet after selection
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="md:hidden bg-transparent">
          <Menu className="h-4 w-4" />
          <span className="sr-only">Open company list</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Companies
          </SheetTitle>
        </SheetHeader>
        <div className="h-full">
          <CompanyList selectedCompanyId={selectedCompanyId} onCompanySelect={handleCompanySelect} />
        </div>
      </SheetContent>
    </Sheet>
  )
}

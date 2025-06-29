"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, TrendingUp, TrendingDown } from "lucide-react"

interface FloatingActionButtonProps {
  onAddTransaction: () => void
}

export function FloatingActionButton({ onAddTransaction }: FloatingActionButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {isExpanded && (
        <div className="mb-4 space-y-2">
          <Button
            onClick={() => {
              onAddTransaction()
              setIsExpanded(false)
            }}
            className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg"
            size="sm"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Add Income
          </Button>
          <Button
            onClick={() => {
              onAddTransaction()
              setIsExpanded(false)
            }}
            className="w-full bg-red-600 hover:bg-red-700 text-white shadow-lg"
            size="sm"
          >
            <TrendingDown className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>
      )}

      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        className="h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        size="icon"
      >
        <Plus className={`h-6 w-6 transition-transform duration-200 ${isExpanded ? "rotate-45" : ""}`} />
      </Button>
    </div>
  )
}

"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, FileText, CheckCircle } from "lucide-react"

interface Transaction {
  _id: string
  date: string
  amount: number
  category: string
  description: string
  status: string
  user: string
  type: "income" | "expense"
}

interface ExportModalProps {
  transactions: Transaction[]
  onClose: () => void
}

interface ColumnConfig {
  key: keyof Transaction | "formattedAmount" | "formattedDate"
  label: string
  selected: boolean
}

export function ExportModal({ transactions, onClose }: ExportModalProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportComplete, setExportComplete] = useState(false)
  const [columns, setColumns] = useState<ColumnConfig[]>([
    { key: "formattedDate", label: "Date", selected: true },
    { key: "description", label: "Description", selected: true },
    { key: "category", label: "Category", selected: true },
    { key: "formattedAmount", label: "Amount", selected: true },
    { key: "type", label: "Type", selected: true },
    { key: "status", label: "Status", selected: true },
    { key: "user", label: "User", selected: false },
    { key: "_id", label: "Transaction ID", selected: false },
  ])

  const toggleColumn = (index: number) => {
    const newColumns = [...columns]
    newColumns[index].selected = !newColumns[index].selected
    setColumns(newColumns)
  }

  const selectAll = () => {
    setColumns(columns.map((col) => ({ ...col, selected: true })))
  }

  const selectNone = () => {
    setColumns(columns.map((col) => ({ ...col, selected: false })))
  }

  const formatTransactionForExport = (transaction: Transaction) => {
    const formatted: any = { ...transaction }
    formatted.formattedDate = new Date(transaction.date).toLocaleDateString()
    formatted.formattedAmount = `${transaction.type === "income" ? "+" : "-"}₹${Math.abs(transaction.amount)}`
    return formatted
  }

  const generateCSV = () => {
    const selectedColumns = columns.filter((col) => col.selected)

    if (selectedColumns.length === 0) {
      return
    }

    // Create CSV header
    const headers = selectedColumns.map((col) => col.label).join(",")

    // Create CSV rows
    const rows = transactions.map((transaction) => {
      const formattedTransaction = formatTransactionForExport(transaction)
      return selectedColumns
        .map((col) => {
          const value = formattedTransaction[col.key]
          // Escape commas and quotes in CSV
          if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        })
        .join(",")
    })

    return [headers, ...rows].join("\n")
  }

  const handleExport = async () => {
    const selectedColumns = columns.filter((col) => col.selected)

    if (selectedColumns.length === 0) {
      return
    }

    setIsExporting(true)

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const csvContent = generateCSV()

      if (csvContent) {
        // Create and download the file
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const link = document.createElement("a")
        const url = URL.createObjectURL(blob)

        link.setAttribute("href", url)
        link.setAttribute("download", `financial-transactions-${new Date().toISOString().split("T")[0]}.csv`)
        link.style.visibility = "hidden"

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        setExportComplete(true)

        // Auto close after 2 seconds
        setTimeout(() => {
          onClose()
        }, 2000)
      }
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const selectedCount = columns.filter((col) => col.selected).length

  if (exportComplete) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Export Complete!</span>
            </DialogTitle>
            <DialogDescription>Your CSV file has been downloaded successfully.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <div className="text-center">
              <FileText className="h-16 w-16 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                {transactions.length} transactions exported with {selectedCount} columns
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Export Transactions to CSV</span>
          </DialogTitle>
          <DialogDescription>
            Select the columns you want to include in your CSV export.
            {transactions.length} transactions will be exported.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {selectedCount} of {columns.length} columns selected
            </div>
            <div className="space-x-2">
              <Button variant="outline" size="sm" onClick={selectAll}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={selectNone}>
                Select None
              </Button>
            </div>
          </div>

          {/* Column Selection */}
          <div className="grid grid-cols-2 gap-4 max-h-60 overflow-y-auto">
            {columns.map((column, index) => (
              <div key={column.key} className="flex items-center space-x-2">
                <Checkbox
                  id={`column-${index}`}
                  checked={column.selected}
                  onCheckedChange={() => toggleColumn(index)}
                />
                <Label
                  htmlFor={`column-${index}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {column.label}
                </Label>
              </div>
            ))}
          </div>

          {selectedCount === 0 && (
            <Alert>
              <AlertDescription>Please select at least one column to export.</AlertDescription>
            </Alert>
          )}

          {/* Preview */}
          {selectedCount > 0 && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="text-sm font-medium mb-2">Preview</h4>
              <div className="text-xs text-gray-600 font-mono">
                {columns
                  .filter((col) => col.selected)
                  .map((col) => col.label)
                  .join(", ")}
              </div>
              <div className="text-xs text-gray-500 mt-1">Currency format: ₹ (Indian Rupee)</div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isExporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={selectedCount === 0 || isExporting} className="min-w-[120px]">
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

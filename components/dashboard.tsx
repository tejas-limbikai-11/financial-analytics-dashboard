"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TransactionTable } from "@/components/transaction-table"
import { FinancialCharts } from "@/components/financial-charts"
import { ExportModal } from "@/components/export-modal"
import { AddTransactionModal } from "@/components/add-transaction-modal"
import { LogOut, Download, Search, Filter, AlertCircle, Plus, TrendingUp } from "lucide-react"
import { FloatingActionButton } from "@/components/floating-action-button"

interface DashboardProps {
  onLogout: () => void
}

interface Transaction {
  _id: string
  date: string
  amount: number
  category: string
  description: string
  status: string
  user: string
  type: "income" | "expense"
  user_profile?: string
}

interface Filters {
  search: string
  category: string
  status: string
  dateFrom: string
  dateTo: string
  amountMin: string
  amountMax: string
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isInitializing, setIsInitializing] = useState(false)
  const [error, setError] = useState("")
  const [showExportModal, setShowExportModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [filters, setFilters] = useState<Filters>({
    search: "",
    category: "",
    status: "",
    dateFrom: "",
    dateTo: "",
    amountMin: "",
    amountMax: "",
  })

  const categories = ["Revenue", "Expense"]
  const statuses = ["paid", "pending"]

  useEffect(() => {
    initializeUserData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [transactions, filters])

  const initializeUserData = async () => {
    try {
      setIsLoading(true)
      setIsInitializing(true)

      const token = localStorage.getItem("token")

      // First, try to fetch existing transactions
      const transactionsResponse = await fetch("/api/transactions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (transactionsResponse.ok) {
        const data = await transactionsResponse.json()

        if (data.length === 0) {
          // No transactions found, initialize with sample data
          console.log("No transactions found, initializing with sample data...")

          const initResponse = await fetch("/api/auth/initialize", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          if (initResponse.ok) {
            // Fetch transactions again after initialization
            const newTransactionsResponse = await fetch("/api/transactions", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })

            if (newTransactionsResponse.ok) {
              const newData = await newTransactionsResponse.json()
              setTransactions(newData)
              console.log(`✅ Loaded ${newData.length} transactions after initialization`)
            }
          } else {
            setError("Failed to initialize data")
          }
        } else {
          setTransactions(data)
          console.log(`✅ Loaded ${data.length} existing transactions`)
        }
      } else {
        setError("Failed to fetch transactions")
      }
    } catch (err) {
      console.error("Error initializing data:", err)
      setError("Network error occurred")
    } finally {
      setIsLoading(false)
      setIsInitializing(false)
    }
  }

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/transactions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setTransactions(data)
      } else {
        setError("Failed to fetch transactions")
      }
    } catch (err) {
      setError("Network error occurred")
    }
  }

  const applyFilters = () => {
    let filtered = [...transactions]

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(
        (t) =>
          t.description.toLowerCase().includes(filters.search.toLowerCase()) ||
          t.category.toLowerCase().includes(filters.search.toLowerCase()) ||
          t.user.toLowerCase().includes(filters.search.toLowerCase()),
      )
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter((t) => t.category === filters.category)
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter((t) => t.status === filters.status)
    }

    // Date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter((t) => new Date(t.date) >= new Date(filters.dateFrom))
    }
    if (filters.dateTo) {
      filtered = filtered.filter((t) => new Date(t.date) <= new Date(filters.dateTo))
    }

    // Amount range filter
    if (filters.amountMin) {
      filtered = filtered.filter((t) => Math.abs(t.amount) >= Number.parseFloat(filters.amountMin))
    }
    if (filters.amountMax) {
      filtered = filtered.filter((t) => Math.abs(t.amount) <= Number.parseFloat(filters.amountMax))
    }

    setFilteredTransactions(filtered)
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    onLogout()
  }

  const clearFilters = () => {
    setFilters({
      search: "",
      category: "",
      status: "",
      dateFrom: "",
      dateTo: "",
      amountMin: "",
      amountMax: "",
    })
  }

  const activeFiltersCount = Object.values(filters).filter((value) => value !== "").length

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">
            {isInitializing ? "Setting up your financial data..." : "Loading dashboard..."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Financial Analytics</h1>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => setShowAddModal(true)} className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add Transaction</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowExportModal(true)}
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Export CSV</span>
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Welcome Message */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <TrendingUp className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Welcome to your Financial Analytics Dashboard!
                <span className="font-medium">
                  {" "}
                  You have {transactions.length} transactions loaded and ready for analysis.
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="mb-8">
          <FinancialCharts transactions={filteredTransactions} />
        </div>

        {/* Filters Section */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Filters</span>
                {activeFiltersCount > 0 && <Badge variant="secondary">{activeFiltersCount}</Badge>}
              </CardTitle>
              {activeFiltersCount > 0 && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search transactions..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Date From */}
              <Input
                type="date"
                placeholder="From Date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              />

              {/* Date To */}
              <Input
                type="date"
                placeholder="To Date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              />

              {/* Amount Min */}
              <Input
                type="number"
                placeholder="Min Amount (₹)"
                value={filters.amountMin}
                onChange={(e) => setFilters({ ...filters, amountMin: e.target.value })}
              />

              {/* Amount Max */}
              <Input
                type="number"
                placeholder="Max Amount (₹)"
                value={filters.amountMax}
                onChange={(e) => setFilters({ ...filters, amountMax: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <TransactionTable transactions={filteredTransactions} />

        {/* Modals */}
        {showExportModal && (
          <ExportModal transactions={filteredTransactions} onClose={() => setShowExportModal(false)} />
        )}

        {showAddModal && (
          <AddTransactionModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onTransactionAdded={fetchTransactions}
          />
        )}

        {/* Floating Action Button */}
        <FloatingActionButton onAddTransaction={() => setShowAddModal(true)} />
      </main>
    </div>
  )
}

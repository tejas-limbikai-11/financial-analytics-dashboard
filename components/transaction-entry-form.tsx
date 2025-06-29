"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Plus, CheckCircle, AlertCircle, Calculator, Calendar } from "lucide-react"

interface TransactionEntryFormProps {
  onTransactionAdded: () => void
}

export function TransactionEntryForm({ onTransactionAdded }: TransactionEntryFormProps) {
  const [formData, setFormData] = useState({
    type: "",
    amount: "",
    category: "",
    description: "",
    status: "",
    date: new Date().toISOString().split("T")[0], // Today's date
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const transactionTypes = [
    { value: "income", label: "Income", color: "text-green-600", bgColor: "bg-green-50" },
    { value: "expense", label: "Expense", color: "text-red-600", bgColor: "bg-red-50" },
  ]

  const categories = {
    income: ["Salary", "Freelance", "Business", "Investment", "Rental", "Bonus", "Gift", "Other Income"],
    expense: [
      "Food & Dining",
      "Transportation",
      "Shopping",
      "Bills & Utilities",
      "Healthcare",
      "Entertainment",
      "Education",
      "Travel",
      "Insurance",
      "Other Expense",
    ],
  }

  const statuses = [
    { value: "paid", label: "Paid", color: "text-green-600" },
    { value: "pending", label: "Pending", color: "text-yellow-600" },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    // Validation
    const numAmount = Number.parseFloat(formData.amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid amount greater than 0")
      setIsLoading(false)
      return
    }

    if (numAmount > 10000000) {
      setError("Amount cannot exceed ₹1,00,00,000")
      setIsLoading(false)
      return
    }

    if (formData.description.length < 3) {
      setError("Description must be at least 3 characters long")
      setIsLoading(false)
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: numAmount,
          category: formData.category,
          description: formData.description,
          status: formData.status,
          type: formData.type,
          date: formData.date,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccess(
          `Transaction added successfully! ${formData.type === "income" ? "+" : "-"}₹${numAmount.toLocaleString()}`,
        )

        // Reset form
        setFormData({
          type: "",
          amount: "",
          category: "",
          description: "",
          status: "",
          date: new Date().toISOString().split("T")[0],
        })

        onTransactionAdded()

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess("")
        }, 3000)
      } else {
        setError(data.message || "Failed to create transaction")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")

    // Reset category when type changes
    if (field === "type") {
      setFormData((prev) => ({ ...prev, [field]: value, category: "" }))
    }
  }

  const selectedType = transactionTypes.find((t) => t.value === formData.type)
  const availableCategories = formData.type ? categories[formData.type as keyof typeof categories] : []

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Add New Transaction</span>
        </CardTitle>
        <CardDescription>Record your income or expense transaction with detailed information</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">{success}</AlertDescription>
            </Alert>
          )}

          {/* Transaction Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Transaction Type *</Label>
            <div className="grid grid-cols-2 gap-3">
              {transactionTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleInputChange("type", type.value)}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    formData.type === type.value
                      ? `border-current ${type.color} ${type.bgColor}`
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className={`font-medium ${formData.type === type.value ? type.color : "text-gray-700"}`}>
                    {type.label}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {type.value === "income" ? "Money coming in" : "Money going out"}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹) *</Label>
              <div className="relative">
                <Calculator className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  max="10000000"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => handleInputChange("amount", e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
              {formData.amount && (
                <div className="text-sm text-gray-600">
                  Amount: ₹{Number.parseFloat(formData.amount || "0").toLocaleString()}
                </div>
              )}
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Transaction Date *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange("category", value)}
                disabled={!formData.type}
              >
                <SelectTrigger>
                  <SelectValue placeholder={formData.type ? "Select category" : "Select type first"} />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Payment Status *</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      <span className={status.color}>{status.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Enter transaction description (e.g., 'Grocery shopping at SuperMart')"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              required
              rows={3}
              minLength={3}
            />
            <div className="text-sm text-gray-500">{formData.description.length}/200 characters</div>
          </div>

          {/* Transaction Preview */}
          {formData.type && formData.amount && formData.category && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="text-sm font-medium mb-3 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                Transaction Preview
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Type:</span>
                  <Badge variant="outline" className={`ml-2 ${selectedType?.color}`}>
                    {selectedType?.label}
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-600">Amount:</span>
                  <span className={`ml-2 font-medium ${selectedType?.color}`}>
                    {formData.type === "income" ? "+" : "-"}₹
                    {Number.parseFloat(formData.amount || "0").toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Category:</span>
                  <span className="ml-2 font-medium">{formData.category}</span>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <span className="ml-2 font-medium capitalize">{formData.status}</span>
                </div>
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={
              isLoading ||
              !formData.type ||
              !formData.amount ||
              !formData.category ||
              !formData.description ||
              !formData.status
            }
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Adding Transaction...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

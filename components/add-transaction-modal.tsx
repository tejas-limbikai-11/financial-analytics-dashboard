"use client"

import type React from "react"

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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, CheckCircle } from "lucide-react"

interface AddTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onTransactionAdded: () => void
}

export function AddTransactionModal({ isOpen, onClose, onTransactionAdded }: AddTransactionModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    description: "",
    status: "",
    type: "",
  })

  const categories = [
    "Revenue",
    "Expense",
    "Food & Dining",
    "Transportation",
    "Shopping",
    "Entertainment",
    "Bills & Utilities",
    "Healthcare",
    "Education",
    "Travel",
    "Investment",
    "Salary",
    "Freelance",
    "Business",
    "Other",
  ]
  const statuses = ["paid", "pending"]
  const types = ["income", "expense"]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validate amount
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

    // Validate description length
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
          amount: Number.parseFloat(formData.amount),
          category: formData.category,
          description: formData.description,
          status: formData.status,
          type: formData.type,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccess(true)
        setFormData({
          amount: "",
          category: "",
          description: "",
          status: "",
          type: "",
        })

        // Auto close after 2 seconds and refresh transactions
        setTimeout(() => {
          setSuccess(false)
          onTransactionAdded()
          onClose()
        }, 2000)
      } else {
        setError(data.message || "Failed to create transaction")
      }
    } catch (err) {
      console.error("Transaction creation error:", err)
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")
  }

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        amount: "",
        category: "",
        description: "",
        status: "",
        type: "",
      })
      setError("")
      setSuccess(false)
      onClose()
    }
  }

  if (success) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Transaction Added!</span>
            </DialogTitle>
            <DialogDescription>Your transaction has been successfully created.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <div className="text-center">
              <Plus className="h-16 w-16 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Transaction added to your dashboard</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Add New Transaction</span>
          </DialogTitle>
          <DialogDescription>Create a new income or expense transaction.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Transaction Type</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {types.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter transaction description..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              required
              rows={3}
            />
          </div>

          {formData.amount && formData.category && formData.description && (
            <div className="border rounded-lg p-3 bg-gray-50">
              <h4 className="text-sm font-medium mb-2">Transaction Preview:</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className={`font-medium ${formData.type === "income" ? "text-green-600" : "text-red-600"}`}>
                    {formData.type === "income" ? "Income" : "Expense"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span className={`font-medium ${formData.type === "income" ? "text-green-600" : "text-red-600"}`}>
                    {formData.type === "income" ? "+" : "-"}₹
                    {Number.parseFloat(formData.amount || "0").toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Category:</span>
                  <span className="font-medium">{formData.category}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-medium capitalize">{formData.status}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isLoading ||
                !formData.amount ||
                !formData.category ||
                !formData.description ||
                !formData.status ||
                !formData.type
              }
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Transaction
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

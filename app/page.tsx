"use client"

import { useState, useEffect } from "react"
import { AuthForm } from "@/components/auth-form"
import { Dashboard } from "@/components/dashboard"
import { QuickRegistration } from "@/components/quick-registration"
import { TransactionEntryForm } from "@/components/transaction-entry-form"

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showQuickRegistration, setShowQuickRegistration] = useState(false)
  const [showTransactionEntry, setShowTransactionEntry] = useState(false)

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem("token")
    if (token) {
      // Verify token validity
      fetch("/api/auth/verify", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          console.log("Token verification status:", res.status) // Debug log
          if (res.ok) {
            setIsAuthenticated(true)
          } else {
            console.log("Token invalid, removing from storage")
            localStorage.removeItem("token")
            localStorage.removeItem("user")
          }
        })
        .catch((error) => {
          console.error("Token verification error:", error)
          localStorage.removeItem("token")
          localStorage.removeItem("user")
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else {
      setIsLoading(false)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated ? (
        <>
          <Dashboard onLogout={() => setIsAuthenticated(false)} />
          {showTransactionEntry && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-4 border-b flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Quick Transaction Entry</h2>
                  <button onClick={() => setShowTransactionEntry(false)} className="text-gray-500 hover:text-gray-700">
                    ✕
                  </button>
                </div>
                <div className="p-4">
                  <TransactionEntryForm
                    onTransactionAdded={() => {
                      setShowTransactionEntry(false)
                      window.location.reload() // Refresh to show new transaction
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </>
      ) : showQuickRegistration ? (
        <div className="min-h-screen flex items-center justify-center p-4">
          <QuickRegistration
            onSuccess={() => setIsAuthenticated(true)}
            onSwitchToLogin={() => setShowQuickRegistration(false)}
          />
        </div>
      ) : (
        <AuthForm onLogin={() => setIsAuthenticated(true)} />
      )}
    </div>
  )
}

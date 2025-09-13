"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CreditCard, Loader2, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface PaymentButtonProps {
  doctorId: number
  date: string
  time: string
  reason: string
  amount: number
  doctorName: string
  disabled?: boolean
  className?: string
}

export function PaymentButton({ 
  doctorId,
  date,
  time,
  reason,
  amount, 
  doctorName, 
  disabled = false,
  className = "" 
}: PaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { token } = useAuth()

  const handlePayment = async () => {
    if (!token) {
      setError("Please login to make payment")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Create appointment booking (which creates Stripe session)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/appointments/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctor_id: doctorId,
          date: date,
          time: time,
          reason: reason
        }),
      })

      const data = await response.json()

      if (response.ok && data.checkout_url) {
        // Redirect to Stripe checkout
        window.location.href = data.checkout_url
      } else {
        setError(data.detail || "Failed to create payment session")
      }
    } catch (error) {
      setError("Network error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handlePayment}
        disabled={disabled || isLoading}
        className={`w-full ${className}`}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4 mr-2" />
            Pay ${amount} - {doctorName}
          </>
        )}
      </Button>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

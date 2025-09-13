"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Calendar, User, Clock, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function PaymentSuccessPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [paymentStatus, setPaymentStatus] = useState<any>(null)
  const [error, setError] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const { token } = useAuth()

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    
    if (!sessionId) {
      setError("No payment session found")
      setIsLoading(false)
      return
    }

    verifyPayment(sessionId)
  }, [searchParams, token])

  const verifyPayment = async (sessionId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://docassist-api.onrender.com'}/payments/verify/${sessionId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok) {
        setPaymentStatus(data)
      } else {
        setError(data.detail || "Failed to verify payment")
      }
    } catch (error) {
      setError("Network error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Verifying your payment...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-red-600">Payment Error</CardTitle>
            <CardDescription>There was an issue with your payment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="flex space-x-2">
              <Button onClick={() => router.push('/appointments')} className="flex-1">
                View Appointments
              </Button>
              <Button variant="outline" onClick={() => router.push('/dashboard')} className="flex-1">
                Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isPaymentSuccessful = paymentStatus?.payment_status === 'paid' && paymentStatus?.appointment_paid

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4 ${
            isPaymentSuccessful ? 'bg-green-100' : 'bg-yellow-100'
          }`}>
            <CheckCircle className={`h-6 w-6 ${
              isPaymentSuccessful ? 'text-green-600' : 'text-yellow-600'
            }`} />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {isPaymentSuccessful ? 'Payment Successful!' : 'Payment Processing'}
          </CardTitle>
          <CardDescription>
            {isPaymentSuccessful 
              ? 'Your appointment has been confirmed and paid'
              : 'Your payment is being processed'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant={isPaymentSuccessful ? "default" : "destructive"}>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              {isPaymentSuccessful 
                ? 'Payment completed successfully. You will receive a confirmation email shortly.'
                : `Payment Status: ${paymentStatus?.payment_status || 'Unknown'}`
              }
            </AlertDescription>
          </Alert>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h3 className="font-medium text-gray-900">Payment Details</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                <span>Status: {paymentStatus?.appointment_status || 'Unknown'}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Appointment: {paymentStatus?.appointment_paid ? 'Confirmed' : 'Pending'}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                <span>Payment: {paymentStatus?.payment_status || 'Processing'}</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button 
              onClick={() => router.push('/appointments')} 
              className="flex-1"
              variant={isPaymentSuccessful ? "default" : "outline"}
            >
              View Appointments
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard')} 
              className="flex-1"
            >
              Dashboard
            </Button>
          </div>

          <div className="text-center">
            <Link href="/doctors" className="text-sm text-blue-600 hover:text-blue-500">
              Book Another Appointment
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

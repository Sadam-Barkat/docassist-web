"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { XCircle, ArrowLeft, Calendar } from "lucide-react"

export default function PaymentCancelPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <XCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Payment Cancelled</CardTitle>
          <CardDescription>
            Your payment was cancelled and no charges were made
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Your appointment is still pending payment. You can complete the payment anytime from your appointments page.
            </AlertDescription>
          </Alert>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">What happens next?</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Your appointment slot is temporarily reserved</li>
              <li>• Complete payment within 24 hours to confirm</li>
              <li>• Unpaid appointments will be automatically cancelled</li>
            </ul>
          </div>

          <div className="flex space-x-2">
            <Button 
              onClick={() => router.push('/appointments')} 
              className="flex-1"
            >
              <Calendar className="h-4 w-4 mr-2" />
              My Appointments
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push('/doctors')} 
              className="flex-1"
            >
              Book New
            </Button>
          </div>

          <div className="text-center">
            <Link 
              href="/dashboard" 
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

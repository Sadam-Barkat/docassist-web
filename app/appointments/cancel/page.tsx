'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { XCircle, ArrowLeft, Calendar } from 'lucide-react'

export default function PaymentCancelPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Cancel Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Cancelled</h1>
          <p className="text-gray-600">Your appointment booking was cancelled.</p>
        </div>

        {/* Information Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>What Happened?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              You cancelled the payment process. No charges were made to your account and no appointment was booked.
            </p>
            <p className="text-sm text-gray-500">
              If you experienced any issues during the booking process, please try again or contact our support team.
            </p>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={() => router.push('/book-appointment')} 
            className="w-full"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Try Booking Again
          </Button>
          
          <Button 
            onClick={() => router.push('/doctors')} 
            variant="outline" 
            className="w-full"
          >
            Browse Doctors
          </Button>
          
          <Button 
            onClick={() => router.push('/dashboard')} 
            variant="ghost" 
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}

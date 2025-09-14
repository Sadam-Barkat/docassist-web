'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Calendar, Clock, User, CreditCard } from 'lucide-react'

interface AppointmentDetails {
  id: string
  doctor_name: string
  doctor_specialty: string
  date: string
  time: string
  fee: number
  status: string
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [appointmentDetails, setAppointmentDetails] = useState<AppointmentDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided')
      setLoading(false)
      return
    }

    // Show success message without requiring authentication
    // Since payment was successful, we can show basic confirmation
    setLoading(false)
    
    // Optional: Try to fetch details if user is logged in
    const fetchAppointmentDetails = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          // Don't redirect to login, just show basic success message
          return
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/session/${sessionId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          setAppointmentDetails(data)
        }
      } catch (err) {
        // Silently fail, show basic success message
        console.log('Could not fetch appointment details:', err)
      }
    }

    fetchAppointmentDetails()
  }, [sessionId, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading appointment details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.push('/appointments')} className="w-full">
              Go to Appointments
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600">Your appointment has been booked successfully.</p>
        </div>

        {/* Appointment Details Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Appointment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {appointmentDetails ? (
              <>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-semibold">{appointmentDetails.doctor_name}</p>
                    <p className="text-sm text-gray-600">{appointmentDetails.doctor_specialty}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-semibold">Date</p>
                    <p className="text-sm text-gray-600">{appointmentDetails.date}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Clock className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-semibold">Time</p>
                    <p className="text-sm text-gray-600">{appointmentDetails.time}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <CreditCard className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-semibold">Amount Paid</p>
                    <p className="text-sm text-gray-600">${appointmentDetails.fee}</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-green-800 font-semibold">Payment Successful!</p>
                  <p className="text-green-700 text-sm mt-1">Your appointment has been booked successfully.</p>
                </div>
                <p className="text-gray-600 mb-2">Your appointment confirmation will be sent to your email.</p>
                <p className="text-sm text-gray-500">Session ID: {sessionId}</p>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    <strong>Next Steps:</strong><br />
                    • Check your email for appointment details<br />
                    • Log in to view your appointments<br />
                    • Arrive 15 minutes early on your appointment day
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• You will receive a confirmation email shortly</li>
              <li>• Please arrive 15 minutes before your appointment time</li>
              <li>• Bring a valid ID and any relevant medical documents</li>
              <li>• You can view and manage your appointments in your dashboard</li>
            </ul>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={() => router.push('/login')} 
            className="flex-1"
          >
            Login to View Appointments
          </Button>
          <Button 
            onClick={() => router.push('/')} 
            variant="outline" 
            className="flex-1"
          >
            Go to Home
          </Button>
        </div>
      </div>
    </div>
  )
}

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CalendarIcon, Clock, User, ArrowLeft, CheckCircle } from "lucide-react"
import type { Doctor, BookAppointmentRequest } from "@/lib/types"
import { doctorsApi, appointmentsApi } from "@/lib/api"
import { format } from "date-fns"
import Link from "next/link"

export default function BookAppointmentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState("")
  const [reason, setReason] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")

  // Available time slots
  const timeSlots = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
  ]

  useEffect(() => {
    const fetchDoctors = async () => {
      const response = await doctorsApi.getAllDoctors()
      if (response.success && response.data) {
        setDoctors(response.data)

        // Pre-select doctor if provided in URL
        const doctorId = searchParams.get("doctorId")
        if (doctorId) {
          const doctor = response.data.find((d) => d.id === doctorId)
          if (doctor) {
            setSelectedDoctor(doctor)
          }
        }
      }
    }

    fetchDoctors()
  }, [searchParams])

  const handleDoctorSelect = (doctorId: string) => {
    const doctor = doctors.find((d) => d.id === doctorId)
    setSelectedDoctor(doctor || null)
    setSelectedDate(undefined)
    setSelectedTime("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedDoctor || !selectedDate || !selectedTime || !reason.trim()) {
      setError("Please fill in all required fields")
      return
    }

    if (!user) {
      setError("You must be logged in to book an appointment")
      return
    }

    // Additional validation for past dates
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const selectedDateOnly = new Date(selectedDate)
    selectedDateOnly.setHours(0, 0, 0, 0)
    
    if (selectedDateOnly < today) {
      setError(`❌ Invalid Date - Please select a date from today (${format(today, "yyyy-MM-dd")}) onwards. You cannot book appointments for past dates.`)
      return
    }

    setIsLoading(true)
    setError("")

    const appointmentData: BookAppointmentRequest = {
      doctorId: selectedDoctor.id,
      appointmentDate: format(selectedDate, "yyyy-MM-dd"),
      appointmentTime: selectedTime,
      reason: reason.trim(),
    }

    try {
      const response = await appointmentsApi.bookAppointment(appointmentData)

      if (response.success && response.data?.checkout_url) {
        // Redirect to Stripe checkout for payment
        window.location.href = response.data.checkout_url
      } else {
        setError(response.error || "Failed to create payment session")
      }
    } catch (error) {
      setError("Network error occurred")
    }

    setIsLoading(false)
  }

  const getInitials = (name: string) => {
    const nameParts = name?.split(' ') || []
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase()
    }
    return name?.charAt(0)?.toUpperCase() || 'U'
  }

  const isDateAvailable = (date: Date) => {
    if (!selectedDoctor) return false

    // Only allow future dates (not past dates)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (date < today) return false

    // If doctor has availability data, check it
    if (selectedDoctor.availability && selectedDoctor.availability.length > 0) {
      const dayOfWeek = date.getDay()
      const availability = selectedDoctor.availability.find((a) => a.dayOfWeek === dayOfWeek)
      return availability?.isAvailable || false
    }

    // If no availability data, allow weekdays (Monday-Friday)
    const dayOfWeek = date.getDay()
    return dayOfWeek >= 1 && dayOfWeek <= 5 // Monday = 1, Friday = 5
  }

  if (isSuccess) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl text-green-600">Appointment Booked Successfully!</CardTitle>
                <CardDescription>
                  Your appointment has been confirmed and a confirmation email has been sent.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg text-left">
                  <h3 className="font-semibold mb-2">Appointment Details:</h3>
                  <p>
                    <strong>Doctor:</strong> {selectedDoctor?.name}
                  </p>
                  <p>
                    <strong>Date:</strong> {selectedDate && format(selectedDate, "MMMM dd, yyyy")}
                  </p>
                  <p>
                    <strong>Time:</strong> {selectedTime}
                  </p>
                  <p>
                    <strong>Reason:</strong> {reason}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/appointments" className="flex-1">
                    <Button className="w-full">View My Appointments</Button>
                  </Link>
                  <Link href="/doctors" className="flex-1">
                    <Button variant="outline" className="w-full bg-transparent">
                      Book Another
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <div className="mb-6">
            <Link href="/doctors" className="inline-flex items-center text-blue-600 hover:text-blue-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Doctors
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Appointment</h1>
            <p className="text-gray-600">Schedule your consultation with our qualified doctors</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Doctor Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Select Doctor
                </CardTitle>
                <CardDescription>Choose the doctor you want to consult with</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedDoctor?.id || ""} onValueChange={handleDoctorSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={doctor.profileImage || "/placeholder.svg"} />
                            <AvatarFallback className="text-xs">
                              {getInitials(doctor.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {doctor.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {doctor.specialty} • ${doctor.consultationFee}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedDoctor && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={selectedDoctor.profileImage || "/placeholder.svg"} />
                        <AvatarFallback>
                          {getInitials(selectedDoctor.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">
                          {selectedDoctor.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Badge variant="secondary">{selectedDoctor.specialty}</Badge>
                          <span>•</span>
                          <span>${selectedDoctor.consultationFee} consultation fee</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Date Selection */}
            {selectedDoctor && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CalendarIcon className="mr-2 h-5 w-5" />
                    Select Date
                  </CardTitle>
                  <CardDescription>Choose your preferred appointment date</CardDescription>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => !isDateAvailable(date)}
                    className="rounded-md border"
                  />
                  {selectedDate && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-800">
                        Selected: {format(selectedDate, "EEEE, MMMM dd, yyyy")}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Time Selection */}
            {selectedDate && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="mr-2 h-5 w-5" />
                    Select Time
                  </CardTitle>
                  <CardDescription>Choose your preferred appointment time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {timeSlots.map((time) => (
                      <Button
                        key={time}
                        type="button"
                        variant={selectedTime === time ? "default" : "outline"}
                        onClick={() => setSelectedTime(time)}
                        className="h-12"
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                  {selectedTime && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-800">Selected: {selectedTime}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Reason for Visit */}
            {selectedTime && (
              <Card>
                <CardHeader>
                  <CardTitle>Reason for Visit</CardTitle>
                  <CardDescription>Please describe the reason for your appointment</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Describe your symptoms, concerns, or reason for the visit..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                    required
                  />
                </CardContent>
              </Card>
            )}

            {/* Submit Button */}
            {reason.trim() && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="font-semibold">Appointment Summary</h3>
                      <p className="text-sm text-gray-600">
                        {selectedDoctor?.name} •{" "}
                        {selectedDate && format(selectedDate, "MMM dd, yyyy")} • {selectedTime}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">${selectedDoctor?.consultationFee}</p>
                      <p className="text-sm text-gray-600">Consultation Fee</p>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                    {isLoading ? "Processing Payment..." : "Pay Now"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </form>
        </div>
      </div>
    </ProtectedRoute>
  )
}

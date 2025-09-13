"use client"

import { Label } from "@/components/ui/label"

import { useState, useEffect, useMemo } from "react"
import { Navigation } from "@/components/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar, Clock, Phone, Mail, Plus, X } from "lucide-react"
import type { Appointment, Doctor } from "@/lib/types"
import { appointmentsApi, doctorsApi } from "@/lib/api"
import { PaymentButton } from "@/components/payment-button"
import { format, parseISO, isPast } from "date-fns"
import Link from "next/link"
import { AppointmentSkeleton } from "@/components/loading-skeleton"

export default function AppointmentsPage() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        // Fetch appointments first (critical for this page)
        const appointmentsResponse = await appointmentsApi.getUserAppointments()
        if (appointmentsResponse.success && appointmentsResponse.data) {
          setAppointments(appointmentsResponse.data)
        } else {
          console.error('Failed to fetch appointments:', appointmentsResponse.error)
        }

        // Fetch doctors in background (less critical)
        doctorsApi.getAllDoctors().then(doctorsResponse => {
          if (doctorsResponse.success && doctorsResponse.data) {
            setDoctors(doctorsResponse.data)
          }
        })
      } catch (error) {
        console.error('Error fetching appointments data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user])

  const getDoctorById = (doctorId: string) => {
    return doctors.find((d) => d.id === doctorId)
  }

  const getInitials = (name: string) => {
    const nameParts = name.split(' ')
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase()
    }
    return name.charAt(0).toUpperCase()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "no-show":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "refunded":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleCancelAppointment = async (appointmentId: string) => {
    if (confirm("Are you sure you want to cancel this appointment?")) {
      try {
        const result = await appointmentsApi.cancelAppointment(appointmentId)
        if (result.success) {
          // Update local state with the cancelled appointment
          setAppointments((prev) =>
            prev.map((apt) => (apt.id === appointmentId ? { ...apt, status: "cancelled" as const } : apt)),
          )
        } else {
          alert("Failed to cancel appointment: " + result.error)
        }
      } catch (error) {
        alert("Failed to cancel appointment. Please try again.")
      }
    }
  }

  // Memoize filtered appointments to avoid recalculation on every render
  const { upcomingAppointments, pastAppointments } = useMemo(() => {
    const upcoming = appointments.filter(
      (apt) => {
        const isUpcoming = (apt.status === "scheduled" || apt.status === "confirmed") && !isPast(parseISO(`${apt.appointmentDate}T${apt.appointmentTime}`))
        return isUpcoming
      }
    )

    const past = appointments.filter(
      (apt) =>
        apt.status === "completed" ||
        apt.status === "cancelled" ||
        apt.status === "no-show" ||
        ((apt.status === "scheduled" || apt.status === "confirmed") && isPast(parseISO(`${apt.appointmentDate}T${apt.appointmentTime}`))),
    )

    return { upcomingAppointments: upcoming, pastAppointments: past }
  }, [appointments])

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Appointments</h1>
                <p className="text-gray-600">Manage your healthcare appointments</p>
              </div>
            </div>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <AppointmentSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  const AppointmentCard = ({
    appointment,
    showActions = true,
  }: { appointment: Appointment; showActions?: boolean }) => {
    const doctor = getDoctorById(appointment.doctorId)
    const appointmentDateTime = parseISO(`${appointment.appointmentDate}T${appointment.appointmentTime}`)

    if (!doctor) return null

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={doctor.profileImage || "/placeholder.svg"} />
                <AvatarFallback>{getInitials(doctor.name)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">
                  {doctor.name}
                </CardTitle>
                <CardDescription>
                  <Badge variant="secondary">{doctor.specialty}</Badge>
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Badge className={getStatusColor(appointment.status)}>
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
              </Badge>
              <Badge className={getPaymentStatusColor(appointment.paymentStatus)}>
                {appointment.paymentStatus.charAt(0).toUpperCase() + appointment.paymentStatus.slice(1)}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{format(appointmentDateTime, "EEEE, MMMM dd, yyyy")}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Clock className="h-4 w-4 mr-2" />
              <span>{format(appointmentDateTime, "h:mm a")}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Phone className="h-4 w-4 mr-2" />
              <span>{doctor.phone}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Mail className="h-4 w-4 mr-2" />
              <span>{doctor.email}</span>
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-1">Reason for visit:</p>
            <p className="text-sm text-gray-600">{appointment.reason}</p>
          </div>

          {appointment.notes && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-700 mb-1">Doctor's notes:</p>
              <p className="text-sm text-blue-600">{appointment.notes}</p>
            </div>
          )}

          {showActions && appointment.status === "scheduled" && (
            <div className="space-y-3 pt-2">
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Appointment Details</DialogTitle>
                      <DialogDescription>Complete information about your appointment</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={doctor.profileImage || "/placeholder.svg"} />
                          <AvatarFallback>{getInitials(doctor.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {doctor.name}
                          </h3>
                          <p className="text-gray-600">{doctor.specialty}</p>
                          <p className="text-sm text-gray-500">{doctor.experience} years experience</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Date & Time</Label>
                          <p className="text-sm">{format(appointmentDateTime, "EEEE, MMMM dd, yyyy at h:mm a")}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Consultation Fee</Label>
                          <p className="text-sm">${doctor.consultationFee}</p>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-700">Reason for Visit</Label>
                        <p className="text-sm mt-1">{appointment.reason}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Contact</Label>
                          <div className="space-y-1 mt-1">
                            <p className="text-sm flex items-center">
                              <Phone className="h-3 w-3 mr-2" />
                              {doctor.phone}
                            </p>
                            <p className="text-sm flex items-center">
                              <Mail className="h-3 w-3 mr-2" />
                              {doctor.email}
                            </p>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Qualifications</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {doctor.qualifications?.map((qual, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {qual}
                              </Badge>
                            )) || <span className="text-sm text-gray-500">No qualifications listed</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCancelAppointment(appointment.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Appointments</h1>
              <p className="text-gray-600">Manage your healthcare appointments</p>
            </div>
            <Link href="/book-appointment">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Book New Appointment
              </Button>
            </Link>
          </div>

          <Tabs defaultValue="upcoming" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="upcoming">Upcoming ({upcomingAppointments.length})</TabsTrigger>
              <TabsTrigger value="past">Past ({pastAppointments.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-6">
              {upcomingAppointments.length > 0 ? (
                <div className="grid gap-6">
                  {upcomingAppointments.map((appointment) => (
                    <AppointmentCard key={appointment.id} appointment={appointment} />
                  ))}
                </div>
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming appointments</h3>
                    <p className="text-gray-600 mb-6">Book your first appointment to get started</p>
                    <Link href="/book-appointment">
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Book Appointment
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-6">
              {pastAppointments.length > 0 ? (
                <div className="grid gap-6">
                  {pastAppointments.map((appointment) => (
                    <AppointmentCard key={appointment.id} appointment={appointment} showActions={false} />
                  ))}
                </div>
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No past appointments</h3>
                    <p className="text-gray-600">Your appointment history will appear here</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  )
}

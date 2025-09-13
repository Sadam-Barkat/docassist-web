"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Clock, Plus, Users, MessageCircle, Activity } from "lucide-react"
import type { Appointment, Doctor } from "@/lib/types"
import { appointmentsApi, doctorsApi } from "@/lib/api"
import { format, parseISO, isToday, isTomorrow } from "date-fns"
import Link from "next/link"
import { DashboardSkeleton } from "@/components/loading-skeleton"

export default function DashboardPage() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        // Fetch appointments first (more critical for dashboard)
        const appointmentsResponse = await appointmentsApi.getUserAppointments()
        if (appointmentsResponse.success && appointmentsResponse.data) {
          setAppointments(appointmentsResponse.data)
        }

        // Fetch doctors in background (less critical)
        doctorsApi.getAllDoctors().then(doctorsResponse => {
          if (doctorsResponse.success && doctorsResponse.data) {
            setDoctors(doctorsResponse.data)
          }
        })
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
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

  const upcomingAppointments = appointments
    .filter((apt) => apt.status === "scheduled" || apt.status === "confirmed")
    .filter((apt) => {
      const appointmentDateTime = new Date(`${apt.appointmentDate}T${apt.appointmentTime}`)
      return appointmentDateTime >= new Date() // Only future appointments
    })
    .sort(
      (a, b) =>
        new Date(`${a.appointmentDate}T${a.appointmentTime}`).getTime() -
        new Date(`${b.appointmentDate}T${b.appointmentTime}`).getTime(),
    )
    .slice(0, 3)

  const getDateLabel = (dateString: string) => {
    const date = parseISO(dateString)
    if (isToday(date)) return "Today"
    if (isTomorrow(date)) return "Tomorrow"
    return format(date, "MMM dd")
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <DashboardSkeleton />
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.firstName || user?.name?.split(' ')[0] || 'User'}!</h1>
            <p className="text-gray-600">Here's an overview of your healthcare dashboard</p>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
                <p className="text-xs text-muted-foreground">
                  {upcomingAppointments.length > 0 ? "Next appointment soon" : "No upcoming appointments"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{appointments.length}</div>
                <p className="text-xs text-muted-foreground">All time appointments</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Doctors</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{doctors.length}</div>
                <p className="text-xs text-muted-foreground">Specialists available</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI Assistant</CardTitle>
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24/7</div>
                <p className="text-xs text-muted-foreground">Always available to help</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Upcoming Appointments */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Upcoming Appointments</CardTitle>
                    <CardDescription>Your scheduled healthcare visits</CardDescription>
                  </div>
                  <Link href="/book-appointment">
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Book New
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {upcomingAppointments.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingAppointments.map((appointment) => {
                        const doctor = getDoctorById(appointment.doctorId)
                        if (!doctor) return null

                        return (
                          <div key={appointment.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={doctor.profileImage || "/placeholder.svg"} />
                              <AvatarFallback>{getInitials(doctor.name)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900">
                                {doctor.name}
                              </p>
                              <p className="text-sm text-gray-500">{doctor.specialty}</p>
                              <div className="flex items-center text-sm text-gray-600 mt-1">
                                <Calendar className="h-3 w-3 mr-1" />
                                <span>{getDateLabel(appointment.appointmentDate)}</span>
                                <Clock className="h-3 w-3 ml-3 mr-1" />
                                <span>{appointment.appointmentTime}</span>
                              </div>
                            </div>
                            <Badge variant="secondary">{appointment.status}</Badge>
                          </div>
                        )
                      })}
                      <div className="text-center pt-4">
                        <Link href="/appointments">
                          <Button variant="outline">View All Appointments</Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming appointments</h3>
                      <p className="text-gray-600 mb-4">Book your first appointment to get started</p>
                      <Link href="/book-appointment">
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Book Appointment
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks and shortcuts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/book-appointment" className="block">
                    <Button className="w-full justify-start bg-transparent" variant="outline">
                      <Calendar className="mr-2 h-4 w-4" />
                      Book Appointment
                    </Button>
                  </Link>
                  <Link href="/doctors" className="block">
                    <Button className="w-full justify-start bg-transparent" variant="outline">
                      <Users className="mr-2 h-4 w-4" />
                      Find Doctors
                    </Button>
                  </Link>
                  <Link href="/appointments" className="block">
                    <Button className="w-full justify-start bg-transparent" variant="outline">
                      <Activity className="mr-2 h-4 w-4" />
                      My Appointments
                    </Button>
                  </Link>
                  <Link href="/profile" className="block">
                    <Button className="w-full justify-start bg-transparent" variant="outline">
                      <Users className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>AI Assistant</CardTitle>
                  <CardDescription>Get instant help with your healthcare needs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <MessageCircle className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 mb-4">
                      Our AI assistant can help you find doctors, book appointments, and answer healthcare questions.
                    </p>
                    <p className="text-xs text-gray-500">Click the chat icon in the bottom right to get started!</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

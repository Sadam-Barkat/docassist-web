"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import type { Appointment, Doctor, User as UserType } from "@/lib/types"
import { appointmentsApi, doctorsApi } from "@/lib/api"
import { mockUsers } from "@/lib/mock-data"
import { format, parseISO } from "date-fns"

export function AppointmentManagement() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [users, setUsers] = useState<UserType[]>([])
  const [statusFilter, setStatusFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const [appointmentsResponse, doctorsResponse] = await Promise.all([
        appointmentsApi.getAllAppointments(),
        doctorsApi.getAllDoctors(),
      ])

      if (appointmentsResponse.success && appointmentsResponse.data) {
        setAppointments(appointmentsResponse.data)
      }

      if (doctorsResponse.success && doctorsResponse.data) {
        setDoctors(doctorsResponse.data)
      }

      setUsers(mockUsers)
      setIsLoading(false)
    }

    fetchData()
  }, [])

  const getDoctorById = (doctorId: string) => {
    return doctors.find((d) => d.id === doctorId)
  }

  const getUserById = (userId: string) => {
    return users.find((u) => u.id === userId)
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Clock className="h-3 w-3" />
      case "completed":
        return <CheckCircle className="h-3 w-3" />
      case "cancelled":
        return <XCircle className="h-3 w-3" />
      case "no-show":
        return <AlertCircle className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  const handleStatusUpdate = async (appointmentId: string, newStatus: string) => {
    // Update locally first for immediate UI feedback
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === appointmentId
          ? { ...apt, status: newStatus as Appointment["status"], updatedAt: new Date().toISOString() }
          : apt,
      ),
    )
    
    // In a real implementation, you would call the backend API here
    // For now, we'll just update locally since the backend doesn't have an update endpoint
  }

  const filteredAppointments = appointments.filter((apt) => statusFilter === "all" || apt.status === statusFilter)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Appointment Management</h2>
          <p className="text-gray-600">View and manage all appointments in the system</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold">{appointments.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-blue-600">
                  {appointments.filter((a) => a.status === "scheduled").length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {appointments.filter((a) => a.status === "completed").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold text-red-600">
                  {appointments.filter((a) => a.status === "cancelled").length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Appointments</CardTitle>
          <CardDescription>Filter appointments by status</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Appointments</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="no-show">No Show</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Appointments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Appointments ({filteredAppointments.length})</CardTitle>
          <CardDescription>All appointments in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.map((appointment) => {
                  const doctor = getDoctorById(appointment.doctorId)
                  const patient = getUserById(appointment.userId)

                  if (!doctor || !patient) return null

                  return (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {getInitials(patient.firstName, patient.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">
                              {patient.firstName} {patient.lastName}
                            </p>
                            <p className="text-xs text-gray-500">{patient.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={doctor.profileImage || "/placeholder.svg"} />
                            <AvatarFallback className="text-xs">
                              {doctor.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">
                              {doctor.name}
                            </p>
                            <p className="text-xs text-gray-500">{doctor.specialty}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Calendar className="h-3 w-3 mr-2 text-gray-400" />
                            <span>{format(parseISO(appointment.appointmentDate), "MMM dd, yyyy")}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="h-3 w-3 mr-2 text-gray-400" />
                            <span>{appointment.appointmentTime}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm max-w-[200px] truncate" title={appointment.reason}>
                          {appointment.reason}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(appointment.status)} flex items-center gap-1 w-fit`}>
                          {getStatusIcon(appointment.status)}
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Select
                            value={appointment.status}
                            onValueChange={(value) => handleStatusUpdate(appointment.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="scheduled">Scheduled</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                              <SelectItem value="no-show">No Show</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {filteredAppointments.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
              <p className="text-gray-600">No appointments match the selected filter</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

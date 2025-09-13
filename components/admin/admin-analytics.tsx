"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { TrendingUp, Users, Calendar, DollarSign } from "lucide-react"
import type { Appointment, Doctor, User } from "@/lib/types"
import { appointmentsApi, doctorsApi } from "@/lib/api"
import { mockUsers } from "@/lib/mock-data"

export function AdminAnalytics() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [users, setUsers] = useState<User[]>([])
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

  // Appointments per doctor
  const appointmentsPerDoctor = doctors.map((doctor) => {
    const doctorAppointments = appointments.filter((apt) => apt.doctorId === doctor.id)
    return {
      name: `${doctor.firstName} ${doctor.lastName}`,
      specialty: doctor.specialty,
      appointments: doctorAppointments.length,
      completed: doctorAppointments.filter((apt) => apt.status === "completed").length,
      revenue: doctorAppointments.filter((apt) => apt.status === "completed").length * doctor.consultationFee,
    }
  })

  // Appointments by status
  const appointmentsByStatus = [
    {
      name: "Scheduled",
      value: appointments.filter((apt) => apt.status === "scheduled").length,
      color: "#3b82f6",
    },
    {
      name: "Completed",
      value: appointments.filter((apt) => apt.status === "completed").length,
      color: "#10b981",
    },
    {
      name: "Cancelled",
      value: appointments.filter((apt) => apt.status === "cancelled").length,
      color: "#ef4444",
    },
    {
      name: "No Show",
      value: appointments.filter((apt) => apt.status === "no-show").length,
      color: "#6b7280",
    },
  ]

  // Monthly appointments (mock data for demonstration)
  const monthlyAppointments = [
    { month: "Jan", appointments: 45, revenue: 9000 },
    { month: "Feb", appointments: 52, revenue: 10400 },
    { month: "Mar", appointments: 48, revenue: 9600 },
    { month: "Apr", appointments: 61, revenue: 12200 },
    { month: "May", appointments: 55, revenue: 11000 },
    { month: "Jun", appointments: 67, revenue: 13400 },
  ]

  // Specialty distribution
  const specialtyData = doctors.reduce(
    (acc, doctor) => {
      const existing = acc.find((item) => item.specialty === doctor.specialty)
      if (existing) {
        existing.count += 1
      } else {
        acc.push({ specialty: doctor.specialty, count: 1 })
      }
      return acc
    },
    [] as { specialty: string; count: number }[],
  )

  const totalRevenue = appointments
    .filter((apt) => apt.status === "completed")
    .reduce((sum, apt) => {
      const doctor = doctors.find((d) => d.id === apt.doctorId)
      return sum + (doctor?.consultationFee || 0)
    }, 0)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
        <p className="text-gray-600">Comprehensive insights into your healthcare system</p>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From completed appointments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. per Doctor</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {doctors.length > 0 ? Math.round(appointments.length / doctors.length) : 0}
            </div>
            <p className="text-xs text-muted-foreground">Appointments per doctor</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {appointments.length > 0
                ? Math.round(
                    (appointments.filter((apt) => apt.status === "completed").length / appointments.length) * 100,
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Appointments completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter((u) => u.isActive).length}</div>
            <p className="text-xs text-muted-foreground">Out of {users.length} total users</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Appointments per Doctor */}
        <Card>
          <CardHeader>
            <CardTitle>Appointments per Doctor</CardTitle>
            <CardDescription>Total appointments handled by each doctor</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                appointments: {
                  label: "Appointments",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={appointmentsPerDoctor}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="appointments" fill="var(--color-appointments)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Appointment Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Appointment Status Distribution</CardTitle>
            <CardDescription>Breakdown of appointments by status</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                scheduled: { label: "Scheduled", color: "#3b82f6" },
                completed: { label: "Completed", color: "#10b981" },
                cancelled: { label: "Cancelled", color: "#ef4444" },
                noShow: { label: "No Show", color: "#6b7280" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={appointmentsByStatus}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {appointmentsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Appointment Trends</CardTitle>
            <CardDescription>Appointments and revenue over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                appointments: {
                  label: "Appointments",
                  color: "hsl(var(--chart-1))",
                },
                revenue: {
                  label: "Revenue",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyAppointments}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="appointments" fill="var(--color-appointments)" />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="var(--color-revenue)" />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Doctor Specialties */}
        <Card>
          <CardHeader>
            <CardTitle>Doctor Specialties</CardTitle>
            <CardDescription>Distribution of doctors by specialty</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: {
                  label: "Doctors",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={specialtyData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="specialty" type="category" width={100} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--color-count)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

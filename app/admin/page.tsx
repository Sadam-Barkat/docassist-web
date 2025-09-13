"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DoctorManagement } from "@/components/admin/doctor-management"
import { UserManagement } from "@/components/admin/user-management"
import { AppointmentManagement } from "@/components/admin/appointment-management"
import { AdminAnalytics } from "@/components/admin/admin-analytics"
import { Users, Calendar, UserCheck, Activity, TrendingUp, Clock } from "lucide-react"
import type { User, Doctor, Appointment } from "@/lib/types"
import { doctorsApi, appointmentsApi } from "@/lib/api"
import { mockUsers } from "@/lib/mock-data"

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const [doctorsResponse, appointmentsResponse] = await Promise.all([
        doctorsApi.getAllDoctors(),
        appointmentsApi.getAllAppointments(),
      ])

      if (doctorsResponse.success && doctorsResponse.data) {
        setDoctors(doctorsResponse.data)
      }

      if (appointmentsResponse.success && appointmentsResponse.data) {
        setAppointments(appointmentsResponse.data)
      }

      // Mock users data
      setUsers(mockUsers)
      setIsLoading(false)
    }

    fetchData()
  }, [])

  const totalUsers = users.length
  const activeUsers = users.filter((u) => u.isActive).length
  const totalAppointments = appointments.length
  const scheduledAppointments = appointments.filter((a) => a.status === "scheduled").length
  const completedAppointments = appointments.filter((a) => a.status === "completed").length
  const totalRevenue = completedAppointments * 200 // Mock calculation

  if (isLoading) {
    return (
      <ProtectedRoute adminOnly>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading admin dashboard...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute adminOnly>
      <div className="min-h-screen bg-gray-50">
        <Navigation />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage your healthcare system</p>
          </div>

          {/* Overview Stats */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalUsers}</div>
                <p className="text-xs text-muted-foreground">{activeUsers} active users</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalAppointments}</div>
                <p className="text-xs text-muted-foreground">{scheduledAppointments} scheduled</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Doctors</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{doctors.length}</div>
                <p className="text-xs text-muted-foreground">All specialties</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">From completed appointments</p>
              </CardContent>
            </Card>
          </div>

          {/* Management Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="doctors">Doctors</TabsTrigger>
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest system activities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">New appointment booked</p>
                          <p className="text-xs text-gray-500">2 minutes ago</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">New user registered</p>
                          <p className="text-xs text-gray-500">15 minutes ago</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Appointment completed</p>
                          <p className="text-xs text-gray-500">1 hour ago</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Doctor profile updated</p>
                          <p className="text-xs text-gray-500">3 hours ago</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>System Status</CardTitle>
                    <CardDescription>Current system health</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Activity className="h-4 w-4 text-green-500" />
                          <span className="text-sm">System Status</span>
                        </div>
                        <span className="text-sm font-medium text-green-600">Operational</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Uptime</span>
                        </div>
                        <span className="text-sm font-medium">99.9%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">Active Sessions</span>
                        </div>
                        <span className="text-sm font-medium">{activeUsers}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-purple-500" />
                          <span className="text-sm">Today's Appointments</span>
                        </div>
                        <span className="text-sm font-medium">{scheduledAppointments}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="doctors">
              <DoctorManagement />
            </TabsContent>

            <TabsContent value="appointments">
              <AppointmentManagement />
            </TabsContent>

            <TabsContent value="users">
              <UserManagement />
            </TabsContent>

            <TabsContent value="analytics">
              <AdminAnalytics />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  )
}

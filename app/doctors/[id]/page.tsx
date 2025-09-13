"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Clock, MapPin, Phone, Mail, Calendar, ArrowLeft } from "lucide-react"
import type { Doctor } from "@/lib/types"
import { doctorsApi } from "@/lib/api"
import Link from "next/link"

export default function DoctorDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDoctor = async () => {
      if (params.id) {
        const response = await doctorsApi.getDoctorById(params.id as string)
        if (response.success && response.data) {
          setDoctor(response.data)
        }
      }
      setIsLoading(false)
    }

    fetchDoctor()
  }, [params.id])

  const getInitials = (name: string) => {
    const nameParts = name?.split(' ') || []
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase()
    }
    return name?.charAt(0)?.toUpperCase() || 'D'
  }

  const getDayName = (dayOfWeek: number) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    return days[dayOfWeek]
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading doctor details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Doctor Not Found</h2>
            <p className="text-gray-600 mb-8">The doctor you're looking for doesn't exist.</p>
            <Link href="/doctors">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Doctors
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
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

        {/* Doctor Profile Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="h-32 w-32">
                <AvatarImage
                  src={doctor.profileImage || "/placeholder.svg"}
                  alt={doctor.name}
                />
                <AvatarFallback className="text-2xl">{getInitials(doctor.name)}</AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center md:text-left">
                <CardTitle className="text-3xl mb-2">
                  {doctor.name}
                </CardTitle>
                <CardDescription className="text-lg mb-4">
                  <Badge variant="secondary" className="text-base px-3 py-1">
                    {doctor.specialty}
                  </Badge>
                </CardDescription>

                <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center justify-center md:justify-start">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span>
                      {doctor.rating} ({doctor.totalReviews} reviews)
                    </span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{doctor.experience} years experience</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>Fee: ${doctor.consultationFee}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href={`/book-appointment?doctorId=${doctor.id}`}>
                    <Button size="lg" className="w-full sm:w-auto">
                      <Calendar className="mr-2 h-4 w-4" />
                      Book Appointment
                    </Button>
                  </Link>
                  <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
                    <Phone className="mr-2 h-4 w-4" />
                    Contact
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Qualifications */}
          <Card>
            <CardHeader>
              <CardTitle>Qualifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {doctor.qualifications.map((qualification, index) => (
                  <Badge key={index} variant="outline" className="mr-2 mb-2">
                    {qualification}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-3 text-gray-400" />
                <span>{doctor.email}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-3 text-gray-400" />
                <span>{doctor.phone}</span>
              </div>
            </CardContent>
          </Card>

          {/* Availability */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Availability</CardTitle>
              <CardDescription>Doctor's weekly schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {doctor.availability.map((schedule, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{getDayName(schedule.dayOfWeek)}</span>
                    <span className={`text-sm ${schedule.isAvailable ? "text-green-600" : "text-red-600"}`}>
                      {schedule.isAvailable ? `${schedule.startTime} - ${schedule.endTime}` : "Unavailable"}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

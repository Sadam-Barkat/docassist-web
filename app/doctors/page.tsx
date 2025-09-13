"use client"

import { useState, useEffect, useMemo } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, MapPin, Clock, Search } from "lucide-react"
import type { Doctor } from "@/lib/types"
import { doctorsApi } from "@/lib/api"
import Link from "next/link"
import { DoctorSkeleton } from "@/components/loading-skeleton"

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDoctors = async () => {
      const response = await doctorsApi.getAllDoctors()
      if (response.success && response.data) {
        setDoctors(response.data)
      }
      setIsLoading(false)
    }

    fetchDoctors()
  }, [])

  // Memoize filtered doctors to avoid recalculation on every render
  const filteredDoctors = useMemo(() => {
    let filtered = doctors

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (doctor) =>
          doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by specialty
    if (selectedSpecialty !== "all") {
      filtered = filtered.filter((doctor) => doctor.specialty === selectedSpecialty)
    }

    return filtered
  }, [doctors, searchTerm, selectedSpecialty])

  const specialties = Array.from(new Set(doctors.map((doctor) => doctor.specialty)))

  const getInitials = (name: string) => {
    const nameParts = name?.split(' ') || []
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase()
    }
    return name?.charAt(0)?.toUpperCase() || 'D'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Doctor</h1>
            <p className="text-gray-600">Browse our qualified healthcare professionals</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <DoctorSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Doctor</h1>
          <p className="text-gray-600">Browse our qualified healthcare professionals</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search doctors by name or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Specialties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specialties</SelectItem>
              {specialties.map((specialty) => (
                <SelectItem key={specialty} value={specialty}>
                  {specialty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredDoctors.length} of {doctors.length} doctors
          </p>
        </div>

        {/* Doctors Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <Avatar className="h-20 w-20 mx-auto mb-4">
                  <AvatarImage
                    src={doctor.profileImage || "/placeholder.svg"}
                    alt={doctor.name}
                  />
                  <AvatarFallback className="text-lg">{getInitials(doctor.name)}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl">
                  {doctor.name}
                </CardTitle>
                <CardDescription>
                  <Badge variant="secondary" className="mb-2">
                    {doctor.specialty}
                  </Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span>{doctor.rating}</span>
                    <span className="ml-1">({doctor.totalReviews} reviews)</span>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>Consultation Fee: ${doctor.consultationFee}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Link href={`/doctors/${doctor.id}`}>
                    <Button variant="outline" className="w-full bg-transparent">
                      View Profile
                    </Button>
                  </Link>
                  <Link href={`/book-appointment?doctorId=${doctor.id}`}>
                    <Button className="w-full">Book Appointment</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredDoctors.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}

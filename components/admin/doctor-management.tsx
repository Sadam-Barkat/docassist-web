"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2, Star } from "lucide-react"
import type { Doctor } from "@/lib/types"
import { doctorsApi } from "@/lib/api"

export function DoctorManagement() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    specialty: "",
    fee: "",
    bio: "",
    image: null as File | null,
  })

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    const response = await doctorsApi.getAllDoctors()
    if (response.success && response.data) {
      setDoctors(response.data)
    }
    setIsLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const doctorData = {
      name: formData.name,
      specialty: formData.specialty,
      fee: formData.fee,
      bio: formData.bio,
      image: formData.image,
    }

    if (editingDoctor) {
      // Update existing doctor using backend API
      const response = await doctorsApi.updateDoctor(editingDoctor.id, doctorData)
      if (response.success && response.data) {
        setDoctors((prev) => prev.map((d) => (d.id === editingDoctor.id ? response.data : d)))
      } else {
        alert(response.error || 'Failed to update doctor')
        return
      }
    } else {
      // Add new doctor via API
      const response = await doctorsApi.createDoctor(doctorData)
      if (response.success && response.data) {
        setDoctors((prev) => [...prev, response.data])
      } else {
        alert(response.error || 'Failed to create doctor')
        return
      }
    }

    resetForm()
    setIsDialogOpen(false)
  }

  const handleEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor)
    setFormData({
      name: doctor.name,
      specialty: doctor.specialty,
      fee: doctor.consultationFee.toString(),
      bio: "", // Backend doesn't store bio in current Doctor type
      image: null,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (doctorId: string) => {
    if (confirm("Are you sure you want to delete this doctor?")) {
      const response = await doctorsApi.deleteDoctor(doctorId)
      if (response.success) {
        setDoctors((prev) => prev.filter((d) => d.id !== doctorId))
      } else {
        alert(response.error || 'Failed to delete doctor')
      }
    }
  }

  const resetForm = () => {
    setEditingDoctor(null)
    setFormData({
      name: "",
      specialty: "",
      fee: "",
      bio: "",
      image: null,
    })
  }

  const getInitials = (name: string) => {
    if (!name) return "DR"
    const nameParts = name.split(" ")
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase()
    }
    return name.charAt(0).toUpperCase()
  }

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
          <h2 className="text-2xl font-bold text-gray-900">Doctor Management</h2>
          <p className="text-gray-600">Manage doctors in the system</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Doctor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingDoctor ? "Edit Doctor" : "Add New Doctor"}</DialogTitle>
              <DialogDescription>
                {editingDoctor ? "Update doctor information" : "Add a new doctor to the system"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Doctor Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Dr. John Smith"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialty">Specialty</Label>
                <Input
                  id="specialty"
                  value={formData.specialty}
                  onChange={(e) => setFormData((prev) => ({ ...prev, specialty: e.target.value }))}
                  placeholder="Cardiology, Dermatology, etc."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fee">Consultation Fee</Label>
                <Input
                  id="fee"
                  value={formData.fee}
                  onChange={(e) => setFormData((prev) => ({ ...prev, fee: e.target.value }))}
                  placeholder="100"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio (Optional)</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                  placeholder="Doctor's background, experience, and qualifications..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Profile Image (Optional)</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null
                    setFormData((prev) => ({ ...prev, image: file }))
                  }}
                />
                <p className="text-sm text-gray-500">Upload a profile photo for the doctor</p>
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{editingDoctor ? "Update Doctor" : "Add Doctor"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doctor) => (
          <Card key={doctor.id}>
            <CardHeader className="text-center">
              <Avatar className="h-16 w-16 mx-auto mb-3">
                <AvatarImage
                  src={doctor.profileImage || "/placeholder.svg"}
                  alt={doctor.name}
                  className="object-cover object-[center_20%]"
                />
                <AvatarFallback>{getInitials(doctor.name)}</AvatarFallback>
              </Avatar>
              <CardTitle className="text-lg">
                {doctor.name}
              </CardTitle>
              <CardDescription>
                <Badge variant="secondary">{doctor.specialty}</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Fee:</span>
                <span>${doctor.consultationFee}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Rating:</span>
                <div className="flex items-center">
                  <Star className="h-3 w-3 text-yellow-400 mr-1" />
                  <span>
                    {doctor.rating} ({doctor.totalReviews})
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <Button variant="outline" size="sm" onClick={() => handleEdit(doctor)} className="flex-1">
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(doctor.id)}
                  className="flex-1 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {doctors.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No doctors found. Add your first doctor to get started.</p>
        </div>
      )}
    </div>
  )
}

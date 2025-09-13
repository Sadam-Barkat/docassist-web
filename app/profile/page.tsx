"use client"

import type React from "react"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Mail, Phone, Calendar, Save, Upload, X } from "lucide-react"

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [error, setError] = useState("")
  const [uploadingImage, setUploadingImage] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone_number: user?.phone_number || "",
    DOB: user?.DOB || "",
    image_url: user?.image_url || "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    setError("")

    try {
      const token = localStorage.getItem('auth_token')
      console.log('DEBUG: Token from localStorage:', token ? token.substring(0, 20) + '...' : 'No token found')
      
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('http://127.0.0.1:8000/upload/profile-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setFormData(prev => ({ ...prev, image_url: result.image_url }))
        
        // Update user in AuthContext and localStorage
        if (user) {
          const updatedUser = { ...user, image_url: result.image_url }
          updateUser(updatedUser)
        }
        
        setSuccessMessage("Profile image uploaded successfully!")
        setTimeout(() => setSuccessMessage(""), 3000)
      } else {
        setError(result.detail || "Failed to upload image")
        setTimeout(() => setError(""), 5000)
      }
    } catch (error) {
      setError("Error uploading image. Please try again.")
      setTimeout(() => setError(""), 5000)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleRemoveImage = async () => {
    setUploadingImage(true)
    setError("")

    try {
      const response = await fetch('http://127.0.0.1:8000/upload/profile-image', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setFormData(prev => ({ ...prev, image_url: "" }))
        
        // Update user in AuthContext and localStorage
        if (user) {
          const updatedUser = { ...user, image_url: "" }
          updateUser(updatedUser)
        }
        
        setSuccessMessage("Profile image removed successfully!")
        setTimeout(() => setSuccessMessage(""), 3000)
      } else {
        setError(result.detail || "Failed to remove image")
        setTimeout(() => setError(""), 5000)
      }
    } catch (error) {
      setError("Error removing image. Please try again.")
      setTimeout(() => setError(""), 5000)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError("")
    try {
      const response = await fetch('http://127.0.0.1:8000/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        setIsEditing(false)
        setSuccessMessage("Profile updated successfully!")
        setTimeout(() => setSuccessMessage(""), 3000)
        
        // Update the form data with the response to reflect any server changes
        setFormData({
          name: result.name || "",
          email: result.email || "",
          phone_number: result.phone_number || "",
          DOB: result.DOB || "",
          image_url: result.image_url || "",
        })
      } else {
        // Handle validation errors from backend
        if (result.detail && Array.isArray(result.detail)) {
          const errorMessages = result.detail.map((err: any) => err.msg || err.message || 'Validation error').join(', ')
          setError(errorMessages)
        } else {
          setError(result.detail || "Failed to update profile. Please try again.")
        }
        setTimeout(() => setError(""), 5000)
      }
    } catch (error) {
      console.error('Profile update error:', error)
      setError("Error updating profile. Please try again.")
      setTimeout(() => setError(""), 5000)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone_number: user?.phone_number || "",
      DOB: user?.DOB || "",
      image_url: user?.image_url || "",
    })
    setIsEditing(false)
    setError("")
  }

  const getInitials = (name: string) => {
    const nameParts = name?.split(' ') || []
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase()
    }
    return name?.charAt(0)?.toUpperCase() || 'U'
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
            <p className="text-gray-600">Manage your personal information and account settings</p>
          </div>

          {successMessage && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Picture and Basic Info */}
            <Card>
              <CardHeader className="text-center">
                <div className="relative">
                  <Avatar className="h-24 w-24 mx-auto mb-4">
                    {formData.image_url ? (
                      <AvatarImage 
                        src={`http://127.0.0.1:8000${formData.image_url}`} 
                        alt="Profile picture" 
                      />
                    ) : null}
                    <AvatarFallback className="text-2xl">
                      {getInitials(formData.name)}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <div className="flex justify-center gap-2 mt-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="profile-image-upload"
                        disabled={uploadingImage}
                      />
                      <label htmlFor="profile-image-upload">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={uploadingImage}
                          asChild
                        >
                          <span className="cursor-pointer">
                            {uploadingImage ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                            ) : (
                              <Upload className="h-4 w-4 mr-2" />
                            )}
                            {uploadingImage ? "Uploading..." : "Upload"}
                          </span>
                        </Button>
                      </label>
                      {formData.image_url && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleRemoveImage}
                          disabled={uploadingImage}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                <CardTitle>{formData.name || "User"}</CardTitle>
                <CardDescription>{formData.email}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-sm text-gray-600">
                  <User className="h-4 w-4 mr-2" />
                  <span>Patient</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Member since {user?.createdAt ? new Date(user.createdAt).getFullYear() : "2024"}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>{user?.email}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>{formData.phone_number || "Not provided"}</span>
                </div>
              </CardContent>
            </Card>

            {/* Profile Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your personal details and contact information</CardDescription>
                  </div>
                  {!isEditing && (
                    <Button onClick={() => setIsEditing(true)}>
                      <User className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone_number">Phone Number</Label>
                    <Input
                      id="phone_number"
                      name="phone_number"
                      type="tel"
                      value={formData.phone_number}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="DOB">Date of Birth</Label>
                    <Input
                      id="DOB"
                      name="DOB"
                      type="date"
                      value={formData.DOB}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>

                  {isEditing && (
                    <div className="flex gap-3 pt-4">
                      <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                      <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

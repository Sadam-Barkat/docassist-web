// API utility functions for backend integration
import type {
  User,
  Doctor,
  Appointment,
  ApiResponse,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  BookAppointmentRequest,
} from "./types"
import apiClient, { handleApiResponse, handleApiError } from "./api-client"

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://docassist-api.onrender.com'

// Helper function to get auth token
const getAuthToken = () => {
  return typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
}

// Auth API
export const authApi = {
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await apiClient.post('/auth/login', credentials)
      const data = response.data

      // If login succeeded, persist token and fetch current user
      if (data.access_token) {
        const token = data.access_token as string
        
        // Store token temporarily
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', token)
        }

        try {
          // Fetch user profile with the token
          const userResponse = await apiClient.get('/users/me')
          const rawUser = userResponse.data as any
          
          // Normalize backend user shape to frontend expected User
          const user: Omit<User, 'password'> = {
            id: String(rawUser.id),
            email: rawUser.email,
            name: rawUser.name ?? '',
            phone_number: rawUser.phone_number ?? '',
            DOB: rawUser.DOB ?? '',
            image_url: rawUser.image_url ?? '',
            is_adman: rawUser.is_adman ?? "user",
            createdAt: rawUser.created_at ?? new Date().toISOString(),
            updatedAt: rawUser.updated_at ?? new Date().toISOString()
          }

          if (typeof window !== 'undefined') {
            localStorage.setItem('auth_user', JSON.stringify(user))
          }
          
          return { success: true, data: { user, token } }
        } catch (userError) {
          console.error('Failed to fetch user profile:', userError)
          // If user fetch fails, clear token and return error
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token')
          }
          return { success: false, error: 'Failed to fetch user profile' }
        }
      }

      return { success: false, error: 'Invalid credentials' }
    } catch (error) {
      return handleApiError(error)
    }
  },

  async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    try {
      // Map frontend register shape to backend expected shape
      const payload = {
        name: `${userData.firstName ?? ''} ${userData.lastName ?? ''}`.trim(),
        email: userData.email,
        password: userData.password,
        phone_number: userData.phone || null,
        DOB: userData.dateOfBirth || null,
      }

      const response = await apiClient.post('/auth/register', payload)
      const data = response.data

      // Check if registration returned token (new format)
      if (data.access_token && data.user) {
        const rawUser = data.user
        const token = data.access_token

        // Store token for immediate use
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', token)
        }

        // Normalize backend user shape to frontend expected User
        const user: Omit<User, 'password'> = {
          id: String(rawUser.id),
          email: rawUser.email,
          name: rawUser.name ?? '',
          phone_number: rawUser.phone_number ?? '',
          DOB: rawUser.DOB ?? '',
          image_url: rawUser.image_url ?? '',
          is_adman: rawUser.is_adman ?? "user",
          createdAt: rawUser.created_at ?? new Date().toISOString(),
          updatedAt: rawUser.updated_at ?? new Date().toISOString(),
        }

        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_user', JSON.stringify(user))
        }

        return { success: true, data: { user, token } }
      } else {
        // Fallback for old format (shouldn't happen with updated backend)
        const rawUser = data
        const user: Omit<User, 'password'> = {
          id: String(rawUser.id),
          email: rawUser.email,
          name: rawUser.name ?? '',
          phone_number: rawUser.phone_number ?? '',
          DOB: rawUser.DOB ?? '',
          image_url: rawUser.image_url ?? '',
          is_adman: rawUser.is_adman ?? "user",
          createdAt: rawUser.created_at ?? new Date().toISOString(),
          updatedAt: rawUser.updated_at ?? new Date().toISOString(),
        }

        return { success: true, data: { user, token: '' } }
      }
    } catch (error) {
      return handleApiError(error)
    }
  },

  async updateProfile(userData: {
    name?: string
    email?: string
    phone_number?: string
    DOB?: string
  }): Promise<ApiResponse<Omit<User, 'password'>>> {
    try {
      // Map frontend data to backend expected format
      const payload: any = {}
      
      if (userData.name !== undefined) {
        payload.name = userData.name
      }
      if (userData.email !== undefined) {
        payload.email = userData.email
      }
      if (userData.phone_number !== undefined) {
        payload.phone_number = userData.phone_number
      }
      if (userData.DOB !== undefined) {
        payload.DOB = userData.DOB
      }

      const response = await apiClient.put('/users/me', payload)
      const rawUser = response.data

      // Normalize backend user shape to frontend expected User
      const user: Omit<User, 'password'> = {
        id: String(rawUser.id),
        email: rawUser.email,
        name: rawUser.name ?? '',
        phone_number: rawUser.phone_number ?? '',
        DOB: rawUser.DOB ?? '',
        image_url: rawUser.image_url ?? '',
        is_adman: rawUser.is_adman ?? "user",
        createdAt: rawUser.created_at ?? new Date().toISOString(),
        updatedAt: rawUser.updated_at ?? new Date().toISOString(),
      }

      return { success: true, data: user }
    } catch (error) {
      return handleApiError(error)
    }
  },
};

// Users API
export const usersApi = {
  // Admin user management
  async getAllUsers(): Promise<ApiResponse<Omit<User, 'password'>[]>> {
    try {
      const response = await apiClient.get('/users/')
      const users = (response.data as any[]).map((rawUser: any) => ({
        id: String(rawUser.id),
        email: rawUser.email,
        name: rawUser.name ?? '',
        phone_number: rawUser.phone_number ?? '',
        DOB: rawUser.DOB ?? '',
        image_url: rawUser.image_url ?? '',
        is_adman: rawUser.is_adman ?? "user",
        createdAt: rawUser.created_at ?? new Date().toISOString(),
        updatedAt: rawUser.updated_at ?? new Date().toISOString(),
      }))
      return { success: true, data: users }
    } catch (error) {
      return handleApiError(error)
    }
  },

  async updateUser(userId: string, userData: {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    dateOfBirth?: string
  }): Promise<ApiResponse<Omit<User, 'password'>>> {
    try {
      // Map frontend data to backend expected format
      const payload: any = {}
      
      if (userData.firstName !== undefined || userData.lastName !== undefined) {
        payload.name = `${userData.firstName || ''} ${userData.lastName || ''}`.trim()
      }
      if (userData.email !== undefined) {
        payload.email = userData.email
      }
      if (userData.phone !== undefined) {
        payload.phone_number = userData.phone
      }
      if (userData.dateOfBirth !== undefined) {
        payload.DOB = userData.dateOfBirth
      }

      const response = await apiClient.put(`/users/${userId}`, payload)
      const rawUser = response.data

      // Normalize backend user shape to frontend expected User
      const user: Omit<User, 'password'> = {
        id: String(rawUser.id),
        email: rawUser.email,
        name: rawUser.name ?? '',
        phone_number: rawUser.phone_number ?? '',
        DOB: rawUser.DOB ?? '',
        image_url: rawUser.image_url ?? '',
        is_adman: rawUser.is_adman ?? "user",
        createdAt: rawUser.created_at ?? new Date().toISOString(),
        updatedAt: rawUser.updated_at ?? new Date().toISOString(),
      }

      return { success: true, data: user }
    } catch (error) {
      return handleApiError(error)
    }
  },

  async deleteUser(userId: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await apiClient.delete(`/users/${userId}`)
      return { success: true, data: response.data }
    } catch (error) {
      return handleApiError(error)
    }
  },
};

// Doctors API
export const doctorsApi = {
  async getAllDoctors(): Promise<ApiResponse<Doctor[]>> {
    try {
      const response = await apiClient.get('/doctors')
      const rawDoctors = response.data as any[]
      
      // Transform backend data to frontend format
      const doctors = rawDoctors.map((doctor: any) => ({
        id: doctor.id.toString(),
        name: doctor.name,
        email: doctor.email || '',
        phone: doctor.phone || '',
        specialty: doctor.specialty,
        qualifications: doctor.qualifications || [],
        experience: doctor.experience || 0,
        consultationFee: parseFloat(doctor.fee) || 0,
        availability: doctor.availability || [],
        rating: doctor.rating || 0,
        totalReviews: doctor.total_reviews || 0,
        profileImage: doctor.image_url ? `${API_BASE_URL}${doctor.image_url}` : '',
        isActive: doctor.is_active !== false,
        createdAt: doctor.created_at || new Date().toISOString(),
        updatedAt: doctor.updated_at || new Date().toISOString(),
      }))
      
      return { success: true, data: doctors }
    } catch (error) {
      return handleApiError(error)
    }
  },

  async getDoctorById(id: string): Promise<ApiResponse<Doctor>> {
    try {
      const response = await apiClient.get(`/doctors/${id}`)
      const doctor = response.data
      
      // Transform backend data to frontend format
      const transformedDoctor: Doctor = {
        id: doctor.id.toString(),
        name: doctor.name,
        email: doctor.email || '',
        phone: doctor.phone || '',
        specialty: doctor.specialty,
        qualifications: doctor.qualifications || [],
        experience: doctor.experience || 0,
        consultationFee: parseFloat(doctor.fee) || 0,
        availability: doctor.availability || [],
        rating: doctor.rating || 0,
        totalReviews: doctor.total_reviews || 0,
        profileImage: doctor.image_url ? `${API_BASE_URL}${doctor.image_url}` : '',
        isActive: doctor.is_active !== false,
        createdAt: doctor.created_at || new Date().toISOString(),
        updatedAt: doctor.updated_at || new Date().toISOString(),
      }
      
      return { success: true, data: transformedDoctor }
    } catch (error) {
      return handleApiError(error)
    }
  },

  async createDoctor(doctorData: { 
    name: string; 
    specialty: string; 
    fee: string; 
    bio?: string; 
    image?: File 
  }): Promise<ApiResponse<Doctor>> {
    try {
      const formData = new FormData()
      formData.append('name', doctorData.name)
      formData.append('specialty', doctorData.specialty)
      formData.append('fee', doctorData.fee)
      if (doctorData.bio) {
        formData.append('bio', doctorData.bio)
      }
      if (doctorData.image) {
        formData.append('image', doctorData.image)
      }

      const response = await fetch(`${API_BASE_URL}/doctors`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const doctor = await response.json()
      
      // Transform backend data to frontend format
      const transformedDoctor: Doctor = {
        id: doctor.id.toString(),
        name: doctor.name,
        email: doctor.email || '',
        phone: doctor.phone || '',
        specialty: doctor.specialty,
        qualifications: doctor.qualifications || [],
        experience: doctor.experience || 0,
        consultationFee: parseFloat(doctor.fee) || 0,
        availability: doctor.availability || [],
        rating: doctor.rating || 0,
        totalReviews: doctor.total_reviews || 0,
        profileImage: doctor.image_url ? `${API_BASE_URL}${doctor.image_url}` : '',
        isActive: doctor.is_active !== false,
        createdAt: doctor.created_at || new Date().toISOString(),
        updatedAt: doctor.updated_at || new Date().toISOString(),
      }
      
      return { success: true, data: transformedDoctor }
    } catch (error) {
      return handleApiError(error)
    }
  },

  async updateDoctor(id: string, doctorData: any): Promise<ApiResponse<Doctor>> {
    try {
      const response = await apiClient.put(`/doctors/${id}`, doctorData)
      const doctor = response.data
      
      // Transform backend data to frontend format
      const transformedDoctor: Doctor = {
        id: doctor.id.toString(),
        name: doctor.name,
        email: doctor.email || '',
        phone: doctor.phone || '',
        specialty: doctor.specialty,
        qualifications: doctor.qualifications || [],
        experience: doctor.experience || 0,
        consultationFee: parseFloat(doctor.fee) || 0,
        availability: doctor.availability || [],
        rating: doctor.rating || 0,
        totalReviews: doctor.total_reviews || 0,
        profileImage: doctor.image_url,
        isActive: doctor.is_active !== false,
        createdAt: doctor.created_at || new Date().toISOString(),
        updatedAt: doctor.updated_at || new Date().toISOString(),
      }
      
      return { success: true, data: transformedDoctor }
    } catch (error) {
      return handleApiError(error)
    }
  },

  async deleteDoctor(id: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await apiClient.delete(`/doctors/${id}`)
      return { success: true, data: response.data }
    } catch (error) {
      return handleApiError(error)
    }
  },
};

// Appointments API
export const appointmentsApi = {
  async bookAppointment(appointmentData: BookAppointmentRequest): Promise<ApiResponse<{checkout_url: string}>> {
    try {
      const payload = {
        doctor_id: Number(appointmentData.doctorId),
        date: appointmentData.appointmentDate,
        time: appointmentData.appointmentTime,
        reason: appointmentData.reason,
      }

      const response = await apiClient.post('/appointments', payload)
      
      // Backend returns {checkout_url: string} for payment-first flow
      return { success: true, data: response.data }
    } catch (error) {
      return handleApiError(error)
    }
  },

  async getUserAppointments(): Promise<ApiResponse<Appointment[]>> {
    try {
      const response = await apiClient.get('/appointments')
      const appointments = (response.data as any[]).map((rawAppointment: any) => ({
        id: String(rawAppointment.id),
        userId: String(rawAppointment.user_id),
        doctorId: String(rawAppointment.doctor_id),
        appointmentDate: rawAppointment.date,
        appointmentTime: rawAppointment.time,
        reason: rawAppointment.reason || '',
        status: rawAppointment.paid ? 'confirmed' : (rawAppointment.status || 'scheduled'),
        notes: rawAppointment.notes || '',
        paymentStatus: rawAppointment.paid ? 'paid' : 'pending' as 'paid' | 'pending' | 'refunded',
        createdAt: rawAppointment.created_at || new Date().toISOString(),
        updatedAt: rawAppointment.updated_at || new Date().toISOString(),
      }))
      return { success: true, data: appointments }
    } catch (error) {
      return handleApiError(error)
    }
  },

  async cancelAppointment(appointmentId: string): Promise<ApiResponse<Appointment>> {
    try {
      const response = await apiClient.post(`/appointments/${appointmentId}/cancel`)
      const rawAppointment = response.data
      
      const appointment: Appointment = {
        id: String(rawAppointment.id),
        userId: String(rawAppointment.user_id),
        doctorId: String(rawAppointment.doctor_id),
        appointmentDate: rawAppointment.date,
        appointmentTime: rawAppointment.time,
        reason: rawAppointment.reason || '',
        status: rawAppointment.status || 'cancelled',
        notes: rawAppointment.notes || '',
        paymentStatus: rawAppointment.payment_status || 'pending',
        createdAt: rawAppointment.created_at || new Date().toISOString(),
        updatedAt: rawAppointment.updated_at || new Date().toISOString(),
      }
      
      return { success: true, data: appointment }
    } catch (error) {
      return handleApiError(error)
    }
  },

  async getAllAppointments(): Promise<ApiResponse<Appointment[]>> {
    try {
      const response = await apiClient.get('/appointments/all')
      const rawAppointments = response.data as any[]
      
      const appointments: Appointment[] = rawAppointments.map((rawAppointment: any) => ({
        id: String(rawAppointment.id),
        userId: String(rawAppointment.user_id),
        doctorId: String(rawAppointment.doctor_id),
        appointmentDate: rawAppointment.date,
        appointmentTime: rawAppointment.time,
        reason: rawAppointment.reason || '',
        status: rawAppointment.paid ? 'confirmed' : (rawAppointment.status || 'scheduled'),
        notes: rawAppointment.notes || '',
        paymentStatus: rawAppointment.paid ? 'paid' : 'pending' as 'paid' | 'pending' | 'refunded',
        createdAt: rawAppointment.created_at || new Date().toISOString(),
        updatedAt: rawAppointment.updated_at || new Date().toISOString(),
      }))
      
      return { success: true, data: appointments }
    } catch (error) {
      return handleApiError(error)
    }
  },
};

// Password Reset API
export const passwordResetApi = {
  async forgotPassword(email: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email })
      return { success: true, data: response.data }
    } catch (error) {
      return handleApiError(error)
    }
  },

  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await apiClient.post('/auth/reset-password', { 
        token, 
        new_password: newPassword 
      })
      return { success: true, data: response.data }
    } catch (error) {
      return handleApiError(error)
    }
  },
};

// Payments API
export const paymentsApi = {
  async createCheckoutSession(appointmentId: number): Promise<ApiResponse<{ checkout_url: string }>> {
    try {
      const response = await apiClient.post('/payments/create-checkout-session', {
        appointment_id: appointmentId
      })
      return { success: true, data: response.data }
    } catch (error) {
      return handleApiError(error)
    }
  },

  async verifyPayment(sessionId: string): Promise<ApiResponse<{
    payment_status: string;
    appointment_status: string;
    appointment_paid: boolean;
  }>> {
    try {
      const response = await apiClient.get(`/payments/verify/${sessionId}`)
      return { success: true, data: response.data }
    } catch (error) {
      return handleApiError(error)
    }
  },

  async getPaymentHistory(): Promise<ApiResponse<any[]>> {
    try {
      const response = await apiClient.get('/payments/history')
      return { success: true, data: response.data }
    } catch (error) {
      return handleApiError(error)
    }
  },
};

// Chatbot API
export const chatbotApi = {
  async sendMessage(message: string): Promise<ApiResponse<{ reply: string }>> {
    try {
      const response = await apiClient.post('/chatbot/', { message })
      return { success: true, data: response.data }
    } catch (error) {
      return handleApiError(error)
    }
  },
};

// Profile Image Upload API
export const profileImageApi = {
  async uploadProfileImage(imageFile: File): Promise<ApiResponse<{ image_url: string; message: string }>> {
    try {
      const formData = new FormData()
      formData.append('file', imageFile)

      const response = await fetch(`${API_BASE_URL}/upload/profile-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Upload failed' }))
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      return handleApiError(error)
    }
  },

  async deleteProfileImage(): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await apiClient.delete('/upload/profile-image')
      return { success: true, data: response.data }
    } catch (error) {
      return handleApiError(error)
    }
  },
};


// Database Models and Types for Doctor Appointment System

export interface User {
  id: string
  email: string
  password: string
  name: string
  phone_number: string
  DOB: string
  image_url?: string
  is_adman: string
  createdAt: string
  updatedAt: string
}

export interface Doctor {
  id: string
  name: string
  firstName?: string
  lastName?: string
  email: string
  phone: string
  specialty: string
  bio?: string
  image_url?: string
  fee?: string
  qualifications?: string[]
  experience?: number // years
  consultationFee?: number
  availability?: DoctorAvailability[]
  rating?: number
  totalReviews?: number
  profileImage?: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface DoctorAvailability {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6 // 0 = Sunday, 6 = Saturday
  startTime: string // "09:00"
  endTime: string // "17:00"
  isAvailable: boolean
}

export interface Appointment {
  id: string
  userId: string
  doctorId: string
  appointmentDate: string
  appointmentTime: string
  reason: string
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no-show"
  notes?: string
  paymentStatus: "pending" | "paid" | "refunded"
  createdAt: string
  updatedAt: string
}

export interface Payment {
  id: string
  appointmentId: string
  userId: string
  amount: number
  currency: string
  paymentMethod: "card" | "cash" | "insurance"
  status: "pending" | "completed" | "failed" | "refunded"
  transactionId?: string
  createdAt: string
  updatedAt: string
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// Auth Types
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  firstName?: string
  lastName?: string
  phone?: string
  dateOfBirth?: string
}

export interface AuthResponse {
  user: Omit<User, "password">
  token: string
}

// Appointment Booking Types
export interface BookAppointmentRequest {
  doctorId: string
  appointmentDate: string
  appointmentTime: string
  reason: string
}

// Chatbot Types
export interface ChatMessage {
  id: string
  message: string
  sender: "user" | "bot"
  timestamp: string
}

export interface ChatbotResponse {
  message: string
  suggestions?: string[]
  data?: any
}

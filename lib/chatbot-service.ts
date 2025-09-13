import type { ChatbotResponse, User } from "./types"
import { doctorsApi, appointmentsApi } from "./api"

export class ChatbotService {
  static async processMessage(message: string, user: Omit<User, "password"> | null): Promise<ChatbotResponse> {
    const lowerMessage = message.toLowerCase()

    // Greeting responses
    if (this.isGreeting(lowerMessage)) {
      return {
        message: `Hello${user ? ` ${user.firstName}` : ""}! I'm here to help you with your healthcare needs. What can I assist you with today?`,
        suggestions: ["Find doctors", "Book appointment", "View my appointments", "Healthcare FAQs"],
      }
    }

    // Doctor-related queries
    if (this.isDoctorQuery(lowerMessage)) {
      return await this.handleDoctorQuery(lowerMessage)
    }

    // Appointment-related queries
    if (this.isAppointmentQuery(lowerMessage)) {
      return await this.handleAppointmentQuery(lowerMessage, user)
    }

    // FAQ responses
    if (this.isFAQQuery(lowerMessage)) {
      return this.handleFAQQuery(lowerMessage)
    }

    // Specialty-specific queries
    if (this.isSpecialtyQuery(lowerMessage)) {
      return await this.handleSpecialtyQuery(lowerMessage)
    }

    // Emergency or urgent care
    if (this.isEmergencyQuery(lowerMessage)) {
      return this.handleEmergencyQuery()
    }

    // Default response
    return {
      message: `I understand you're asking about "${message}". I can help you with:

• Finding doctors by specialty
• Booking appointments
• Viewing your appointment history
• Healthcare FAQs and general information
• Emergency contact information

Could you please be more specific about what you need help with?`,
      suggestions: ["Show available doctors", "Book an appointment", "Healthcare FAQs", "Emergency contacts"],
    }
  }

  private static isGreeting(message: string): boolean {
    const greetings = ["hello", "hi", "hey", "good morning", "good afternoon", "good evening"]
    return greetings.some((greeting) => message.includes(greeting))
  }

  private static isDoctorQuery(message: string): boolean {
    const doctorKeywords = ["doctor", "physician", "specialist", "find doctor", "available doctors", "show doctors"]
    return doctorKeywords.some((keyword) => message.includes(keyword))
  }

  private static isAppointmentQuery(message: string): boolean {
    const appointmentKeywords = ["appointment", "book", "schedule", "my appointments", "cancel appointment"]
    return appointmentKeywords.some((keyword) => message.includes(keyword))
  }

  private static isFAQQuery(message: string): boolean {
    const faqKeywords = ["how", "what", "when", "where", "why", "faq", "help", "hours", "cost", "insurance"]
    return faqKeywords.some((keyword) => message.includes(keyword))
  }

  private static isSpecialtyQuery(message: string): boolean {
    const specialties = ["cardiology", "dermatology", "pediatrics", "orthopedics", "neurology", "psychiatry"]
    return specialties.some((specialty) => message.includes(specialty))
  }

  private static isEmergencyQuery(message: string): boolean {
    const emergencyKeywords = ["emergency", "urgent", "pain", "chest pain", "difficulty breathing", "911"]
    return emergencyKeywords.some((keyword) => message.includes(keyword))
  }

  private static async handleDoctorQuery(message: string): Promise<ChatbotResponse> {
    try {
      const response = await doctorsApi.getAllDoctors()

      if (response.success && response.data) {
        const doctors = response.data
        const doctorList = doctors
          .slice(0, 3)
          .map(
            (doctor) =>
              `• ${doctor.firstName} ${doctor.lastName} - ${doctor.specialty} (${doctor.experience} years experience)`,
          )
          .join("\n")

        return {
          message: `Here are some of our available doctors:

${doctorList}

${doctors.length > 3 ? `And ${doctors.length - 3} more doctors available.` : ""}

Would you like to see more details about any specific doctor or book an appointment?`,
          suggestions: ["Book appointment", "View all doctors", "Search by specialty"],
          data: doctors,
        }
      }
    } catch (error) {
      // Handle error
    }

    return {
      message:
        "I can help you find doctors. We have specialists in cardiology, dermatology, pediatrics, and more. Would you like to see our available doctors?",
      suggestions: ["Show all doctors", "Search by specialty"],
    }
  }

  private static async handleAppointmentQuery(
    message: string,
    user: Omit<User, "password"> | null,
  ): Promise<ChatbotResponse> {
    if (!user) {
      return {
        message: "To book or view appointments, you need to be logged in. Please sign in to your account first.",
        suggestions: ["Sign in", "Create account"],
      }
    }

    if (message.includes("book") || message.includes("schedule")) {
      return {
        message: `I can help you book an appointment, ${user.firstName}! To get started, I'll need to know:

• Which type of specialist you need
• Your preferred date and time
• The reason for your visit

Would you like me to show you our available doctors first?`,
        suggestions: [
          "Show available doctors",
          "Book with cardiologist",
          "Book with dermatologist",
          "Book with pediatrician",
        ],
      }
    }

    if (message.includes("my appointments") || message.includes("view appointments")) {
      try {
        const response = await appointmentsApi.getUserAppointments(user.id)

        if (response.success && response.data) {
          const appointments = response.data
          const upcomingAppointments = appointments.filter((apt) => apt.status === "scheduled")

          if (upcomingAppointments.length > 0) {
            const appointmentList = upcomingAppointments
              .slice(0, 2)
              .map((apt) => `• ${apt.appointmentDate} at ${apt.appointmentTime}`)
              .join("\n")

            return {
              message: `You have ${upcomingAppointments.length} upcoming appointment${upcomingAppointments.length > 1 ? "s" : ""}:

${appointmentList}

${upcomingAppointments.length > 2 ? "And more..." : ""}

Would you like to view all your appointments or book a new one?`,
              suggestions: ["View all appointments", "Book new appointment", "Cancel appointment"],
            }
          } else {
            return {
              message: "You don't have any upcoming appointments. Would you like to book one?",
              suggestions: ["Book appointment", "Find doctors"],
            }
          }
        }
      } catch (error) {
        // Handle error
      }
    }

    return {
      message:
        "I can help you with appointments! You can book new appointments, view existing ones, or cancel if needed.",
      suggestions: ["Book appointment", "View my appointments"],
    }
  }

  private static handleFAQQuery(message: string): ChatbotResponse {
    if (message.includes("hours") || message.includes("open")) {
      return {
        message: `Our clinic hours are:

• Monday - Friday: 8:00 AM - 6:00 PM
• Saturday: 9:00 AM - 4:00 PM
• Sunday: 10:00 AM - 2:00 PM (Emergency only)

You can book appointments online 24/7 through our website.`,
        suggestions: ["Book appointment", "Emergency contacts", "Find doctors"],
      }
    }

    if (message.includes("cost") || message.includes("price") || message.includes("fee")) {
      return {
        message: `Consultation fees vary by specialist:

• General consultation: $150-200
• Specialist consultation: $200-300
• Follow-up visits: $100-150

We accept most major insurance plans. Please contact us to verify your coverage.`,
        suggestions: ["Book appointment", "Insurance information", "Find doctors"],
      }
    }

    if (message.includes("insurance")) {
      return {
        message: `We accept most major insurance plans including:

• Blue Cross Blue Shield
• Aetna
• Cigna
• UnitedHealthcare
• Medicare/Medicaid

Please bring your insurance card to your appointment. We recommend calling to verify coverage before your visit.`,
        suggestions: ["Book appointment", "Contact us", "Find doctors"],
      }
    }

    if (message.includes("cancel") || message.includes("reschedule")) {
      return {
        message: `To cancel or reschedule an appointment:

• Online: Visit your appointments page
• Phone: Call us at least 24 hours in advance
• Same-day cancellations may incur a fee

Would you like me to help you manage your appointments?`,
        suggestions: ["View my appointments", "Contact us", "Book new appointment"],
      }
    }

    return {
      message: `Here are some frequently asked questions:

• Clinic hours and availability
• Consultation fees and insurance
• How to book/cancel appointments
• Emergency contact information

What specific information are you looking for?`,
      suggestions: ["Clinic hours", "Consultation fees", "Insurance info", "Emergency contacts"],
    }
  }

  private static async handleSpecialtyQuery(message: string): Promise<ChatbotResponse> {
    const specialtyMap: { [key: string]: string } = {
      cardiology: "heart and cardiovascular conditions",
      dermatology: "skin, hair, and nail conditions",
      pediatrics: "children's health and development",
      orthopedics: "bones, joints, and musculoskeletal system",
      neurology: "brain and nervous system disorders",
      psychiatry: "mental health and behavioral disorders",
    }

    for (const [specialty, description] of Object.entries(specialtyMap)) {
      if (message.includes(specialty)) {
        try {
          const response = await doctorsApi.getAllDoctors()

          if (response.success && response.data) {
            const specialistDoctors = response.data.filter((doctor) =>
              doctor.specialty.toLowerCase().includes(specialty),
            )

            if (specialistDoctors.length > 0) {
              const doctorList = specialistDoctors
                .map(
                  (doctor) =>
                    `• ${doctor.firstName} ${doctor.lastName} - ${doctor.experience} years experience, $${doctor.consultationFee}`,
                )
                .join("\n")

              return {
                message: `Our ${specialty} specialists treat ${description}. Here are our available doctors:

${doctorList}

Would you like to book an appointment with any of these specialists?`,
                suggestions: [`Book ${specialty} appointment`, "View doctor profiles", "Other specialties"],
              }
            }
          }
        } catch (error) {
          // Handle error
        }

        return {
          message: `${specialty.charAt(0).toUpperCase() + specialty.slice(1)} specialists treat ${description}. Let me check our available doctors for you.`,
          suggestions: ["Show all doctors", "Book appointment"],
        }
      }
    }

    return {
      message:
        "We have specialists in various fields including cardiology, dermatology, pediatrics, and orthopedics. Which specialty are you interested in?",
      suggestions: ["Cardiology", "Dermatology", "Pediatrics", "Orthopedics"],
    }
  }

  private static handleEmergencyQuery(): ChatbotResponse {
    return {
      message: `🚨 For medical emergencies, please:

• Call 911 immediately
• Go to the nearest emergency room
• Call our emergency line: (555) 123-HELP

For urgent but non-emergency care:
• Our urgent care is open 24/7
• Walk-ins welcome
• Address: 123 Healthcare Ave

This chatbot is for general information only and cannot provide emergency medical advice.`,
      suggestions: ["Urgent care info", "Find nearest hospital", "Contact us"],
    }
  }
}

export const chatbotService = ChatbotService

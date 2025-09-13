import type { Appointment, Doctor, User } from "./types"

export interface EmailTemplate {
  to: string
  subject: string
  html: string
}

export class EmailService {
  static async sendAppointmentConfirmation(
    appointment: Appointment,
    doctor: Doctor,
    user: Omit<User, "password">,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // Mock implementation - in production, integrate with SendGrid, AWS SES, etc.

    const emailTemplate: EmailTemplate = {
      to: user.email,
      subject: `Appointment Confirmation - ${doctor.firstName} ${doctor.lastName}`,
      html: this.generateConfirmationEmail(appointment, doctor, user),
    }

    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock success response
    console.log("📧 Email sent:", emailTemplate)

    return {
      success: true,
      messageId: `mock-email-${Date.now()}`,
    }
  }

  static async sendAppointmentReminder(
    appointment: Appointment,
    doctor: Doctor,
    user: Omit<User, "password">,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const emailTemplate: EmailTemplate = {
      to: user.email,
      subject: `Appointment Reminder - Tomorrow at ${appointment.appointmentTime}`,
      html: this.generateReminderEmail(appointment, doctor, user),
    }

    await new Promise((resolve) => setTimeout(resolve, 500))
    console.log("📧 Reminder sent:", emailTemplate)

    return {
      success: true,
      messageId: `mock-reminder-${Date.now()}`,
    }
  }

  static async sendAppointmentCancellation(
    appointment: Appointment,
    doctor: Doctor,
    user: Omit<User, "password">,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const emailTemplate: EmailTemplate = {
      to: user.email,
      subject: `Appointment Cancelled - ${doctor.firstName} ${doctor.lastName}`,
      html: this.generateCancellationEmail(appointment, doctor, user),
    }

    await new Promise((resolve) => setTimeout(resolve, 500))
    console.log("📧 Cancellation sent:", emailTemplate)

    return {
      success: true,
      messageId: `mock-cancellation-${Date.now()}`,
    }
  }

  private static generateConfirmationEmail(
    appointment: Appointment,
    doctor: Doctor,
    user: Omit<User, "password">,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Appointment Confirmation</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .appointment-details { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>HealthCare+</h1>
              <h2>Appointment Confirmed</h2>
            </div>
            <div class="content">
              <p>Dear ${user.firstName} ${user.lastName},</p>
              <p>Your appointment has been successfully booked. Here are the details:</p>
              
              <div class="appointment-details">
                <h3>Appointment Details</h3>
                <p><strong>Doctor:</strong> ${doctor.firstName} ${doctor.lastName}</p>
                <p><strong>Specialty:</strong> ${doctor.specialty}</p>
                <p><strong>Date:</strong> ${appointment.appointmentDate}</p>
                <p><strong>Time:</strong> ${appointment.appointmentTime}</p>
                <p><strong>Reason:</strong> ${appointment.reason}</p>
                <p><strong>Consultation Fee:</strong> $${doctor.consultationFee}</p>
              </div>
              
              <div class="appointment-details">
                <h3>Doctor Contact Information</h3>
                <p><strong>Phone:</strong> ${doctor.phone}</p>
                <p><strong>Email:</strong> ${doctor.email}</p>
              </div>
              
              <p>Please arrive 15 minutes before your scheduled appointment time.</p>
              <p>If you need to reschedule or cancel, please contact us at least 24 hours in advance.</p>
            </div>
            <div class="footer">
              <p>Thank you for choosing HealthCare+</p>
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }

  private static generateReminderEmail(appointment: Appointment, doctor: Doctor, user: Omit<User, "password">): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Appointment Reminder</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .reminder-box { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 5px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>HealthCare+</h1>
              <h2>Appointment Reminder</h2>
            </div>
            <div class="content">
              <p>Dear ${user.firstName} ${user.lastName},</p>
              <p>This is a friendly reminder about your upcoming appointment:</p>
              
              <div class="reminder-box">
                <h3>Tomorrow's Appointment</h3>
                <p><strong>Doctor:</strong> ${doctor.firstName} ${doctor.lastName}</p>
                <p><strong>Time:</strong> ${appointment.appointmentTime}</p>
                <p><strong>Date:</strong> ${appointment.appointmentDate}</p>
              </div>
              
              <p>Please remember to arrive 15 minutes early and bring any relevant medical documents.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }

  private static generateCancellationEmail(
    appointment: Appointment,
    doctor: Doctor,
    user: Omit<User, "password">,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Appointment Cancelled</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>HealthCare+</h1>
              <h2>Appointment Cancelled</h2>
            </div>
            <div class="content">
              <p>Dear ${user.firstName} ${user.lastName},</p>
              <p>Your appointment with ${doctor.firstName} ${doctor.lastName} on ${appointment.appointmentDate} at ${appointment.appointmentTime} has been cancelled.</p>
              <p>If you need to book a new appointment, please visit our website or contact us directly.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }
}

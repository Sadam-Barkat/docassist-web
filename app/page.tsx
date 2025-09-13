"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"
import { Calendar, Clock, Shield, Users } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function HomePage() {
  const { user } = useAuth()
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 text-balance">
            Book Your Doctor Appointment
            <span className="text-blue-600"> Instantly</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto text-pretty">
            Connect with qualified healthcare professionals, schedule appointments at your convenience, and manage your
            health journey with our comprehensive platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={user ? "/book-appointment" : "/register"}>
              <Button size="lg" className="w-full sm:w-auto">
                Book Appointment Now
              </Button>
            </Link>
            <Link href="/doctors">
              <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
                Browse Doctors
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Choose HealthCare+?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Easy Scheduling</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Book appointments 24/7 with real-time availability updates</CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Qualified Doctors</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Access to board-certified specialists across multiple fields</CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Secure & Private</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Your health information is protected with enterprise-grade security</CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Clock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>AI Assistant</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Get instant help with our intelligent chatbot for quick queries</CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Take Control of Your Health?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of patients who trust HealthCare+ for their medical needs.
          </p>
          <Link href={user ? "/book-appointment" : "/register"}>
            <Button size="lg" variant="secondary">
              Start Your Journey Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-4">HealthCare+</h3>
          <p className="text-gray-400 mb-8">Your trusted partner in healthcare management</p>
          <div className="flex justify-center gap-8 text-sm text-gray-400">
            <Link href="/privacy" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white">
              Terms of Service
            </Link>
            <Link href="/contact" className="hover:text-white">
              Contact Us
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

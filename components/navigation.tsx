"use client"

import Link from "next/link"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, LogOut, Settings, Calendar } from "lucide-react"

export function Navigation() {
  const { isAuthenticated, user, logout } = useAuth()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const getInitials = (name: string) => {
    const nameParts = name?.split(' ') || []
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase()
    }
    return name?.charAt(0)?.toUpperCase() || 'U'
  }

  return (
    <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-blue-600">
              HealthCare+
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <div className="hidden md:flex items-center gap-4">
                  <Link href="/dashboard">
                    <Button variant="ghost">Dashboard</Button>
                  </Link>
                  <Link href="/doctors">
                    <Button variant="ghost">Doctors</Button>
                  </Link>
                  <Link href="/appointments">
                    <Button variant="ghost">Appointments</Button>
                  </Link>
                </div>

                <div className="relative">
                  <Button 
                    variant="ghost" 
                    className="relative h-8 w-8 rounded-full"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{user ? getInitials(user.name || '') : "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                  
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                      <div className="flex items-center justify-start gap-2 p-3 border-b">
                        <div className="flex flex-col space-y-1 leading-none">
                          <p className="font-medium">{user ? user.name : "User"}</p>
                          <p className="w-[200px] truncate text-sm text-gray-500">{user?.email}</p>
                        </div>
                      </div>
                      
                      <div className="py-1">
                        <Link 
                          href="/profile" 
                          className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </Link>
                        <Link 
                          href="/appointments" 
                          className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          My Appointments
                        </Link>
                        {user?.is_adman === "admin" && (
                          <Link 
                            href="/admin" 
                            className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <Settings className="mr-2 h-4 w-4" />
                            Admin Panel
                          </Link>
                        )}
                      </div>
                      
                      <div className="border-t py-1">
                        <button 
                          onClick={() => {
                            logout()
                            setIsDropdownOpen(false)
                          }} 
                          className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer text-left"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Log out
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Click outside to close */}
                  {isDropdownOpen && (
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsDropdownOpen(false)}
                    />
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/register">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

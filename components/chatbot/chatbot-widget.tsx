"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Bot, X, MessageCircle, Minus, Users, Calendar } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter, usePathname } from "next/navigation"
import type { ChatMessage } from "@/lib/types"
import { chatbotApi } from "@/lib/api"

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<{path: string, delay: number} | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Hide chatbot on auth pages
  const shouldHideChatbot = pathname === '/login' || pathname === '/register'

  useEffect(() => {
    setMessages([])
    // Re-initialize with welcome message
    const welcomeMessage: ChatMessage = {
      id: "1",
      message: `Hello${user ? ` ${user.name}` : ""}! I'm your HealthCare+ AI assistant. I can help you with:

• Finding doctors by specialty or name
• Booking appointments
• Managing your profile
${user?.is_adman === "admin" ? "• Admin: Managing doctors and users" : ""}

How can I assist you today?`,
      sender: "bot",
      timestamp: new Date().toISOString(),
    }
    setMessages([welcomeMessage])
  }, [user])

  const minimizeChat = () => {
    setIsOpen(false)
  }

  const clearChat = () => {
    setMessages([])
    setIsOpen(false)
    // Re-initialize with welcome message when reopened
    setTimeout(() => {
      const welcomeMessage: ChatMessage = {
        id: "1",
        message: `Hello${user ? ` ${user.name}` : ""}! I'm your HealthCare+ AI assistant. I can help you with:

• Finding doctors by specialty or name
• Booking appointments
• Managing your profile
${user?.is_adman === "admin" ? "• Admin: Managing doctors and users" : ""}

How can I assist you today?`,
        sender: "bot",
        timestamp: new Date().toISOString(),
      }
      setMessages([welcomeMessage])
    }, 100)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Don't render chatbot on auth pages (moved after all hooks)
  if (shouldHideChatbot) {
    return null
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    // Check if user is authenticated for chatbot
    if (!user) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: "Please login to use the AI assistant. The chatbot requires authentication to provide personalized assistance.",
        sender: "bot",
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMessage])
      return
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message: inputMessage.trim(),
      sender: "user",
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      const response = await chatbotApi.sendMessage(inputMessage.trim())

      if (response.success && response.data) {
        let botReply = response.data.reply
        let navigationData: { path: string; action: string; delay_ms: number } | null = null
        
        // Check if the response contains navigation response format
        try {
          console.log("Raw chatbot response:", response.data.reply)
          const parsedReply = JSON.parse(response.data.reply)
          console.log("Parsed chatbot response:", parsedReply)
          
          // Handle different response formats from backend
          
          // Format 1: OpenAI Agent SDK structured responses
          if (parsedReply.type === "navigation_response" && parsedReply.navigation) {
            console.log("✅ OpenAI Agent navigation response:", parsedReply)
            botReply = parsedReply.message || "Processing your request..."
            
            const targetPath = parsedReply.navigation.path
            const delay = parsedReply.navigation.delay_ms || 500
            
            console.log(`🚀 Executing navigation to: ${targetPath} in ${delay}ms`)
            setTimeout(() => {
              console.log("🔄 Router.push called with:", targetPath)
              router.push(targetPath)
            }, delay)
            
          } else if (parsedReply.type === "message_response") {
            console.log("✅ OpenAI Agent message response:", parsedReply)
            botReply = parsedReply.message || "Request processed successfully"
            
          // Format 2: Simple response format {"response": "Redirecting to dashboard..."}
          } else if (parsedReply.response) {
            console.log("✅ Simple response format detected:", parsedReply.response)
            
            // Check if response mentions redirecting/navigating to a specific page
            const redirectMatch = parsedReply.response.match(/(?:redirecting to|navigating to|go to|show|visit)\s+(\w+)/i)
            if (redirectMatch) {
              const pageName = redirectMatch[1].toLowerCase()
              const pageMap: { [key: string]: string } = {
                'dashboard': '/dashboard',
                'appointments': '/appointments',
                'appointment': '/book-appointment',
                'admin': '/admin',
                'profile': '/profile',
                'doctors': '/doctors',
                'doctor': '/doctors'
              }
              
              const targetPath = pageMap[pageName] || `/${pageName}`
              botReply = `✅ ${parsedReply.response}`
              
              console.log("🚀 Executing redirect to:", targetPath)
              setTimeout(() => {
                console.log("🔄 Router.push called with:", targetPath)
                router.push(targetPath)
              }, 1000)
            } else {
              botReply = parsedReply.response
            }
            
          // Format 3: Simple page format {"page": "dashboard"}
          } else if (parsedReply.page) {
            console.log("✅ Simple page navigation detected:", parsedReply.page)
            const pageMap: { [key: string]: string } = {
              'dashboard': '/dashboard',
              'appointments': '/appointments',
              'book-appointment': '/book-appointment',
              'admin': '/admin',
              'profile': '/profile',
              'doctors': '/doctors'
            }
            
            const targetPath = pageMap[parsedReply.page] || `/${parsedReply.page}`
            botReply = `✅ Navigating to ${parsedReply.page}...`
            
            console.log("🚀 Executing navigation to:", targetPath)
            setTimeout(() => {
              console.log("🔄 Router.push called with:", targetPath)
              router.push(targetPath)
            }, 500)
            
          // Format 2: {"response": "OK, redirecting to dashboard."}
          } else if (parsedReply.response) {
            console.log("✅ Response format detected:", parsedReply.response)
            
            // Check if response mentions redirecting/navigating to a page
            const redirectMatch = parsedReply.response.match(/(?:redirecting to|navigating to|go to|show|visit)\s+(\w+)/i)
            if (redirectMatch) {
              const pageName = redirectMatch[1].toLowerCase()
              const pageMap: { [key: string]: string } = {
                'dashboard': '/dashboard',
                'appointments': '/appointments',
                'appointment': '/book-appointment',
                'admin': '/admin',
                'profile': '/profile',
                'doctors': '/doctors',
                'doctor': '/doctors'
              }
              
              const targetPath = pageMap[pageName] || `/${pageName}`
              botReply = `✅ ${parsedReply.response}`
              
              console.log("🚀 Executing redirect to:", targetPath)
              setTimeout(() => {
                console.log("🔄 Router.push called with:", targetPath)
                router.push(targetPath)
              }, 1000)
            } else {
              botReply = parsedReply.response
            }
            
          // Format 3: {"doctors": []} or other data responses
          } else if (parsedReply.doctors !== undefined) {
            console.log("✅ Doctors data detected:", parsedReply.doctors)
            if (parsedReply.doctors.length === 0) {
              botReply = "📋 No doctors found in the system. You can add doctors through the admin panel."
              // Navigate to doctors page to show the empty state
              setTimeout(() => {
                router.push('/doctors')
              }, 1000)
            } else {
              botReply = `👨‍⚕️ Found ${parsedReply.doctors.length} doctors. Showing doctors page...`
              setTimeout(() => {
                router.push('/doctors')
              }, 1000)
            }
            
          // Format 4: {"appointments": []} or other data responses  
          } else if (parsedReply.appointments !== undefined) {
            console.log("✅ Appointments data detected:", parsedReply.appointments)
            if (parsedReply.appointments.length === 0) {
              botReply = "📅 No appointments found. You can book a new appointment."
              setTimeout(() => {
                router.push('/appointments')
              }, 1000)
            } else {
              botReply = `📅 Found ${parsedReply.appointments.length} appointments. Showing appointments page...`
              setTimeout(() => {
                router.push('/appointments')
              }, 1000)
            }
            
          } else if (parsedReply.type === "payment_redirect") {
            // Handle payment redirect response
            console.log("Payment redirect detected:", parsedReply.payment_url)
            botReply = parsedReply.message || "💳 Pay Now - Redirecting to secure payment..."
            
            // Redirect to Stripe payment page
            setTimeout(() => {
              console.log("Redirecting to payment:", parsedReply.payment_url)
              window.open(parsedReply.payment_url, '_blank')
            }, 1000)
            
          } else if (parsedReply.type === "message_response") {
            // Handle message-only response (no navigation)
            console.log("Message-only response detected")
            botReply = parsedReply.message || "Request processed successfully"
            navigationData = null
          } else if (parsedReply.navigate_to) {
            // Handle legacy navigation format
            console.log("Legacy navigation detected:", parsedReply.navigate_to)
            botReply = `${parsedReply.message || parsedReply.reply || "Here's what I found:"}\n\n🔗 Will navigate to: ${parsedReply.navigate_to}`
            setTimeout(() => {
              console.log("Executing legacy navigation to:", parsedReply.navigate_to)
              router.push(parsedReply.navigate_to)
            }, 500)
          }
        } catch (parseError) {
          console.log("Failed to parse response as JSON:", parseError)
          console.log("Response type:", typeof response.data.reply)
          console.log("Response content:", response.data.reply)
          // Not JSON, use reply as-is
          botReply = response.data.reply
        }

        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          message: botReply,
          sender: "bot",
          timestamp: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, botMessage])

        // Legacy navigation handling (keeping for backward compatibility)
        if (navigationData && navigationData.action === "navigate" && navigationData.path) {
          const delay = navigationData.delay_ms || 1500
          
          console.log(`Scheduling AUTOMATIC navigation to ${navigationData.path} in ${delay}ms`)
          
          // Automatic navigation
          setTimeout(() => {
            console.log(`Executing AUTOMATIC navigation to: ${navigationData.path}`)
            router.push(navigationData.path)
          }, delay)
        } else {
          console.log("No navigation data found or invalid format:", navigationData)
        }
      } else {
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          message: response.error || "Sorry, I encountered an error. Please try again.",
          sender: "bot",
          timestamp: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, errorMessage])
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: "Sorry, I encountered an error. Please try again or contact support.",
        sender: "bot",
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMessage])
    }

    setIsLoading(false)
    // Refocus the input after the response
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }

  const handleSuggestionClick = async (suggestion: string) => {
    if (isLoading) return
    
    // Add user message immediately
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message: suggestion,
      sender: "user",
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMessage])
    
    // Clear input and start loading
    setInputMessage("")
    setIsLoading(true)

    // Send message to API
    try {
      const response = await chatbotApi.sendMessage(suggestion)
      
      if (response.success) {
        let botReply = response.data.reply
        let navigationData = null

        // Parse JSON responses for navigation
        try {
          const parsedReply = JSON.parse(response.data.reply)
          
          if (parsedReply.type === "navigation_response") {
            console.log("Navigation response detected:", parsedReply.navigation)
            botReply = parsedReply.message || "Navigating..."
            navigationData = parsedReply.navigation
          } else if (parsedReply.type === "payment_redirect") {
            console.log("Payment redirect detected:", parsedReply.payment_url)
            botReply = parsedReply.message || "💳 Pay Now - Redirecting to secure payment..."
            
            setTimeout(() => {
              window.open(parsedReply.payment_url, '_blank')
            }, 1000)
          } else if (parsedReply.type === "message_response") {
            console.log("Message-only response detected")
            botReply = parsedReply.message || "Request processed successfully"
            navigationData = null
          }
        } catch (parseError) {
          // Not JSON, use reply as-is
          botReply = response.data.reply
        }

        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          message: botReply,
          sender: "bot",
          timestamp: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, botMessage])

        // Handle navigation
        if (navigationData && navigationData.action === "navigate" && navigationData.path) {
          const delay = navigationData.delay_ms || 1500
          
          setTimeout(() => {
            router.push(navigationData.path)
          }, delay)
        }
      } else {
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          message: response.error || "Sorry, I encountered an error. Please try again.",
          sender: "bot",
          timestamp: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, errorMessage])
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: "Sorry, I encountered an error. Please try again or contact support.",
        sender: "bot",
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMessage])
    }

    setIsLoading(false)
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
    // Shift+Enter allows new line (default textarea behavior)
  }

  const formatMessage = (message: string) => {
    // Simple formatting for bullet points and line breaks
    return message.split("\n").map((line, index) => (
      <div key={index} className={line.startsWith("•") ? "ml-2" : ""}>
        {line}
      </div>
    ))
  }

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-blue-600 hover:bg-blue-700"
          size="icon"
        >
          <img src="/chatbot-icon.svg" alt="AI Assistant" className="h-8 w-8" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-4 left-4 right-4 top-20 sm:bottom-6 sm:right-6 sm:left-auto sm:top-auto w-auto sm:w-96 h-auto sm:h-[500px] sm:max-h-[600px] bg-white rounded-lg shadow-xl z-50 flex flex-col border">
          {/* Header */}
          <div className="flex items-center justify-between p-3 bg-blue-600 text-white rounded-t-lg">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8 bg-blue-500">
                <img src="/chatbot-icon.svg" alt="AI Assistant" className="h-6 w-6" />
                <AvatarFallback className="text-white">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-sm font-medium">HealthCare+ Assistant</h3>
                <p className="text-xs text-blue-100">Online</p>
              </div>
            </div>
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={minimizeChat}
                className="h-8 w-8 text-white hover:bg-blue-700"
                title="Minimize chat"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={clearChat}
                className="h-8 w-8 text-white hover:bg-blue-700"
                title="Clear chat history"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-3 sm:space-y-4" style={{ maxHeight: 'calc(100% - 140px)' }}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[80%] rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm ${
                    message.sender === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {formatMessage(message.message)}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Navigation Button */}
          {pendingNavigation && (
            <div className="px-3 py-2 border-t border-orange-100 bg-orange-50">
              <Button
                onClick={() => {
                  console.log(`Manual navigation triggered to: ${pendingNavigation.path}`)
                  router.push(pendingNavigation.path)
                  setPendingNavigation(null)
                }}
                className="w-full text-sm bg-orange-500 hover:bg-orange-600 text-white"
              >
                🔗 Go to {pendingNavigation.path}
              </Button>
            </div>
          )}

          {/* Suggestions */}
          <div className="px-2 sm:px-3 py-2 border-t border-gray-100">
            <div className="flex flex-wrap gap-1 sm:gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSuggestionClick("Show me doctors")}
                className="text-xs flex-1 sm:flex-none"
              >
                <Users className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Find Doctor</span>
                <span className="sm:hidden">Doctors</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSuggestionClick("Book an appointment")}
                className="text-xs flex-1 sm:flex-none"
              >
                <Calendar className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Book Appointment</span>
                <span className="sm:hidden">Book</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSuggestionClick("Open my profile")}
                className="text-xs flex-1 sm:flex-none"
              >
                <Bot className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">My Profile</span>
                <span className="sm:hidden">Profile</span>
              </Button>
            </div>
          </div>

          {/* Input Area - Fixed at bottom */}
          <div className="p-2 sm:p-3 border-t border-gray-200 bg-white rounded-b-lg">
            <div className="flex space-x-2 items-end">
              <Textarea
                ref={inputRef}
                placeholder={isLoading ? "AI is typing..." : "Type your message"}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={isLoading}
                className="flex-1 min-h-[36px] sm:min-h-[40px] max-h-[100px] sm:max-h-[120px] resize-none text-sm"
                autoComplete="off"
                autoFocus
                rows={1}
              />
              <Button onClick={handleSendMessage} disabled={!inputMessage.trim() || isLoading} size="icon" className="h-9 w-9 sm:h-10 sm:w-10 shrink-0">
                <Send className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

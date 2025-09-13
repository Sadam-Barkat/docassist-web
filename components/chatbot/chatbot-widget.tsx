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
          
          if (parsedReply.type === "navigation_response" && parsedReply.navigation) {
            // Handle structured navigation response
            console.log("Navigation detected:", parsedReply.navigation)
            botReply = parsedReply.message || "Processing your request..."
            navigationData = parsedReply.navigation
            
            // Force immediate navigation for testing
            console.log("FORCING IMMEDIATE NAVIGATION TO:", navigationData?.path)
            setTimeout(() => {
              console.log("Executing navigation to:", navigationData?.path)
              if (navigationData?.path) {
                router.push(navigationData.path)
              }
            }, 500) // Very short delay for testing
            
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

        // Handle navigation with React Router (preserves chatbot state)
        if (navigationData && navigationData.action === "navigate" && navigationData.path) {
          const delay = navigationData.delay_ms || 1500
          
          console.log(`Scheduling AUTOMATIC navigation to ${navigationData.path} in ${delay}ms`)
          
          // Automatic navigation
          setTimeout(() => {
            console.log(`Executing AUTOMATIC navigation to: ${navigationData.path}`)
            try {
              // Use React Router push to navigate without page refresh
              // This preserves the chatbot state and keeps it open
              router.push(navigationData.path)
              setPendingNavigation(null) // Clear manual navigation button
              console.log("Automatic navigation executed successfully")
            } catch (navError) {
              console.error("Automatic navigation failed:", navError)
              // Keep manual navigation button if automatic fails
            }
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

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion)
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
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-lg shadow-xl z-50 flex flex-col border">
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
          <div className="flex-1 overflow-y-auto p-3 space-y-4" style={{ maxHeight: '380px' }}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
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
          <div className="px-3 py-2 border-t border-gray-100">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSuggestionClick("Show me doctors")}
                className="text-xs"
              >
                <Users className="h-3 w-3 mr-1" />
                Find Doctor
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSuggestionClick("Book an appointment")}
                className="text-xs"
              >
                <Calendar className="h-3 w-3 mr-1" />
                Book Appointment
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSuggestionClick("Open my profile")}
                className="text-xs"
              >
                <Bot className="h-3 w-3 mr-1" />
                My Profile
              </Button>
            </div>
          </div>

          {/* Input Area - Fixed at bottom */}
          <div className="p-3 border-t border-gray-200 bg-white rounded-b-lg">
            <div className="flex space-x-2 items-end">
              <Textarea
                ref={inputRef}
                placeholder={isLoading ? "AI is typing..." : "Type your message"}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={isLoading}
                className="flex-1 min-h-[40px] max-h-[120px] resize-none"
                autoComplete="off"
                autoFocus
                rows={1}
              />
              <Button onClick={handleSendMessage} disabled={!inputMessage.trim() || isLoading} size="icon" className="h-10 w-10 shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

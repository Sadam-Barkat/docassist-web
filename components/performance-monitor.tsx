"use client"

import { useEffect } from 'react'

export function PerformanceMonitor() {
  useEffect(() => {
    // Monitor Core Web Vitals
    if (typeof window !== 'undefined' && 'performance' in window) {
      // First Contentful Paint (FCP)
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
            console.log('🎨 First Contentful Paint:', entry.startTime.toFixed(2) + 'ms')
          }
          
          if (entry.entryType === 'largest-contentful-paint') {
            console.log('🖼️ Largest Contentful Paint:', entry.startTime.toFixed(2) + 'ms')
          }
          
          if (entry.entryType === 'first-input') {
            console.log('⚡ First Input Delay:', entry.processingStart - entry.startTime + 'ms')
          }
        }
      })
      
      try {
        observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input'] })
      } catch (e) {
        // Fallback for older browsers
        console.log('Performance monitoring not fully supported')
      }
      
      // Page Load Time
      window.addEventListener('load', () => {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart
        console.log('📊 Page Load Time:', loadTime + 'ms')
        
        // Log if load time is over 5 seconds
        if (loadTime > 5000) {
          console.warn('⚠️ Slow page load detected:', loadTime + 'ms')
        } else if (loadTime < 3000) {
          console.log('✅ Fast page load:', loadTime + 'ms')
        }
      })
      
      return () => {
        observer.disconnect()
      }
    }
  }, [])
  
  return null // This component doesn't render anything
}

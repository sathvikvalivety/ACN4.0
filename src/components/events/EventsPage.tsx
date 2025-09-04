import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Plus, Loader2, AlertCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useToast, ToastContainer } from './Toast'
import EventCard from './EventCard'

interface Event {
  id: string
  title: string
  description: string
  tagline?: string
  image_url?: string
  rules?: string
  schedule?: string
  venue?: string
  created_at: string
}

export default function EventsPage() {
  const { user } = useAuth()
  const { toasts, addToast, removeToast } = useToast()
  
  // State
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  
  // Load events
  const loadEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      
      let query = supabase.from('events').select('*')
      
      if (searchTerm.trim()) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      }
      
      query = query.order('created_at', { ascending: false })
      
      const { data, error } = await query
      
      if (error) {
        throw error
      }
      
      setEvents(data || [])
      
    } catch (err: any) {
      console.error('Error loading events:', err)
      setError(err.message)
      addToast({
        type: 'error',
        title: 'Failed to load events',
        message: err.message
      })
    } finally {
      setLoading(false)
    }
  }
  
  // Initial load
  useEffect(() => {
    loadEvents()
  }, [])
  
  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      loadEvents()
    }, 500)
    
    return () => clearTimeout(timer)
  }, [searchTerm])
  
  const handleSearch = (value: string) => {
    setSearchTerm(value)
  }
  
  if (loading && events.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Loading events...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (error && events.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Failed to load events
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <button
                onClick={() => loadEvents()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Events
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Discover and register for upcoming events
              </p>
            </div>
            
          </div>
        </div>
      </div>
      
      {/* Search */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex-1 relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
      
      {/* Events Grid */}
      <div className="container mx-auto px-4 py-8">
        {events.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <EventCard event={event} />
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="text-6xl">🔍</div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No events found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm 
                  ? 'Try adjusting your search criteria' 
                  : 'No events are currently available'
                }
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}

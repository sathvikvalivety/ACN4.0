import { Calendar, MapPin, Users, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from './Toast'
import { supabase } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'

interface Event {
  id: string
  title: string
  tagline: string
  image_url: string | null
  venue: string | null
  schedule: string | null
    price?: number | null
}

interface EventCardProps {
  event: Event
}

export default function EventCard({ event }: EventCardProps) {
  const [registrationStatus, setRegistrationStatus] = useState<{
    isRegistered: boolean
    paymentStatus: 'pending' | 'approved' | 'rejected' | 'none'
    loading: boolean
  }>({ isRegistered: false, paymentStatus: 'none', loading: true })
  const [isRegistering, setIsRegistering] = useState(false)
  const { user } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  
  // Check registration status on component mount
  useEffect(() => {
    if (user && event.id) {
      checkRegistration()
    } else {
      setRegistrationStatus({ isRegistered: false, paymentStatus: 'none', loading: false })
    }
  }, [user, event.id])

  const checkRegistration = async () => {
    if (!user) return

    try {
      // Use secure backend function to check registration
      const { data, error } = await supabase.rpc('check_user_registration', {
        p_user_id: user.id,
        p_event_id: event.id
      })

      if (error) {
        // Silent fail - don't expose database errors to user
        console.error('Registration check failed')
        setRegistrationStatus({ isRegistered: false, paymentStatus: 'none', loading: false })
        return
      }

      if (data && data.length > 0) {
        const result = data[0]
        setRegistrationStatus({
          isRegistered: result.is_registered,
          paymentStatus: result.payment_status || 'none',
          loading: false
        })
      } else {
        setRegistrationStatus({ isRegistered: false, paymentStatus: 'none', loading: false })
      }
    } catch (error) {
      // Silent fail - don't expose errors
      setRegistrationStatus({ isRegistered: false, paymentStatus: 'none', loading: false })
    }
  }

  const checkProfileComplete = async () => {
    if (!user) return false
    
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (error || !profile) return false
      
      return profile.name && profile.phone && profile.rollno && profile.branch
    } catch (error) {
      return false
    }
  }

  const handleRegister = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!user) {
      addToast({
        type: 'warning',
        title: 'Login Required',
        message: 'Please sign in to register'
      })
      return
    }

    // Check if already registered first
    if (registrationStatus.isRegistered) {
      const statusMessages = {
        pending: 'Payment verification in progress',
        approved: 'You are already registered!', 
        rejected: 'Previous payment was declined. Contact support.'
      }
      
      addToast({
        type: registrationStatus.paymentStatus === 'approved' ? 'success' : 'info',
        title: 'Already Registered',
        message: statusMessages[registrationStatus.paymentStatus] || 'Registration exists'
      })
      return
    }
    
    const isProfileComplete = await checkProfileComplete()
    if (!isProfileComplete) {
      addToast({
        type: 'warning',
        title: 'Complete Profile',
        message: 'Please update your profile first'
      })
      return
    }

    setIsRegistering(true)
    
    try {
      // Use secure backend function to register
      const { data, error } = await supabase.rpc('register_user_for_event', {
        p_user_id: user.id,
        p_event_id: event.id
      })

      if (error) {
        addToast({
          type: 'error',
          title: 'Registration Failed',
          message: 'Please try again'
        })
        return
      }

      const result = data?.[0]
      if (!result?.success) {
        addToast({
          type: 'info',
          title: 'Registration Status',
          message: result?.message || 'Already registered'
        })
        // Refresh registration status
        checkRegistration()
        return
      }

      // Success - navigate to payment
      navigate(`pay/${event.id}`, {
        state: { eventTitle: event.title, amount: event.price ?? 0 },
      })
      
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Registration Failed',
        message: 'Please try again later'
      })
    } finally {
      setIsRegistering(false)
    }
  }

  return (
    <motion.div
      className="tech-card cursor-pointer group overflow-hidden"
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
<div className="relative h-48 overflow-hidden">
  {event.image_url ? (
    <img
      src={event.image_url}
      alt={event.title}
      className="w-full h-[200%] object-cover object-top transition-transform duration-500 group-hover:scale-110"
    />
  ) : (
    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <Users className="h-16 w-16 text-white opacity-50" />
    </div>
  )}
  {registrationStatus.isRegistered && (
    <div className={`absolute top-2 right-2 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center ${
      registrationStatus.paymentStatus === 'approved' ? 'bg-green-500' :
      registrationStatus.paymentStatus === 'pending' ? 'bg-yellow-500' :
      registrationStatus.paymentStatus === 'rejected' ? 'bg-red-500' : 'bg-gray-500'
    }`}>
      <Check className="h-3 w-3 mr-1" />
      {registrationStatus.paymentStatus === 'approved' ? 'Registered' :
       registrationStatus.paymentStatus === 'pending' ? 'Pending' :
       registrationStatus.paymentStatus === 'rejected' ? 'Rejected' : 'Registered'}
    </div>
  )}
</div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2">
            {event.title}
          </h3>
        </div>

        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
          {event.tagline}
        </p>

        <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
          {event.venue && (
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-gray-400" />
              <span>{event.venue}</span>
            </div>
          )}
          {event.schedule && (
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
              <span>{event.schedule}</span>
            </div>
          )}
        </div>

        <div className="mt-4 space-y-2">
          <button
            onClick={handleRegister}
            disabled={isRegistering || registrationStatus.loading || (registrationStatus.isRegistered && registrationStatus.paymentStatus === 'approved')}
            className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
              registrationStatus.isRegistered && registrationStatus.paymentStatus === 'approved'
                ? 'bg-green-100 text-green-800 cursor-default dark:bg-green-900 dark:text-green-200'
                : registrationStatus.isRegistered && registrationStatus.paymentStatus === 'pending'
                ? 'bg-yellow-100 text-yellow-800 cursor-default dark:bg-yellow-900 dark:text-yellow-200'
                : registrationStatus.isRegistered && registrationStatus.paymentStatus === 'rejected' 
                ? 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200'
                : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600'
            } ${(isRegistering || registrationStatus.loading) ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {registrationStatus.loading ? (
              'Loading...'
            ) : isRegistering ? (
              'Processing...'
            ) : registrationStatus.isRegistered && registrationStatus.paymentStatus === 'approved' ? (
              '✓ Registered'
            ) : registrationStatus.isRegistered && registrationStatus.paymentStatus === 'pending' ? (
              '⏳ Payment Pending'
            ) : registrationStatus.isRegistered && registrationStatus.paymentStatus === 'rejected' ? (
              '❌ Payment Rejected - Retry'
            ) : (
              'Pay & Register'
            )}
          </button>
          
          <a
            onClick={(e) => {
              e.stopPropagation();
              navigate(`event/${event.id}`);
            }}
            className="block text-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mt-2"
          >
            View Details
          </a>
        </div>
      </div>
    </motion.div>
  )
}
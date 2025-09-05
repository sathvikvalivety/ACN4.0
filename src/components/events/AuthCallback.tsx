import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useToast } from './Toast'

export default function AuthCallback() {
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { addToast } = useToast()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the hash from URL (Supabase auth tokens are in the hash)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        
        // Check if we have auth tokens in the hash
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        
        if (accessToken && refreshToken) {
          // Set the session with the tokens
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })

          if (error) {
            throw error
          }

          setSuccess(true)
          
          // Show success toast
          addToast({
            type: 'success',
            title: 'Email Verified!',
            message: 'Your account has been verified successfully.',
            duration: 4000
          })

          // Redirect to events page after a short delay
          setTimeout(() => {
            navigate('/events', { replace: true })
          }, 2000)
          
        } else {
          // Check for error parameters
          const errorCode = searchParams.get('error')
          const errorDescription = searchParams.get('error_description')
          
          if (errorCode) {
            throw new Error(errorDescription || 'Verification failed')
          }
          
          // If no tokens and no error, might be an invalid callback
          throw new Error('Invalid verification link')
        }
      } catch (err: any) {
        setError('Verification failed. Please try signing up again.')
        
        addToast({
          type: 'error',
          title: 'Verification Failed',
          message: 'Please try signing up again or contact support.',
          duration: 6000
        })
        
        // Redirect to events page after showing error
        setTimeout(() => {
          navigate('/events', { replace: true })
        }, 3000)
      } finally {
        setLoading(false)
      }
    }

    handleAuthCallback()
  }, [navigate, searchParams, addToast])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
      >
        {loading && (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 mx-auto mb-6"
            >
              <Loader2 className="w-16 h-16 text-primary" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Verifying Account
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we verify your email...
            </p>
          </>
        )}

        {!loading && success && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-16 h-16 mx-auto mb-6"
            >
              <CheckCircle className="w-16 h-16 text-green-500" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Account Verified!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Welcome to ACN TechFest 4.0! Redirecting you to events...
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 2 }}
                className="bg-green-500 h-2 rounded-full"
              />
            </div>
          </>
        )}

        {!loading && error && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-16 h-16 mx-auto mb-6"
            >
              <XCircle className="w-16 h-16 text-red-500" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Verification Failed
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error}
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 3 }}
                className="bg-gray-400 h-2 rounded-full"
              />
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}

import { useState, useRef } from 'react'
import { X, Mail, Lock, Eye, EyeOff, Shield } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast, ToastContainer } from './Toast'
import TurnstileCaptcha, { TurnstileCaptchaRef } from './TurnstileCaptcha'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [captchaToken, setCaptchaToken] = useState('')
  const [needsCaptcha, setNeedsCaptcha] = useState(false)
  const captchaRef = useRef<TurnstileCaptchaRef>(null)

  const { signIn, signUp, signInWithGoogle } = useAuth()
  const { toasts, addToast, removeToast } = useToast()

  // Validation functions
  const validateEmail = (email: string) => {
    const pattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
    return pattern.test(email) && email.length <= 254 && !email.includes('..')
  }

  const validatePassword = (password: string) => {
    return password.length >= 6
  }

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setError('')
    setCaptchaToken('')
    setNeedsCaptcha(false)
    if (captchaRef.current) {
      captchaRef.current.reset()
    }
  }

  const validateForm = () => {
    if (!email || !validateEmail(email)) {
      setError('Please enter a valid email address')
      return false
    }
    if (!password || !validatePassword(password)) {
      setError('Password must be at least 6 characters long')
      return false
    }
    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    if ((isSignUp || needsCaptcha) && !captchaToken) {
      setError('Please complete the security verification')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate form
    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      const { error } = isSignUp 
        ? await signUp(email, password, captchaToken)
        : await signIn(email, password, captchaToken)

      if (error) {
        // Check if error is related to captcha requirement
        if (error.message.includes('captcha') && !needsCaptcha) {
          setNeedsCaptcha(true)
          setError('Security verification required. Please complete the captcha below.')
          setLoading(false)
          return
        }
        // Convert backend errors to user-friendly messages
        let friendlyMessage = 'Something went wrong. Please try again.'
        
        if (error.message.includes('Invalid login credentials')) {
          friendlyMessage = 'Invalid email or password. Please check and try again.'
        } else if (error.message.includes('Email not confirmed')) {
          friendlyMessage = 'Please check your email and click the verification link first.'
        } else if (error.message.includes('User already registered')) {
          friendlyMessage = 'This email is already registered. Try signing in instead.'
        } else if (error.message.includes('Password should be at least')) {
          friendlyMessage = 'Password should be at least 6 characters long.'
        } else if (error.message.includes('Unable to validate email address')) {
          friendlyMessage = 'Please enter a valid email address.'
        } else if (error.message.includes('signup is disabled')) {
          friendlyMessage = 'Account creation is currently disabled. Please contact support.'
        }
        
        setError(friendlyMessage)
      } else {
        if (isSignUp) {
          setError('')
          addToast({
            type: 'success',
            title: 'Account Created',
            message: 'Please check your email for verification link before signing in.',
            duration: 6000
          })
        } else {
          addToast({
            type: 'success',
            title: 'Welcome Back!',
            message: 'You have successfully signed in.'
          })
        }
        onClose()
        resetForm()
      }
    } catch (err) {
      setError('Connection failed. Please check your internet and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')

    try {
      const { error } = await signInWithGoogle()
      if (error) {
        // Convert backend errors to user-friendly messages
        let friendlyMessage = 'Google sign-in failed. Please try again.'
        
        if (error.message.includes('cancelled') || error.message.includes('closed')) {
          friendlyMessage = 'Sign-in was cancelled. Please try again if you want to continue.'
        } else if (error.message.includes('popup_closed_by_user')) {
          friendlyMessage = 'Sign-in window was closed. Please try again.'
        }
        
        setError(friendlyMessage)
      } else {
        addToast({
          type: 'success',
          title: 'Welcome!',
          message: 'You have successfully signed in with Google.'
        })
        onClose()
      }
    } catch (err) {
      setError('Connection failed. Please check your internet and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div key="auth-modal" className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={onClose}
            />
            
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-4 sm:p-6 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
              >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {isSignUp 
                  ? 'Join the campus community today' 
                  : 'Sign in to your account'
                }
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.trim())}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Enter your email"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder={isSignUp ? 'Enter a password (6+ characters)' : 'Enter your password'}
                    required
                    disabled={loading}
                    minLength={isSignUp ? 6 : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field - Only shown during signup */}
              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="Confirm your password"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <motion.p 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }}
                      className="text-red-500 text-sm mt-1"
                    >
                      Passwords do not match
                    </motion.p>
                  )}
                </motion.div>
              )}

              {/* Captcha - Shown during signup OR when required for sign-in */}
              {(isSignUp || needsCaptcha) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex justify-center py-4"
                >
                  <TurnstileCaptcha
                    ref={captchaRef}
                    onVerify={(token) => {
                      setCaptchaToken(token)
                      setError('') // Clear any captcha-related errors
                    }}
                    onError={() => {
                      setCaptchaToken('')
                      setError('Security verification failed. Please try again.')
                    }}
                    onExpire={() => {
                      setCaptchaToken('')
                      setError('Security verification expired. Please verify again.')
                    }}
                    theme='auto'
                    size='normal'
                  />
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading || !email || !password || (isSignUp && (!confirmPassword || password !== confirmPassword)) || ((isSignUp || needsCaptcha) && !captchaToken)}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200"
              >
                {loading && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  </motion.div>
                )}
                {loading 
                  ? (isSignUp ? 'Creating Account...' : 'Signing In...') 
                  : (isSignUp ? 'Create Account' : 'Sign In')
                }
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or continue with</span>
                </div>
              </div>

              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="mt-4 w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 mr-2"
                  >
                    <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full" />
                  </motion.div>
                ) : (
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                )}
                {loading ? 'Connecting...' : 'Continue with Google'}
              </button>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError('')
                  setCaptchaToken('')
                  setNeedsCaptcha(false)
                  if (captchaRef.current) {
                    captchaRef.current.reset()
                  }
                }}
                className="text-primary hover:text-primary/80 font-medium transition-colors text-sm sm:text-base"
                disabled={loading}
              >
                {isSignUp 
                  ? 'Already have an account? Sign in' 
                  : "Don't have an account? Sign up"
                }
              </button>
            </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  )
}

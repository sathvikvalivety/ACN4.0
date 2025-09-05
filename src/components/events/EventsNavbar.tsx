import { useState, useEffect } from 'react'
import { Menu, X, User, LogOut, Shield } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { motion, AnimatePresence } from 'framer-motion'
import DarkModeToggle from './DarkModeToggle'
import { useToast, ToastContainer } from './Toast'
import { supabase } from '../../lib/supabase'

interface NavbarProps {
  onAuthClick: () => void
  onProfileClick: () => void
  onAdminClick: () => void
}

export default function EventsNavbar({ onAuthClick, onProfileClick, onAdminClick }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, signOut } = useAuth()
  const { toasts, addToast, removeToast } = useToast()
  
  // 🔒 Secure admin check using database roles
  const [isAdmin, setIsAdmin] = useState(false)
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user?.id) {
        setIsAdmin(false)
        return
      }
      
      try {
        // Use RPC function for secure admin check
        const { data, error } = await supabase.rpc('is_admin')
        if (error) {
          console.error('Admin check error:', error)
          setIsAdmin(false)
          return
        }
        
        setIsAdmin(!!data)
      } catch (err) {
        console.error('Admin check failed:', err)
        setIsAdmin(false)
      }
    }
    
    checkAdminStatus()
  }, [user?.id])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut()
      addToast({
        type: 'success',
        title: 'Signed Out',
        message: 'You have been signed out successfully'
      })
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Sign Out Failed',
        message: 'Failed to sign out. Please try again.'
      })
    }
    setIsMobileMenuOpen(false)
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'py-2' : 'py-4'
      }`}
    >
      <div className="mx-4">
        <div
          className={`glass-effect transition-all duration-300 ${
            isScrolled ? 'rounded-2xl shadow-large' : 'rounded-3xl shadow-medium'
          }`}
        >
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <motion.div
                className={`font-bold text-gray-900 dark:text-white transition-all duration-300 font-mono ${
                  isScrolled ? 'text-2xl' : 'text-3xl'
                }`}
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-primary">&lt;</span>ACNTechFest 4.0<span className="text-primary"> /&gt;</span>
              </motion.div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-6">
                <NavLink href="/">Home</NavLink>
                <NavLink href="#events">Events</NavLink>
                
                <DarkModeToggle />
                
                {user ? (
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                      <User className="w-4 h-4" />
                      <span className="text-sm">{user.email}</span>
                    </div>
                    <button
                      onClick={onProfileClick}
                      className="text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors"
                    >
                      Profile
                    </button>
                    {isAdmin && (
                      <button
                        onClick={onAdminClick}
                        className="flex items-center space-x-1 text-red-600 hover:text-red-700 transition-colors"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Admin</span>
                      </button>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={onAuthClick}
                    className="btn-primary"
                  >
                    Sign In
                  </button>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-gray-900 dark:text-white" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-900 dark:text-white" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden border-t border-gray-200/50 dark:border-gray-700/50"
              >
                <div className="px-6 py-4 space-y-4">
                  <MobileNavLink href="/" onClick={() => setIsMobileMenuOpen(false)}>
                    Home
                  </MobileNavLink>
                  <MobileNavLink href="#events" onClick={() => setIsMobileMenuOpen(false)}>
                    Events
                  </MobileNavLink>
                  
                  <div className="flex justify-center py-2">
                    <DarkModeToggle />
                  </div>
                  
                  {user ? (
                    <div className="space-y-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                        <User className="w-4 h-4" />
                        <span className="text-sm">{user.email}</span>
                      </div>
                      <button
                        onClick={() => {
                          onProfileClick()
                          setIsMobileMenuOpen(false)
                        }}
                        className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors w-full"
                      >
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => {
                            onAdminClick()
                            setIsMobileMenuOpen(false)
                          }}
                          className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors w-full"
                        >
                          <Shield className="w-4 h-4" />
                          <span>Admin Panel</span>
                        </button>
                      )}
                      <button
                        onClick={handleSignOut}
                        className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors w-full"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        onAuthClick()
                        setIsMobileMenuOpen(false)
                      }}
                      className="btn-primary w-full"
                    >
                      Sign In
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </motion.nav>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="text-gray-700 dark:text-gray-300 hover:text-primary-600 font-semibold transition-colors duration-200 relative group"
    >
      {children}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-200 group-hover:w-full" />
    </a>
  )
}

function MobileNavLink({ 
  href, 
  children, 
  onClick 
}: { 
  href: string
  children: React.ReactNode
  onClick: () => void 
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="block text-gray-700 dark:text-gray-300 hover:text-primary-600 font-semibold transition-colors duration-200 py-2"
    >
      {children}
    </a>
  )
}
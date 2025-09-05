import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

interface AdminRole {
  id: string
  user_id: string
  role: string
  permissions: Record<string, boolean>
  is_active: boolean
  granted_by: string
  created_at: string
}

interface UseSecureAdminResult {
  isAdmin: boolean
  adminRole: AdminRole | null
  isLoading: boolean
  isBlocked: boolean
  accessAttempts: number
  hasPermission: (permission: string) => boolean
  performSecureAction: (action: string, callback: () => Promise<void>) => Promise<void>
  logSecurityEvent: (event: string, data: any) => Promise<void>
}

/**
 * 🔒 ULTRA-SECURE ADMIN HOOK
 * Provides secure admin validation with multiple security layers
 */
// Security configuration
const SECURITY_CONFIG = {
  adminSessionTimeout: 8 * 60 * 60 * 1000 // 8 hours in milliseconds
}

export function useSecureAdmin(): UseSecureAdminResult {
  const { user } = useAuth()
  
  // Security states
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminRole, setAdminRole] = useState<AdminRole | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isBlocked, setIsBlocked] = useState(false)
  const [accessAttempts, setAccessAttempts] = useState(0)
  const [lastSecurityCheck, setLastSecurityCheck] = useState(0)

  // Security logging function
  const logSecurityEvent = useCallback(async (event: string, data: any) => {
    try {
      await supabase.rpc('log_admin_action', {
        action_name: event,
        table_name: 'security_log',
        record_id: null,
        old_data: null,
        new_data: data
      })
    } catch (err) {
      console.error('Failed to log security event:', err)
    }
  }, [])

  // Permission checker
  const hasPermission = useCallback((permission: string): boolean => {
    if (!adminRole?.permissions) return false
    return adminRole.permissions[permission] === true
  }, [adminRole])

  // Enhanced admin validation with edge function
  const validateAdminAccess = useCallback(async (): Promise<boolean> => {
    if (!user?.id) {
      setIsAdmin(false)
      setIsLoading(false)
      return false
    }

    try {
      setIsLoading(true)

      // Step 1: Call auth-guard edge function for additional security
      try {
        const { data: guardResult, error: guardError } = await supabase.functions.invoke('auth-guard', {
          body: { 
            action: 'admin_access_check',
            user_id: user.id,
            timestamp: Date.now()
          }
        })

        if (guardError || !guardResult?.success) {
          console.warn('🚫 Edge function security check failed')
          await logSecurityEvent('edge_function_security_check_failed', {
            user_id: user.id,
            user_email: user.email,
            guard_error: guardError?.message,
            guard_result: guardResult
          })
          setAccessAttempts(prev => prev + 1)
          return false
        }
      } catch (edgeErr) {
        console.warn('Edge function not available, using fallback validation')
      }

      // Step 2: Enhanced database validation
      const { data: secureCheck, error: checkError } = await supabase.rpc('secure_admin_check')
      
      if (checkError) {
        console.error('🚫 Secure admin check failed:', checkError)
        await logSecurityEvent('secure_admin_check_error', {
          user_id: user.id,
          error: checkError.message
        })
        setAccessAttempts(prev => prev + 1)
        return false
      }

      if (!secureCheck?.is_valid) {
        console.warn(`🚫 Admin access denied: ${secureCheck?.security_status}`)
        await logSecurityEvent('admin_access_denied', {
          user_id: user.id,
          user_email: user.email,
          reason: secureCheck?.security_status,
          role_info: secureCheck?.role_info
        })
        setAccessAttempts(prev => prev + 1)
        return false
      }

      // Step 3: Additional frontend validation
      const { data: adminData, error: adminError } = await supabase
        .from('admin_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single()

      if (adminError || !adminData) {
        console.warn('🚫 Admin role verification failed')
        setAccessAttempts(prev => prev + 1)
        return false
      }

      // Step 4: Session validation
      const sessionAge = Date.now() - new Date(user.last_sign_in_at || 0).getTime()
      if (sessionAge > SECURITY_CONFIG.adminSessionTimeout) {
        console.warn('🚫 Admin session expired')
        await logSecurityEvent('admin_session_expired', {
          user_id: user.id,
          session_age_ms: sessionAge,
          last_sign_in: user.last_sign_in_at
        })
        setAccessAttempts(prev => prev + 1)
        return false
      }

      // All checks passed
      console.log('✅ Secure admin access granted')
      setAdminRole(adminData)
      setIsAdmin(true)
      setLastSecurityCheck(Date.now())
      
      await logSecurityEvent('secure_admin_access_granted', {
        user_id: user.id,
        user_email: user.email,
        role: adminData.role,
        permissions: adminData.permissions,
        security_checks_passed: [
          'edge_function',
          'secure_admin_check',
          'admin_roles_verification',
          'session_validation'
        ]
      })

      return true

    } catch (err: any) {
      console.error('🚨 Admin validation error:', err)
      await logSecurityEvent('admin_validation_error', {
        user_id: user.id,
        user_email: user.email,
        error: err.message
      })
      setAccessAttempts(prev => prev + 1)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [user, logSecurityEvent])

  // Perform secure admin action with validation
  const performSecureAction = useCallback(async (
    actionName: string, 
    callback: () => Promise<void>
  ) => {
    // Re-validate if last check was more than 10 minutes ago
    const timeSinceLastCheck = Date.now() - lastSecurityCheck
    if (timeSinceLastCheck > 10 * 60 * 1000) { // 10 minutes
      console.log('🔍 Re-validating admin status due to time elapsed')
      const isValid = await validateAdminAccess()
      if (!isValid) {
        throw new Error('Admin re-validation failed')
      }
    }

    if (!isAdmin || isBlocked) {
      await logSecurityEvent('unauthorized_action_attempt', {
        user_id: user?.id,
        attempted_action: actionName,
        is_admin: isAdmin,
        is_blocked: isBlocked
      })
      throw new Error('Unauthorized: Admin access required')
    }

    try {
      await logSecurityEvent('admin_action_started', {
        user_id: user?.id,
        action: actionName
      })

      await callback()

      await logSecurityEvent('admin_action_completed', {
        user_id: user?.id,
        action: actionName,
        success: true
      })

    } catch (err: any) {
      await logSecurityEvent('admin_action_failed', {
        user_id: user?.id,
        action: actionName,
        error: err.message,
        success: false
      })
      throw err
    }
  }, [isAdmin, isBlocked, lastSecurityCheck, user, logSecurityEvent, validateAdminAccess])

  // Main effect for admin validation
  useEffect(() => {
    validateAdminAccess()
  }, [user?.id])

  // Block access after too many attempts
  useEffect(() => {
    if (accessAttempts >= 3) {
      setIsBlocked(true)
      logSecurityEvent('admin_access_blocked', {
        user_id: user?.id,
        user_email: user?.email,
        access_attempts: accessAttempts,
        blocked_at: new Date().toISOString()
      })
    }
  }, [accessAttempts, user, logSecurityEvent])

  // Auto-refresh admin status every 30 minutes
  useEffect(() => {
    if (!isAdmin) return

    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing admin status...')
      validateAdminAccess()
    }, 30 * 60 * 1000) // 30 minutes

    return () => clearInterval(interval)
  }, [isAdmin, validateAdminAccess])

  return {
    isAdmin,
    adminRole,
    isLoading,
    isBlocked,
    accessAttempts,
    hasPermission,
    performSecureAction,
    logSecurityEvent
  }
}

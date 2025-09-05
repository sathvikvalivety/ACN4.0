import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
// Using custom toast system - pass addToast function from component

interface QRInfo {
  success: boolean
  qr_id: string
  qr_name: string
  upi_id: string
  payee_name: string
  event_title: string
  event_price: number
  daily_payment_number: number
  upi_uri: string
  gpay_uri: string
  storage_path: string
  message: string
}

interface PaymentSubmissionResult {
  success: boolean
  payment_proof_id?: string
  qr_name?: string
  daily_payment_number?: number
  storage_path?: string
  qr_status?: string
  next_reset_time?: string
  message?: string
  error_code?: string
}

interface QRSystemStats {
  total_qrs: number
  active_qrs: number
  temp_disabled_qrs: number
  total_daily_payments: number
  remaining_daily_capacity: number
  next_auto_reset: string
  qr_details: {
    qr_name: string
    upi_id: string
    daily_count: number
    max_daily_payments: number
    is_temp_disabled: boolean
    remaining_today: number
    temp_disabled_until?: string
    last_reset_date: string
    status: 'active' | 'temp_disabled' | 'unused_today' | 'full_today'
    next_available?: string
  }[]
}

interface UserRegistrationStatus {
  can_register: boolean
  is_already_registered: boolean
  existing_payment_status?: 'pending' | 'approved' | 'rejected'
  message?: string
}

export function useQRCycling() {
  const [loading, setLoading] = useState(false)
  const [qrSystemStats, setQrSystemStats] = useState<QRSystemStats | null>(null)

  // Check if user can register for an event
  const checkUserRegistration = useCallback(async (
    userId: string, 
    eventId: string
  ): Promise<UserRegistrationStatus> => {
    try {
      const { data: canRegister, error } = await supabase.rpc('check_user_event_registration', {
        p_user_id: userId,
        p_event_id: eventId
      })

      if (error) throw error

      if (canRegister) {
        return {
          can_register: true,
          is_already_registered: false,
          message: 'User can register for this event'
        }
      } else {
        // Check what type of existing registration they have
        const { data: existingProof } = await supabase
          .from('payment_proofs')
          .select('status')
          .eq('user_id', userId)
          .eq('event_id', eventId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        return {
          can_register: false,
          is_already_registered: true,
          existing_payment_status: existingProof?.status || 'pending',
          message: `User already has ${existingProof?.status || 'pending'} registration for this event`
        }
      }
    } catch (error: any) {
      console.error('Error checking user registration:', error)
      throw new Error(error.message || 'Failed to check registration status')
    }
  }, [])

  // Get available QR for payment with 24-hour cycling
  const getAvailableQR = useCallback(async (
    userId: string, 
    eventId: string
  ): Promise<QRInfo> => {
    setLoading(true)
    try {
      const { data, error } = await supabase.rpc('get_available_qr_for_payment', {
        p_user_id: userId,
        p_event_id: eventId
      })

      if (error) throw error

      if (!data || !data.success) {
        throw new Error(data?.message || 'No QR codes available')
      }

      return data as QRInfo
    } catch (error: any) {
      console.error('Error getting available QR:', error)
      throw new Error(error.message || 'Failed to get available QR code')
    } finally {
      setLoading(false)
    }
  }, [])

  // Submit payment proof with automatic QR selection
  const submitPaymentProof = useCallback(async (params: {
    userId: string
    eventId: string
    name: string
    rollNo?: string
    teamMembers?: string
    fileSizeBytes?: number
    fileType?: string
  }): Promise<PaymentSubmissionResult> => {
    setLoading(true)
    try {
      const { data, error } = await supabase.rpc('secure_submit_payment_proof', {
        p_user_id: params.userId,
        p_event_id: params.eventId,
        p_name: params.name,
        p_roll_no: params.rollNo || null,
        p_team_members: params.teamMembers || null,
        p_file_size_bytes: params.fileSizeBytes || 500000,
        p_file_type: params.fileType || 'image/jpeg'
      })

      if (error) throw error

      const result = data as PaymentSubmissionResult

      if (!result.success) {
        throw new Error(result.message || 'Failed to submit payment proof')
      }

      return result
    } catch (error: any) {
      console.error('Error submitting payment proof:', error)
      throw new Error(error.message || 'Failed to submit payment proof')
    } finally {
      setLoading(false)
    }
  }, [])

  // Upload file to Supabase storage with organized folder structure
  const uploadPaymentScreenshot = useCallback(async (
    file: File, 
    storagePath: string
  ): Promise<string> => {
    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image')
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB')
      }

      // Upload to storage bucket
      const { data, error } = await supabase.storage
        .from('payment-proofs')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: true // Allow overwriting if same path
        })

      if (error) throw error

      // Get public URL
      const { data: publicData } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(storagePath)

      return publicData.publicUrl
    } catch (error: any) {
      console.error('Error uploading screenshot:', error)
      throw new Error(`Upload failed: ${error.message}`)
    }
  }, [])

  // Get QR system statistics with 24-hour cycling info
  const getQRSystemStats = useCallback(async (): Promise<QRSystemStats> => {
    try {
      const { data, error } = await supabase.rpc('get_qr_system_stats')

      if (error) throw error

      const stats = data as QRSystemStats
      setQrSystemStats(stats)
      
      return stats
    } catch (error: any) {
      console.error('Error getting QR system stats:', error)
      throw new Error(error.message || 'Failed to get QR system statistics')
    }
  }, [])

  // Complete payment flow (check registration -> get QR -> submit -> upload)
  const completePaymentFlow = useCallback(async (params: {
    userId: string
    eventId: string
    name: string
    rollNo: string
    teamMembers?: string
    screenshot: File
  }): Promise<{
    success: boolean
    paymentProofId?: string
    qrName?: string
    dailyPaymentNumber?: number
    qrStatus?: string
    message: string
  }> => {
    setLoading(true)
    try {
      // Step 1: Check if user can register
      const registrationStatus = await checkUserRegistration(params.userId, params.eventId)
      
      if (!registrationStatus.can_register) {
        return {
          success: false,
          message: registrationStatus.message || 'You are already registered for this event'
        }
      }

      // Step 2: Submit payment proof (this automatically selects best QR)
      const submitResult = await submitPaymentProof({
        userId: params.userId,
        eventId: params.eventId,
        name: params.name,
        rollNo: params.rollNo,
        teamMembers: params.teamMembers,
        fileSizeBytes: params.screenshot.size,
        fileType: params.screenshot.type
      })

      // Step 3: Upload screenshot to storage
      const publicUrl = await uploadPaymentScreenshot(params.screenshot, submitResult.storage_path!)

      // Step 4: Update payment proof with uploaded URL
      const { error: updateError } = await supabase
        .from('payment_proofs')
        .update({ 
          screenshot_url: publicUrl,
          status: 'pending'
        })
        .eq('id', submitResult.payment_proof_id!)

      if (updateError) throw updateError

      // Step 5: Refresh system stats
      await getQRSystemStats()

      return {
        success: true,
        paymentProofId: submitResult.payment_proof_id,
        qrName: submitResult.qr_name,
        dailyPaymentNumber: submitResult.daily_payment_number,
        qrStatus: submitResult.qr_status,
        message: `${submitResult.message} Screenshot uploaded successfully!`
      }

    } catch (error: any) {
      console.error('Complete payment flow error:', error)
      return {
        success: false,
        message: error.message || 'Failed to complete payment submission'
      }
    } finally {
      setLoading(false)
    }
  }, [checkUserRegistration, submitPaymentProof, uploadPaymentScreenshot, getQRSystemStats])

  // Trigger daily QR maintenance (for admin use)
  const triggerDailyMaintenance = useCallback(async (): Promise<string> => {
    try {
      const { data, error } = await supabase.rpc('daily_qr_maintenance')

      if (error) throw error

      await getQRSystemStats() // Refresh stats after maintenance
      
      return data as string
    } catch (error: any) {
      console.error('Error triggering maintenance:', error)
      throw new Error(error.message || 'Failed to trigger maintenance')
    }
  }, [getQRSystemStats])

  // Reset specific QR (for admin use)
  const resetQRDailyLimits = useCallback(async (): Promise<void> => {
    try {
      const { error } = await supabase.rpc('reset_qr_daily_limits')

      if (error) throw error

      await getQRSystemStats() // Refresh stats after reset
      toast.success('QR daily limits reset successfully')
    } catch (error: any) {
      console.error('Error resetting QR limits:', error)
      toast.error(error.message || 'Failed to reset QR limits')
      throw error
    }
  }, [getQRSystemStats])

  // Utility function to format time until next reset
  const formatTimeUntilReset = useCallback((resetTime: string): string => {
    const now = new Date()
    const reset = new Date(resetTime)
    const diffMs = reset.getTime() - now.getTime()
    
    if (diffMs <= 0) return 'Resetting now...'
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }, [])

  // Get QR status summary for display
  const getQRStatusSummary = useCallback((stats: QRSystemStats | null) => {
    if (!stats) return null

    const activeCount = stats.active_qrs
    const totalCapacity = stats.qr_details.reduce((sum, qr) => sum + qr.max_daily_payments, 0)
    const usedToday = stats.total_daily_payments
    const remainingToday = stats.remaining_daily_capacity

    return {
      activeCount,
      totalCapacity,
      usedToday,
      remainingToday,
      utilizationPercent: Math.round((usedToday / totalCapacity) * 100),
      timeUntilReset: formatTimeUntilReset(stats.next_auto_reset),
      hasAvailableCapacity: remainingToday > 0,
      nextQRToFill: stats.qr_details
        .filter(qr => qr.status === 'active')
        .sort((a, b) => a.daily_count - b.daily_count)[0]
    }
  }, [formatTimeUntilReset])

  return {
    // State
    loading,
    qrSystemStats,
    
    // Core functions
    checkUserRegistration,
    getAvailableQR,
    submitPaymentProof,
    uploadPaymentScreenshot,
    getQRSystemStats,
    completePaymentFlow,
    
    // Admin functions
    triggerDailyMaintenance,
    resetQRDailyLimits,
    
    // Utility functions
    formatTimeUntilReset,
    getQRStatusSummary
  }
}

// Hook for QR admin management
export function useQRAdmin() {
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<QRSystemStats | null>(null)

  const loadStats = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.rpc('get_qr_system_stats')
      if (error) throw error
      setStats(data)
      return data as QRSystemStats
    } catch (error: any) {
      console.error('Error loading QR stats:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const forceResetAllQRs = useCallback(async () => {
    setLoading(true)
    try {
      const { error } = await supabase.rpc('reset_qr_daily_limits')
      if (error) throw error
      
      await loadStats() // Refresh stats
    } catch (error: any) {
      console.error('Error resetting QRs:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [loadStats])

  const runDailyMaintenance = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.rpc('daily_qr_maintenance')
      if (error) throw error
      
      await loadStats() // Refresh stats
      return data as string
    } catch (error: any) {
      console.error('Error running maintenance:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [loadStats])

  // Get QR utilization insights
  const getQRInsights = useCallback(() => {
    if (!stats) return null

    const insights = {
      mostUsedQR: stats.qr_details.reduce((max, qr) => 
        qr.daily_count > max.daily_count ? qr : max, stats.qr_details[0]
      ),
      leastUsedQR: stats.qr_details.reduce((min, qr) => 
        qr.daily_count < min.daily_count ? qr : min, stats.qr_details[0]
      ),
      averageUtilization: Math.round(
        (stats.total_daily_payments / (stats.total_qrs * 20)) * 100
      ),
      busyQRs: stats.qr_details.filter(qr => qr.daily_count >= 15).length,
      availableQRs: stats.qr_details.filter(qr => qr.status === 'active').length,
      hoursUntilReset: Math.floor(
        (new Date(stats.next_auto_reset).getTime() - Date.now()) / (1000 * 60 * 60)
      )
    }

    return insights
  }, [stats])

  return {
    loading,
    stats,
    loadStats,
    forceResetAllQRs,
    runDailyMaintenance,
    getQRInsights
  }
}

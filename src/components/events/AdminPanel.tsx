import { useState, useEffect } from 'react'
import { Shield, Plus, Edit, Trash2, Users, X} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useToast, ToastContainer } from './Toast'

interface Event {
  id: string
  title: string
  description: string
  tagline: string
  image_url: string | null
  rules: string | null
  schedule: string | null
  venue: string | null
}

interface AdminPanelProps {
  isOpen: boolean
  onClose: () => void
  onRefresh?: () => void
}

export default function AdminPanel({ isOpen, onClose, onRefresh }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'events' | 'participants'>('events')
  const [events, setEvents] = useState<Event[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [showEventForm, setShowEventForm] = useState(false)
  const { user } = useAuth()
  const { toasts, addToast, removeToast } = useToast()
  
  // Secure admin check using database roles
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminLoading, setAdminLoading] = useState(true)
  const [adminRole, setAdminRole] = useState<any>(null)
  const [accessAttempts, setAccessAttempts] = useState(0)

  // 🔒 SECURE ADMIN VERIFICATION
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user?.id) {
        setIsAdmin(false)
        setAdminLoading(false)
        return
      }

      try {
        setAdminLoading(true)
        
        // Check admin_roles table for secure validation
        const { data: adminData, error: adminError } = await supabase
          .from('admin_roles')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single()
        
        if (adminError || !adminData) {
          console.warn('🚫 Admin access denied - No admin role found')
          setAccessAttempts(prev => prev + 1)
          setIsAdmin(false)
          setAdminLoading(false)
          return
        }

        // Verify permissions
        if (!adminData.permissions?.can_manage_events) {
          console.warn('🚫 Admin access denied - No event management permission')
          setAccessAttempts(prev => prev + 1)
          setIsAdmin(false)
          setAdminLoading(false)
          return
        }

        // Double-check with RPC function
        const { data: rpcResult, error: rpcError } = await supabase.rpc('is_admin')
        if (rpcError || !rpcResult) {
          console.warn('🚫 Admin access denied - RPC check failed')
          setAccessAttempts(prev => prev + 1)
          setIsAdmin(false)
          setAdminLoading(false)
          return
        }

        // All checks passed
        console.log('✅ Admin access granted')
        setAdminRole(adminData)
        setIsAdmin(true)
        
      } catch (err) {
        console.error('🚫 Admin check failed:', err)
        setAccessAttempts(prev => prev + 1)
        setIsAdmin(false)
      } finally {
        setAdminLoading(false)
      }
    }
    
    checkAdminStatus()
  }, [user?.id])

  useEffect(() => {
    if (isOpen && isAdmin && !adminLoading) {
      fetchData()
    }
  }, [isOpen, isAdmin, adminLoading])

  // 🔒 Permission checker
  const hasPermission = (permission: string): boolean => {
    return adminRole?.permissions?.[permission] === true
  }

  // 🔒 Security logging function
  const logSecurityEvent = async (event: string, data: any) => {
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
  }

  const fetchData = async () => {
    if (!isAdmin) {
      await logSecurityEvent('unauthorized_data_access_attempt', {
        user_id: user?.id,
        attempted_action: 'fetch_admin_data'
      })
      return
    }

    try {
      const eventsQuery = hasPermission('can_manage_events') 
        ? supabase.from('events').select('*').order('created_at', { ascending: false })
        : null
        
      const usersQuery = hasPermission('can_view_users')
        ? supabase.from('profiles').select('*')
        : null

      const responses = await Promise.allSettled([
        eventsQuery,
        usersQuery
      ].filter(q => q !== null))

      // Handle events
      if (eventsQuery && responses[0]?.status === 'fulfilled') {
        const eventsResponse = responses[0].value as any
        if (eventsResponse.error) throw eventsResponse.error
        setEvents(eventsResponse.data || [])
        
        await logSecurityEvent('data_access', {
          user_id: user?.id,
          action: 'fetch_events',
          count: eventsResponse.data?.length || 0
        })
      }

      // Handle users  
      if (usersQuery && responses[responses.length - 1]?.status === 'fulfilled') {
        const usersResponse = responses[responses.length - 1].value as any
        if (usersResponse.error) throw usersResponse.error
        setUsers(usersResponse.data || [])
        
        await logSecurityEvent('data_access', {
          user_id: user?.id,
          action: 'fetch_users',
          count: usersResponse.data?.length || 0
        })
      }
      
    } catch (error) {
      console.error('Error fetching data:', error)
      await logSecurityEvent('data_fetch_error', {
        user_id: user?.id,
        error: error
      })
      addToast({
        type: 'error',
        title: 'Data Load Failed',
        message: 'Failed to load admin data'
      })
    } finally {
      // Data loaded
    }
  }

  const handleSaveEvent = async (eventData: Partial<Event>) => {
    // 🔒 Permission check
    if (!hasPermission('can_manage_events')) {
      await logSecurityEvent('unauthorized_action_attempt', {
        user_id: user?.id,
        attempted_action: 'save_event',
        event_data: eventData
      })
      addToast({
        type: 'error',
        title: 'Permission Denied',
        message: 'You do not have permission to manage events'
      })
      return
    }

    try {
      if (editingEvent) {
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', editingEvent.id)
        if (error) throw error
        
        await logSecurityEvent('event_updated', {
          user_id: user?.id,
          event_id: editingEvent.id,
          changes: eventData
        })
      } else {
        const { data, error } = await supabase
          .from('events')
          .insert(eventData)
          .select('id')
          .single()
        if (error) throw error
        
        await logSecurityEvent('event_created', {
          user_id: user?.id,
          event_id: data?.id,
          event_data: eventData
        })
      }
      
      fetchData()
      onRefresh?.()
      setEditingEvent(null)
      setShowEventForm(false)
      addToast({
        type: 'success',
        title: editingEvent ? 'Event Updated' : 'Event Created',
        message: editingEvent ? 'Event has been updated successfully' : 'New event has been created successfully'
      })
    } catch (error: any) {
      console.error('Error saving event:', error)
      await logSecurityEvent('event_save_failed', {
        user_id: user?.id,
        event_id: editingEvent?.id,
        error: error.message
      })
      addToast({
        type: 'error',
        title: 'Save Failed',
        message: 'Failed to save event. Please try again.'
      })
    }
  }

  const handleDeleteEvent = async (id: string) => {
    // 🔒 Permission check
    if (!hasPermission('can_manage_events')) {
      await logSecurityEvent('unauthorized_action_attempt', {
        user_id: user?.id,
        attempted_action: 'delete_event',
        event_id: id
      })
      addToast({
        type: 'error',
        title: 'Permission Denied',
        message: 'You do not have permission to delete events'
      })
      return
    }

    if (!confirm('🚨 Are you sure you want to delete this event? This action cannot be undone.')) return
    
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)
      if (error) throw error
      
      await logSecurityEvent('event_deleted', {
        user_id: user?.id,
        event_id: id
      })
      
      fetchData()
      addToast({
        type: 'success',
        title: 'Event Deleted',
        message: 'Event has been deleted successfully'
      })
    } catch (error: any) {
      console.error('Error deleting event:', error)
      await logSecurityEvent('event_delete_failed', {
        user_id: user?.id,
        event_id: id,
        error: error.message
      })
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: 'Failed to delete event. Please try again.'
      })
    }
  }

  if (!isOpen) return null

  // 🔒 Show loading during admin verification
  if (adminLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="w-6 h-6 animate-pulse" />
            <motion.div
              className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"
            />
          </div>
          <h3 className="text-lg font-bold mb-2">Security Verification</h3>
          <p className="text-sm text-white/70">Verifying admin credentials...</p>
          <div className="mt-4 flex space-x-2">
            <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    )
  }

  // 🔒 Show access denied with attempt counter
  if (!isAdmin) {
    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-red-900/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 text-center border border-red-500"
          >
            <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">🔒 Access Denied</h2>
            <p className="text-red-200 mb-4">Admin privileges required to access this panel</p>
            <div className="bg-red-800/50 rounded-lg p-3 mb-4">
              <p className="text-xs text-red-300">
                <strong>Security Notice:</strong> All access attempts are logged and monitored.
              </p>
            </div>
            <div className="text-xs text-red-400 mb-4">
              Failed Attempts: {accessAttempts}/3
              {accessAttempts >= 3 && (
                <div className="text-red-300 mt-1">🚨 Multiple failed attempts detected</div>
              )}
            </div>
            <button onClick={onClose} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              Close
            </button>
          </motion.div>
        </div>
      </AnimatePresence>
    )
  }


  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
          className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Panel</h2>
                <p className="text-gray-600 dark:text-gray-400">Manage events and participants</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {[
              { id: 'events', label: 'Events', icon: Plus },
              { id: 'participants', label: 'Participants', icon: Users },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-primary border-b-2 border-primary bg-primary/5'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
            {activeTab === 'events' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Manage Events</h3>
                  <button
                    onClick={() => {
                      setEditingEvent(null)
                      setShowEventForm(true)
                    }}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Event</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {events.map((event) => (
                    <div key={event.id} className="card p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex space-x-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center">
                            {event.image_url ? (
                              <img src={event.image_url} alt={event.title} className="w-full h-full rounded-lg object-cover" />
                            ) : (
                              <Plus className="w-8 h-8 text-primary" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">{event.title}</h4>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">{event.tagline}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setEditingEvent(event)
                              setShowEventForm(true)
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'participants' && (
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Event Participants</h3>
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Registered Users</h4>
                  {users.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">No users registered yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {users.map((user) => (
                        <div key={user.id} className="card p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">{user.email}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Joined: {new Date(user.created_at).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Status: {user.email_confirmed_at ? 'Verified' : 'Pending Verification'}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                user.email_confirmed_at 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {user.email_confirmed_at ? 'Active' : 'Pending'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Event Form Modal */}
        <EventFormModal
          isOpen={showEventForm}
          onClose={() => {
            setShowEventForm(false)
            setEditingEvent(null)
          }}
          event={editingEvent}
          onSave={handleSaveEvent}
        />
        
        {/* Toast Notifications */}
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </AnimatePresence>
  )
}

// Event Form Modal Component
function EventFormModal({ isOpen, onClose, event, onSave }: {
  isOpen: boolean
  onClose: () => void
  event: Event | null
  onSave: (data: Partial<Event>) => void
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tagline: '',
    image_url: '',
    rules: '',
    schedule: '',
    venue: ''
  })

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description,
        tagline: event.tagline,
        image_url: event.image_url || '',
        rules: event.rules || '',
        schedule: event.schedule || '',
        venue: event.venue || ''
      })
    } else {
      setFormData({
        title: '',
        description: '',
        tagline: '',
        image_url: '',
        rules: '',
        schedule: '',
        venue: ''
      })
    }
  }, [event])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">{event ? 'Edit Event' : 'Add Event'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Event Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Tagline</label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={4}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Image URL</label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Rules & Guidelines</label>
            <textarea
              value={formData.rules}
              onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={3}
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">
              Cancel
            </button>
            <button type="submit" className="flex-1 btn-primary">
              {event ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
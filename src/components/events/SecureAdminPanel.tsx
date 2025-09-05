import { useState, useEffect } from 'react'
import { Shield, Plus, Edit, Trash2, Users, X, Loader2, Lock, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useSecureAdmin } from '../../hooks/useSecureAdmin'
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
  capacity: number | null
  price: number | null
  contact_email: string | null
  contact_phone: string | null
}

interface UserProfile {
  id: string
  name: string | null
  phone: string | null
  rollno: string | null
  branch: string | null
  created_at: string
  email?: string
}

interface AdminPanelProps {
  isOpen: boolean
  onClose: () => void
  onRefresh?: () => void
}

export default function SecureAdminPanel({ isOpen, onClose, onRefresh }: AdminPanelProps) {
  const { user } = useAuth()
  const { 
    isAdmin, 
    adminRole, 
    isLoading: adminLoading, 
    isBlocked, 
    accessAttempts, 
    hasPermission, 
    performSecureAction,
    logSecurityEvent 
  } = useSecureAdmin()
  
  const { toasts, addToast, removeToast } = useToast()
  
  // UI States
  const [activeTab, setActiveTab] = useState<'events' | 'users' | 'security'>('events')
  const [events, setEvents] = useState<Event[]>([])
  const [users, setUsers] = useState<UserProfile[]>([])
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [showEventForm, setShowEventForm] = useState(false)
  const [loading, setLoading] = useState(false)

  // Event form state
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    tagline: '',
    venue: '',
    schedule: '',
    price: '',
    capacity: '',
    contact_email: '',
    contact_phone: ''
  })

  // Load data when admin access is confirmed
  useEffect(() => {
    if (isOpen && isAdmin && !adminLoading) {
      loadData()
    }
  }, [isOpen, isAdmin, adminLoading, activeTab])

  const loadData = async () => {
    await performSecureAction('load_admin_data', async () => {
      setLoading(true)
      try {
        if (activeTab === 'events' && hasPermission('can_manage_events')) {
          await loadEvents()
        }
        if (activeTab === 'users' && hasPermission('can_view_users')) {
          await loadUsers()
        }
      } finally {
        setLoading(false)
      }
    })
  }

  const loadEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    setEvents(data || [])
  }

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    // Get emails from auth data
    const { data: authUsers } = await supabase
      .from('payment_proofs')
      .select('user_id, user_email')
    
    const usersWithEmail = data?.map(profile => {
      const authUser = authUsers?.find(au => au.user_id === profile.id)
      return {
        ...profile,
        email: authUser?.user_email || 'Unknown'
      }
    }) || []
    
    setUsers(usersWithEmail)
  }

  const handleSaveEvent = async (formData: any) => {
    await performSecureAction('save_event', async () => {
      if (!hasPermission('can_manage_events')) {
        throw new Error('Permission denied: Event management required')
      }

      const eventData = {
        title: formData.title,
        description: formData.description,
        tagline: formData.tagline,
        venue: formData.venue || null,
        schedule: formData.schedule || null,
        price: formData.price ? parseInt(formData.price) : null,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        contact_email: formData.contact_email || null,
        contact_phone: formData.contact_phone || null
      }

      if (editingEvent) {
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', editingEvent.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('events')
          .insert(eventData)
        if (error) throw error
      }

      await loadEvents()
      setEditingEvent(null)
      setShowEventForm(false)
      setEventForm({
        title: '', description: '', tagline: '', venue: '', schedule: '',
        price: '', capacity: '', contact_email: '', contact_phone: ''
      })
      
      addToast({
        type: 'success',
        title: editingEvent ? 'Event Updated' : 'Event Created',
        message: editingEvent ? 'Event updated successfully' : 'Event created successfully'
      })
    })
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('🚨 Are you sure you want to delete this event? This action cannot be undone.')) return

    await performSecureAction('delete_event', async () => {
      if (!hasPermission('can_manage_events')) {
        throw new Error('Permission denied: Event management required')
      }

      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)
      
      if (error) throw error
      
      await loadEvents()
      addToast({
        type: 'success',
        title: 'Event Deleted',
        message: 'Event has been deleted successfully'
      })
    })
  }

  const handleEditEvent = (event: Event) => {
    if (!hasPermission('can_manage_events')) {
      addToast({
        type: 'error',
        title: 'Permission Denied',
        message: 'You do not have permission to edit events'
      })
      return
    }
    
    setEditingEvent(event)
    setEventForm({
      title: event.title,
      description: event.description,
      tagline: event.tagline,
      venue: event.venue || '',
      schedule: event.schedule || '',
      price: event.price?.toString() || '',
      capacity: event.capacity?.toString() || '',
      contact_email: event.contact_email || '',
      contact_phone: event.contact_phone || ''
    })
    setShowEventForm(true)
  }

  if (!isOpen) return null

  // 🔒 Security loading screen
  if (adminLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-white max-w-md">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <Shield className="w-8 h-8 animate-pulse text-blue-400" />
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <h3 className="text-xl font-bold mb-3">🔒 Security Verification</h3>
            <p className="text-sm text-white/70 mb-4">
              Performing multi-layer security validation...
            </p>
            <div className="space-y-2 text-xs text-white/60">
              <div>✓ Validating user authentication</div>
              <div>✓ Checking admin role permissions</div>
              <div>✓ Verifying session security</div>
              <div>✓ Running suspicious activity detection</div>
            </div>
            <div className="mt-6 flex justify-center space-x-2">
              <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 🚨 Access blocked screen
  if (isBlocked) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
        <div className="relative bg-red-900/90 backdrop-blur-sm rounded-2xl p-8 w-full max-w-md text-white border-2 border-red-500">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4 animate-pulse" />
            <h2 className="text-2xl font-bold mb-4">🚨 Access Blocked</h2>
            <div className="bg-red-800/50 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-200 mb-2">
                Multiple unauthorized access attempts detected.
              </p>
              <p className="text-xs text-red-300">
                Your access has been temporarily blocked for security reasons.
              </p>
            </div>
            <div className="text-xs text-red-400 mb-6">
              Failed Attempts: {accessAttempts}/3<br/>
              User: {user?.email || 'Unknown'}<br/>
              Blocked At: {new Date().toLocaleString()}
            </div>
            <p className="text-xs text-red-300 mb-4">
              Contact the system administrator to restore access.
            </p>
            <button 
              onClick={onClose}
              className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 🚫 Access denied screen
  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-red-900/90 backdrop-blur-sm rounded-2xl p-8 w-full max-w-md text-white border border-red-500">
          <div className="text-center">
            <Lock className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-4">🔒 Access Denied</h2>
            <div className="bg-red-800/50 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-200 mb-2">
                🚫 Admin privileges required to access this panel.
              </p>
              <p className="text-xs text-red-300">
                All access attempts are logged and monitored for security.
              </p>
            </div>
            <div className="text-xs text-red-400 mb-4">
              Attempts: {accessAttempts}/3<br/>
              User: {user?.email || 'Not authenticated'}
            </div>
            <button 
              onClick={onClose}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 📱 Main admin interface
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
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-700 dark:to-gray-600">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  🔒 Secure Admin Panel
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  ✅ Authenticated as {adminRole?.role} | 🛡️ All actions logged
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            {[
              { id: 'events', label: 'Events', icon: Plus, permission: 'can_manage_events' },
              { id: 'users', label: 'Users', icon: Users, permission: 'can_view_users' },
              { id: 'security', label: 'Security', icon: Shield, permission: null }
            ].filter(tab => !tab.permission || hasPermission(tab.permission)).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-green-600 border-b-2 border-green-500 bg-white dark:bg-gray-800'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mr-3" />
                <span>Loading secure data...</span>
              </div>
            ) : (
              <>
                {/* Events Tab */}
                {activeTab === 'events' && hasPermission('can_manage_events') && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        📅 Manage Events
                      </h3>
                      <button
                        onClick={() => {
                          setEditingEvent(null)
                          setEventForm({
                            title: '', description: '', tagline: '', venue: '', schedule: '',
                            price: '', capacity: '', contact_email: '', contact_phone: ''
                          })
                          setShowEventForm(true)
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Event</span>
                      </button>
                    </div>

                    <div className="space-y-4">
                      {events.map((event) => (
                        <div key={event.id} className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 shadow-sm">
                          <div className="flex items-start justify-between">
                            <div className="flex space-x-4">
                              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 dark:from-gray-600 dark:to-gray-500 rounded-lg flex items-center justify-center overflow-hidden">
                                {event.image_url ? (
                                  <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
                                ) : (
                                  <Plus className="w-8 h-8 text-green-600" />
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 dark:text-white text-lg">{event.title}</h4>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{event.tagline}</p>
                                <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                                  {event.venue && <span>📍 {event.venue}</span>}
                                  {event.price && <span>💰 ₹{event.price}</span>}
                                  {event.capacity && <span>👥 {event.capacity} seats</span>}
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditEvent(event)}
                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteEvent(event.id)}
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
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

                {/* Users Tab */}
                {activeTab === 'users' && hasPermission('can_view_users') && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                      👥 Registered Users
                    </h3>
                    <div className="space-y-3">
                      {users.map((user) => (
                        <div key={user.id} className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {user.name || 'Unknown User'}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                              <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {user.rollno && <span>🆔 {user.rollno}</span>}
                                {user.branch && <span>🎓 {user.branch}</span>}
                                {user.phone && <span>📞 {user.phone}</span>}
                              </div>
                              <p className="text-xs text-gray-400 mt-1">
                                Joined: {new Date(user.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                      🛡️ Security Status
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                        <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">
                          ✅ Security Features Active
                        </h4>
                        <ul className="text-sm text-green-700 dark:text-green-400 space-y-1">
                          <li>• Multi-layer admin authentication</li>
                          <li>• Row Level Security (RLS) enabled</li>
                          <li>• Rate limiting protection</li>
                          <li>• Suspicious activity detection</li>
                          <li>• Session timeout enforcement</li>
                          <li>• Comprehensive audit logging</li>
                        </ul>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                          🔐 Your Admin Status
                        </h4>
                        <div className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                          <div>Role: <span className="font-mono font-bold">{adminRole?.role}</span></div>
                          <div>Permissions: {Object.entries(adminRole?.permissions || {}).filter(([_, v]) => v).map(([k]) => k).join(', ')}</div>
                          <div>Session: Valid for {Math.round((new Date(user?.last_sign_in_at || 0).getTime() + (8 * 60 * 60 * 1000) - Date.now()) / (60 * 60 * 1000))} hours</div>
                        </div>
                      </div>

                      {accessAttempts > 0 && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                          <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
                            ⚠️ Security Alerts
                          </h4>
                          <p className="text-sm text-yellow-700 dark:text-yellow-400">
                            {accessAttempts} unauthorized access attempt(s) detected in this session.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Permission Denied Messages */}
                {activeTab === 'events' && !hasPermission('can_manage_events') && (
                  <div className="text-center py-12">
                    <Lock className="w-16 h-16 mx-auto mb-4 text-red-400" />
                    <h3 className="text-lg font-semibold text-red-600 mb-2">🚫 Access Denied</h3>
                    <p className="text-red-500">Event management permission required</p>
                  </div>
                )}

                {activeTab === 'users' && !hasPermission('can_view_users') && (
                  <div className="text-center py-12">
                    <Lock className="w-16 h-16 mx-auto mb-4 text-red-400" />
                    <h3 className="text-lg font-semibold text-red-600 mb-2">🚫 Access Denied</h3>
                    <p className="text-red-500">User viewing permission required</p>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>

        {/* Event Form Modal */}
        {showEventForm && hasPermission('can_manage_events') && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingEvent ? '✏️ Edit Event' : '➕ Add New Event'}
                </h3>
                <button 
                  onClick={() => setShowEventForm(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    value={eventForm.title}
                    onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                    placeholder="Enter event title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={eventForm.tagline}
                    onChange={(e) => setEventForm({...eventForm, tagline: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter event tagline"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <textarea
                    value={eventForm.description}
                    onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    rows={3}
                    placeholder="Enter event description"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Venue
                    </label>
                    <input
                      type="text"
                      value={eventForm.venue}
                      onChange={(e) => setEventForm({...eventForm, venue: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Event venue"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Schedule
                    </label>
                    <input
                      type="text"
                      value={eventForm.schedule}
                      onChange={(e) => setEventForm({...eventForm, schedule: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Event schedule"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      value={eventForm.price}
                      onChange={(e) => setEventForm({...eventForm, price: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="100"
                      min="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Capacity
                    </label>
                    <input
                      type="number"
                      value={eventForm.capacity}
                      onChange={(e) => setEventForm({...eventForm, capacity: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="50"
                      min="1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={eventForm.contact_email}
                      onChange={(e) => setEventForm({...eventForm, contact_email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="contact@event.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={eventForm.contact_phone}
                      onChange={(e) => setEventForm({...eventForm, contact_phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="+91 9876543210"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => handleSaveEvent(eventForm)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  {editingEvent ? '💾 Update Event' : '➕ Create Event'}
                </button>
                <button
                  onClick={() => setShowEventForm(false)}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Toast Notifications */}
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </AnimatePresence>
  )
}

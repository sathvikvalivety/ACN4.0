import { useState, useEffect } from 'react'
import { User, Calendar, CreditCard, QrCode, Download, X, Loader2, ArrowRight, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { useLocation } from 'react-router-dom'
import { useToast, ToastContainer } from './Toast'

interface Registration {
  id: string
  created_at: string
  event: {
    id: string
    title: string
    tagline: string
    venue: string | null
    schedule: string | null
    image_url: string | null
  }
}

interface ProfilePageProps {
  isOpen: boolean
  onClose: () => void
}

export default function ProfilePage({ isOpen, onClose }: ProfilePageProps) {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)
  const { user } = useAuth()
  const { toasts, addToast, removeToast } = useToast()
  const location = useLocation()
  const returnPath = (location.state as any)?.returnTo
  const returnEventTitle = (location.state as any)?.returnEventTitle

  // Profile fields
  const [profile, setProfile] = useState<any>({ 
    name: '', 
    phone: '', 
    rollno: '', 
    branch: '',
    year: '',
    bio: '',
    interests: '',
    linkedin: '',
    github: '',
    avatar_url: ''
  })
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')
  const [tickets, setTickets] = useState<any[]>([])
  const [proofs, setProofs] = useState<any[]>([])
  const [ticketsLoading, setTicketsLoading] = useState(false)
  const [proofsLoading, setProofsLoading] = useState(false)

  useEffect(() => {
    if (isOpen && user) {
      fetchRegistrations()
      fetchProfile()
      fetchTickets()
      fetchProofs()
    }
  }, [isOpen, user])

  const fetchProfile = async () => {
    setProfileLoading(true)
    setProfileError('')
    try {
      if (!user?.id) throw new Error('No user')
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      if (error) throw error
      setProfile(data || { 
        name: '', 
        phone: '', 
        rollno: '', 
        branch: '',
        year: '',
        bio: '',
        interests: '',
        linkedin: '',
        github: '',
        avatar_url: ''
      })
    } catch (error) {
      setProfileError('Failed to load profile')
      addToast({
        type: 'error',
        title: 'Profile Load Failed',
        message: 'Failed to load your profile information'
      })
    } finally {
      setProfileLoading(false)
    }
  }

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setProfile((prev: any) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value })
  }

  const handleProfileUpdate = async () => {
    setProfileLoading(true)
    setProfileError('')
    setProfileSuccess('')
    try {
      if (!user?.id) throw new Error('No user')
      
      // Check if required fields are filled
      const requiredFields = ['name', 'phone', 'rollno', 'branch']
      const missingFields = requiredFields.filter(field => !profile[field]?.trim())
      
      if (missingFields.length > 0) {
        setProfileError(`Please fill in required fields: ${missingFields.join(', ')}`)
        setProfileLoading(false)
        return
      }
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: profile.name,
          phone: profile.phone,
          rollno: profile.rollno,
          branch: profile.branch,
          year: profile.year,
          bio: profile.bio,
          interests: profile.interests,
          linkedin: profile.linkedin,
          github: profile.github,
          avatar_url: profile.avatar_url,
        })
      if (error) throw error
      
      const isComplete = profile.name && profile.phone && profile.rollno && profile.branch
      if (returnPath && isComplete) {
        setProfileSuccess('Profile completed! Redirecting to payment...')
        addToast({
          type: 'success',
          title: 'Profile Complete!',
          message: 'Profile completed! Redirecting to payment...'
        })
        setTimeout(() => {
          onClose()
        }, 1500)
      } else {
        setProfileSuccess('Profile updated successfully!')
        addToast({
          type: 'success',
          title: 'Profile Updated',
          message: 'Your profile has been updated successfully!'
        })
      }
    } catch (error) {
      setProfileError('Failed to update profile')
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update your profile. Please try again.'
      })
    } finally {
      setProfileLoading(false)
    }
  }

  const fetchRegistrations = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('eventsregistrations')
        .select(`
          id,
          created_at,
          event:events!inner(
            id,
            title,
            tagline,
            venue,
            schedule,
            image_url
          )
        `)
        .eq('user_email', user.email)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Transform the data to match the Registration interface
      const formattedData = (data || []).map(item => ({
        ...item,
        event: Array.isArray(item.event) ? item.event[0] : item.event
      }))
      setRegistrations(formattedData)
    } catch (error) {
      console.error('Error fetching registrations:', error)
      addToast({
        type: 'error',
        title: 'Load Failed',
        message: 'Failed to load your event registrations'
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchTickets = async () => {
    if (!user) return
    setTicketsLoading(true)
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      setTickets(data || [])
    } catch (e) {
      console.error('Error fetching tickets:', e)
    } finally {
      setTicketsLoading(false)
    }
  }

  const fetchProofs = async () => {
    if (!user) return
    setProofsLoading(true)
    try {
      const { data, error } = await supabase
        .from('payment_proofs')
        .select('id, event_title, status, reason, created_at, amount')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      setProofs(data || [])
    } catch (e) {
      console.error('Error fetching payment proofs:', e)
    } finally {
      setProofsLoading(false)
    }
  }

  const generateQRCode = (eventId: string, eventTitle: string) => {
    const qrData = `${window.location.origin}/event/${eventId}?user=${user?.id}`
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`
    
    // Create download link
    const link = document.createElement('a')
    link.href = qrUrl
    link.download = `${eventTitle.replace(/\s+/g, '_')}_QR.png`
    link.click()
  }

  if (!isOpen) return null

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
          className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h2>
                <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
            <div className="p-6">
              {/* Return Path Notification */}
              {returnPath && returnEventTitle && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center">
                      <ArrowRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                        Complete your profile to register for: <span className="font-bold">{returnEventTitle}</span>
                      </h3>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                        Fill in the required fields below (Name, Phone, Roll No, Branch) to continue with payment.
                      </p>
                    </div>
                    <CheckCircle className={`w-6 h-6 ${
                      profile.name && profile.phone && profile.rollno && profile.branch 
                        ? 'text-green-500' 
                        : 'text-gray-300 dark:text-gray-600'
                    }`} />
                  </div>
                </motion.div>
              )}
              
              {/* Profile Section */}
              <div className="mb-8 card p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Profile Details</h3>
                
                {/* Avatar Section */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-white" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {profile?.name || 'Your Name'}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="space-y-4 mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="name"
                      value={profile?.name || ''}
                      onChange={handleProfileChange}
                      className="input"
                      placeholder="Full Name *"
                      disabled={profileLoading}
                    />
                    <input
                      type="text"
                      name="phone"
                      value={profile?.phone || ''}
                      onChange={handleProfileChange}
                      className="input"
                      placeholder="Phone Number *"
                      disabled={profileLoading}
                    />
                    <input
                      type="text"
                      name="rollno"
                      value={profile?.rollno || ''}
                      onChange={handleProfileChange}
                      className="input"
                      placeholder="Roll Number *"
                      disabled={profileLoading}
                    />
                    <input
                      type="text"
                      name="branch"
                      value={profile?.branch || ''}
                      onChange={handleProfileChange}
                      className="input"
                      placeholder="Branch/Department *"
                      disabled={profileLoading}
                    />
                    <select
                      name="year"
                      value={profile?.year || ''}
                      onChange={handleProfileChange}
                      className="input"
                      disabled={profileLoading}
                    >
                      <option value="">Select Year</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="Graduate">Graduate</option>
                    </select>
                    <input
                      type="url"
                      name="avatar_url"
                      value={profile?.avatar_url || ''}
                      onChange={handleProfileChange}
                      className="input"
                      placeholder="Profile Picture URL"
                      disabled={profileLoading}
                    />
                  </div>
                </div>

                {/* Bio Section */}
                <div className="space-y-4 mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">About You</h4>
                  <textarea
                    name="bio"
                    value={profile?.bio || ''}
                    onChange={handleTextareaChange}
                    className="input resize-none"
                    rows={3}
                    placeholder="Tell us about yourself..."
                    disabled={profileLoading}
                  />
                  <textarea
                    name="interests"
                    value={profile?.interests || ''}
                    onChange={handleTextareaChange}
                    className="input resize-none"
                    rows={2}
                    placeholder="Your interests and hobbies..."
                    disabled={profileLoading}
                  />
                </div>

                {/* Social Links */}
                <div className="space-y-4 mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">Social Links</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="url"
                      name="linkedin"
                      value={profile?.linkedin || ''}
                      onChange={handleProfileChange}
                      className="input"
                      placeholder="LinkedIn Profile URL"
                      disabled={profileLoading}
                    />
                    <input
                      type="url"
                      name="github"
                      value={profile?.github || ''}
                      onChange={handleProfileChange}
                      className="input"
                      placeholder="GitHub Profile URL"
                      disabled={profileLoading}
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <input
                    type="text"
                    name="name"
                    value={profile?.name || ''}
                    onChange={handleProfileChange}
                    className="input"
                    placeholder="Name"
                    disabled={profileLoading}
                  />
                  <input
                    type="text"
                    name="phone"
                    value={profile?.phone || ''}
                    onChange={handleProfileChange}
                    className="input"
                    placeholder="Phone Number"
                    disabled={profileLoading}
                  />
                  <input
                    type="text"
                    name="rollno"
                    value={profile?.rollno || ''}
                    onChange={handleProfileChange}
                    className="input"
                    placeholder="Roll Number"
                    disabled={profileLoading}
                  />
                  <input
                    type="text"
                    name="branch"
                    value={profile?.branch || ''}
                    onChange={handleProfileChange}
                    className="input"
                    placeholder="Branch"
                    disabled={profileLoading}
                  />
                  <button
                    onClick={handleProfileUpdate}
                    className="btn-primary w-full md:w-auto"
                    disabled={profileLoading}
                  >
                    {profileLoading ? 'Updating Profile...' : 'Save Profile'}
                  </button>
                  {profileError && <div className="mt-2 text-red-600 text-sm">{profileError}</div>}
                  {profileSuccess && <div className="mt-2 text-green-600 text-sm">{profileSuccess}</div>}
                  <p className="text-xs text-gray-500 mt-2">* Required fields for event registration</p>
                </div>
              </div>

              {/* Events Section */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>My Registered Events</span>
                </h3>

                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="card p-4 animate-pulse">
                        <div className="flex space-x-4">
                          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : registrations.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No registered events yet</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                      Browse events and register to see them here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {registrations.map((registration) => (
                      <motion.div
                        key={registration.id}
                        className="card p-4 hover:shadow-lg transition-all duration-200"
                        whileHover={{ y: -2 }}
                      >
                        <div className="flex items-start space-x-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center flex-shrink-0">
                            {registration.event.image_url ? (
                              <img
                                src={registration.event.image_url}
                                alt={registration.event.title}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <Calendar className="w-8 h-8 text-primary" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                              {registration.event.title}
                            </h4>
                            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                              {registration.event.schedule && (
                                <span>{registration.event.schedule}</span>
                              )}
                              {registration.event.venue && (
                                <span>{registration.event.venue}</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                              Registered on {new Date(registration.created_at).toLocaleDateString()}
                            </p>
                          </div>

                          <div className="flex flex-col space-y-2">
                            <button
                              onClick={() => setSelectedEvent(selectedEvent === registration.event.id ? null : registration.event.id)}
                              className="flex items-center space-x-1 px-3 py-1 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm"
                            >
                              <QrCode className="w-4 h-4" />
                              <span>QR</span>
                            </button>
                            <button
                              onClick={() => generateQRCode(registration.event.id, registration.event.title)}
                              className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                            >
                              <Download className="w-4 h-4" />
                              <span>Save</span>
                            </button>
                          </div>
                        </div>

                        <AnimatePresence>
                          {selectedEvent === registration.event.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                            >
                              <div className="flex justify-center">
                                <div className="bg-white p-4 rounded-lg shadow-inner">
                                  <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`${window.location.origin}/event/${registration.event.id}?user=${user?.id}`)}`}
                                    alt="Event QR Code"
                                    className="w-32 h-32"
                                  />
                                  <p className="text-center text-xs text-gray-500 mt-2">
                                    Scan to view event
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                  <CreditCard className="w-5 h-5" />
                  <span>My Tickets</span>
                </h3>
                {ticketsLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400">Loading tickets...</p>
                  </div>
                ) : tickets.length === 0 ? (
                  <div className="text-center py-8">
                    <QrCode className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No tickets yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tickets.map((t: any) => (
                      <div key={t.id} className="card p-4 flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">{t.event_title}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{t.holder_name} {t.roll_no ? `• ${t.roll_no}` : ''}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-500">{t.ticket_code} • {new Date(t.created_at).toLocaleString()}</div>
                        </div>
                        <button
                          onClick={async () => {
                            try {
                              const { data, error } = await supabase.storage.from('tickets').createSignedUrl(t.pdf_path, 120)
                              if (error) throw error
                              window.open(data.signedUrl, '_blank')
                            } catch (e) {
                              console.error('Open ticket failed', e)
                            }
                          }}
                          className="btn-secondary"
                        >
                          Download Ticket
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                  <CreditCard className="w-5 h-5" />
                  <span>Payment History</span>
                </h3>
                {proofsLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400">Loading payments...</p>
                  </div>
                ) : proofs.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No payment records yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {proofs.map((p: any) => (
                      <div key={p.id} className="card p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">{p.event_title}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-500">{new Date(p.created_at).toLocaleString()}</div>
                          </div>
                          <div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.status==='approved'?'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-200':p.status==='rejected'?'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200':'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-200'}`}>
                              {p.status}
                            </span>
                          </div>
                        </div>
                        {p.status === 'rejected' && (
                          <div className="text-sm text-red-600 dark:text-red-300 mt-2">❌ Payment rejected by Admin. {p.reason ? `Reason: ${p.reason}` : 'Contact support or re-upload proof.'}</div>
                        )}
                        {p.status === 'pending' && (
                          <div className="text-sm text-yellow-700 dark:text-yellow-200 mt-2">⏳ Payment under review.</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Toast Notifications */}
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </AnimatePresence>
  )
}

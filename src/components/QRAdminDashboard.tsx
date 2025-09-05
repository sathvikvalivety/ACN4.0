import React, { useState, useEffect } from 'react'
import { useQRAdmin } from '../hooks/useQRCycling'
import { useSecureAdmin } from '../hooks/useSecureAdmin'
import { toast } from 'react-hot-toast'

export default function QRAdminDashboard() {
  const { isAdmin, loading: authLoading, checkAdminStatus } = useSecureAdmin()
  const { 
    loading, 
    stats, 
    loadStats, 
    forceResetAllQRs, 
    runDailyMaintenance, 
    getQRInsights 
  } = useQRAdmin()

  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  useEffect(() => {
    checkAdminStatus()
  }, [])

  useEffect(() => {
    if (isAdmin) {
      loadStats()
      setLastRefresh(new Date())
    }
  }, [isAdmin, loadStats])

  useEffect(() => {
    if (!isAdmin || !autoRefresh) return

    const interval = setInterval(() => {
      loadStats()
      setLastRefresh(new Date())
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [isAdmin, autoRefresh, loadStats])

  const handleForceReset = async () => {
    if (!confirm('Are you sure you want to reset all QR daily limits? This will set all QRs back to 0/20.')) {
      return
    }

    try {
      await forceResetAllQRs()
    } catch (error) {
      // Error already handled by hook
    }
  }

  const handleDailyMaintenance = async () => {
    try {
      const result = await runDailyMaintenance()
      console.log('Maintenance result:', result)
    } catch (error) {
      // Error already handled by hook
    }
  }

  const handleRefresh = async () => {
    try {
      await loadStats()
      setLastRefresh(new Date())
      toast.success('QR stats refreshed')
    } catch (error) {
      // Error already handled by hook
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking admin permissions...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-600 mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access the QR Admin Dashboard.
          </p>
        </div>
      </div>
    )
  }

  const insights = getQRInsights()
  const formatLastRefresh = (date: Date | null) => {
    if (!date) return 'Never'
    return date.toLocaleTimeString()
  }

  return (
    <div className="h-full bg-transparent">
      <div className="max-w-full mx-auto">
        
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">🔄 QR Cycling Dashboard</h1>
              <p className="text-white/70 mt-1">24-Hour QR Rotation System</p>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-white/90">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded"
                />
                Auto-refresh (30s)
              </label>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
              >
                🔄 Refresh
              </button>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-white/60">
            Last updated: {formatLastRefresh(lastRefresh)} | 
            {loading ? ' Updating...' : ' Ready'}
          </div>
        </div>

        {loading && !stats ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
            <p className="mt-4 text-white/70">Loading QR system statistics...</p>
          </div>
        ) : stats ? (
          <>
            {/* System Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <span className="text-green-400 text-xl">🜢</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-white/70">Active QRs</p>
                    <p className="text-xl font-bold text-white">
                      {stats.active_qrs}/{stats.total_qrs}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <span className="text-blue-400 text-xl">📊</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-white/70">Today's Payments</p>
                    <p className="text-xl font-bold text-white">{stats.total_daily_payments}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <span className="text-yellow-400 text-xl">🔄</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-white/70">Remaining Slots</p>
                    <p className="text-xl font-bold text-white">{stats.remaining_daily_capacity}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <span className="text-purple-400 text-xl">⏰</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-white/70">Next Reset</p>
                    <p className="text-sm font-bold text-white">
                      {insights?.hoursUntilReset || 0}h until midnight
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Insights Panel */}
            {insights && (
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">📈 System Insights</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <h3 className="font-medium text-green-800">Most Used QR</h3>
                    <p className="text-2xl font-bold text-green-600">{insights.mostUsedQR?.qr_name}</p>
                    <p className="text-sm text-green-700">{insights.mostUsedQR?.daily_count}/20 payments</p>
                  </div>
                  
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-medium text-blue-800">System Utilization</h3>
                    <p className="text-2xl font-bold text-blue-600">{insights.averageUtilization}%</p>
                    <p className="text-sm text-blue-700">Average QR usage</p>
                  </div>
                  
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <h3 className="font-medium text-orange-800">Busy QRs</h3>
                    <p className="text-2xl font-bold text-orange-600">{insights.busyQRs}</p>
                    <p className="text-sm text-orange-700">QRs with 15+ payments</p>
                  </div>
                </div>
              </div>
            )}

            {/* QR Details Table */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">🎯 QR Status Details</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        QR Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        UPI ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Daily Progress
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Remaining
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Next Available
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats.qr_details.map((qr, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{qr.qr_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{qr.upi_id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                              <div
                                className={`h-2 rounded-full ${
                                  qr.daily_count >= qr.max_daily_payments 
                                    ? 'bg-red-500' 
                                    : qr.daily_count >= 15 
                                    ? 'bg-yellow-500' 
                                    : 'bg-green-500'
                                }`}
                                style={{ width: `${(qr.daily_count / qr.max_daily_payments) * 100}%` }}
                              ></div>
                            </div>
                            <div className="text-sm font-medium text-gray-700">
                              {qr.daily_count}/{qr.max_daily_payments}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            qr.status === 'active' ? 'bg-green-100 text-green-800' :
                            qr.status === 'temp_disabled' ? 'bg-red-100 text-red-800' :
                            qr.status === 'unused_today' ? 'bg-blue-100 text-blue-800' :
                            qr.status === 'full_today' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {qr.status === 'temp_disabled' ? 'Temp Disabled' :
                             qr.status === 'unused_today' ? 'Unused Today' :
                             qr.status === 'full_today' ? 'Full (20/20)' :
                             qr.status === 'active' ? 'Active' : qr.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {qr.remaining_today} slots
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {qr.status === 'temp_disabled' && qr.temp_disabled_until ? (
                            new Date(qr.temp_disabled_until).toLocaleTimeString()
                          ) : qr.status === 'active' ? (
                            'Now'
                          ) : (
                            'Midnight'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Action Panel */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">🔧 Admin Actions</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  🔄 Refresh Stats
                </button>
                
                <button
                  onClick={handleDailyMaintenance}
                  disabled={loading}
                  className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  🧹 Run Maintenance
                </button>
                
                <button
                  onClick={handleForceReset}
                  disabled={loading}
                  className="bg-orange-600 text-white px-4 py-3 rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
                >
                  🔁 Force Reset All
                </button>
              </div>
              
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Admin Actions:</strong>
                </p>
                <ul className="text-xs text-yellow-700 mt-2 space-y-1">
                  <li><strong>Refresh Stats:</strong> Updates current QR status and statistics</li>
                  <li><strong>Run Maintenance:</strong> Performs daily cleanup and resets expired QRs</li>
                  <li><strong>Force Reset All:</strong> Immediately resets all QRs to 0/20 (use carefully)</li>
                </ul>
              </div>
            </div>

            {/* System Information */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">ℹ️ System Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">🔄 24-Hour Cycling Rules</h3>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• Each QR accepts exactly 20 payments per day</li>
                    <li>• System always picks QR with lowest daily count</li>
                    <li>• QRs auto-disable after reaching 20 payments</li>
                    <li>• All QRs reset to 0/20 at midnight (00:00)</li>
                    <li>• Files organized in QR name folders (qr001, qr002, etc.)</li>
                    <li>• Unique file naming: EventName_RollNo_Timestamp.jpg</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">📁 File Organization</h3>
                  <div className="text-sm text-gray-700 space-y-2">
                    <div className="bg-gray-50 p-3 rounded font-mono">
                      <div>/payment-proofs/</div>
                      <div>&nbsp;&nbsp;├── qr001/</div>
                      <div>&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;├── EventName_RollNo_1234567890.jpg</div>
                      <div>&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;└── EventName_RollNo_9876543210.jpg</div>
                      <div>&nbsp;&nbsp;├── qr002/</div>
                      <div>&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;└── EventName_RollNo_5555555555.jpg</div>
                      <div>&nbsp;&nbsp;└── qr003/</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">💡 System Benefits</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                  <div>
                    <strong>Fair Distribution:</strong> Automatically balances load across all QR codes
                  </div>
                  <div>
                    <strong>No Downtime:</strong> QRs auto-reset daily, ensuring continuous availability
                  </div>
                  <div>
                    <strong>Organized Storage:</strong> Files grouped by QR for easy management
                  </div>
                  <div>
                    <strong>Unique Naming:</strong> Prevents file conflicts with timestamp-based names
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-red-600 mb-4">
              <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load QR Statistics</h3>
            <p className="text-gray-600 mb-4">
              Unable to fetch QR system information. Please check your connection and try again.
            </p>
            <button
              onClick={handleRefresh}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

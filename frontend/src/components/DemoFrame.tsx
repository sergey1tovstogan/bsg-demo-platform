import { useState, useEffect } from 'react'
import { Loader2, ExternalLink, Power } from 'lucide-react'
import { apiService } from '../services/api'
import type { ComponentId, DemoConfig, DemoSession } from '../types'
import { ObservabilityDemo } from './observability/ObservabilityDemo'

interface DemoFrameProps {
  componentId: ComponentId
}

export function DemoFrame({ componentId }: DemoFrameProps) {
  // Use specialized component for observability
  if (componentId === 'observability') {
    return <ObservabilityDemo />
  }
  const [demoConfig, setDemoConfig] = useState<DemoConfig | null>(null)
  const [session, setSession] = useState<DemoSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDemoConfig()
  }, [componentId])

  useEffect(() => {
    return () => {
      // Cleanup: disconnect on unmount
      if (session?.session_id) {
        apiService.disconnectDemo(componentId, session.session_id).catch(console.error)
      }
    }
  }, [session, componentId])

  const loadDemoConfig = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiService.getDemoConfig(componentId)
      setDemoConfig(response.data)
    } catch (err: any) {
      setError(err.message || 'Failed to load demo configuration')
    } finally {
      setLoading(false)
    }
  }

  const connectDemo = async () => {
    if (!demoConfig) return

    try {
      setConnecting(true)
      setError(null)
      const response = await apiService.connectDemo(componentId, 'default', {})
      setSession(response.data)
    } catch (err: any) {
      setError(err.message || 'Failed to connect to demo system')
    } finally {
      setConnecting(false)
    }
  }

  const disconnectDemo = async () => {
    if (!session?.session_id) return

    try {
      await apiService.disconnectDemo(componentId, session.session_id)
      setSession(null)
    } catch (err: any) {
      console.error('Failed to disconnect:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#283054]" />
      </div>
    )
  }

  if (error && !demoConfig) {
    return (
      <div className="card">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  if (!demoConfig) {
    return (
      <div className="card">
        <p className="text-[#4A5568]">No demo configuration available for this component.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Demo Controls */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold mb-1">{demoConfig.name}</h3>
            <p className="text-sm text-[#4A5568]">
              Connection Type: {demoConfig.connection_type}
            </p>
          </div>
          {!session ? (
            <button
              onClick={connectDemo}
              disabled={connecting}
              className="btn-primary flex items-center space-x-2"
            >
              {connecting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <Power className="w-5 h-5" />
                  <span>Connect</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={disconnectDemo}
              className="btn-secondary flex items-center space-x-2"
            >
              <Power className="w-5 h-5" />
              <span>Disconnect</span>
            </button>
          )}
        </div>

        {session && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Status:</strong> {session.status}
            </p>
            {session.connected_at && (
              <p className="text-sm text-green-700 mt-1">
                Connected at: {new Date(session.connected_at).toLocaleString()}
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Demo Frame */}
      {session && session.connection_url && (
        <div className="card p-0 overflow-hidden">
          <div className="aspect-video bg-gray-100">
            {demoConfig.connection_type === 'iframe' ? (
              <iframe
                src={session.connection_url}
                className="w-full h-full border-0"
                title="Demo Frame"
                allow="fullscreen"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <ExternalLink className="w-12 h-12 mx-auto mb-4 text-[#283054]" />
                  <p className="text-[#4A5568] mb-2">Demo System</p>
                  <a
                    href={session.connection_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Open in new window
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {!session && (
        <div className="card">
          <div className="text-center py-12">
            <Power className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-[#4A5568]">Click Connect to start the demo</p>
          </div>
        </div>
      )}
    </div>
  )
}


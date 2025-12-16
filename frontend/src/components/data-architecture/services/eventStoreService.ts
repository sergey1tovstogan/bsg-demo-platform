/**
 * Event Store Service - Fetches events from Azure Event Hub via backend proxy
 *
 * This service connects to the backend Event Store API proxy and provides:
 * - Event fetching with polling support
 * - Automatic CloudEvents transformation
 * - Connection status management
 * - Error handling and retries
 */

import type { KafkaEvent } from '../demo/types'
import { EVENT_STORE_CONFIG } from '../config/simulation.config'

// =============================================================================
// Types
// =============================================================================

export interface EventStoreOptions {
  /** Filter events by topic */
  topic?: string
  /** ISO datetime to fetch events since */
  since?: string
  /** Maximum number of events to fetch */
  limit?: number
  /** Starting offset for pagination */
  offset?: number
  /** Fetch events from last N minutes */
  minutes?: number
}

export interface EventStoreResponse {
  success: boolean
  events: KafkaEvent[]
  total: number
  error?: string
  source: 'event_store' | 'mock'
}

export interface EventStoreHealth {
  status: 'healthy' | 'unhealthy' | 'error' | 'unknown'
  endpoint?: string
  responseTimeMs?: number
  error?: string
}

export type EventStoreConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

export interface EventStoreState {
  connectionStatus: EventStoreConnectionStatus
  lastFetchTime?: number
  lastError?: string
  totalEventsFetched: number
}

// =============================================================================
// Event Store Service Class
// =============================================================================

class EventStoreService {
  private baseUrl: string
  private pollingInterval: number | null = null
  private state: EventStoreState = {
    connectionStatus: 'disconnected',
    totalEventsFetched: 0,
  }
  private eventCallbacks: Set<(events: KafkaEvent[]) => void> = new Set()
  private statusCallbacks: Set<(status: EventStoreConnectionStatus) => void> = new Set()

  constructor() {
    // Use backend API proxy URL
    this.baseUrl = EVENT_STORE_CONFIG.BACKEND_PROXY_URL
  }

  /**
   * Get current service state
   */
  getState(): EventStoreState {
    return { ...this.state }
  }

  /**
   * Subscribe to new events
   */
  onEvents(callback: (events: KafkaEvent[]) => void): () => void {
    this.eventCallbacks.add(callback)
    return () => this.eventCallbacks.delete(callback)
  }

  /**
   * Subscribe to connection status changes
   */
  onStatusChange(callback: (status: EventStoreConnectionStatus) => void): () => void {
    this.statusCallbacks.add(callback)
    return () => this.statusCallbacks.delete(callback)
  }

  /**
   * Update connection status
   */
  private setConnectionStatus(status: EventStoreConnectionStatus): void {
    this.state.connectionStatus = status
    this.statusCallbacks.forEach((cb) => cb(status))
  }

  /**
   * Notify event subscribers
   */
  private notifyEvents(events: KafkaEvent[]): void {
    this.eventCallbacks.forEach((cb) => cb(events))
  }

  /**
   * Fetch events from backend proxy
   */
  async fetchEvents(options: EventStoreOptions = {}): Promise<EventStoreResponse> {
    this.setConnectionStatus('connecting')

    try {
      // Build query parameters
      const params = new URLSearchParams()

      if (options.topic) {
        params.set('topic', options.topic)
      }
      if (options.since) {
        params.set('since', options.since)
      }
      if (options.limit) {
        params.set('limit', options.limit.toString())
      }
      if (options.offset) {
        params.set('offset', options.offset.toString())
      }

      const url = `${this.baseUrl}/events${params.toString() ? `?${params.toString()}` : ''}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data: EventStoreResponse = await response.json()

      if (data.success) {
        this.setConnectionStatus('connected')
        this.state.lastFetchTime = Date.now()
        this.state.totalEventsFetched += data.events.length
        this.state.lastError = undefined

        if (data.events.length > 0) {
          this.notifyEvents(data.events)
        }
      } else {
        this.state.lastError = data.error
        this.setConnectionStatus('error')
      }

      return data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      this.state.lastError = errorMessage
      this.setConnectionStatus('error')

      return {
        success: false,
        events: [],
        total: 0,
        error: errorMessage,
        source: 'event_store',
      }
    }
  }

  /**
   * Fetch recent events from last N minutes
   */
  async fetchRecentEvents(minutes: number = 30, limit: number = 50): Promise<EventStoreResponse> {
    this.setConnectionStatus('connecting')

    try {
      const url = `${this.baseUrl}/events/recent?minutes=${minutes}&limit=${limit}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data: EventStoreResponse = await response.json()

      if (data.success) {
        this.setConnectionStatus('connected')
        this.state.lastFetchTime = Date.now()
        this.state.totalEventsFetched += data.events.length
        this.state.lastError = undefined

        if (data.events.length > 0) {
          this.notifyEvents(data.events)
        }
      } else {
        this.state.lastError = data.error
        this.setConnectionStatus('error')
      }

      return data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      this.state.lastError = errorMessage
      this.setConnectionStatus('error')

      return {
        success: false,
        events: [],
        total: 0,
        error: errorMessage,
        source: 'event_store',
      }
    }
  }

  /**
   * Fetch mock events for development/testing
   */
  async fetchMockEvents(count: number = 10): Promise<EventStoreResponse> {
    try {
      const url = `${this.baseUrl}/events/mock?count=${count}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data: EventStoreResponse = await response.json()

      if (data.success && data.events.length > 0) {
        this.notifyEvents(data.events)
      }

      return data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      return {
        success: false,
        events: [],
        total: 0,
        error: errorMessage,
        source: 'mock',
      }
    }
  }

  /**
   * Start polling for events
   */
  startPolling(intervalMs: number = EVENT_STORE_CONFIG.POLLING_INTERVAL): void {
    if (this.pollingInterval !== null) {
      this.stopPolling()
    }

    console.log(`[EventStoreService] Starting polling every ${intervalMs}ms`)

    // Fetch immediately
    this.fetchRecentEvents(EVENT_STORE_CONFIG.DEFAULT_TIME_RANGE_MINUTES, EVENT_STORE_CONFIG.MAX_EVENTS_PER_REQUEST)

    // Start interval
    this.pollingInterval = window.setInterval(() => {
      this.fetchRecentEvents(
        EVENT_STORE_CONFIG.DEFAULT_TIME_RANGE_MINUTES,
        EVENT_STORE_CONFIG.MAX_EVENTS_PER_REQUEST
      )
    }, intervalMs)
  }

  /**
   * Stop polling for events
   */
  stopPolling(): void {
    if (this.pollingInterval !== null) {
      console.log('[EventStoreService] Stopping polling')
      window.clearInterval(this.pollingInterval)
      this.pollingInterval = null
      this.setConnectionStatus('disconnected')
    }
  }

  /**
   * Check if polling is active
   */
  isPolling(): boolean {
    return this.pollingInterval !== null
  }

  /**
   * Check Event Store API health
   */
  async checkHealth(): Promise<EventStoreHealth> {
    try {
      const url = `${this.baseUrl}/events/health`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      })

      if (!response.ok) {
        return {
          status: 'unhealthy',
          error: `HTTP ${response.status}`,
        }
      }

      const data = await response.json()

      return {
        status: data.status || 'unknown',
        endpoint: data.endpoint,
        responseTimeMs: data.response_time_ms,
        error: data.error,
      }
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Explore Event Store API endpoints (for development)
   */
  async exploreApi(): Promise<any> {
    try {
      const url = `${this.baseUrl}/events/explore`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Get available topics
   */
  async getTopics(): Promise<string[]> {
    try {
      const url = `${this.baseUrl}/events/topics`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      })

      if (!response.ok) {
        return []
      }

      const data = await response.json()
      return data.topics || []
    } catch {
      return []
    }
  }
}

// =============================================================================
// Singleton Instance
// =============================================================================

export const eventStoreService = new EventStoreService()

// =============================================================================
// React Hook for Event Store
// =============================================================================

import { useState, useEffect, useCallback } from 'react'

export interface UseEventStoreOptions {
  /** Auto-start polling when hook mounts */
  autoStart?: boolean
  /** Polling interval in milliseconds */
  pollingInterval?: number
  /** Enable event store (false = use mock events) */
  enabled?: boolean
}

export interface UseEventStoreReturn {
  /** Current events */
  events: KafkaEvent[]
  /** Connection status */
  connectionStatus: EventStoreConnectionStatus
  /** Whether polling is active */
  isPolling: boolean
  /** Last error message */
  error?: string
  /** Start polling */
  startPolling: () => void
  /** Stop polling */
  stopPolling: () => void
  /** Manually fetch events */
  fetchEvents: (options?: EventStoreOptions) => Promise<void>
  /** Clear local events */
  clearEvents: () => void
  /** Check health */
  checkHealth: () => Promise<EventStoreHealth>
}

export function useEventStore(options: UseEventStoreOptions = {}): UseEventStoreReturn {
  const { autoStart = false, pollingInterval = EVENT_STORE_CONFIG.POLLING_INTERVAL, enabled = true } = options

  const [events, setEvents] = useState<KafkaEvent[]>([])
  const [connectionStatus, setConnectionStatus] = useState<EventStoreConnectionStatus>('disconnected')
  const [error, setError] = useState<string | undefined>()
  const [isPolling, setIsPolling] = useState(false)

  // Subscribe to events and status changes
  useEffect(() => {
    if (!enabled) return

    const unsubEvents = eventStoreService.onEvents((newEvents) => {
      setEvents((prev) => {
        // Merge and deduplicate events
        const allIds = new Set(prev.map((e) => e.id))
        const uniqueNew = newEvents.filter((e) => !allIds.has(e.id))
        const merged = [...uniqueNew, ...prev]
        // Sort by timestamp descending and limit
        return merged.sort((a, b) => b.timestamp - a.timestamp).slice(0, EVENT_STORE_CONFIG.MAX_EVENTS_PER_REQUEST)
      })
    })

    const unsubStatus = eventStoreService.onStatusChange((status) => {
      setConnectionStatus(status)
      if (status === 'error') {
        setError(eventStoreService.getState().lastError)
      } else {
        setError(undefined)
      }
    })

    return () => {
      unsubEvents()
      unsubStatus()
    }
  }, [enabled])

  // Auto-start polling
  useEffect(() => {
    if (!enabled) return
    
    if (autoStart) {
      eventStoreService.startPolling(pollingInterval)
      setIsPolling(true)
    }

    return () => {
      eventStoreService.stopPolling()
      setIsPolling(false)
    }
  }, [autoStart, pollingInterval, enabled])

  const startPolling = useCallback(() => {
    if (!enabled) return
    eventStoreService.startPolling(pollingInterval)
    setIsPolling(true)
  }, [pollingInterval, enabled])

  const stopPolling = useCallback(() => {
    eventStoreService.stopPolling()
    setIsPolling(false)
  }, [])

  const fetchEvents = useCallback(
    async (fetchOptions?: EventStoreOptions) => {
      if (!enabled) return
      const result = await eventStoreService.fetchEvents(fetchOptions)
      if (!result.success && result.error) {
        setError(result.error)
      }
    },
    [enabled]
  )

  const clearEvents = useCallback(() => {
    setEvents([])
  }, [])

  const checkHealth = useCallback(async () => {
    return eventStoreService.checkHealth()
  }, [])

  return {
    events,
    connectionStatus,
    isPolling,
    error,
    startPolling,
    stopPolling,
    fetchEvents,
    clearEvents,
    checkHealth,
  }
}


/**
 * Event Transformers - CloudEvents to KafkaEvent transformation utilities
 *
 * Transforms events from CloudEvents format (Event Store API) to the internal
 * KafkaEvent format used by the Kafka Event Stream component.
 */

import type { KafkaEvent, TransactionType } from '../demo/types'

/**
 * CloudEvents specification format from Event Store API
 */
export interface CloudEvent {
  id: string
  source: string
  type: string
  specversion: string
  time: string
  data: any
  datacontenttype?: string
  // Extensions
  subject?: string
  partition?: number
  offset?: number
  kafkapartition?: number
  kafkaoffset?: number
}

/**
 * Response from Event Store API
 */
export interface EventStoreApiResponse {
  success: boolean
  events: KafkaEvent[]
  total: number
  error?: string
  source: 'event_store' | 'mock'
}

/**
 * Temenos topic mapping configuration
 */
const TEMENOS_TOPIC_MAPPINGS: Record<string, string> = {
  // Customer events
  'customer.created': 'temenos.party.customers.created',
  'customer.updated': 'temenos.party.customers.updated',
  'customer.deleted': 'temenos.party.customers.deleted',
  // Account events
  'account.opened': 'temenos.holdings.accounts.opened',
  'account.created': 'temenos.holdings.accounts.opened',
  'account.updated': 'temenos.holdings.accounts.updated',
  'account.closed': 'temenos.holdings.accounts.closed',
  // Payment events
  'payment.initiated': 'temenos.order.payments.initiated',
  'payment.created': 'temenos.order.payments.initiated',
  'payment.completed': 'temenos.order.payments.completed',
  'payment.failed': 'temenos.order.payments.failed',
  // Data sync events
  'data.sync': 'temenos.data.sync',
  'account.sync': 'temenos.data.accounts.sync',
  'payment.sync': 'temenos.data.payments.sync',
}

/**
 * Business event keywords for categorization
 */
const BUSINESS_EVENT_KEYWORDS = [
  'customer.created',
  'customer.updated',
  'customer.deleted',
  'account.opened',
  'account.closed',
  'account.updated',
  'payment.initiated',
  'payment.completed',
  'payment.failed',
  'transaction.completed',
  'order',
  'kyc',
  'compliance',
]

/**
 * Data event keywords for categorization
 */
const DATA_EVENT_KEYWORDS = ['sync', 'replicated', 'data.', 'cdc', 'change']

/**
 * Parse ISO datetime string to milliseconds timestamp
 */
export function parseIsoToMillis(isoString: string): number {
  try {
    if (!isoString) {
      return Date.now()
    }
    // Handle ISO format: 2024-01-15T10:30:00Z or 2024-01-15T10:30:00+00:00
    const date = new Date(isoString)
    if (isNaN(date.getTime())) {
      return Date.now()
    }
    return date.getTime()
  } catch {
    return Date.now()
  }
}

/**
 * Extract topic name from CloudEvent source
 */
export function extractTopicFromSource(source: string, eventType: string): string {
  // Try to extract topic from source path (e.g., "/azure/eventhub/topic-name")
  if (source && source.includes('/')) {
    const topic = source.split('/').pop() || ''
    if (topic) {
      return mapToTemenosTopic(topic, eventType)
    }
  }

  // Fallback to using event type
  return mapToTemenosTopic(source || eventType.replace('.', '-'), eventType)
}

/**
 * Map source/type to Temenos-style topic names
 */
export function mapToTemenosTopic(topic: string, eventType: string): string {
  const topicLower = topic.toLowerCase()
  const eventTypeLower = eventType.toLowerCase()

  // Check direct mappings first
  for (const [pattern, temenosTopic] of Object.entries(TEMENOS_TOPIC_MAPPINGS)) {
    if (topicLower.includes(pattern) || eventTypeLower.includes(pattern)) {
      return temenosTopic
    }
  }

  // Infer from keywords
  if (topicLower.includes('customer') || eventTypeLower.includes('customer')) {
    if (eventTypeLower.includes('created')) {
      return 'temenos.party.customers.created'
    }
    return 'temenos.party.customers.updated'
  }

  if (topicLower.includes('account') || eventTypeLower.includes('account')) {
    if (eventTypeLower.includes('opened') || eventTypeLower.includes('created')) {
      return 'temenos.holdings.accounts.opened'
    }
    return 'temenos.holdings.accounts.updated'
  }

  if (topicLower.includes('payment') || eventTypeLower.includes('payment')) {
    if (eventTypeLower.includes('initiated') || eventTypeLower.includes('created')) {
      return 'temenos.order.payments.initiated'
    }
    if (eventTypeLower.includes('completed')) {
      return 'temenos.order.payments.completed'
    }
    return 'temenos.order.payments.updated'
  }

  if (topicLower.includes('transaction')) {
    return 'temenos.data.transactions.sync'
  }

  // Default: prefix with temenos.data
  return `temenos.data.${topicLower.replace(/[^a-z0-9.]/g, '-')}`
}

/**
 * Categorize event as 'business' or 'data' based on type
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function categorizeEvent(eventType: string, _data?: unknown): 'business' | 'data' {
  const eventTypeLower = eventType.toLowerCase()

  // Check for business event patterns
  for (const keyword of BUSINESS_EVENT_KEYWORDS) {
    if (eventTypeLower.includes(keyword)) {
      return 'business'
    }
  }

  // Check for data event patterns
  for (const keyword of DATA_EVENT_KEYWORDS) {
    if (eventTypeLower.includes(keyword)) {
      return 'data'
    }
  }

  // Default to business for unknown types
  return 'business'
}

/**
 * Extract transaction type from event for UI display
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function extractTransactionType(eventType: string, _data?: unknown): TransactionType | undefined {
  const eventTypeLower = eventType.toLowerCase()

  if (eventTypeLower.includes('customer')) {
    return 'CREATE_CUSTOMER'
  }
  if (eventTypeLower.includes('account')) {
    return 'OPEN_ACCOUNT'
  }
  if (eventTypeLower.includes('payment')) {
    return 'SEND_PAYMENT'
  }

  return undefined
}

/**
 * Transform a CloudEvent to internal KafkaEvent format
 */
export function transformCloudEvent(cloudEvent: CloudEvent): KafkaEvent {
  const timestamp = parseIsoToMillis(cloudEvent.time)
  const topic = extractTopicFromSource(cloudEvent.source, cloudEvent.type)
  const eventCategory = categorizeEvent(cloudEvent.type, cloudEvent.data)
  const transactionType = extractTransactionType(cloudEvent.type, cloudEvent.data)

  // Extract partition and offset from CloudEvent extensions
  let partition = cloudEvent.partition ?? 0
  let offset = cloudEvent.offset ?? 0

  // Check Kafka-specific extensions
  if (cloudEvent.kafkapartition !== undefined) {
    partition = cloudEvent.kafkapartition
  }
  if (cloudEvent.kafkaoffset !== undefined) {
    offset = cloudEvent.kafkaoffset
  }

  return {
    id: cloudEvent.id || `evt_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp,
    type: eventCategory,
    topic,
    partition,
    offset,
    payload: cloudEvent.data || {},
    transactionType,
  }
}

/**
 * Transform multiple CloudEvents to KafkaEvents
 */
export function transformCloudEvents(cloudEvents: CloudEvent[]): KafkaEvent[] {
  return cloudEvents.map(transformCloudEvent)
}

/**
 * Deduplicate events by ID
 */
export function deduplicateEvents(events: KafkaEvent[]): KafkaEvent[] {
  const seen = new Set<string>()
  return events.filter((event) => {
    if (seen.has(event.id)) {
      return false
    }
    seen.add(event.id)
    return true
  })
}

/**
 * Merge new events with existing events, avoiding duplicates
 */
export function mergeEvents(
  existingEvents: KafkaEvent[],
  newEvents: KafkaEvent[],
  maxEvents: number = 100
): KafkaEvent[] {
  // Combine and deduplicate
  const allEvents = [...newEvents, ...existingEvents]
  const deduplicated = deduplicateEvents(allEvents)

  // Sort by timestamp (newest first)
  deduplicated.sort((a, b) => b.timestamp - a.timestamp)

  // Limit to max events
  return deduplicated.slice(0, maxEvents)
}

/**
 * Filter events by topic
 */
export function filterEventsByTopic(events: KafkaEvent[], topic: string): KafkaEvent[] {
  const topicLower = topic.toLowerCase()
  return events.filter((event) => event.topic.toLowerCase().includes(topicLower))
}

/**
 * Filter events by type (business/data)
 */
export function filterEventsByType(events: KafkaEvent[], type: 'business' | 'data'): KafkaEvent[] {
  return events.filter((event) => event.type === type)
}

/**
 * Filter events by time range
 */
export function filterEventsByTimeRange(
  events: KafkaEvent[],
  sinceMs: number,
  untilMs?: number
): KafkaEvent[] {
  return events.filter((event) => {
    if (event.timestamp < sinceMs) return false
    if (untilMs && event.timestamp > untilMs) return false
    return true
  })
}


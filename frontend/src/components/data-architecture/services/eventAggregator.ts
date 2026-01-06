// Event Aggregator - Groups and analyzes events by transaction
import type { KafkaEvent, EventGroup, TransactionMetrics, TransactionType } from '../demo/types'
import { EVENT_DISPLAY_CONFIG } from '../config/simulation.config'

/**
 * Extracts customer ID from event payload (handles nested Temenos structures)
 */
function getCustomerId(event: KafkaEvent): string | undefined {
  if (!event.payload) return undefined

  // Check top-level fields first
  if (event.payload.customerId) {
    return String(event.payload.customerId)
  }

  // For account events, check nested Temenos structure
  if (event.payload.data?.applicationContext?.applicationData?.Customer?.[0]?.customer) {
    return String(event.payload.data.applicationContext.applicationData.Customer[0].customer)
  }

  // For customer events, entityid is the customer ID
  if (event.topic?.includes('party') || event.topic?.includes('customer')) {
    if (event.payload.entityid) {
      return String(event.payload.entityid)
    }
  }

  return undefined
}

/**
 * Extracts correlation ID from event payload
 */
function getCorrelationId(event: KafkaEvent): string | undefined {
  if (!event.payload) return undefined
  return event.payload.correlationId || event.payload.correlationid
}

/**
 * Determines transaction type from event topic and payload
 */
function determineTransactionType(event: KafkaEvent): TransactionType | undefined {
  // First check if event already has transactionType
  if (event.transactionType) {
    return event.transactionType
  }

  // Determine from topic
  const topic = event.topic.toLowerCase()

  if (topic.includes('party') || topic.includes('customer')) {
    return 'CREATE_CUSTOMER'
  }
  if (topic.includes('holding') || topic.includes('account')) {
    return 'OPEN_ACCOUNT'
  }
  if (topic.includes('payment') || topic.includes('order')) {
    return 'SEND_PAYMENT'
  }

  return undefined
}

/**
 * Groups events by the configured grouping strategy
 */
export function groupEventsByCustomer(events: KafkaEvent[]): EventGroup[] {
  const groupBy = EVENT_DISPLAY_CONFIG.GROUP_BY

  // Create a map to hold groups
  const groupMap = new Map<string, KafkaEvent[]>()

  // Group events
  for (const event of events) {
    let groupKey: string | undefined

    switch (groupBy) {
      case 'customerId':
        groupKey = getCustomerId(event)
        break
      case 'correlationId':
        groupKey = getCorrelationId(event)
        break
      case 'transactionId':
        groupKey = event.payload?.transactionId
        break
    }

    // Skip events without a valid group key
    if (!groupKey) continue

    // Get or create group
    if (!groupMap.has(groupKey)) {
      groupMap.set(groupKey, [])
    }
    groupMap.get(groupKey)!.push(event)
  }

  // Convert map to EventGroup array
  const groups: EventGroup[] = []

  for (const [key, groupEvents] of groupMap.entries()) {
    // Sort events by timestamp
    groupEvents.sort((a, b) => a.timestamp - b.timestamp)

    // Calculate time boundaries
    const startTime = groupEvents[0].timestamp
    const endTime = groupEvents[groupEvents.length - 1].timestamp
    const duration = endTime - startTime

    // Determine transaction type from first event
    const transactionType = determineTransactionType(groupEvents[0])

    // Create group
    const group: EventGroup = {
      id: `group-${key}-${startTime}`,
      customerId: getCustomerId(groupEvents[0]),
      correlationId: getCorrelationId(groupEvents[0]),
      transactionType,
      events: groupEvents,
      startTime,
      endTime,
      duration
    }

    groups.push(group)
  }

  // Sort groups by start time (newest first)
  groups.sort((a, b) => b.startTime - a.startTime)

  return groups
}

/**
 * Calculates metrics for an event group
 */
export function calculateTransactionMetrics(group: EventGroup): TransactionMetrics {
  const businessEvents = group.events.filter(e => e.type === 'business').length
  const dataEvents = group.events.filter(e => e.type === 'data').length

  // Determine success based on event types
  // A successful transaction should have at least one business event
  const successful = businessEvents > 0

  return {
    totalEvents: group.events.length,
    businessEvents,
    dataEvents,
    duration: group.duration,
    successful
  }
}

/**
 * Filters events within a time window from a reference point
 */
export function filterEventsByTimeWindow(
  events: KafkaEvent[],
  referenceTime: number,
  windowMs: number
): KafkaEvent[] {
  return events.filter(event => {
    const timeDiff = Math.abs(event.timestamp - referenceTime)
    return timeDiff <= windowMs
  })
}

/**
 * Merges overlapping event groups that belong to the same transaction
 */
export function mergeOverlappingGroups(groups: EventGroup[]): EventGroup[] {
  if (groups.length <= 1) return groups

  const merged: EventGroup[] = []
  let current = groups[0]

  for (let i = 1; i < groups.length; i++) {
    const next = groups[i]

    // Check if groups should be merged (same customer within time window)
    const sameCustomer = current.customerId === next.customerId
    const timeGap = Math.abs(next.startTime - current.endTime)
    const withinWindow = timeGap <= EVENT_DISPLAY_CONFIG.GROUP_TIME_WINDOW_MS

    if (sameCustomer && withinWindow) {
      // Merge groups
      current = {
        ...current,
        events: [...current.events, ...next.events].sort((a, b) => a.timestamp - b.timestamp),
        endTime: Math.max(current.endTime, next.endTime),
        duration: Math.max(current.endTime, next.endTime) - current.startTime
      }
    } else {
      // Save current and move to next
      merged.push(current)
      current = next
    }
  }

  // Add the last group
  merged.push(current)

  return merged
}

/**
 * Gets a human-readable label for an event group
 */
export function getGroupLabel(group: EventGroup): string {
  const transactionLabel = group.transactionType
    ? group.transactionType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
    : 'Transaction'

  const customerLabel = group.customerId ? ` - Customer ${group.customerId.slice(-8)}` : ''

  const eventCount = group.events.length
  const eventLabel = eventCount === 1 ? 'event' : 'events'

  return `${transactionLabel}${customerLabel} (${eventCount} ${eventLabel})`
}

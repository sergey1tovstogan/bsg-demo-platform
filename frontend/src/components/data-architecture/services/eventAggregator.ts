// Event Aggregator - Groups and analyzes events by transaction
import type { KafkaEvent, EventGroup, TransactionMetrics, TransactionType } from '../demo/types'
import { EVENT_DISPLAY_CONFIG } from '../config/simulation.config'

/**
 * Extracts entity ID from event payload for grouping.
 * 
 * Grouping is based on the entityid field which contains:
 * - CustomerID (e.g., "190633") for customer events
 * - AccountID (e.g., "AA25105LJ7HX") for account events
 * 
 * Events with subject="dataevent" are data events and should be grouped by entityid.
 */
function getEntityId(event: KafkaEvent): string | undefined {
  if (!event.payload) return undefined

  // Primary grouping: use entityid directly (works for both Customer and Account events)
  if (event.payload.entityid) {
    return String(event.payload.entityid)
  }

  // Fallback: check customerId field
  if (event.payload.customerId) {
    return String(event.payload.customerId)
  }

  // Fallback: check nested Temenos structure for account events
  if (event.payload.data?.applicationContext?.applicationData?.Customer?.[0]?.customer) {
    return String(event.payload.data.applicationContext.applicationData.Customer[0].customer)
  }

  return undefined
}

/**
 * Legacy alias for backward compatibility
 * @deprecated Use getEntityId instead
 */
function getCustomerId(event: KafkaEvent): string | undefined {
  return getEntityId(event)
}

/**
 * Extracts correlation ID from event payload
 */
function getCorrelationId(event: KafkaEvent): string | undefined {
  if (!event.payload) return undefined
  return event.payload.correlationId || event.payload.correlationid
}

/**
 * Determines transaction type from event topic, entityname, and payload
 */
function determineTransactionType(event: KafkaEvent): TransactionType | undefined {
  // First check if event already has transactionType
  if (event.transactionType) {
    return event.transactionType
  }

  // Determine from topic
  const topic = (event.topic || '').toLowerCase()
  const entityName = (event.payload?.entityname || '').toLowerCase()

  if (topic.includes('party') || topic.includes('customer') || entityName.includes('customer')) {
    return 'CREATE_CUSTOMER'
  }
  // Check for AA (Arrangement Architecture) entities - these are accounts in Temenos
  if (topic.includes('holding') || topic.includes('account') || 
      entityName.includes('account') || entityName.startsWith('aa') || 
      entityName.includes('aa_') || entityName.includes('_aa_')) {
    return 'OPEN_ACCOUNT'
  }
  if (topic.includes('payment') || topic.includes('order') || 
      entityName.includes('funds') || entityName.includes('transfer')) {
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
      case 'entityId':
        // Group by entityid (works for CustomerID and AccountID)
        groupKey = getEntityId(event)
        break
      case 'customerId':
        // Legacy: same as entityId
        groupKey = getEntityId(event)
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
 * Uses appropriate entity ID based on transaction type:
 * - CREATE_CUSTOMER: Customer ID
 * - OPEN_ACCOUNT: Account ID (from entityid in event payload)
 * - SEND_PAYMENT: Payment reference
 */
export function getGroupLabel(group: EventGroup): string {
  const transactionLabel = group.transactionType
    ? group.transactionType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
    : 'Transaction'

  // Get the appropriate entity ID based on transaction type
  let entityLabel = ''
  
  if (group.transactionType === 'OPEN_ACCOUNT') {
    // For OPEN_ACCOUNT, extract the Account ID from the first event's entityid
    const accountId = group.events[0]?.payload?.entityid
    if (accountId) {
      entityLabel = ` - Account ID: ${accountId}`
    }
  } else if (group.transactionType === 'CREATE_CUSTOMER') {
    // For CREATE_CUSTOMER, show Customer ID
    const customerId = group.customerId || group.events[0]?.payload?.entityid
    if (customerId) {
      entityLabel = ` - Customer ID: ${customerId}`
    }
  } else if (group.transactionType === 'SEND_PAYMENT') {
    // For SEND_PAYMENT, show Payment reference if available
    const paymentId = group.events[0]?.payload?.entityid || group.events[0]?.payload?.paymentId
    if (paymentId) {
      entityLabel = ` - Payment ID: ${paymentId}`
    }
  } else if (group.customerId) {
    // Fallback to customer ID for unknown transaction types
    entityLabel = ` - ID: ${group.customerId}`
  }

  const eventCount = group.events.length
  const eventLabel = eventCount === 1 ? 'event' : 'events'

  return `${transactionLabel}${entityLabel} (${eventCount} ${eventLabel})`
}

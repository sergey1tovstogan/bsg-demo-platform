/**
 * Microservice Brief Registry
 *
 * Central registry mapping discovered component names to their RAG brief content.
 * Used when the Deployment Analyzer identifies a Temenos microservice - the
 * corresponding technical brief is displayed for the demo.
 */

import {
  HOLDINGS_BRIEF_RAW,
  EVENT_STORE_BRIEF_RAW,
  PARTY_BRIEF_RAW,
  ADAPTER_BRIEF_RAW,
  VIRTUAL_TABLE_BRIEF_RAW,
  GENERIC_CONFIGURATION_BRIEF_RAW,
  CAMT_BRIEF_RAW,
} from './mockBrief'

export interface BriefEntry {
  name: string
  rawText: string
}

/** Registry: normalized key -> { name, rawText } */
const REGISTRY: Record<string, BriefEntry> = {
  holdings: { name: 'Holdings', rawText: HOLDINGS_BRIEF_RAW },
  eventstore: { name: 'Event Store', rawText: EVENT_STORE_BRIEF_RAW },
  'event-store': { name: 'Event Store', rawText: EVENT_STORE_BRIEF_RAW },
  party: { name: 'Party', rawText: PARTY_BRIEF_RAW },
  adapter: { name: 'Adapter', rawText: ADAPTER_BRIEF_RAW },
  virtualtable: { name: 'Virtual Table', rawText: VIRTUAL_TABLE_BRIEF_RAW },
  'virtual-table': { name: 'Virtual Table', rawText: VIRTUAL_TABLE_BRIEF_RAW },
  genericconfiguration: { name: 'Generic Configuration', rawText: GENERIC_CONFIGURATION_BRIEF_RAW },
  'generic-configuration': { name: 'Generic Configuration', rawText: GENERIC_CONFIGURATION_BRIEF_RAW },
  genericconfig: { name: 'Generic Configuration', rawText: GENERIC_CONFIGURATION_BRIEF_RAW },
  camt: { name: 'CAMT', rawText: CAMT_BRIEF_RAW },
}

function normalizeKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/-/g, '')
}

/**
 * Get the technical brief for a discovered microservice component.
 * Returns the brief entry if we have curated content for this component, else null.
 *
 * @param componentName - Name from Deployment Analyzer (e.g. "Holdings", "Event Store")
 */
export function getBriefForComponent(componentName: string): BriefEntry | null {
  if (!componentName || typeof componentName !== 'string') return null

  const key = normalizeKey(componentName)
  const entry = REGISTRY[key]
  if (entry) return entry

  // Try with hyphens instead of spaces
  const keyWithHyphens = componentName.toLowerCase().replace(/\s+/g, '-')
  return REGISTRY[keyWithHyphens] ?? null
}

/** List all available microservice briefs for reference */
export function getAllBriefs(): BriefEntry[] {
  const seen = new Set<string>()
  return Object.values(REGISTRY).filter((e) => {
    if (seen.has(e.name)) return false
    seen.add(e.name)
    return true
  })
}

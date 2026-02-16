import type { ComponentId } from '../types'

export interface SearchResult {
  componentId: ComponentId
  selectedCard?: number // For security component sub-sections
  tab?: 'content' | 'video' | 'demo' // For specific tabs (no chatbot - use floating BSG Guru)
}

// Search term mappings to components and sub-pages
const searchMappings: Array<{
  keywords: string[]
  result: SearchResult
}> = [
  // Security Component - Privacy & Encryption
  {
    keywords: ['privacy', 'encryption', 'privacy & encryption', 'privacy and encryption', 'data protection', 'encrypt'],
    result: { componentId: 'security', selectedCard: 3 }
  },
  // Security Component - Authentication
  {
    keywords: ['authentication', 'auth', 'sso', 'single sign-on', 'identity verification', 'login'],
    result: { componentId: 'security', selectedCard: 1 }
  },
  // Security Component - Authorization
  {
    keywords: ['authorization', 'rbac', 'role-based', 'access control', 'permissions', 'roles'],
    result: { componentId: 'security', selectedCard: 2 }
  },
  // Security Component - Segregation
  {
    keywords: ['segregation', 'multi-tenant', 'isolation', 'tenant isolation', 'segregation of duties'],
    result: { componentId: 'security', selectedCard: 4 }
  },
  // Security Component - Access Management
  {
    keywords: ['access management', 'privileged access', 'pam', 'privileged access management', 'access monitoring'],
    result: { componentId: 'security', selectedCard: 5 }
  },
  // Security Component - Platform Management
  {
    keywords: ['platform management', 'infrastructure controls', 'platform security'],
    result: { componentId: 'security', selectedCard: 6 }
  },
  // Security Component - SaaS Security Services
  {
    keywords: ['saas security', 'saas security services', 'cloud-native security', 'saas cloud'],
    result: { componentId: 'security', selectedCard: 7 }
  },
  // Security Component - BCP, Logs, Incidents
  {
    keywords: ['bcp', 'business continuity', 'logs', 'incidents', 'resilience', 'monitoring', 'saas logs'],
    result: { componentId: 'security', selectedCard: 8 }
  },
  // Security Component - Compliance
  {
    keywords: ['compliance', 'risk management', 'regulatory', 'compliance and risk', 'risk'],
    result: { componentId: 'security', selectedCard: 9 }
  },
  // Main Components
  {
    keywords: ['integration', 'api', 'apis', 'events', 'integration apis', 'integration apis & events'],
    result: { componentId: 'integration' }
  },
  {
    keywords: ['extensibility', 'extensible', 'extensibility framework', 'workbench', 'low-code', 'configurable'],
    result: { componentId: 'extensibility' }
  },
  {
    keywords: ['data architecture', 'database', 'data modeling', 'data design'],
    result: { componentId: 'data-architecture' }
  },
  {
    keywords: ['architecture', 'deployment', 'cloud', 'deployment & cloud', 'deployment and cloud', 'azure', 'kubernetes', 'aks', 'functional architecture'],
    result: { componentId: 'architecture' }
  },
  {
    keywords: ['security', 'application security', 'vulnerability'],
    result: { componentId: 'security' }
  },
  {
    keywords: ['observability', 'monitoring', 'logging', 'distributed tracing', 'tracing'],
    result: { componentId: 'observability' }
  },
  {
    keywords: ['devops', 'design time', 'design-time', 'design principles', 'architecture patterns', 'software design'],
    result: { componentId: 'devops' }
  },
  {
    keywords: ['temenos components', 'active components', 'future components', 'temenos active', 'temenos future', 'components roadmap'],
    result: { componentId: 'temenos-components' }
  }
]

/**
 * Search for a component or sub-page based on search query
 * @param query - The search query string
 * @returns SearchResult if match found, null otherwise
 */
export function searchQuery(query: string): SearchResult | null {
  if (!query || !query.trim()) {
    return null
  }

  const normalizedQuery = query.toLowerCase().trim()

  // Find the best match (longest keyword match wins)
  let bestMatch: SearchResult | null = null
  let bestMatchLength = 0

  for (const mapping of searchMappings) {
    for (const keyword of mapping.keywords) {
      if (normalizedQuery.includes(keyword.toLowerCase())) {
        // Prefer longer keyword matches
        if (keyword.length > bestMatchLength) {
          bestMatch = mapping.result
          bestMatchLength = keyword.length
        }
      }
    }
  }

  return bestMatch
}

/**
 * Get search suggestions based on partial query
 * @param query - Partial search query
 * @returns Array of suggested search terms
 */
export function getSearchSuggestions(query: string): string[] {
  if (!query || query.trim().length < 2) {
    return []
  }

  const normalizedQuery = query.toLowerCase().trim()
  const suggestions: Set<string> = new Set()

  for (const mapping of searchMappings) {
    for (const keyword of mapping.keywords) {
      if (keyword.toLowerCase().includes(normalizedQuery) || normalizedQuery.includes(keyword.toLowerCase())) {
        suggestions.add(keyword)
        if (suggestions.size >= 5) break // Limit to 5 suggestions
      }
    }
  }

  return Array.from(suggestions).slice(0, 5)
}


/**
 * RAG Client Module
 * 
 * Handles communication with the Temenos RAG API for retrieval.
 */

export interface RAGChunk {
  chunk_id: string
  title?: string | null
  text: string
  snippet?: string
  source?: string
  section?: string
  url?: string
}

export interface RAGQueryPayload {
  query: string
  filters?: {
    product_family?: string
    component?: string
  }
  top_k?: number
  rerank?: boolean
  rerank_top_k?: number
  return_chunks?: boolean
}

export interface RAGResponse {
  chunks: RAGChunk[]
}

export class RagClient {
  private baseUrl: string

  constructor(baseUrl: string = '/api/v1') {
    this.baseUrl = baseUrl
  }

  /**
   * Build comprehensive query with aliases and key terms.
   */
  buildQuery(
    productFamily: string,
    componentName: string,
    aliases: string[] = []
  ): string {
    const baseTerms = [
      'architecture',
      'responsibilities',
      'patterns',
      'guarantees',
      'interfaces',
      'APIs',
      'events',
      'deployment',
      'observability',
      'security',
      'scaling',
      'resilience',
      'dependencies'
    ]

    const queryParts = [productFamily, componentName, ...baseTerms, ...aliases]
    return queryParts.join(' ')
  }

  /**
   * Call RAG API with query payload.
   */
  async callRag(queryPayload: RAGQueryPayload): Promise<RAGChunk[]> {
    try {
      // For now, use the backend briefing endpoint which handles RAG internally
      // In the future, this could call a direct RAG endpoint
      const response = await fetch(`${this.baseUrl}/deployment/temenos/briefing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          product_family: queryPayload.filters?.product_family || '',
          component_name: queryPayload.filters?.component || '',
          aliases: []
        })
      })

      if (!response.ok) {
        throw new Error(`RAG API error: ${response.status}`)
      }

      const data = await response.json()
      
      // Extract chunks from briefing sources
      if (data.data?.sources) {
        return data.data.sources.map((source: any) => ({
          chunk_id: source.chunk_id,
          title: source.title,
          text: source.snippet || '',
          snippet: source.snippet,
          source: source.source,
          section: source.section,
          url: source.url
        }))
      }

      return []
    } catch (error) {
      console.error('RAG API call failed:', error)
      throw error
    }
  }
}


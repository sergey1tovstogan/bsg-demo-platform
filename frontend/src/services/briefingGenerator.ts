/**
 * Briefing Generator Module
 * 
 * Generates structured briefings from RAG chunks.
 */

import { RAGChunk } from './ragClient'

export interface Fact {
  type: string
  statement: string
  citations: string[]
}

export interface BriefingJSON {
  meta: {
    product_family: string
    component_name: string
    version_scope: string | null
    generated_at: string
  }
  executive_summary: {
    one_liner: string
    what_it_does: string[]
    why_it_matters: string[]
    where_it_fits: string[]
    confidence: 'high' | 'medium' | 'low'
  }
  architecture: {
    responsibilities: string[]
    core_patterns: Array<{
      pattern: string
      what_it_ensures: string
      why_it_matters: string
      citations: string[]
    }>
    event_lifecycle: string[]
    key_components: Array<{
      name: string
      responsibility: string
      notes: string
      citations: string[]
    }>
    interactions: Array<{
      with: string
      type: string
      description: string
      citations: string[]
    }>
  }
  functional_overview: {
    capabilities: Array<{
      capability: string
      details: string[]
      citations: string[]
    }>
    primary_use_cases: Array<{
      use_case: string
      steps: string[]
      citations: string[]
    }>
  }
  interfaces: {
    apis: Array<{
      name: string
      type: string
      purpose: string
      inputs: string
      outputs: string
      citations: string[]
    }>
    events: Array<{
      name: string
      direction: string
      schema: string
      topics: string
      citations: string[]
    }>
  }
  deployment_and_ops: {
    runtime: string[]
    dependencies: Array<{
      dependency: string
      category: string
      notes: string
      citations: string[]
    }>
    scaling: Array<{
      dimension: string
      how: string
      limits_or_notes: string
      citations: string[]
    }>
    resilience: Array<{
      mechanism: string
      why: string
      citations: string[]
    }>
    observability: Array<{
      signal: string
      what_to_monitor: string[]
      citations: string[]
    }>
  }
  security_and_compliance: {
    controls: Array<{
      control: string
      details: string
      citations: string[]
    }>
    data_protection: Array<{
      area: string
      approach: string
      citations: string[]
    }>
  }
  limitations_and_gaps: Array<{
    gap: string
    impact: string
    reason: string
    recommended_follow_up_questions: string[]
  }>
  sources: Array<{
    chunk_id: string
    title: string | null
    snippet: string
    relevance: string
  }>
}

export class BriefingGenerator {
  /**
   * Normalize text for deduplication.
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
  }

  /**
   * Check if two texts are similar.
   */
  private areSimilar(text1: string, text2: string, threshold: number = 0.85): boolean {
    const norm1 = this.normalizeText(text1)
    const norm2 = this.normalizeText(text2)

    if (norm1 === norm2) return true

    const words1 = new Set(norm1.split(' '))
    const words2 = new Set(norm2.split(' '))

    if (words1.size === 0 || words2.size === 0) return false

    const intersection = new Set([...words1].filter(x => words2.has(x)))
    const union = new Set([...words1, ...words2])

    const similarity = intersection.size / union.size
    return similarity >= threshold
  }

  /**
   * Extract facts from chunks (PASS 1).
   */
  generateFacts(chunks: RAGChunk[]): Fact[] {
    const facts: Fact[] = []

    for (const chunk of chunks) {
      const chunkId = chunk.chunk_id
      const text = chunk.text || chunk.snippet || ''

      if (!text) continue

      // Split by sentences
      const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 20)

      for (const sentence of sentences) {
        const sentenceLower = sentence.toLowerCase()

        // Determine fact type
        let factType = 'definition'
        if (sentenceLower.includes('responsibility') || sentenceLower.includes('responsible') || sentenceLower.includes('handles')) {
          factType = 'responsibility'
        } else if (sentenceLower.includes('pattern') || sentenceLower.includes('design pattern')) {
          factType = 'pattern'
        } else if (sentenceLower.includes('guarantee') || sentenceLower.includes('ensures')) {
          factType = 'guarantee'
        } else if (sentenceLower.includes('api') || sentenceLower.includes('interface')) {
          factType = 'interface'
        } else if (sentenceLower.includes('event') || sentenceLower.includes('message')) {
          factType = 'event'
        } else if (sentenceLower.includes('depends') || sentenceLower.includes('requires')) {
          factType = 'dependency'
        } else if (sentenceLower.includes('deploy') || sentenceLower.includes('runtime')) {
          factType = 'deployment'
        } else if (sentenceLower.includes('monitor') || sentenceLower.includes('log')) {
          factType = 'ops'
        } else if (sentenceLower.includes('security') || sentenceLower.includes('encrypt')) {
          factType = 'security'
        } else if (sentenceLower.includes('limit') || sentenceLower.includes('cannot')) {
          factType = 'limitation'
        }

        facts.push({
          type: factType,
          statement: sentence,
          citations: [chunkId]
        })
      }
    }

    return this.deduplicateFacts(facts)
  }

  /**
   * Deduplicate facts.
   */
  deduplicateFacts(facts: Fact[]): Fact[] {
    const deduplicated: Fact[] = []
    const seenStatements: string[] = []

    for (const fact of facts) {
      const statement = fact.statement
      let isDuplicate = false

      for (const seen of seenStatements) {
        if (this.areSimilar(statement, seen)) {
          isDuplicate = true
          // Merge citations
          const existingFact = deduplicated.find(f => this.areSimilar(f.statement, statement))
          if (existingFact) {
            existingFact.citations = [...new Set([...existingFact.citations, ...fact.citations])]
          }
          break
        }
      }

      if (!isDuplicate) {
        deduplicated.push(fact)
        seenStatements.push(statement)
      }
    }

    return deduplicated
  }

  /**
   * Synthesize briefing JSON from facts (PASS 2).
   * This is handled by the backend, but we keep the interface for consistency.
   */
  async synthesizeBriefing(
    _facts: Fact[],
    _chunks: RAGChunk[],
    _productFamily: string,
    _componentName: string
  ): Promise<BriefingJSON> {
    // The actual synthesis is done by the backend
    // This is a placeholder that would call the backend API
    throw new Error('Synthesis should be done via backend API')
  }
}


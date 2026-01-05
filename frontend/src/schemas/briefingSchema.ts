/**
 * Zod Schema for Briefing JSON Validation
 */

import { z } from 'zod'

// Base schemas
const CitationSchema = z.array(z.string())

const PatternSchema = z.object({
  pattern: z.string(),
  what_it_ensures: z.string(),
  why_it_matters: z.string(),
  citations: CitationSchema
})

const KeyComponentSchema = z.object({
  name: z.string(),
  responsibility: z.string(),
  notes: z.string().optional().default(''),
  citations: CitationSchema
})

const InteractionSchema = z.object({
  with: z.string(),
  type: z.enum(['sync', 'async', 'storage', 'config']),
  description: z.string(),
  citations: CitationSchema
})

const CapabilitySchema = z.object({
  capability: z.string(),
  details: z.array(z.string()),
  citations: CitationSchema
})

const UseCaseSchema = z.object({
  use_case: z.string(),
  steps: z.array(z.string()),
  citations: CitationSchema
})

const APISchema = z.object({
  name: z.string(),
  type: z.enum(['REST', 'gRPC', 'internal', 'unknown']),
  purpose: z.string(),
  inputs: z.string().optional().default(''),
  outputs: z.string().optional().default(''),
  citations: CitationSchema
})

const EventSchema = z.object({
  name: z.string(),
  direction: z.enum(['produces', 'consumes', 'both']),
  schema: z.enum(['CloudEvents', 'JSON', 'Avro', 'unknown']),
  topics: z.string().optional().default('unknown'),
  citations: CitationSchema
})

const DependencySchema = z.object({
  dependency: z.string(),
  category: z.enum(['messaging', 'storage', 'platform', 'identity', 'other']),
  notes: z.string().optional().default(''),
  citations: CitationSchema
})

const ScalingSchema = z.object({
  dimension: z.string(),
  how: z.string(),
  limits_or_notes: z.string().optional().default(''),
  citations: CitationSchema
})

const ResilienceSchema = z.object({
  mechanism: z.string(),
  why: z.string(),
  citations: CitationSchema
})

const ObservabilitySchema = z.object({
  signal: z.enum(['logs', 'metrics', 'traces', 'health']),
  what_to_monitor: z.array(z.string()),
  citations: CitationSchema
})

const ControlSchema = z.object({
  control: z.string(),
  details: z.string(),
  citations: CitationSchema
})

const DataProtectionSchema = z.object({
  area: z.enum(['in_transit', 'at_rest', 'secrets', 'access']),
  approach: z.string(),
  citations: CitationSchema
})

const GapSchema = z.object({
  gap: z.string(),
  impact: z.string(),
  reason: z.string().optional().default('Not found in provided context'),
  recommended_follow_up_questions: z.array(z.string())
})

const SourceSchema = z.object({
  chunk_id: z.string(),
  title: z.string().nullable().optional(),
  snippet: z.string(),
  relevance: z.string().optional().default('')
})

// Section schemas
const MetaSchema = z.object({
  product_family: z.string(),
  component_name: z.string(),
  version_scope: z.string().nullable().optional(),
  generated_at: z.string()
})

const ExecutiveSummarySchema = z.object({
  one_liner: z.string(),
  what_it_does: z.array(z.string()),
  why_it_matters: z.array(z.string()),
  where_it_fits: z.array(z.string()),
  confidence: z.enum(['high', 'medium', 'low'])
})

const ArchitectureSchema = z.object({
  responsibilities: z.array(z.string()),
  core_patterns: z.array(PatternSchema),
  event_lifecycle: z.array(z.string()),
  key_components: z.array(KeyComponentSchema),
  interactions: z.array(InteractionSchema)
})

const FunctionalOverviewSchema = z.object({
  capabilities: z.array(CapabilitySchema),
  primary_use_cases: z.array(UseCaseSchema)
})

const InterfacesSchema = z.object({
  apis: z.array(APISchema),
  events: z.array(EventSchema)
})

const DeploymentAndOpsSchema = z.object({
  runtime: z.array(z.string()),
  dependencies: z.array(DependencySchema),
  scaling: z.array(ScalingSchema),
  resilience: z.array(ResilienceSchema),
  observability: z.array(ObservabilitySchema)
})

const SecurityAndComplianceSchema = z.object({
  controls: z.array(ControlSchema),
  data_protection: z.array(DataProtectionSchema)
})

// Main briefing schema
export const BriefingSchema = z.object({
  meta: MetaSchema,
  executive_summary: ExecutiveSummarySchema,
  architecture: ArchitectureSchema,
  functional_overview: FunctionalOverviewSchema,
  interfaces: InterfacesSchema,
  deployment_and_ops: DeploymentAndOpsSchema,
  security_and_compliance: SecurityAndComplianceSchema,
  limitations_and_gaps: z.array(GapSchema),
  sources: z.array(SourceSchema)
})

export type Briefing = z.infer<typeof BriefingSchema>

/**
 * Validate briefing JSON against schema.
 */
export function validateBriefing(data: unknown): { valid: boolean; errors?: z.ZodError } {
  try {
    BriefingSchema.parse(data)
    return { valid: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, errors: error }
    }
    return { valid: false, errors: error as z.ZodError }
  }
}

/**
 * Check citation coverage - ensure claims have citations.
 */
export function checkCitationCoverage(briefing: Briefing): { passed: boolean; warnings: string[] } {
  const warnings: string[] = []

  // Check patterns
  briefing.architecture.core_patterns.forEach((pattern, idx) => {
    if (pattern.citations.length === 0) {
      warnings.push(`Pattern "${pattern.pattern}" has no citations`)
    }
  })

  // Check capabilities
  briefing.functional_overview.capabilities.forEach((cap, idx) => {
    if (cap.citations.length === 0) {
      warnings.push(`Capability "${cap.capability}" has no citations`)
    }
  })

  // Check APIs
  briefing.interfaces.apis.forEach((api, idx) => {
    if (api.citations.length === 0) {
      warnings.push(`API "${api.name}" has no citations`)
    }
  })

  // Check dependencies
  briefing.deployment_and_ops.dependencies.forEach((dep, idx) => {
    if (dep.citations.length === 0) {
      warnings.push(`Dependency "${dep.dependency}" has no citations`)
    }
  })

  return {
    passed: warnings.length === 0,
    warnings
  }
}


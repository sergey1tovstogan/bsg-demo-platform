/**
 * Microservice Brief - Data Model
 *
 * Strongly-typed structure for Temenos microservice technical briefs
 * parsed from RAG-generated text.
 */

export type SectionTag =
  | 'Integration'
  | 'Deploy'
  | 'Security'
  | 'Ops'
  | 'Architecture'
  | 'Data'
  | 'API'
  | 'Demo'
  | 'Reference'
  | 'General'

export interface BulletGroup {
  type: 'bullet'
  items: string[]
}

export interface KeyValueGroup {
  type: 'keyvalue'
  pairs: Array<{ key: string; value: string }>
}

export interface ParagraphGroup {
  type: 'paragraph'
  content: string
}

export interface CodeBlockGroup {
  type: 'code'
  language?: string
  content: string
}

export interface ReferenceGroup {
  type: 'reference'
  items: string[]
}

export type ContentGroup =
  | BulletGroup
  | KeyValueGroup
  | ParagraphGroup
  | CodeBlockGroup
  | ReferenceGroup

export interface Section {
  id: string
  title: string
  order: number
  tags: SectionTag[]
  items: ContentGroup[]
}

export interface MicroserviceBrief {
  name: string
  sections: Section[]
}

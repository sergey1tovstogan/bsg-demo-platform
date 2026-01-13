# Zod Schema Implementation Guide

This document contains the complete implementation code for Task 1: Zod Runtime Validation.

**Directory:** `/frontend/src/lib/template-validation/`

**Files to create:**
1. `section-schemas.ts` - All 31 section schemas
2. `section-schemas.test.ts` - Validation tests
3. `card-schema.ts` - CardDefinition schema  
4. `page-schema.ts` - PageDefinition schema
5. `index.ts` - Exports

---

## File 1: section-schemas.ts

```typescript
import { z } from 'zod';

// ============================================================================
// SHARED/COMMON SCHEMAS
// ============================================================================

const AlignSchema = z.enum(['left', 'center', 'right', 'justify']).default('left');
const SizeSchema = z.enum(['small', 'medium', 'large', 'full']).optional();
const ClickActionSchema = z.object({
  type: z.enum(['navigate_to_subpage', 'show_popup', 'external_link']),
  target: z.string().optional(),
  popup_id: z.string().optional(),
  url: z.string().url().optional()
});

// ============================================================================
// CONTENT DISPLAY SECTIONS
// ============================================================================

export const HeroSectionSchema = z.object({
  type: z.literal('hero'),
  heading: z.string().min(1, 'Heading must be at least 1 character'),
  subtitle: z.string().optional(),
  align: AlignSchema
});

export const TextSectionSchema = z.object({
  type: z.literal('text'),
  content: z.string().min(1, 'Content cannot be empty'),
  align: AlignSchema
});

export const TextWithLinksSectionSchema = z.object({
  type: z.literal('text_with_links'),
  content: z.string().min(1, 'Content cannot be empty')
});

export const ImageSectionSchema = z.object({
  type: z.literal('image'),
  image: z.string().min(1, 'Image path is required'),
  alt: z.string().min(1, 'Alt text is required for accessibility'),
  caption: z.string().optional(),
  size: SizeSchema,
  align: AlignSchema
});

export const VideoSectionSchema = z.object({
  type: z.literal('video'),
  video_url: z.string().url('Video URL must be valid'),
  caption: z.string().optional(),
  aspect_ratio: z.enum(['16:9', '4:3', '1:1']).default('16:9'),
  autoplay: z.boolean().default(false)
});

export const CodeBlockSectionSchema = z.object({
  type: z.literal('code_block'),
  language: z.string().min(1, 'Language is required'),
  code: z.string().min(1, 'Code content is required'),
  filename: z.string().optional(),
  show_line_numbers: z.boolean().default(true),
  highlight_lines: z.string().optional()
});

export const QuoteSectionSchema = z.object({
  type: z.literal('quote'),
  content: z.string().min(1, 'Quote content is required'),
  author: z.string().optional(),
  role: z.string().optional(),
  avatar: z.string().optional()
});

export const DividerSectionSchema = z.object({
  type: z.literal('divider'),
  style: z.enum(['line', 'dots', 'wave']).default('line'),
  spacing: z.enum(['small', 'medium', 'large']).default('medium')
});

export const EmbedSectionSchema = z.object({
  type: z.literal('embed'),
  url: z.string().url('Embed URL must be valid'),
  height: z.string().default('400px'),
  title: z.string().min(1, 'Title is required for accessibility'),
  allow: z.string().optional()
});

// ============================================================================
// DATA PRESENTATION SECTIONS
// ============================================================================

export const ListSectionSchema = z.object({
  type: z.literal('list'),
  list_style: z.enum(['bullet', 'numbered', 'checklist']).default('bullet'),
  items: z.array(z.string()).min(1, 'List must have at least one item')
});

export const ComparisonGridSectionSchema = z.object({
  type: z.literal('comparison_grid'),
  columns: z.number().int().min(2).max(4).default(2),
  items: z.array(z.object({
    heading: z.string(),
    subheading: z.string().optional(),
    badge: z.string().optional(),
    points: z.array(z.object({
      text: z.string(),
      highlight: z.boolean().default(false)
    }))
  })).min(1)
});

export const KeyValuePairsSectionSchema = z.object({
  type: z.literal('key_value_pairs'),
  layout: z.enum(['horizontal', 'vertical']).default('horizontal'),
  pairs: z.array(z.object({
    key: z.string(),
    value: z.string(),
    highlight: z.boolean().default(false)
  })).min(1)
});

export const StepsSectionSchema = z.object({
  type: z.literal('steps'),
  orientation: z.enum(['vertical', 'horizontal']).default('vertical'),
  steps: z.array(z.object({
    number: z.number().int().positive(),
    title: z.string(),
    description: z.string(),
    code: z.string().optional()
  })).min(1)
});

export const TimelineSectionSchema = z.object({
  type: z.literal('timeline'),
  events: z.array(z.object({
    date: z.string(),
    title: z.string(),
    description: z.string(),
    highlight: z.boolean().default(false)
  })).min(1)
});

export const TableSectionSchema = z.object({
  type: z.literal('table'),
  headers: z.array(z.string()).min(1),
  rows: z.array(z.array(z.string())).min(1),
  stripe: z.boolean().default(true),
  compact: z.boolean().default(false)
});

// ============================================================================
// NAVIGATION & INTERACTIVE SECTIONS
// ============================================================================

export const ImageClickableSectionSchema = z.object({
  type: z.literal('image_clickable'),
  image: z.string().min(1),
  alt: z.string().min(1),
  click_action: ClickActionSchema,
  hover_effect: z.enum(['zoom', 'lift', 'glow', 'border']).optional(),
  caption: z.string().optional()
});

export const FeatureGridSectionSchema = z.object({
  type: z.literal('feature_grid'),
  columns: z.number().int().min(2).max(4).default(3),
  features: z.array(z.object({
    name: z.string(),
    icon: z.string(),
    description: z.string(),
    click_action: ClickActionSchema.optional()
  })).min(1)
});

export const ClickableCardsSectionSchema = z.object({
  type: z.literal('clickable_cards'),
  columns: z.number().int().min(2).max(4).default(3),
  cards: z.array(z.object({
    title: z.string(),
    description: z.string(),
    icon: z.string().optional(),
    image: z.string().optional(),
    click_action: ClickActionSchema
  })).min(1)
});

export const TabbedContentSectionSchema = z.object({
  type: z.literal('tabbed_content'),
  tabs: z.array(z.object({
    label: z.string(),
    target_type: z.enum(['inline_content', 'subpage', 'external_link']),
    content: z.string().optional(),
    target: z.string().optional(),
    url: z.string().url().optional()
  })).min(1)
});

export const InteractiveDiagramSectionSchema = z.object({
  type: z.literal('interactive_diagram'),
  image: z.string().min(1),
  hotspots: z.array(z.object({
    x: z.number(),
    y: z.number(),
    radius: z.number().positive(),
    click_action: ClickActionSchema,
    hover_text: z.string()
  })).min(1)
});

// ============================================================================
// EXPANDABLE SECTIONS
// ============================================================================

export const ExpandableSectionSchema = z.object({
  type: z.literal('expandable_section'),
  trigger: z.enum(['click', 'hover']).default('click'),
  collapsed: z.object({
    title: z.string(),
    icon: z.string().optional(),
    text: z.string().optional()
  }),
  expanded: z.object({
    content: z.string(),
    animation: z.enum(['slide-down', 'fade-in']).default('slide-down')
  }),
  max_height: z.string().optional()
});

export const ExpandableCardSectionSchema = z.object({
  type: z.literal('expandable_card'),
  trigger: z.enum(['click', 'click_icon', 'click_anywhere']).default('click'),
  icon: z.string(),
  collapsed_title: z.string(),
  collapsed_text: z.string(),
  expanded_content: z.string(),
  animation: z.enum(['slide-down', 'fade-in']).default('slide-down'),
  start_expanded: z.boolean().default(false)
});

export const AccordionSectionSchema = z.object({
  type: z.literal('accordion'),
  allow_multiple: z.boolean().default(false),
  items: z.array(z.object({
    title: z.string(),
    content: z.string()
  })).min(1)
});

// ============================================================================
// SPECIAL ELEMENTS
// ============================================================================

export const AlertSectionSchema = z.object({
  type: z.literal('alert'),
  alert_type: z.enum(['info', 'success', 'warning', 'error']),
  title: z.string(),
  content: z.string().min(1),
  dismissible: z.boolean().default(false),
  icon: z.string().optional()
});

export const StatsSectionSchema = z.object({
  type: z.literal('stats'),
  layout: z.enum(['grid', 'horizontal']).default('grid'),
  stats: z.array(z.object({
    label: z.string(),
    value: z.string(),
    icon: z.string().optional(),
    trend: z.enum(['up', 'down', 'neutral']).optional(),
    change: z.string().optional()
  })).min(1)
});

export const DownloadSectionSchema = z.object({
  type: z.literal('download'),
  files: z.array(z.object({
    title: z.string(),
    description: z.string(),
    file: z.string(),
    size: z.string(),
    icon: z.string().optional()
  })).min(1)
});

export const GallerySectionSchema = z.object({
  type: z.literal('gallery'),
  columns: z.number().int().min(2).max(4).default(3),
  images: z.array(z.object({
    src: z.string(),
    alt: z.string(),
    caption: z.string().optional(),
    click_action: ClickActionSchema.optional()
  })).min(1)
});

export const CardListSectionSchema = z.object({
  type: z.literal('card_list'),
  items: z.array(z.object({
    icon: z.string(),
    title: z.string(),
    description: z.string()
  })).min(1)
});

export const ProgressSectionSchema = z.object({
  type: z.literal('progress'),
  items: z.array(z.object({
    label: z.string(),
    status: z.enum(['completed', 'current', 'pending'])
  })).min(1)
});

export const TagsSectionSchema = z.object({
  type: z.literal('tags'),
  tags: z.array(z.object({
    label: z.string(),
    color: z.string().optional(),
    clickable: z.boolean().default(false),
    click_action: ClickActionSchema.optional()
  })).min(1)
});

// ============================================================================
// UNION TYPE
// ============================================================================

export const SectionSchema = z.discriminatedUnion('type', [
  HeroSectionSchema,
  TextSectionSchema,
  TextWithLinksSectionSchema,
  ImageSectionSchema,
  VideoSectionSchema,
  CodeBlockSectionSchema,
  QuoteSectionSchema,
  DividerSectionSchema,
  EmbedSectionSchema,
  ListSectionSchema,
  ComparisonGridSectionSchema,
  KeyValuePairsSectionSchema,
  StepsSectionSchema,
  TimelineSectionSchema,
  TableSectionSchema,
  ImageClickableSectionSchema,
  FeatureGridSectionSchema,
  ClickableCardsSectionSchema,
  TabbedContentSectionSchema,
  InteractiveDiagramSectionSchema,
  ExpandableSectionSchema,
  ExpandableCardSectionSchema,
  AccordionSectionSchema,
  AlertSectionSchema,
  StatsSectionSchema,
  DownloadSectionSchema,
  GallerySectionSchema,
  CardListSectionSchema,
  ProgressSectionSchema,
  TagsSectionSchema
]);

export type Section = z.infer<typeof SectionSchema>;
```

---

## File 2: index.ts

```typescript
export * from './section-schemas';
export * from './card-schema';
export * from './page-schema';
```

---

## Next Steps

1. **Create the directory:** `mkdir -p /frontend/src/lib/template-validation`
2. **Add the files above** to that directory
3. **Copy the test file** from my previous attempt
4. **Run tests:** `npm test section-schemas.test.ts` (should fail - RED)
5. **Verify schemas work:** Tests should pass - GREEN
6. **I'll then integrate** these schemas into the parser

Once these files exist, let me know and I'll proceed with the parser integration and move to Task 2 (Error Boundaries).

import { Section } from '@/lib/template-types';
import { HeroSection } from '@/components/template-sections/content/HeroSection';
import { TextSection } from '@/components/template-sections/content/TextSection';
import { QuoteSection } from '@/components/template-sections/content/QuoteSection';
import { DividerSection } from '@/components/template-sections/content/DividerSection';
import { ImageSection } from '@/components/template-sections/content/ImageSection';
import { VideoSection } from '@/components/template-sections/content/VideoSection';
import { CodeBlockSection } from '@/components/template-sections/content/CodeBlockSection';
import { TextWithLinksSection } from '@/components/template-sections/content/TextWithLinksSection';
import { AlertSection } from '@/components/template-sections/special/AlertSection';
import { ProgressSection } from '@/components/template-sections/special/ProgressSection';
import { TagsSection } from '@/components/template-sections/special/TagsSection';
import { ListSection } from '@/components/template-sections/data/ListSection';
import { StepsSection } from '@/components/template-sections/data/StepsSection';
import { KeyValuePairsSection } from '@/components/template-sections/data/KeyValuePairsSection';
import { ImageClickableSection } from '@/components/template-sections/navigation/ImageClickableSection';
import { FeatureGridSection } from '@/components/template-sections/navigation/FeatureGridSection';
import { ClickableCardsSection } from '@/components/template-sections/navigation/ClickableCardsSection';
import { TabbedContentSection } from '@/components/template-sections/navigation/TabbedContentSection';
import { AccordionSection } from '@/components/template-sections/expandable/AccordionSection';
import { ComparisonGridSection } from '@/components/template-sections/data/ComparisonGridSection';
import { TimelineSection } from '@/components/template-sections/data/TimelineSection';
import { TableSection } from '@/components/template-sections/data/TableSection';
import { StatsSection } from '@/components/template-sections/special/StatsSection';
import { GallerySection } from '@/components/template-sections/special/GallerySection';
import { DownloadSection } from '@/components/template-sections/special/DownloadSection';
import { CardListSection } from '@/components/template-sections/special/CardListSection';
import { EmbedSection } from '@/components/template-sections/content/EmbedSection';
import { ExpandableSection } from '@/components/template-sections/ExpandableSection';
import { ExpandableCardSection } from '@/components/template-sections/ExpandableCardSection';
import { InteractiveDiagramSection } from '@/components/template-sections/InteractiveDiagramSection';

interface SectionRendererProps {
  section: Section;
}

export function SectionRenderer({ section }: SectionRendererProps) {
  switch (section.type) {
    case 'hero':
      return <HeroSection {...section} />;

    case 'text':
      return <TextSection {...section} />;

    case 'quote':
      return <QuoteSection {...section} />;

    case 'divider':
      return <DividerSection {...section} />;

    case 'alert':
      return <AlertSection {...section} />;

    case 'list':
      return <ListSection {...section} />;

    case 'steps':
      return <StepsSection {...section} />;

    case 'key_value_pairs':
      return <KeyValuePairsSection {...section} />;

    case 'image':
      return <ImageSection {...section} />;

    case 'video':
      return <VideoSection {...section} />;

    case 'progress':
      return <ProgressSection {...section} />;

    case 'tags':
      return <TagsSection {...section} />;

    case 'code_block':
      return <CodeBlockSection {...section} />;

    case 'text_with_links':
      return <TextWithLinksSection {...section} />;

    case 'image_clickable':
      return <ImageClickableSection {...section} />;

    case 'feature_grid':
      return <FeatureGridSection {...section} />;

    case 'clickable_cards':
      return <ClickableCardsSection {...section} />;

    case 'tabbed_content':
      return <TabbedContentSection {...section} />;

    case 'accordion':
      return <AccordionSection {...section} />;

    case 'comparison_grid':
      return <ComparisonGridSection {...section} />;

    case 'timeline':
      return <TimelineSection {...section} />;

    case 'stats':
      return <StatsSection {...section} />;

    case 'table':
      return <TableSection {...section} />;

    case 'gallery':
      return <GallerySection {...section} />;

    case 'download':
      return <DownloadSection {...section} />;

    case 'card_list':
      return <CardListSection {...section} />;

    case 'embed':
      return <EmbedSection {...section} />;

    case 'expandable':
      return <ExpandableSection section={section as any} />;

    case 'expandable_card':
      return <ExpandableCardSection section={section as any} />;

    case 'interactive_diagram':
      return <InteractiveDiagramSection section={section as any} />;

    // More section types will be added here as we implement them

    default:
      return (
        <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl">
          <p className="text-red-900 dark:text-red-100 text-sm">
            Unknown section type: {(section as any).type}
          </p>
        </div>
      );
  }
}

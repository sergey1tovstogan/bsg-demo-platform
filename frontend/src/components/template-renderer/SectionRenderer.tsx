import { Section } from '@/lib/template-types';
import { HeroSection } from '@/components/template-sections/content/HeroSection';
import { TextSection } from '@/components/template-sections/content/TextSection';
import { QuoteSection } from '@/components/template-sections/content/QuoteSection';
import { DividerSection } from '@/components/template-sections/content/DividerSection';
import { AlertSection } from '@/components/template-sections/special/AlertSection';
import { ListSection } from '@/components/template-sections/data/ListSection';
import { StepsSection } from '@/components/template-sections/data/StepsSection';

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

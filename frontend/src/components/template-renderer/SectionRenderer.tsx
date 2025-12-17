import { Section } from '@/lib/template-types';
import { HeroSection } from '@/components/template-sections/content/HeroSection';
import { TextSection } from '@/components/template-sections/content/TextSection';
import { AlertSection } from '@/components/template-sections/special/AlertSection';

interface SectionRendererProps {
  section: Section;
}

export function SectionRenderer({ section }: SectionRendererProps) {
  switch (section.type) {
    case 'hero':
      return <HeroSection {...section} />;

    case 'text':
      return <TextSection {...section} />;

    case 'alert':
      return <AlertSection {...section} />;

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

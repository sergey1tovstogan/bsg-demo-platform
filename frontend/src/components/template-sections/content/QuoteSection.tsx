import { QuoteSection as QuoteSectionType } from '@/lib/template-types';

export function QuoteSection({ text, citation }: QuoteSectionType) {
  return (
    <blockquote className="border-l-4 border-slate-300 dark:border-slate-600 pl-4 py-2 my-4 italic text-slate-700 dark:text-slate-300">
      <p className="text-lg leading-relaxed">{text}</p>
      {citation && (
        <cite className="block mt-2 text-sm not-italic text-slate-600 dark:text-slate-400">
          — {citation}
        </cite>
      )}
    </blockquote>
  );
}

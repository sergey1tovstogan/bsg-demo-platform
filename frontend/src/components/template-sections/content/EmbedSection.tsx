import { EmbedSection as EmbedSectionType } from '@/lib/template-types';

export function EmbedSection({
  url,
  height = '400px',
  title
}: EmbedSectionType) {
  return (
    <div className="w-full rounded-xl overflow-hidden shadow-md bg-slate-100 dark:bg-slate-800">
      <iframe
        src={url}
        style={{ height }}
        className="w-full border-0"
        title={title || 'Embedded content'}
        allowFullScreen
      />
    </div>
  );
}

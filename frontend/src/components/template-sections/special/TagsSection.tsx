import { TagsSection as TagsSectionType } from '@/lib/template-types';

export function TagsSection({ tags, style = 'default' }: TagsSectionType) {
  const styleClasses = {
    default: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600',
    primary: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-700',
    success: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700',
    outline: 'bg-transparent text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600',
  }[style];

  return (
    <div className="flex flex-wrap gap-2" role="list">
      {tags.map((tag, index) => (
        <span
          key={index}
          className={`px-3 py-1 rounded-full text-sm font-medium ${styleClasses}`}
          role="listitem"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

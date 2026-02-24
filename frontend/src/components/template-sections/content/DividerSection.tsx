import { DividerSection as DividerSectionType } from '@/lib/template-types';

export function DividerSection({ style = 'solid' }: DividerSectionType) {
  const styleClasses = {
    solid: 'border-slate-300 dark:border-slate-600',
    dashed: 'border-slate-300 dark:border-slate-600 border-dashed',
    dotted: 'border-slate-300 dark:border-slate-600 border-dotted',
    thick: 'border-2 border-slate-400 dark:border-slate-500',
  }[style];

  return (
    <hr className={`my-8 ${styleClasses}`} />
  );
}

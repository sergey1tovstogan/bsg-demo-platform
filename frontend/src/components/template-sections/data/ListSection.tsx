import { Check } from 'lucide-react';
import { ListSection as ListSectionType } from '@/lib/template-types';

export function ListSection({ list_type = 'bullet', items }: ListSectionType) {
  if (list_type === 'bullet') {
    return (
      <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
        {items.map((item, index) => (
          <li key={index} className="leading-relaxed">{item}</li>
        ))}
      </ul>
    );
  }

  if (list_type === 'numbered') {
    return (
      <ol className="list-decimal list-inside space-y-2 text-slate-700 dark:text-slate-300">
        {items.map((item, index) => (
          <li key={index} className="leading-relaxed">{item}</li>
        ))}
      </ol>
    );
  }

  if (list_type === 'checklist') {
    return (
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
            <Check size={20} className="flex-shrink-0 mt-0.5 text-green-600 dark:text-green-400" />
            <span className="leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    );
  }

  return null;
}

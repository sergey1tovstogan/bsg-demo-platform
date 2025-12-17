import { Check, X } from 'lucide-react';
import { ComparisonGridSection as ComparisonGridSectionType } from '@/lib/template-types';

export function ComparisonGridSection({ items }: ComparisonGridSectionType) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {items.map((item, index) => (
        <div
          key={index}
          className="p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
            {item.title}
          </h3>

          <ul className="space-y-2">
            {item.features.map((feature, featureIndex) => (
              <li
                key={featureIndex}
                className="flex items-start gap-2 text-slate-700 dark:text-slate-300"
              >
                {feature.included ? (
                  <Check
                    size={20}
                    className="flex-shrink-0 mt-0.5 text-green-600 dark:text-green-400"
                  />
                ) : (
                  <X
                    size={20}
                    className="flex-shrink-0 mt-0.5 text-red-600 dark:text-red-400"
                  />
                )}
                <span className="leading-relaxed">{feature.label}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

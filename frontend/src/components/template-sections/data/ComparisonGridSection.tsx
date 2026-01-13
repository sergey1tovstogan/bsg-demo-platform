import { Check } from 'lucide-react';
import { ComparisonGridSection as ComparisonGridSectionType } from '@/lib/template-types';

export function ComparisonGridSection({ items, columns }: ComparisonGridSectionType & { columns?: any[] }) {
  // Check if we are in "Table Mode" (columns are defined)
  if (columns && columns.length > 0) {
    return (
      <div className="overflow-x-auto">
        <div className="min-w-full inline-block align-middle">
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Feature
                  </th>
                  {columns.map((col, idx) => (
                    <th key={idx} scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      {col.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                {items.map((item: any, rowIdx) => (
                  <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-800/50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
                      {item.label}
                    </td>
                    {item.values?.map((val: string, colIdx: number) => (
                      <td key={colIdx} className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Card Mode (Side-by-side pricing/comparison cards)
  const gridCols = items.length === 2 ? 'md:grid-cols-2' : items.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2';

  return (
    <div className={`grid grid-cols-1 ${gridCols} gap-6`}>
      {items.map((item, index) => (
        <div
          key={index}
          className="relative p-6 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow"
        >
          {/* Badge (e.g., "Popular", "Best Value") */}
          {item.badge && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="px-3 py-1 text-xs font-semibold text-white bg-blue-600 rounded-full">
                {item.badge}
              </span>
            </div>
          )}

          {/* Heading */}
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-1 text-center">
            {item.heading || item.title}
          </h3>

          {/* Subheading (e.g., price) */}
          {item.subheading && (
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-6 text-center">
              {item.subheading}
            </p>
          )}

          {/* Points/Features List */}
          <ul className="space-y-3 mt-6">
            {(item.points || item.features)?.map((point: any, pointIndex: number) => {
              const text = point.text || point.label;
              const isHighlighted = point.highlight ?? point.included ?? false;

              return (
                <li
                  key={pointIndex}
                  className="flex items-start gap-3"
                >
                  {isHighlighted ? (
                    <Check
                      size={20}
                      className="flex-shrink-0 mt-0.5 text-green-600 dark:text-green-400"
                    />
                  ) : (
                    <Check
                      size={20}
                      className="flex-shrink-0 mt-0.5 text-slate-400 dark:text-slate-600"
                    />
                  )}
                  <span className={`leading-relaxed ${
                    isHighlighted
                      ? 'text-slate-900 dark:text-slate-100 font-medium'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}>
                    {text}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

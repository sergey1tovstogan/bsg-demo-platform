import { StatsSection as StatsSectionType } from '@/lib/template-types';

export function StatsSection({ stats, columns = 3 }: StatsSectionType) {
  const columnClass = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }[columns];

  return (
    <div className={`grid ${columnClass} gap-6`}>
      {stats.map((stat, index) => (
        <div
          key={index}
          className="p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-center"
        >
          <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            {stat.value}
          </div>
          <div className="text-sm font-medium text-slate-900 dark:text-slate-50 mb-1">
            {stat.label}
          </div>
          {stat.description && (
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
              {stat.description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

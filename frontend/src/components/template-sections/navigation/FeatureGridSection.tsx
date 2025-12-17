import { FeatureGridSection as FeatureGridSectionType } from '@/lib/template-types';

export function FeatureGridSection({ features, columns = 3 }: FeatureGridSectionType) {
  const columnClass = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }[columns];

  return (
    <div className={`grid ${columnClass} gap-6`}>
      {features.map((feature, index) => (
        <div
          key={index}
          className="p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow"
        >
          {feature.icon && (
            <div className="text-4xl mb-3">{feature.icon}</div>
          )}
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
            {feature.title}
          </h3>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            {feature.description}
          </p>
        </div>
      ))}
    </div>
  );
}

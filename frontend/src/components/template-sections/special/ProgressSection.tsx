import { ProgressSection as ProgressSectionType } from '@/lib/template-types';

export function ProgressSection({
  label,
  value,
  max = 100,
  color = 'blue'
}: ProgressSectionType) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const colorClasses = {
    blue: 'bg-blue-600 dark:bg-blue-500',
    green: 'bg-green-600 dark:bg-green-500',
    yellow: 'bg-yellow-600 dark:bg-yellow-500',
    red: 'bg-red-600 dark:bg-red-500',
  }[color];

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-slate-900 dark:text-slate-50">
          {label}
        </span>
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {Math.round(percentage)}%
        </span>
      </div>
      <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClasses} transition-all duration-300 ease-out`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label}
        />
      </div>
    </div>
  );
}

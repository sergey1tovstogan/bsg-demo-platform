import { KeyValuePairsSection as KeyValuePairsSectionType } from '@/lib/template-types';

export function KeyValuePairsSection({ pairs }: KeyValuePairsSectionType) {
  return (
    <dl className="space-y-3">
      {pairs.map((pair, index) => (
        <div key={index} className="grid grid-cols-[auto_1fr] gap-4">
          <dt className="font-semibold text-slate-900 dark:text-slate-50">
            {pair.key}:
          </dt>
          <dd className="text-slate-700 dark:text-slate-300">
            {pair.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

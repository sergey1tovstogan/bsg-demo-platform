import { CardListSection as CardListSectionType } from '@/lib/template-types';

export function CardListSection({ cards }: CardListSectionType) {
  return (
    <div className="space-y-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className="p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow"
        >
          {card.title && (
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
              {card.title}
            </h3>
          )}
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            {card.content}
          </p>
        </div>
      ))}
    </div>
  );
}

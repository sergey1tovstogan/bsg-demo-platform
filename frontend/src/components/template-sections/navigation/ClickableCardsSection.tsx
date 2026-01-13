import { ClickableCardsSection as ClickableCardsSectionType } from '@/lib/template-types';
import { useClickAction } from '@/hooks/useClickAction';

export function ClickableCardsSection({ cards, columns = 3 }: ClickableCardsSectionType) {
  const columnClass = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }[columns];

  return (
    <div className={`grid ${columnClass} gap-6`}>
      {cards.map((card, index) => (
        <ClickableCard
          key={index}
          title={card.title}
          description={card.description}
          action={card.click_action}
          hoverEffect={card.hover_effect}
        />
      ))}
    </div>
  );
}

function ClickableCard({
  title,
  description,
  action,
  hoverEffect
}: {
  title: string;
  description: string;
  action: any;
  hoverEffect?: string;
}) {
  const handleClick = useClickAction(action);

  // Get hover effect classes based on hover_effect property
  const getHoverEffectClasses = (effect?: string): string => {
    switch (effect) {
      case 'zoom':
        return 'hover:scale-105 transition-transform duration-200';
      case 'lift':
        return 'hover:-translate-y-1 hover:shadow-xl transition-all duration-200';
      case 'glow':
        return 'hover:ring-2 hover:ring-blue-400 hover:ring-opacity-50 transition-all duration-200';
      case 'border':
        return 'hover:border-blue-500 dark:hover:border-blue-400 transition-colors duration-200';
      case 'brightness':
        return 'hover:brightness-110 transition-all duration-200';
      default:
        // Default hover effect (lift style)
        return 'hover:shadow-lg hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200';
    }
  };

  const hoverEffectClasses = getHoverEffectClasses(hoverEffect);
  const baseClasses = "p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm";

  return (
    <button
      onClick={handleClick}
      className={`${baseClasses} ${hoverEffectClasses} text-left w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
    >
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
        {title}
      </h3>
      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
        {description}
      </p>
    </button>
  );
}

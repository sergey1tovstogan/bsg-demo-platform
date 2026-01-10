import { FeatureGridSection as FeatureGridSectionType } from '@/lib/template-types';
import { useClickAction } from '@/hooks/useClickAction';
import * as Icons from 'lucide-react';

export function FeatureGridSection({ features, columns = 3 }: FeatureGridSectionType) {
  const columnClass = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }[columns];

  return (
    <div className={`grid ${columnClass} gap-6`}>
      {features.map((feature, index) => (
        <FeatureCard key={index} feature={feature} />
      ))}
    </div>
  );
}

function FeatureCard({ feature }: { feature: any }) {
  const hasAction = feature.click_action || feature.action;
  const handleClick = useClickAction(hasAction);

  // Get icon component if provided
  const IconComponent = feature.icon && (Icons as any)[feature.icon]
    ? (Icons as any)[feature.icon]
    : null;

  // Get hover effect classes based on hover_effect property
  const getHoverEffectClasses = (hoverEffect?: string): string => {
    switch (hoverEffect) {
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
        // Default subtle hover effect
        return 'hover:shadow-md transition-shadow duration-200';
    }
  };

  const hoverEffectClasses = getHoverEffectClasses(feature.hover_effect);

  const content = (
    <>
      {IconComponent && (
        <div className="mb-4">
          <IconComponent className="w-10 h-10 text-blue-600 dark:text-blue-400" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
        {feature.name || feature.title}
      </h3>
      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
        {feature.description}
      </p>
    </>
  );

  const baseClasses = "p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm";

  if (hasAction) {
    return (
      <button
        onClick={handleClick}
        className={`${baseClasses} ${hoverEffectClasses} text-left w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={`${baseClasses} ${hoverEffectClasses}`}>
      {content}
    </div>
  );
}

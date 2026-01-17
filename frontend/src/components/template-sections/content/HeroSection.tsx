import { HeroSection as HeroSectionType } from '@/lib/template-types';

export function HeroSection({
  heading,
  subtitle,
  align = 'left'
}: HeroSectionType) {
  const alignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[align];

  return (
    <div
      className={`hero-section space-y-3 ${alignmentClass}`}
      role="banner"
    >
      {/* H1 styling from UNIFIED_LAYOUT_SPECIFICATION Section 4.2 */}
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
        {heading}
      </h1>

      {subtitle && (
        /* Body Large from spec */
        <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300">
          {subtitle}
        </p>
      )}
    </div>
  );
}

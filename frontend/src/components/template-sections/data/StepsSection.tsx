import { StepsSection as StepsSectionType } from '@/lib/template-types';

export function StepsSection({ steps }: StepsSectionType) {
  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div key={index} className="flex gap-4">
          {/* Step Number */}
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center font-semibold text-sm">
            {index + 1}
          </div>

          {/* Step Content */}
          <div className="flex-1 pt-0.5">
            {step.title && (
              <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-1">
                {step.title}
              </h3>
            )}
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {step.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

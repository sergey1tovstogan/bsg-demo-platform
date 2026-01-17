import { TimelineSection as TimelineSectionType } from '@/lib/template-types';

export function TimelineSection({ events }: TimelineSectionType) {
  return (
    <div className="relative">
      {/* Timeline Line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />

      {/* Events */}
      <div className="space-y-8">
        {events.map((event, index) => (
          <div key={index} className="relative flex gap-6">
            {/* Timeline Dot */}
            <div className="relative flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-blue-600 dark:bg-blue-500 border-4 border-white dark:border-slate-900 shadow-md" />
            </div>

            {/* Event Content */}
            <div className="flex-1 pb-8">
              {event.date && (
                <time className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {event.date}
                </time>
              )}
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-1">
                {event.title}
              </h3>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-2">
                {event.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

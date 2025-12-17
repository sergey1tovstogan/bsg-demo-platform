import { useState } from 'react';
import { TabbedContentSection as TabbedContentSectionType } from '@/lib/template-types';

export function TabbedContentSection({ tabs }: TabbedContentSectionType) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="w-full">
      {/* Tab Headers */}
      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700 mb-6">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === index
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="py-4">
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
          {tabs[activeTab].content}
        </p>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import { AccordionSection as AccordionSectionType } from '@/lib/template-types';

export function AccordionSection({ items, allow_multiple = false }: AccordionSectionType) {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    if (allow_multiple) {
      setOpenItems(prev =>
        prev.includes(index)
          ? prev.filter(i => i !== index)
          : [...prev, index]
      );
    } else {
      setOpenItems(prev =>
        prev.includes(index) ? [] : [index]
      );
    }
  };

  return (
    <div className="space-y-2">
      {items.map((item, index) => {
        const isOpen = openItems.includes(index);

        return (
          <div
            key={index}
            className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden"
          >
            <button
              onClick={() => toggleItem(index)}
              className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors text-left"
            >
              <span className="font-semibold text-slate-900 dark:text-slate-50">
                {item.title}
              </span>
              <ChevronDown
                size={20}
                className={`text-slate-600 dark:text-slate-400 transition-transform ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isOpen && (
              <div className="px-4 py-3 bg-white dark:bg-slate-900">
                <div className="prose prose-slate dark:prose-invert max-w-none prose-sm">
                  <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                    {item.content}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

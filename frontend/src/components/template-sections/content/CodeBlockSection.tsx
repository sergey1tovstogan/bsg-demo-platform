import { CodeBlockSection as CodeBlockSectionType } from '@/lib/template-types';

export function CodeBlockSection({
  code,
  language = 'text',
  title
}: CodeBlockSectionType) {
  return (
    <div className="my-4">
      {title && (
        <div className="bg-slate-800 dark:bg-slate-900 text-slate-200 px-4 py-2 rounded-t-xl text-sm font-medium border-b border-slate-700">
          {title}
        </div>
      )}
      <pre
        className={`bg-slate-900 dark:bg-slate-950 text-slate-100 p-4 overflow-x-auto ${
          title ? 'rounded-b-xl' : 'rounded-xl'
        }`}
      >
        <code className={`language-${language} text-sm font-mono`}>
          {code}
        </code>
      </pre>
    </div>
  );
}

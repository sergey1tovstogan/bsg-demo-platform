import { Download } from 'lucide-react';
import { DownloadSection as DownloadSectionType } from '@/lib/template-types';

export function DownloadSection({ files }: DownloadSectionType) {
  return (
    <div className="space-y-3">
      {files.map((file, index) => (
        <a
          key={index}
          href={file.url}
          download
          className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-blue-500 dark:hover:border-blue-400 transition-all group"
        >
          <div className="flex-1">
            <div className="font-semibold text-slate-900 dark:text-slate-50 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {file.name}
            </div>
            {file.description && (
              <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {file.description}
              </div>
            )}
            {file.size && (
              <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                {file.size}
              </div>
            )}
          </div>
          <Download
            size={20}
            className="flex-shrink-0 ml-4 text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
          />
        </a>
      ))}
    </div>
  );
}

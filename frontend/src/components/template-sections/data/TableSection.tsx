import { TableSection as TableSectionType } from '@/lib/template-types';

export function TableSection({ headers, rows }: TableSectionType) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
      <table className="w-full">
        <thead className="bg-slate-50 dark:bg-slate-800">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-50"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

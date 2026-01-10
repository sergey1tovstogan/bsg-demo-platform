import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import { AlertSection as AlertSectionType } from '@/lib/template-types';

export function AlertSection({ alert_type, title, content }: AlertSectionType) {
  // Color schemes for each alert type (UNIFIED_LAYOUT_SPECIFICATION compliant)
  const styles = {
    info: {
      bg: 'bg-blue-50 dark:bg-blue-950',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-900 dark:text-blue-100',
      icon: Info,
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    success: {
      bg: 'bg-green-50 dark:bg-green-950',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-900 dark:text-green-100',
      icon: CheckCircle,
      iconColor: 'text-green-600 dark:text-green-400'
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-950',
      border: 'border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-900 dark:text-yellow-100',
      icon: AlertTriangle,
      iconColor: 'text-yellow-600 dark:text-yellow-400'
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-950',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-900 dark:text-red-100',
      icon: AlertCircle,
      iconColor: 'text-red-600 dark:text-red-400'
    }
  };

  const style = styles[alert_type];
  const Icon = style.icon;

  return (
    <div
      role="alert"
      className={`alert-section flex gap-3 rounded-xl border p-4 ${style.bg} ${style.border}`}
    >
      {/* Icon */}
      <div className={`flex-shrink-0 ${style.iconColor}`}>
        <Icon size={20} />
      </div>

      {/* Content */}
      <div className="flex-1">
        {title && (
          <h3 className={`text-sm font-semibold mb-1 ${style.text}`}>
            {title}
          </h3>
        )}
        <div className={`text-sm ${style.text} prose prose-sm prose-slate dark:prose-invert max-w-none`}>
          <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

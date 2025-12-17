import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import { TextSection as TextSectionType } from '@/lib/template-types';

export function TextSection({ content }: TextSectionType) {
  return (
    <div className="text-section prose prose-slate dark:prose-invert max-w-none">
      <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

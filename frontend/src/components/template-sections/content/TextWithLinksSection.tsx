import { TextWithLinksSection as TextWithLinksSectionType } from '@/lib/template-types';
import { useClickAction } from '@/hooks/useClickAction';
import { useNavigation } from '@/components/template-navigation/NavigationProvider';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';

/**
 * Parse wiki-style links [[label|target]] from content
 */
type LinkPart = { type: 'link'; content: string; label: string; target: string };
type TextPart = { type: 'text'; content: string };
type ParsedPart = LinkPart | TextPart;

function parseInlineLinks(content: string): ParsedPart[] {
  const parts: ParsedPart[] = [];
  const regex = /\[\[([^\]|]+)\|([^\]]+)\]\]/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: content.substring(lastIndex, match.index) });
    }

    // Add the link
    parts.push({
      type: 'link',
      content: match[0],
      label: match[1],
      target: match[2],
    });

    lastIndex = regex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push({ type: 'text', content: content.substring(lastIndex) });
  }

  return parts.length > 0 ? parts : [{ type: 'text', content }];
}

export function TextWithLinksSection({ content, links }: TextWithLinksSectionType) {
  const { navigateToPage } = useNavigation();

  // Split content by lines to process separately
  const lines = content.split('\n');

  return (
    <div className="space-y-4">
      <div className="prose prose-slate dark:prose-invert max-w-none">
        {lines.map((line, lineIndex) => {
          // Check if this line contains our special link syntax
          if (line.includes('[[')) {
            const parts = parseInlineLinks(line);

            return (
              <p key={lineIndex} className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {parts.map((part, partIndex) => {
                  if (part.type === 'link') {
                    return (
                      <button
                        key={`link-${partIndex}`}
                        onClick={() => navigateToPage(part.target)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium underline underline-offset-4 transition-colors"
                      >
                        {part.label}
                      </button>
                    );
                  }
                  // Render text part with inline markdown (strip p tags)
                  return (
                    <ReactMarkdown
                      key={`text-${partIndex}`}
                      rehypePlugins={[rehypeSanitize]}
                      components={{
                        p: ({ children }) => <>{children}</>,
                      }}
                    >
                      {part.content}
                    </ReactMarkdown>
                  );
                })}
              </p>
            );
          }

          // For lines without links, render normally with ReactMarkdown
          if (line.trim()) {
            return (
              <ReactMarkdown key={lineIndex} rehypePlugins={[rehypeSanitize]}>
                {line}
              </ReactMarkdown>
            );
          }

          // Empty lines
          return <br key={lineIndex} />;
        })}
      </div>
      {links && links.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {links.map((link, index) => (
            <LinkButton key={index} label={link.label} action={link.action} />
          ))}
        </div>
      )}
    </div>
  );
}

function LinkButton({ label, action }: { label: string; action: any }) {
  const handleClick = useClickAction(action);

  return (
    <button
      onClick={handleClick}
      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium underline underline-offset-4 transition-colors"
    >
      {label}
    </button>
  );
}

import { TextWithLinksSection as TextWithLinksSectionType } from '@/lib/template-types';
import { useClickAction } from '@/hooks/useClickAction';

export function TextWithLinksSection({ content, links }: TextWithLinksSectionType) {
  return (
    <div className="space-y-4">
      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
        {content}
      </p>
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

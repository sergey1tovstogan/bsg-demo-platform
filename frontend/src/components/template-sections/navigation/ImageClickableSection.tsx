import { ImageClickableSection as ImageClickableSectionType } from '@/lib/template-types';
import { useClickAction } from '@/hooks/useClickAction';

export function ImageClickableSection({
  src,
  alt,
  action,
  caption
}: ImageClickableSectionType) {
  const handleClick = useClickAction(action);

  return (
    <figure className="w-full">
      <button
        onClick={handleClick}
        className="block w-full rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-auto hover:scale-105 transition-transform duration-300"
        />
      </button>
      {caption && (
        <figcaption className="mt-2 text-sm text-center text-slate-600 dark:text-slate-400 italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

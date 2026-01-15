import { ImageSection as ImageSectionType } from '@/lib/template-types';

export function ImageSection({
  src,
  alt,
  caption,
  width = 'full'
}: ImageSectionType) {
  const widthClass = {
    full: 'w-full',
    half: 'w-1/2',
    third: 'w-1/3',
  }[width];

  return (
    <figure className={`${widthClass} mx-auto`}>
      <img
        src={src}
        alt={alt}
        className="rounded-xl shadow-md w-full h-auto"
      />
      {caption && (
        <figcaption className="mt-2 text-sm text-center text-slate-600 dark:text-slate-400 italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

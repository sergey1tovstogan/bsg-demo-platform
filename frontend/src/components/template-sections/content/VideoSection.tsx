import { VideoSection as VideoSectionType } from '@/lib/template-types';

export function VideoSection({
  src,
  caption,
  aspect_ratio = '16:9'
}: VideoSectionType) {
  const aspectClass = {
    '16:9': 'aspect-video',
    '4:3': 'aspect-[4/3]',
    '1:1': 'aspect-square',
  }[aspect_ratio];

  return (
    <figure className="w-full">
      <div className={`relative ${aspectClass} rounded-xl overflow-hidden shadow-md bg-slate-100 dark:bg-slate-800`}>
        <iframe
          src={src}
          className="absolute inset-0 w-full h-full"
          allowFullScreen
          title={caption || 'Video content'}
        />
      </div>
      {caption && (
        <figcaption className="mt-2 text-sm text-center text-slate-600 dark:text-slate-400 italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

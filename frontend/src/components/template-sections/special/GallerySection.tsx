import { GallerySection as GallerySectionType } from '@/lib/template-types';

export function GallerySection({ images, columns = 3 }: GallerySectionType) {
  const columnClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  }[columns];

  return (
    <div className={`grid ${columnClass} gap-4`}>
      {images.map((image, index) => (
        <figure key={index} className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-shadow">
          <img
            src={image.src}
            alt={image.alt}
            className="w-full h-auto object-cover aspect-square group-hover:scale-105 transition-transform duration-300"
          />
          {image.caption && (
            <figcaption className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white text-sm">
              {image.caption}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}

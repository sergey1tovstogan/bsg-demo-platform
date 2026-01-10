import { GallerySection as GallerySectionType } from '@/lib/template-types';

export function GallerySection({ images, columns = 3 }: GallerySectionType) {
  const columnClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  }[columns];

  // Get hover effect classes for images
  const getImageHoverClasses = (hoverEffect?: string): string => {
    switch (hoverEffect) {
      case 'zoom':
        return 'group-hover:scale-105';
      case 'brightness':
        return 'group-hover:brightness-110';
      case 'border':
        // Border effect handled at figure level
        return '';
      default:
        // Default zoom effect
        return 'group-hover:scale-105';
    }
  };

  // Get hover effect classes for figure container
  const getFigureHoverClasses = (hoverEffect?: string): string => {
    switch (hoverEffect) {
      case 'border':
        return 'hover:ring-2 hover:ring-blue-400 hover:ring-opacity-50';
      case 'lift':
        return 'hover:-translate-y-1 hover:shadow-xl';
      case 'glow':
        return 'hover:ring-2 hover:ring-blue-400 hover:ring-opacity-50 hover:shadow-lg';
      default:
        return 'hover:shadow-lg';
    }
  };

  return (
    <div className={`grid ${columnClass} gap-4`}>
      {images.map((image, index) => (
        <figure
          key={index}
          className={`group relative overflow-hidden rounded-xl shadow-md transition-all duration-200 ${getFigureHoverClasses(image.hover_effect)}`}
        >
          <img
            src={image.src}
            alt={image.alt}
            className={`w-full h-auto object-cover aspect-square transition-transform duration-300 ${getImageHoverClasses(image.hover_effect)}`}
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

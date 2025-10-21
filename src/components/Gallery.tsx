import { useEffect, useState } from 'react';

// Galería de imágenes con React
interface GalleryImage {
  id: number;
  url: string;
  alt: string;
}

const images: GalleryImage[] = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?q=80&w=1600&auto=format&fit=crop',
    alt: 'Niños celebrando un gol'
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1600&auto=format&fit=crop',
    alt: 'Entrenamiento de equipo'
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?q=80&w=1600&auto=format&fit=crop',
    alt: 'Compañerismo entre jugadores'
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=1600&auto=format&fit=crop',
    alt: 'Partido juvenil'
  },
  {
    id: 5,
    url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1600&auto=format&fit=crop',
    alt: 'Ejercicios de habilidad'
  },
  {
    id: 6,
    url: 'https://images.unsplash.com/photo-1489944440615-453fc2b866a9?q=80&w=1600&auto=format&fit=crop',
    alt: 'Alegría del fútbol infantil'
  },
  {
    id: 7,
    url: 'https://images.unsplash.com/photo-1624880357913-a8539238245b?q=80&w=1600&auto=format&fit=crop',
    alt: 'Entrenamiento táctico'
  },
  {
    id: 8,
    url: 'https://images.unsplash.com/photo-1542766788-a2f588e447ee?q=80&w=1600&auto=format&fit=crop',
    alt: 'Momento de equipo'
  },
  {
    id: 9,
    url: 'https://images.unsplash.com/photo-1577223625816-7546f8d0d117?q=80&w=1600&auto=format&fit=crop',
    alt: 'Celebración del equipo'
  }
];

const buildSrcSet = (url: string) => {
  if (!url.includes('w=1600')) {
    return undefined;
  }

  return [
    url.replace('w=1600', 'w=600') + ' 600w',
    url.replace('w=1600', 'w=900') + ' 900w',
    url + ' 1600w'
  ].join(', ');
};

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setPrefersReducedMotion(event.matches);
    };

    handleChange(mediaQuery);

    const listener = (event: MediaQueryListEvent) => handleChange(event);
    mediaQuery.addEventListener('change', listener);

    return () => {
      mediaQuery.removeEventListener('change', listener);
    };
  }, []);

  const openLightbox = (image: GalleryImage) => {
    setSelectedImage(image);
    setIsOpen(true);
  };

  const closeLightbox = () => {
    setIsOpen(false);
    setSelectedImage(null);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (!selectedImage) return;
    
    const currentIndex = images.findIndex(img => img.id === selectedImage.id);
    let newIndex: number;
    
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % images.length;
    } else {
      newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    }
    
    setSelectedImage(images[newIndex]);
  };

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = '';
      return;
    }

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeLightbox();
      }

      if (event.key === 'ArrowRight') {
        navigateImage('next');
      }

      if (event.key === 'ArrowLeft') {
        navigateImage('prev');
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, selectedImage]);

  return (
    <section id="galeria" className="py-20 bg-pfc-black">
      <div className="container mx-auto px-4">
        {/* Título de la sección */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Vive la <span className="text-pfc-red">Pasión</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Momentos que inspiran y transforman vidas
          </p>
          <div className="w-24 h-1 bg-pfc-red mx-auto mt-6"></div>
        </div>

        {/* Grid de imágenes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {images.map((image, index) => {
            const animationStyles = prefersReducedMotion
              ? undefined
              : {
                  animationDelay: `${index * 0.1}s`,
                  opacity: 0,
                  animation: 'fadeIn 0.6s ease-out forwards'
                } as const;

            return (
              <button
                type="button"
                key={image.id}
                className="group relative overflow-hidden rounded-xl shadow-lg cursor-pointer aspect-square focus:outline-none focus-visible:ring-4 focus-visible:ring-pfc-red/60"
                onClick={() => openLightbox(image)}
                style={animationStyles}
                aria-label={`Ver imagen: ${image.alt}`}
              >
                <img
                  src={image.url}
                  srcSet={buildSrcSet(image.url)}
                  sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 90vw"
                  alt={image.alt}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-pfc-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white font-semibold">{image.alt}</p>
                  </div>
                </div>
                {/* Ícono de zoom */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-pfc-red rounded-full p-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                    </svg>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Lightbox Modal */}
        {isOpen && selectedImage && (
          <div
            className="fixed inset-0 z-[100] bg-black bg-opacity-95 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            {/* Botón cerrar */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white hover:text-pfc-red transition-colors z-10"
              aria-label="Cerrar"
            >
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Botón anterior */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateImage('prev');
              }}
              className="absolute left-4 text-white hover:text-pfc-red transition-colors z-10"
              aria-label="Anterior"
            >
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Imagen */}
            <div
              className="max-w-6xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage.url}
                alt={selectedImage.alt}
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
              <p className="text-white text-center mt-4 text-lg">{selectedImage.alt}</p>
            </div>

            {/* Botón siguiente */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateImage('next');
              }}
              className="absolute right-4 text-white hover:text-pfc-red transition-colors z-10"
              aria-label="Siguiente"
            >
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Indicador de posición */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-4 py-2 rounded-full">
              {images.findIndex(img => img.id === selectedImage.id) + 1} / {images.length}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}


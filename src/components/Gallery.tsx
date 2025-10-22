import { useEffect, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';

// Galería de imágenes con React
type GsapTarget = Element | Element[] | NodeListOf<Element> | string;

interface GsapTween {
  kill: () => void;
  scrollTrigger?: {
    kill: () => void;
  };
}

interface GsapGlobal {
  registerPlugin?: (...plugins: unknown[]) => void;
  fromTo: (
    target: GsapTarget,
    fromVars: Record<string, unknown>,
    toVars: Record<string, unknown>
  ) => GsapTween;
  to: (target: GsapTarget, vars: Record<string, unknown>) => GsapTween;
}

interface ScrollTriggerGlobal {
  getAll: () => Array<{ kill: () => void }>;
}

declare global {
  interface Window {
    gsap?: GsapGlobal;
    ScrollTrigger?: ScrollTriggerGlobal;
  }
}

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

const GSAP_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/';

const headingAnimation = {
  from: { autoAlpha: 0, y: 64 },
  to: { autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out' }
};

const subheadingAnimation = {
  from: { autoAlpha: 0, y: 40 },
  to: { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.1 }
};

const underlineAnimation = {
  from: { scaleX: 0, autoAlpha: 0, transformOrigin: 'center center' },
  to: { scaleX: 1, autoAlpha: 1, duration: 0.6, ease: 'power3.out', delay: 0.25 }
};

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false;
    }

    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  const sectionRef = useRef<HTMLElement | null>(null);
  const lightboxRef = useRef<HTMLDivElement | null>(null);
  const animationsRef = useRef<GsapTween[]>([]);
  const gsapReadyRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    setPrefersReducedMotion(mediaQuery.matches);

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }

    if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(handleChange);
      return () => {
        mediaQuery.removeListener(handleChange);
      };
    }
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

  const loadScript = (src: string) =>
    new Promise<void>((resolve, reject) => {
      if (typeof document === 'undefined') {
        resolve();
        return;
      }

      const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);

      if (existing) {
        if (existing.dataset.loaded === 'true') {
          resolve();
          return;
        }

        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener(
          'error',
          () => reject(new Error(`No se pudo cargar ${src}`)),
          { once: true }
        );
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.dataset.loaded = 'false';
      script.onload = () => {
        script.dataset.loaded = 'true';
        resolve();
      };
      script.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
      document.head.appendChild(script);
    });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    animationsRef.current.forEach(animation => {
      animation.scrollTrigger?.kill();
      animation.kill();
    });
    animationsRef.current = [];

    if (prefersReducedMotion) {
      gsapReadyRef.current = false;

      if (sectionRef.current) {
        sectionRef.current.style.setProperty('--glow-x', '0px');
        sectionRef.current.style.setProperty('--glow-y', '0px');
      }

      return;
    }

    let cancelled = false;

    const setupAnimations = async () => {
      try {
        await loadScript(`${GSAP_CDN}gsap.min.js`);
        await loadScript(`${GSAP_CDN}ScrollTrigger.min.js`);
      } catch (error) {
        console.error(error);
        return;
      }

      if (!window.gsap || !sectionRef.current || cancelled) {
        return;
      }

      if (window.ScrollTrigger && window.gsap.registerPlugin) {
        window.gsap.registerPlugin(window.ScrollTrigger);
      }

      const animations: GsapTween[] = [];
      const section = sectionRef.current;

      const heading = section.querySelector('[data-animate="heading"]');
      if (heading) {
        const toVars = {
          ...headingAnimation.to,
          scrollTrigger: window.ScrollTrigger
            ? {
                trigger: section,
                start: 'top 80%'
              }
            : undefined
        };
        animations.push(window.gsap.fromTo(heading, headingAnimation.from, toVars));
      }

      const subheading = section.querySelector('[data-animate="subheading"]');
      if (subheading) {
        const toVars = {
          ...subheadingAnimation.to,
          scrollTrigger: window.ScrollTrigger
            ? {
                trigger: section,
                start: 'top 75%'
              }
            : undefined
        };
        animations.push(window.gsap.fromTo(subheading, subheadingAnimation.from, toVars));
      }

      const underline = section.querySelector('[data-animate="underline"]');
      if (underline) {
        const toVars = {
          ...underlineAnimation.to,
          scrollTrigger: window.ScrollTrigger
            ? {
                trigger: section,
                start: 'top 70%'
              }
            : undefined
        };
        animations.push(window.gsap.fromTo(underline, underlineAnimation.from, toVars));
      }

      const cards = Array.from(section.querySelectorAll<HTMLButtonElement>('[data-animate="card"]'));
      cards.forEach((card, index) => {
        const dataIndex = Number(card.getAttribute('data-card-index'));
        const cardIndex = Number.isNaN(dataIndex) ? index : dataIndex;
        const fromVars = { autoAlpha: 0, y: 64, scale: 0.9 };
        const toVars: Record<string, unknown> = {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          delay: cardIndex * 0.12,
          ease: 'power3.out'
        };

        if (window.ScrollTrigger) {
          toVars.scrollTrigger = {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          };
        }

        animations.push(window.gsap.fromTo(card, fromVars, toVars));
      });

      animationsRef.current = animations;
      gsapReadyRef.current = true;
    };

    setupAnimations();

    return () => {
      cancelled = true;
      gsapReadyRef.current = false;
      animationsRef.current.forEach(animation => {
        animation.scrollTrigger?.kill();
        animation.kill();
      });
      animationsRef.current = [];
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (!isOpen || !lightboxRef.current || prefersReducedMotion || typeof window === 'undefined') {
      return;
    }

    if (!window.gsap) {
      return;
    }

    const tween = window.gsap.fromTo(
      lightboxRef.current,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.35, ease: 'power2.out' }
    );

    return () => {
      tween.kill();
    };
  }, [isOpen, prefersReducedMotion]);

  const handleMouseMove = (event: ReactMouseEvent<HTMLElement>) => {
    if (
      prefersReducedMotion ||
      !gsapReadyRef.current ||
      typeof window === 'undefined' ||
      !sectionRef.current ||
      !window.gsap
    ) {
      return;
    }

    const bounds = sectionRef.current.getBoundingClientRect();
    const relativeX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const relativeY = (event.clientY - bounds.top) / bounds.height - 0.5;

    const offsetX = relativeX * 60;
    const offsetY = relativeY * 60;

    window.gsap.to(sectionRef.current, {
      duration: 0.6,
      ease: 'power3.out',
      '--glow-x': `${offsetX}px`,
      '--glow-y': `${offsetY}px`,
      overwrite: true
    });
  };

  const handleMouseLeave = () => {
    if (!gsapReadyRef.current || typeof window === 'undefined' || !sectionRef.current || !window.gsap) {
      return;
    }

    window.gsap.to(sectionRef.current, {
      duration: 0.8,
      ease: 'power3.out',
      '--glow-x': '0px',
      '--glow-y': '0px',
      overwrite: true
    });
  };

  return (
    <section
      id="galeria"
      ref={sectionRef}
      className="relative overflow-hidden py-20 bg-pfc-black"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ '--glow-x': '0px', '--glow-y': '0px' }}
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-pfc-red/30 blur-3xl"
          style={{ transform: 'translate3d(var(--glow-x), calc(var(--glow-y) * 0.6), 0)' }}
        />
        <div
          className="absolute bottom-10 right-10 h-48 w-48 rounded-full bg-pfc-red/10 blur-3xl"
          style={{ transform: 'translate3d(calc(var(--glow-x) * -0.5), calc(var(--glow-y) * -0.5), 0)' }}
        />
      </div>
      <div className="container relative mx-auto px-4">
        {/* Título de la sección */}
        <div className="text-center mb-16">
          <h2 data-animate="heading" className="text-4xl md:text-5xl font-bold text-white mb-4">
            Vive la <span className="text-pfc-red">Pasión</span>
          </h2>
          <p data-animate="subheading" className="text-xl text-gray-400 max-w-2xl mx-auto">
            Momentos que inspiran y transforman vidas
          </p>
          <div data-animate="underline" className="w-24 h-1 bg-pfc-red mx-auto mt-6"></div>
        </div>

        {/* Grid de imágenes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {images.map((image, index) => (
            <button
              type="button"
              key={image.id}
              data-animate="card"
              data-card-index={index}
              className="group relative overflow-hidden rounded-xl shadow-lg cursor-pointer aspect-square focus:outline-none focus-visible:ring-4 focus-visible:ring-pfc-red/60"
              onClick={() => openLightbox(image)}
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 114 0zM10 7v6m3-3H7" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Lightbox Modal */}
        {isOpen && selectedImage && (
          <div
            ref={lightboxRef}
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
              onClick={event => {
                event.stopPropagation();
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
            <div className="max-w-6xl max-h-[90vh]" onClick={event => event.stopPropagation()}>
              <img
                src={selectedImage.url}
                alt={selectedImage.alt}
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
              <p className="text-white text-center mt-4 text-lg">{selectedImage.alt}</p>
            </div>

            {/* Botón siguiente */}
            <button
              onClick={event => {
                event.stopPropagation();
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

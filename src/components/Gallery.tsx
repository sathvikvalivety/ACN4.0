import { useState } from 'react';
import { motion } from 'framer-motion';
// Removed unused ChevronLeft, ChevronRight imports


import img1 from '../images/1st.JPG';
import img2 from '../images/2nd.jpg';
import img3 from '../images/3rd.jpg';
import img4 from '../images/conclave.jpg';

const localImages = [img1, img2, img3, img4];

import { useEffect, useRef } from 'react';

const Gallery = () => {
  const [centerIndex, setCenterIndex] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const nextImage = () => {
    if (isSliding) return;
    setIsSliding(true);
    setTimeout(() => {
      setCenterIndex((prev) => (prev + 1) % localImages.length);
      setIsSliding(false);
    }, 600); // Animation duration
  };

  // Removed prevImage function (no arrows)

  // Auto-slide effect with pause
  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      nextImage();
    }, 3000); // Pause in center for 3s
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [centerIndex]);

  return (
    <section id="gallery" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Event Gallery
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Capturing moments of learning, networking, and cybersecurity excellence
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 relative">
          <div
            className="relative flex items-center justify-center w-full overflow-hidden"
            style={{ minHeight: '320px', maxWidth: '100%' }}
          >
            {/* Left Preview (desktop only) */}
            <div className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-0 w-1/3 justify-end">
              <motion.img
                key={`left-${centerIndex}`}
                src={localImages[(centerIndex - 1 + localImages.length) % localImages.length]}
                alt="Previous"
                initial={{ x: -400, opacity: 0.3, scale: 0.7 }}
                animate={{ x: -180, opacity: 0.5, scale: 1 }}
                exit={{ x: -400, opacity: 0.3, scale: 0.7 }}
                transition={{ type: 'spring', stiffness: 200, damping: 30 }}
                className="rounded-xl object-contain shadow-md bg-white"
                style={{ width: '220px', height: '160px', filter: 'blur(1px)' }}
              />
            </div>

            {/* Center Main Image (always visible, animated for both mobile and desktop) */}
            <div className="flex justify-center items-center w-full z-10">
              <motion.img
                key={`center-${centerIndex}`}
                src={localImages[centerIndex]}
                alt={`Gallery image ${centerIndex + 1}`}
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="rounded-2xl object-contain shadow-xl bg-white"
                style={{
                  width: '100%',
                  maxWidth: window.innerWidth < 640 ? '320px' : '600px',
                  height: 'auto',
                  maxHeight: '90vh',
                  aspectRatio: '4/3',
                  display: 'block',
                }}
              />
            </div>

            {/* Right Preview (desktop only) */}
            <div className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-0 w-1/3 justify-start">
              <motion.img
                key={`right-${centerIndex}`}
                src={localImages[(centerIndex + 1) % localImages.length]}
                alt="Next"
                initial={{ x: 400, opacity: 0.3, scale: 0.7 }}
                animate={{ x: 180, opacity: 0.5, scale: 1 }}
                exit={{ x: 400, opacity: 0.3, scale: 0.7 }}
                transition={{ type: 'spring', stiffness: 200, damping: 30 }}
                className="rounded-2xl object-contain shadow-md bg-white"
                style={{ width: '220px', height: '160px', filter: 'blur(1px)' }}
              />
            </div>
          </div>
        </div>

        <div className="text-center mt-8 text-gray-500">
          {centerIndex + 1} / {localImages.length}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
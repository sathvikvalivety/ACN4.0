import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import "@fontsource/poppins/400.css"; // Regular
import "@fontsource/poppins/600.css"; // SemiBold
import "@fontsource/poppins/700.css"; // Bold


const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [timeLeft, setTimeLeft] = useState({
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const slides = [
    {
      id: 4,
      title: "ACN 4th Edition",
      subtitle: "The Future Unfolds",
      description: "Join us for the most anticipated cybersecurity event of 2025",
      image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      duration: 10000,
      year: "2025",
      hasCountdown: true
    },
    {
      id: 3,
      title: "ACN 3rd Edition",
      subtitle: "Current Excellence",
      description: "The present milestone - 1000+ participants, cutting-edge cybersecurity insights",
      image: "/src/images/conclave.jpg",
      duration: 5000,
      year: "2024"
    },
    {
      id: 2,
      title: "ACN 2nd Edition", 
      subtitle: "Building Momentum",
      description: "Expanded horizons - 750+ participants, international speakers, advanced workshops",
      image: "/src/images/2nd.jpg",
      duration: 5000,
      year: "2023"
    },
    {
      id: 1,
      title: "ACN 1st Edition",
      subtitle: "The Beginning of Excellence",
      description: "Where it all started - 500+ participants, 12 sessions of cybersecurity awareness",
      image: "/src/images/1st.jpg",
      duration: 5000,
      year: "2022"
    }
  ];

  
  // Countdown timer logic
  useEffect(() => {
    if (slides[currentSlide].hasCountdown) {
      const targetYear = slides[currentSlide].year === '2025' ? '2025-09-16T08:00:00' : '2024-12-31T23:59:59';
      const targetDate = new Date(targetYear).getTime();
      
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const difference = targetDate - now;

        if (difference > 0) {
          const months = Math.floor(difference / (1000 * 60 * 60 * 24 * 30));
          const days = Math.floor((difference % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
          const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((difference % (1000 * 60)) / 1000);

          setTimeLeft({ months, days, hours, minutes, seconds });
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentSlide]);

  // Auto-advance slides
  useEffect(() => {
    const advanceSlide = () => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const timer = setTimeout(advanceSlide, slides[currentSlide].duration || 5000);

    return () => clearTimeout(timer);
  }, [currentSlide]);
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  const goToSlide = (index: number) => setCurrentSlide(index);

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Slide Images */}
      <div className="relative h-full w-full">
        {slides.map((slide, index) => (
          <motion.div
            key={slide.id}
            className="absolute inset-0 w-full h-full"
            initial={false}
            animate={{ x: `${(index - currentSlide) * 100}%` }}
            transition={{ type: "tween", duration: 0.6, ease: "easeInOut" }}
          >
            {/* Background Image */}
            <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/50" />

            {/* Content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white max-w-4xl mx-auto px-6">
                
                {/* Year + SVG Badge */}
                <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4 space-x-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-calendar w-4 h-4 sm:w-5 sm:h-5 text-custom-burgundy"
                  >
                    <path d="M8 2v4"></path>
                    <path d="M16 2v4"></path>
                    <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                    <path d="M3 10h18"></path>
                  </svg>
                  <span className="text-sm font-semibold">{slide.year}</span>
                </div>


                {/* Slide Title */}
                <h1 className="text-4xl md:text-6xl font-poppins font-bold mb-4">{slide.title}</h1>
                <h2 className="text-xl md:text-2xl font-poppins font-semibold text-blue-200 mb-4">{slide.subtitle}</h2>
                <p className="text-lg text-white/90 max-w-2xl mx-auto leading-relaxed mb-8">{slide.description}</p>
                                {/* Countdown Timer */}
                {slide.hasCountdown && (
                  <motion.div
                    className="mb-6 sm:mb-8 w-full px-2"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.9 }}
                  >
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 sm:p-4 w-full max-w-2xl mx-auto">
                      <h3 className="text-custom-burgundy text-base sm:text-lg font-semibold font-roboto mb-3 sm:mb-4">
                        Event Countdown
                      </h3>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-4">
                        {[
                          { label: 'Months', value: timeLeft.months },
                          { label: 'Days', value: timeLeft.days },
                          { label: 'Hours', value: timeLeft.hours },
                          { label: 'Mins', value: timeLeft.minutes },
                          { label: 'Secs', value: timeLeft.seconds }
                        ].map((item, index) => (
                          <motion.div
                            key={item.label}
                            className="text-center"
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 1, repeat: Infinity, delay: index * 0.1 }}
                          >
                            <div className="text-lg sm:text-xl md:text-2xl font-bold font-roboto text-white">
                              {item.value.toString().padStart(2, '0')}
                            </div>
                            <div className="text-custom-burgundy text-xs sm:text-sm">{item.label}</div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button className="px-8 py-3 bg-white text-gray-900 font-bold rounded-full hover:bg-gray-100 transition-colors duration-300">
                    Explore Events
                  </button>
                  <button className="px-8 py-3 bg-transparent text-white font-bold rounded-full border-2 border-white hover:bg-white hover:text-gray-900 transition-all duration-300">
                    Register Now
                  </button>
                </div>

              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Navigation Controls */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 p-3 bg-white/20 hover:bg-white/30 text-white rounded-full backdrop-blur-sm transition-colors duration-300"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-3 bg-white/20 hover:bg-white/30 text-white rounded-full backdrop-blur-sm transition-colors duration-300"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Navigation Dots */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentSlide === index ? 'bg-[#b22049] scale-125' : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20">
        <motion.div
          className="h-full bg-[#b22049]"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: (slides[currentSlide].duration || 5000) / 1000, ease: 'linear' }}
          key={currentSlide}
        />
      </div>
    </section>
  );
};

export default Hero;
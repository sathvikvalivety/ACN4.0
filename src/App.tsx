import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import GuestsCarousel from './components/GuestsCarousel';
import About from './components/About';
import PreviousGuests from './components/PreviousGuests';
import Editions from './components/Editions';
import Sponsors from './components/Sponsors';
import Gallery from './components/Gallery';
import Footer from './components/Footer';

function App() {
  useEffect(() => {
    // Smooth scrolling for the entire page
    document.documentElement.style.scrollBehavior = 'smooth';
    
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <motion.div 
      className="min-h-screen bg-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Navbar />
      <Hero />
      <GuestsCarousel />
      <About />
      <PreviousGuests />
      <Editions />
      <Sponsors />
      <Gallery />
      <Footer />
    </motion.div>
  );
}

export default App;
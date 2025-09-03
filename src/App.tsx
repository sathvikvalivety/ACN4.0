import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLocation, Routes, Route, Outlet } from "react-router-dom";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
//import GuestsCarousel from "./components/GuestsCarousel";
import PreviousGuests from "./components/PreviousGuests";
import Editions from "./components/Editions";
import Sponsors from "./components/Sponsors";
import Gallery from "./components/Gallery";
import Footer from "./components/Footer";
import Loader from "./components/Preloader";
import SponsorsPage from "./components/SponsorsPage";

// Layout wrapper for pages that share Navbar & Footer
function AppLayout() {
  return (
    <motion.div
      className="min-h-screen bg-deepNavy"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Navbar />
      <Outlet /> {/* 👈 page content swaps here */}
      <Footer />
    </motion.div>
  );
}

function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <PreviousGuests />
      <Editions />
      <Sponsors />
      <Gallery />
    </>
  );
}

function App() {
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const root = document.documentElement;
    root.style.scrollBehavior = "smooth";
    root.classList.add("home-no-xoverflow");
    return () => {
      root.style.scrollBehavior = "auto";
      root.classList.remove("home-no-xoverflow");
    };
  }, []);

  if (loading && isHomePage) {
    return <Loader onFinish={() => setLoading(false)} />;
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/sponsors" element={<SponsorsPage />} />
      </Route>
    </Routes>
  );
}

export default App;

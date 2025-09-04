import React from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Calendar,
  Clock,
  Users,
  ArrowUp,
  ExternalLink,
  Copy,
} from "lucide-react";

import COVERURL from '../images/Welcome.png';

// --- NOTES -------------------------------------------------------------
// • Enhanced with sophisticated animations and design
// • Staggered entrance animations for each section
// • Advanced hover effects and micro-interactions
// • Fully responsive, works on mobile and desktop
// ----------------------------------------------------------------------

const FOOTER_LINKS = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Events", href: "#events" },
  { name: "Gallery", href: "#gallery" },
  { name: "Contact", href: "#contact" },
];

const SOCIALS = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
];

const VENUE = {
  title: "Amrita Vishwa Vidyapeetham",
  subtitle: "Chennai Campus",
  address: [
    "Amrita Vishwa Vidyapeetham",
    "Vengal Village, Chennai - 601103",
    "Tamil Nadu, India",
  ],
  mapUrl: "https://maps.app.goo.gl/Jti2HcuEjwC52BYL9",
  coverSrc: COVERURL,
  mapImgSrc: "/src/images/maps.png",
  event: {
    name: "ACN 4th Edition",
    dateRange: "16–20 Sep 2025",
    time: "9:00 AM – 6:00 PM",
    expected: "1000+ Participants",
  },
};

const embedSrc = "https://maps.google.com/maps?&q=13.2629694,80.0274183&z=17&output=embed";

function scrollToHash(href) {
  if (!href?.startsWith("#")) return;
  const el = document.querySelector(href);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const socialVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

const floatingAnimation = {
  y: [-2, 2, -2],
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

const pulseGlow = {
  boxShadow: [
    "0 0 20px rgba(16, 185, 129, 0.3)",
    "0 0 30px rgba(16, 185, 129, 0.5)",
    "0 0 20px rgba(16, 185, 129, 0.3)",
  ],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="relative text-white selection:bg-white/20 overflow-hidden m-0"
      aria-labelledby="site-footer-heading"
    >
      <h2 id="site-footer-heading" className="sr-only">
        Site Footer
      </h2>

      {/* Enhanced gradient backdrop */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-black" />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/20 via-transparent to-blue-900/10" />
      </div>

      {/* Animated grid pattern */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.03]"
        animate={{ 
          backgroundPosition: ["0% 0%", "100% 100%"],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "linear",
        }}
      >
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="enhanced-dots"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="1.5" fill="white" />
              <circle cx="30" cy="30" r="0.8" fill="white" opacity="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#enhanced-dots)" />
        </svg>
      </motion.div>

      {/* Enhanced top border wave */}
      <motion.div 
        aria-hidden="true" 
        className="absolute -top-6 left-0 right-0 -z-10"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, ease: "easeInOut" }}
      >
        <svg
          viewBox="0 0 1440 120"
          className="h-12 w-full"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M0,48 C240,96 480,0 720,24 C960,48 1200,144 1440,96 L1440,0 L0,0 Z"
            className="fill-gradient-to-r from-slate-800 to-gray-900"
            fill="url(#waveGradient)"
          />
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(30, 41, 59)" />
              <stop offset="50%" stopColor="rgb(17, 24, 39)" />
              <stop offset="100%" stopColor="rgb(0, 0, 0)" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <motion.div 
          className="flex flex-col-reverse gap-12 lg:grid lg:grid-cols-2 lg:gap-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Left: Enhanced Venue Card */}
          <motion.section
            variants={itemVariants}
            className="group relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl shadow-2xl overflow-hidden"
          >
            {/* Animated border glow */}
            <motion.div 
              className="absolute inset-0 rounded-3xl"
              animate={pulseGlow}
            />
            
            {/* Side by Side: Map and Welcome Image */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 m-6 mt-6">
              {/* Enhanced Map Container */}
              <motion.div 
                className="rounded-2xl overflow-hidden border border-white/20 bg-gradient-to-br from-white/10 to-white/5 relative"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-800/80 to-gray-800/80 backdrop-blur-sm">
                  <motion.div 
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <motion.div
                      animate={floatingAnimation}
                    >
                      <MapPin className="h-4 w-4 text-emerald-400" />
                    </motion.div>
                    <span className="text-sm font-medium">Campus Map</span>
                  </motion.div>
                  <div className="flex items-center gap-2">
                    <motion.a
                      href={VENUE.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-emerald-300/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 transition-all duration-300"
                      whileHover={{ 
                        scale: 1.05,
                        backgroundColor: "rgba(16, 185, 129, 0.2)",
                        borderColor: "rgba(16, 185, 129, 0.5)",
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </motion.a>
                    <motion.button
                      type="button"
                      onClick={() => {
                        const text = [...VENUE.address].join(", ");
                        if (navigator?.clipboard?.writeText) {
                          navigator.clipboard.writeText(text);
                        }
                      }}
                      className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-200 transition-all duration-300"
                      whileHover={{ 
                        scale: 1.05,
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                      }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="Copy venue address"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </motion.button>
                  </div>
                </div>
                <motion.div 
                  className="relative h-40 sm:h-48 md:h-56"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                >
                  <img
                    src={VENUE.mapImgSrc}
                    alt="Static map preview"
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                  />
                  <iframe
                    title="Amrita Vishwa Vidyapeetham, Chennai — Google Maps"
                    src={embedSrc}
                    className="relative h-full w-full border-0 filter grayscale-[15%] contrast-110 saturate-110"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                </motion.div>
              </motion.div>

              {/* Enhanced Welcome Image */}
              <motion.div 
                className="relative overflow-hidden rounded-2xl group/banner"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.4 }}
              >
                <motion.img
                  src={VENUE.coverSrc}
                  alt={`${VENUE.title} campus`}
                  className="h-40 sm:h-48 md:h-56 w-full object-cover transition-transform duration-700 group-hover/banner:scale-110"
                  loading="lazy"
                  initial={{ scale: 1.1, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-blue-500/10 opacity-0 group-hover/banner:opacity-100 transition-opacity duration-500"
                />
              </motion.div>
            </div>

            {/* Enhanced Venue Details */}
            <motion.div 
              className="p-6"
              variants={itemVariants}
            >
              <motion.ul 
                className="grid gap-4 text-gray-200/90"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {[
                  {
                    icon: MapPin,
                    content: (
                      <div className="text-sm">
                        <p className="text-white font-medium">{VENUE.address[0]}</p>
                        <p className="text-gray-300">{VENUE.address[1]}</p>
                        <p className="text-gray-300">{VENUE.address[2]}</p>
                      </div>
                    ),
                  },
                  {
                    icon: Calendar,
                    content: <span className="text-sm font-medium">{VENUE.event.dateRange}</span>,
                  },
                  {
                    icon: Clock,
                    content: <span className="text-sm">{VENUE.event.time}</span>,
                  },
                  {
                    icon: Users,
                    content: <span className="text-sm">Expected {VENUE.event.expected}</span>,
                  },
                ].map((item, index) => (
                  <motion.li
                    key={index}
                    className="flex items-start gap-4 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
                    variants={socialVariants}
                    whileHover={{ 
                      x: 4,
                      backgroundColor: "rgba(255, 255, 255, 0.08)",
                    }}
                  >
                    <motion.div
                      animate={floatingAnimation}
                      transition={{ delay: index * 0.5, ...floatingAnimation.transition }}
                    >
                      <item.icon className="mt-0.5 h-5 w-5 text-emerald-400 flex-shrink-0" />
                    </motion.div>
                    {item.content}
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
          </motion.section>

          {/* Right: Enhanced Brand + Contact */}
          <motion.section
            variants={itemVariants}
            className="relative"
          >
            {/* Brand Section */}
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <motion.div 
                className="mb-4 flex items-center gap-4"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-300/30"
                  animate={pulseGlow}
                >
                  <Shield className="h-8 w-8 text-emerald-400" />
                </motion.div>
                <div>
                  <motion.h3 
                    className="text-3xl font-bold bg-gradient-to-r from-white via-emerald-200 to-white bg-clip-text text-transparent leading-tight"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                  >
                    Amrita CyberNation
                  </motion.h3>
                  <motion.p 
                    className="text-sm text-emerald-300 font-medium tracking-wide"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                  >
                    4th Edition
                  </motion.p>
                </div>
              </motion.div>

              <motion.p 
                className="max-w-prose text-gray-300/95 leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.6 }}
              >
                Empowering the next generation of cybersecurity professionals
                through cutting-edge education, industry partnerships, and hands-on
                learning experiences.
              </motion.p>
            </motion.div>

            {/* Enhanced Contact Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <motion.h4 
                className="text-xl font-bold mb-6 tracking-wide bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1, duration: 0.5 }}
              >
                Contact
              </motion.h4>
              
              <motion.div 
                className="grid gap-4 text-sm text-gray-300 mb-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {[
                  {
                    href: "mailto:info@amritacybernation.com",
                    icon: Mail,
                    text: "info@amritacybernation.com",
                  },
                  {
                    href: "tel:+914427479999",
                    icon: Phone,
                    text: "+91 44 2747 9999",
                  },
                ].map((contact, index) => (
                  <motion.a
                    key={index}
                    href={contact.href}
                    className="inline-flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 group/contact"
                    variants={socialVariants}
                    whileHover={{ 
                      scale: 1.02,
                      backgroundColor: "rgba(16, 185, 129, 0.1)",
                      borderColor: "rgba(16, 185, 129, 0.3)",
                      x: 4,
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.div
                      animate={floatingAnimation}
                      transition={{ delay: index * 0.3, ...floatingAnimation.transition }}
                    >
                      <contact.icon className="h-5 w-5 text-emerald-400 group-hover/contact:text-emerald-300 transition-colors duration-300" />
                    </motion.div>
                    <span className="font-medium group-hover/contact:text-white transition-colors duration-300">
                      {contact.text}
                    </span>
                  </motion.a>
                ))}
              </motion.div>

              {/* Enhanced Social Links */}
              <motion.div 
                className="flex items-center gap-3"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {SOCIALS.map((social, index) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="relative group grid h-12 w-12 place-items-center rounded-xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm transition-all duration-300 overflow-hidden"
                    variants={socialVariants}
                    whileHover={{ 
                      scale: 1.1,
                      y: -4,
                      backgroundColor: "rgba(16, 185, 129, 0.15)",
                      borderColor: "rgba(16, 185, 129, 0.4)",
                    }}
                    whileTap={{ scale: 0.9 }}
                    custom={index}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    />
                    <social.icon className="h-5 w-5 relative z-10 text-gray-300 group-hover:text-white transition-colors duration-300" />
                    <motion.div
                      className="absolute inset-0 rounded-xl"
                      initial={{ scale: 0 }}
                      whileHover={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                      style={{
                        background: "radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)",
                      }}
                    />
                  </motion.a>
                ))}
              </motion.div>
            </motion.div>
          </motion.section>
        </motion.div>

        {/* Enhanced Bottom Bar */}
        <motion.div
          className="mt-12 border-t border-gradient-to-r from-transparent via-white/20 to-transparent pt-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <div className="flex flex-col items-center justify-between gap-6 text-center text-sm text-gray-400 md:flex-row">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.5 }}
            >
              © {year} Amrita CyberNation. All rights reserved.
            </motion.p>
            <motion.div 
              className="flex flex-wrap items-center gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {[
                { href: "#privacy", text: "Privacy Policy" },
                { href: "#terms", text: "Terms of Service" },
                { href: "#conduct", text: "Code of Conduct" },
              ].map((link, index) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  className="relative transition-all duration-300 hover:text-emerald-300"
                  variants={socialVariants}
                  whileHover={{ y: -2 }}
                >
                  <span className="relative z-10">{link.text}</span>
                  <motion.div
                    className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-emerald-400 to-emerald-300"
                    initial={{ width: 0 }}
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.a>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Enhanced Back to Top Button */}
      <motion.div 
        className="fixed bottom-8 right-8 z-50"
        initial={{ opacity: 0, scale: 0, rotate: -180 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ delay: 2, duration: 0.8, ease: "easeOut" }}
      >
        <motion.button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="group relative grid h-14 w-14 place-items-center rounded-full border border-white/20 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 backdrop-blur-xl text-white shadow-2xl overflow-hidden"
          whileHover={{ 
            scale: 1.1,
            rotate: 360,
          }}
          whileTap={{ scale: 0.9 }}
          animate={{
            boxShadow: [
              "0 0 20px rgba(16, 185, 129, 0.3)",
              "0 0 40px rgba(16, 185, 129, 0.5)",
              "0 0 20px rgba(16, 185, 129, 0.3)",
            ],
          }}
          transition={{
            boxShadow: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            },
            scale: { duration: 0.2 },
            rotate: { duration: 0.6 },
          }}
          aria-label="Back to top"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          />
          <motion.div
            animate={floatingAnimation}
            transition={{ ...floatingAnimation.transition, delay: 2.5 }}
          >
            <ArrowUp className="h-6 w-6 relative z-10" />
          </motion.div>
          
          {/* Ripple effect on hover */}
          <motion.div
            className="absolute inset-0 rounded-full"
            initial={{ scale: 0, opacity: 1 }}
            whileHover={{
              scale: 2,
              opacity: 0,
            }}
            transition={{ duration: 0.6 }}
            style={{
              background: "radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, transparent 70%)",
            }}
          />
        </motion.button>
      </motion.div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-1 w-1 bg-emerald-400/20 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + i * 10}%`,
            }}
            animate={{
              y: [-10, 10, -10],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        ))}
      </div>
    </footer>
  );
}
import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const Sponsors = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const sponsors = [
    { 
      name: 'Microsoft', 
      logo: 'https://logos-world.net/wp-content/uploads/2020/09/Microsoft-Logo.png',
      category: 'Platinum'
    },
    { 
      name: 'Google', 
      logo: 'https://logos-world.net/wp-content/uploads/2020/09/Google-Logo.png',
      category: 'Platinum'
    },
    { 
      name: 'Amazon', 
      logo: 'https://logos-world.net/wp-content/uploads/2020/04/Amazon-Logo.png',
      category: 'Gold'
    },
    { 
      name: 'IBM', 
      logo: 'https://logos-world.net/wp-content/uploads/2020/09/IBM-Logo.png',
      category: 'Gold'
    },
    { 
      name: 'Cisco', 
      logo: 'https://logos-world.net/wp-content/uploads/2020/11/Cisco-Logo.png',
      category: 'Silver'
    },
    { 
      name: 'Intel', 
      logo: 'https://logos-world.net/wp-content/uploads/2020/03/Intel-Logo.png',
      category: 'Silver'
    },
    { 
      name: 'Oracle', 
      logo: 'https://logos-world.net/wp-content/uploads/2020/09/Oracle-Logo.png',
      category: 'Silver'
    },
    { 
      name: 'Salesforce', 
      logo: 'https://logos-world.net/wp-content/uploads/2020/09/Salesforce-Logo.png',
      category: 'Bronze'
    },
  ];

  return (
    <section id="sponsors" className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center space-x-2 bg-accent/20 px-6 py-3 rounded-full mb-6"
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <span className="text-accent font-semibold">Powered By</span>
          </motion.div>
          
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Our <span className="text-accent">Partners</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Collaborating with global technology leaders to advance cybersecurity education and innovation
          </p>
        </motion.div>

        <div className="relative overflow-hidden">
          {/* Gradient Masks */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-900 to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-900 to-transparent z-10" />

          {/* Marquee Container */}
          <motion.div
            className="flex space-x-12 items-center"
            animate={{
              x: [0, -150 * sponsors.length]
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: 'loop',
                duration: 25,
                ease: 'linear'
              }
            }}
            style={{ width: `${300 * sponsors.length}px` }}
          >
            {/* First set of sponsors */}
            {sponsors.map((sponsor, index) => (
              <motion.div
                key={`first-${index}`}
                className="flex-shrink-0 w-48 h-28 bg-white rounded-2xl flex items-center justify-center shadow-2xl group hover:shadow-3xl transition-all duration-500 border border-gray-200 hover:border-accent/30"
                whileHover={{ scale: 1.08, y: -8 }}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="relative w-full h-full p-4 flex items-center justify-center">
                  <img
                    src={sponsor.logo}
                    alt={sponsor.name}
                    className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                </div>
              </motion.div>
            ))}

            {/* Duplicate set for seamless loop */}
            {sponsors.map((sponsor, index) => (
              <motion.div
                key={`second-${index}`}
                className="flex-shrink-0 w-48 h-28 bg-white rounded-2xl flex items-center justify-center shadow-2xl group hover:shadow-3xl transition-all duration-500 border border-gray-200 hover:border-accent/30"
                whileHover={{ scale: 1.08, y: -8 }}
              >
                <div className="relative w-full h-full p-4 flex items-center justify-center">
                  <img
                    src={sponsor.logo}
                    alt={sponsor.name}
                    className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <motion.button
            className="px-10 py-4 bg-gradient-to-r from-accent to-accent/80 text-gray-900 font-bold rounded-full hover:from-accent/90 hover:to-accent/70 transition-all duration-300 shadow-xl hover:shadow-2xl"
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
          >
            Partner With Us
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default Sponsors;
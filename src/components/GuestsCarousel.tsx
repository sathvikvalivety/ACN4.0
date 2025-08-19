import React, { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { User, Building2 } from 'lucide-react';

const GuestsCarousel = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  const guests2024 = [
    { name: 'Rajesh Ganesan', designation: 'Chief Technology Officer', organization: 'ManageEngine' },
    { name: 'Dr. TR Reshmi', designation: 'Professor & Head', organization: 'Department of CSE, Amrita' },
    { name: 'Vinod Senthil T', designation: 'Senior Security Consultant', organization: 'Infosys' },
    { name: 'Aravind Gnanabaskaran', designation: 'Cybersecurity Expert', organization: 'TCS' },
    { name: 'Priya Sharma', designation: 'CISO', organization: 'Wipro Technologies' },
    { name: 'Karthik Krishnan', designation: 'Security Architect', organization: 'HCL Technologies' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            2024 Distinguished Guests
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join us as we welcome industry leaders and cybersecurity experts from across the globe
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {guests2024.map((guest, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group"
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6 mx-auto group-hover:bg-primary/20 transition-colors duration-300">
                <User className="w-8 h-8 text-primary" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
                {guest.name}
              </h3>
              
              <p className="text-accent font-semibold mb-2 text-center">
                {guest.designation}
              </p>
              
              <div className="flex items-center justify-center text-gray-600">
                <Building2 className="w-4 h-4 mr-2" />
                <span className="text-sm">{guest.organization}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default GuestsCarousel;
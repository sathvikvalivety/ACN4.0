import React, { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Search, User, Star, Award } from 'lucide-react';

const PreviousGuests = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [searchTerm, setSearchTerm] = useState('');

  const previousGuests = [
    { name: 'Dr. Anand Kumar', year: '2023', organization: 'IIT Madras', expertise: 'AI Security', image: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg' },
    { name: 'Sanjay Katkar', year: '2023', organization: 'Quick Heal Technologies', expertise: 'Malware Analysis', image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg' },
    { name: 'Rakesh Krishnan', year: '2023', organization: 'Infosys Cyber Defense', expertise: 'Threat Intelligence', image: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg' },
    { name: 'Dr. Prabaharan Poornachandran', year: '2022', organization: 'Amrita Vishwa Vidyapeetham', expertise: 'Cyber Forensics', image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg' },
    { name: 'Amit Sharma', year: '2022', organization: 'Microsoft India', expertise: 'Cloud Security', image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg' },
    { name: 'Priya Nair', year: '2022', organization: 'Cisco Systems', expertise: 'Network Security', image: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg' },
    { name: 'Venkatesh Sundar', year: '2023', organization: 'Zoho Corporation', expertise: 'Data Protection', image: 'https://images.pexels.com/photos/1043473/pexels-photo-1043473.jpeg' },
    { name: 'Dr. M. Sethumadhavan', year: '2022', organization: 'DRDO', expertise: 'Cryptography', image: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg' },
    { name: 'Kiran Maraju', year: '2023', organization: 'McAfee', expertise: 'Endpoint Security', image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg' },
    { name: 'Deepa Srinivasan', year: '2022', organization: 'IBM Security', expertise: 'Risk Management', image: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg' },
    { name: 'Rajesh Ganesan', year: '2023', organization: 'ManageEngine', expertise: 'IT Security', image: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg' },
    { name: 'Vinod Senthil T', year: '2023', organization: 'Infosys', expertise: 'Security Consulting', image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg' },
    { name: 'Aravind Gnanabaskaran', year: '2023', organization: 'TCS', expertise: 'Cybersecurity Expert', image: 'https://images.pexels.com/photos/1043473/pexels-photo-1043473.jpeg' },
    { name: 'Suresh Kumar', year: '2022', organization: 'Wipro', expertise: 'Blockchain Security', image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg' },
    { name: 'Meera Krishnan', year: '2022', organization: 'HCL Technologies', expertise: 'Security Architecture', image: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg' }
  ];

  const filteredGuests = previousGuests.filter(guest =>
    guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.expertise.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-gray-100 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center space-x-2 bg-primary/10 px-4 py-2 rounded-full mb-4"
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Star className="w-5 h-5 text-primary" />
            <span className="text-primary font-semibold">Hall of Fame</span>
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Previous Edition Legends
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Celebrating the cybersecurity pioneers who shaped our journey
          </p>

          {/* Enhanced Search Bar */}
          <motion.div 
            className="relative max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, organization, or expertise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all duration-300 bg-white shadow-lg"
            />
          </motion.div>
        </motion.div>

        {/* Horizontal Scrolling Container */}
        <div className="relative">
          {/* Gradient Masks */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none" />

          {/* Scrolling Animation Container */}
          <motion.div
            className="flex space-x-6 pb-4"
            animate={{
              x: [0, -50 * filteredGuests.length]
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: 'loop',
                duration: filteredGuests.length * 3,
                ease: 'linear'
              }
            }}
            style={{ width: `${300 * filteredGuests.length * 2}px` }}
          >
            {/* First set of guests */}
            {filteredGuests.map((guest, index) => (
              <motion.div
                key={`first-${index}`}
                className="flex-shrink-0 w-80 bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 group border border-gray-100 hover:border-primary/20"
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ 
                  y: -10, 
                  scale: 1.02,
                  boxShadow: "0 25px 50px -12px rgba(178, 32, 73, 0.25)"
                }}
              >
                <div className="text-center">
                  <motion.div 
                    className="w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden group-hover:scale-110 transition-transform duration-300 shadow-lg"
                    whileHover={{ rotate: 5 }}
                  >
                    <img 
                      src={guest.image} 
                      alt={guest.name}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                  
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-primary transition-colors duration-300 text-center">
                      {guest.name}
                    </h3>
                    
                    <p className="text-accent font-semibold mb-2 text-sm text-center">
                      {guest.expertise}
                    </p>
                    
                    <p className="text-gray-600 text-sm mb-3 text-center">
                      {guest.organization}
                    </p>
                    
                    <div className="flex items-center justify-center space-x-3">
                      <span className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                        <Award className="w-3 h-3 mr-1" />
                        {guest.year}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Duplicate set for seamless loop */}
            {filteredGuests.map((guest, index) => (
              <motion.div
                key={`second-${index}`}
                className="flex-shrink-0 w-80 bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 group border border-gray-100 hover:border-primary/20"
                whileHover={{ 
                  y: -10, 
                  scale: 1.02,
                  boxShadow: "0 25px 50px -12px rgba(178, 32, 73, 0.25)"
                }}
              >
                <div className="text-center">
                  <motion.div 
                    className="w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden group-hover:scale-110 transition-transform duration-300 shadow-lg"
                    whileHover={{ rotate: 5 }}
                  >
                    <img 
                      src={guest.image} 
                      alt={guest.name}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                  
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-primary transition-colors duration-300 text-center">
                      {guest.name}
                    </h3>
                    
                    <p className="text-accent font-semibold mb-2 text-sm text-center">
                      {guest.expertise}
                    </p>
                    
                    <p className="text-gray-600 text-sm mb-3 text-center">
                      {guest.organization}
                    </p>
                    
                    <div className="flex items-center justify-center space-x-3">
                      <span className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                        <Award className="w-3 h-3 mr-1" />
                        {guest.year}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {filteredGuests.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg">No guests found matching your search.</p>
            <p className="text-gray-400 text-sm mt-2">Try searching with different keywords</p>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default PreviousGuests;
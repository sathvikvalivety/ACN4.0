
import React from "react";
import { motion } from "framer-motion";

// Example sponsor logos (replace with actual paths or URLs)
import gold1 from "../images/Sponsors/Ashok_Leyland.png";
import gold2 from "../images/Sponsors/Innspark.png";
import gold3 from "../images/Sponsors/CISAI.png";
import gold4 from "../images/Sponsors/CUB.png";
import gold5 from "../images/Sponsors/Hack_The_Box.png";

import event1 from "../images/Sponsors/Ashok_Leyland.png";
import event2 from "../images/Sponsors/Wipro.png";
import event3 from "../images/Sponsors/Hack_The_Box.png";
import event4 from "../images/Sponsors/Innspark.png";
import event5 from "../images/Sponsors/ISEA.png";
import event6 from "../images/Sponsors/Manag_Engine.png";
import event7 from "../images/Sponsors/MRF.jpg";
import event8 from "../images/Sponsors/Quick_Heal.png";
import event9 from "../images/Sponsors/Skills_Da.png";
import event10 from "../images/Sponsors/TCS.png";

const SponsorsPage = () => {
  const goldSponsors = [gold1, gold2, gold3, gold4, gold5];
  const eventSupporters = [
    event1,
    event2,
    event3,
    event4,
    event5,
    event6,
    event7,
    event8,
    event9,
    event10,
  ];

  // Animation variants for entrance and hover
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.4,
        ease: "easeOut",
      },
    }),
    hover: {
      scale: 1.06,
      rotate: 1,
      boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.15)",
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="min-h-[50rem] bg-gradient-to-br from-gray-800 via-gray-900 to-black pt-24 pb-20 px-4 sm:px-6 lg:px-8 mb-0">
      {/* Title Section */}
      <div className="text-center mb-16 max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl font-extrabold text-white tracking-tight sm:text-6xl"
        >
          Our Sponsors
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto"
        >
          We are grateful for the incredible support from our Gold Sponsors and Event Supporters.
        </motion.p>
      </div>

      {/* Gold Sponsors Section */}
      <section className="mb-20">
        <h2 className="text-3xl font-bold text-yellow-400 mb-10 text-center">
          🌟 Gold Sponsors
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 justify-items-center max-w-6xl mx-auto">
          {goldSponsors.map((logo, idx) => (
            <motion.div
              key={idx}
              custom={idx}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              variants={cardVariants}
              className="bg-gray-800 p-6 rounded-lg shadow-[4px_4px_12px_rgba(0,0,0,0.4),-4px_-4px_12px_rgba(255,255,255,0.05)] flex items-center justify-center w-48 h-32"
            >
              <img
                src={logo}
                alt={`Gold Sponsor ${idx + 1}`}
                className="max-h-20 object-contain"
                loading="lazy"
              />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Event Supporters Section */}
      <section>
        <h2 className="text-3xl font-bold text-blue-400 mb-10 text-center">
          🤝 Event Supporters
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 justify-items-center max-w-6xl mx-auto">
          {eventSupporters.map((logo, idx) => (
            <motion.div
              key={idx}
              custom={idx}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              variants={cardVariants}
              className="bg-gray-800 p-5 rounded-lg shadow-[4px_4px_12px_rgba(0,0,0,0.4),-4px_-4px_12px_rgba(255,255,255,0.05)] flex items-center justify-center w-40 h-24"
            >
              <img
                src={logo}
                alt={`Event Supporter ${idx + 1}`}
                className="max-h-16 object-contain"
                loading="lazy"
              />
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default SponsorsPage;
// ```

// ### Changes Made:
// 1. **Fixed the Error**: Removed the problematic inline SVG background (`bg-[url('data:image/svg+xml,...')]`) that caused the parsing error. Replaced it with a simple Tailwind gradient (`bg-gradient-to-br from-gray-800 via-gray-900 to-black`) to maintain a sleek, dark aesthetic without parser issues.
// 2. **New Design Aesthetic**:
//    - **Background**: A dark gradient for a modern, professional look.
//    - **Cards**: Neumorphic design with subtle shadows (`shadow-[4px_4px_12px_rgba(0,0,0,0.4),-4px_-4px_12px_rgba(255,255,255,0.05)]`) for a tactile feel.
//    - **Typography**: Bold, white headings with `text-yellow-400` and `text-blue-400` accents for Gold Sponsors and Event Supporters, respectively.
//    - **Animations**: Kept Framer Motion animations with a slightly tweaked `cardVariants` (reduced `scale` and `rotate` for subtlety).
// 3. **Responsiveness**: Adjusted grid layouts (`grid-cols-2 sm:grid-cols-3 lg:grid-cols-5`) for better scaling across screen sizes.
// 4. **Accessibility**: Ensured proper `alt` text for images and high-contrast text colors (`text-white`, `text-gray-300`).
// 5. **TypeScript Support**: Added type annotation for the `i` parameter in `cardVariants` to ensure TypeScript compatibility, as the file extension is `.tsx`.

// ### How to Test:
// 1. Replace the `SponsorsPage.tsx` file in your `E:\ACN4.0\src\components\` directory with the above code.
// 2. Ensure all imported image paths (e.g., `../images/Sponsors/Ashok_Leyland.png`) are correct and exist in your project.
// 3. Run your Vite development server (`npm run dev` or equivalent) to verify the component renders without errors.
// 4. Check the console for any warnings about missing images or other issues.

// If you want to reintroduce a patterned background, consider moving the SVG to an external file (e.g., `pattern.svg`) and referencing it via a CSS file or Tailwind configuration to avoid inline parsing issues. For example:
// - Save the SVG as `public/pattern.svg`.
// - Update the CSS to `background-image: url('/pattern.svg')`.

// If you have specific design preferences (e.g., a different color scheme, layout, or background pattern), let me know, and I can tailor another variation!
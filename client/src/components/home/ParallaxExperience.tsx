import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { experiences } from "@/lib/destinations";
import { Button } from "@/components/ui/button";

const ParallaxExperience = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const calculateTranslate = (factor: number) => {
    return scrollY * factor;
  };

  return (
    <section className="relative py-20 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')",
          transform: `translateY(${calculateTranslate(0.05)}px)`,
        }}
      >
        <div className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <h2 className="font-montserrat font-bold text-3xl md:text-4xl text-white mb-4 px-4 py-1">
            Immersive Experiences
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto">
            Discover our collection of unique travel activities designed to create unforgettable memories.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiences.map((experience, index) => (
            <motion.div
              key={experience.id}
              className="bg-white/10 backdrop-blur rounded-xl overflow-hidden border border-white/20 card-hover group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={experience.imageUrl}
                  alt={experience.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div
                  className={`absolute top-4 left-4 text-white text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${
                    experience.category === "Adventure"
                      ? "bg-[#00D1B2]"
                      : experience.category === "Romantic"
                      ? "bg-[#FF9500]"
                      : "bg-primary"
                  }`}
                >
                  {experience.category}
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-montserrat font-bold text-xl text-white mb-2">
                  {experience.title}
                </h3>
                <p className="text-white/70 text-sm mb-4">
                  {experience.description}
                </p>
                <div className="flex justify-between items-center">
                  <div className="text-white/90">
                    <span className="font-bold">${experience.price}</span> / person
                  </div>
                  <Button 
                    className="text-sm px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-full"
                  >
                    Book Activity
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Button
            className="px-6 py-3 bg-white text-primary rounded-full shadow-sm hover:bg-primary hover:text-white border border-white transition-colors"
          >
            View All Experiences
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ParallaxExperience;

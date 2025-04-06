import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { testimonials } from "@/lib/destinations";
import { Button } from "@/components/ui/button";

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleNext = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    scrollToTestimonial((activeIndex + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setActiveIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
    scrollToTestimonial((activeIndex - 1 + testimonials.length) % testimonials.length);
  };

  const scrollToTestimonial = (index: number) => {
    if (containerRef.current) {
      const scrollAmount = containerRef.current.clientWidth / 2;
      containerRef.current.scrollTo({
        left: index * scrollAmount,
        behavior: "smooth"
      });
    }
  };

  const handleIndicatorClick = (index: number) => {
    setActiveIndex(index);
    scrollToTestimonial(index);
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-montserrat font-bold text-3xl md:text-4xl mb-4">What Our Travelers Say</h2>
          <p className="text-gray-700 max-w-2xl mx-auto">
            Hear from our community of travelers who have experienced unforgettable journeys with Voyager.
          </p>
        </motion.div>

        <div className="relative">
          {/* Testimonial Cards Container */}
          <div 
            ref={containerRef}
            className="flex overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide space-x-6"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div 
                key={testimonial.id}
                className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3 snap-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="bg-white rounded-xl shadow-md p-6 h-full">
                  <div className="flex text-yellow-400 mb-4">
                    {Array(Math.floor(testimonial.rating)).fill(0).map((_, i) => (
                      <i key={i} className="fas fa-star"></i>
                    ))}
                    {testimonial.rating % 1 === 0.5 && <i className="fas fa-star-half-alt"></i>}
                  </div>
                  <p className="text-gray-700 mb-6 italic">{testimonial.comment}</p>
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden mr-4">
                      <img 
                        src={testimonial.imageUrl} 
                        alt={testimonial.name} 
                        className="h-full w-full object-cover" 
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <p className="text-gray-700 text-sm">{testimonial.package}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Carousel Controls */}
          <Button
            variant="outline"
            size="icon"
            className="absolute top-1/2 -left-2 transform -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-primary z-10 opacity-75 hover:opacity-100"
            onClick={handlePrev}
          >
            <i className="fas fa-chevron-left"></i>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute top-1/2 -right-2 transform -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-primary z-10 opacity-75 hover:opacity-100"
            onClick={handleNext}
          >
            <i className="fas fa-chevron-right"></i>
          </Button>
        </div>

        {/* Testimonial Indicators */}
        <div className="flex justify-center mt-6 space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === activeIndex ? "bg-primary" : "bg-gray-300 hover:bg-primary/50"
              }`}
              onClick={() => handleIndicatorClick(index)}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

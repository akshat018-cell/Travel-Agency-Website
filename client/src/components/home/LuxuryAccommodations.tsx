import { motion } from "framer-motion";
import { accommodations } from "@/lib/destinations";
import { Button } from "@/components/ui/button";

const LuxuryAccommodations = () => {
  return (
    <section id="accommodations" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-montserrat font-bold text-3xl md:text-4xl mb-4">Luxury Accommodations</h2>
          <p className="text-gray-700 max-w-2xl mx-auto">
            Stay in comfort and style with our handpicked selection of premium hotels and resorts worldwide.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accommodations.map((accommodation, index) => (
            <motion.div
              key={accommodation.id}
              className="bg-white rounded-xl shadow-md overflow-hidden card-hover group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={accommodation.imageUrl}
                  alt={accommodation.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                  <div className="flex items-end">
                    <div>
                      <h3 className="font-playfair text-xl text-white font-semibold">{accommodation.name}</h3>
                      <div className="flex items-center text-white/90 text-sm">
                        <i className="fas fa-map-marker-alt mr-1"></i>
                        <span>{accommodation.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center mb-3">
                  <div className="flex text-yellow-400">
                    {[...Array(Math.floor(accommodation.rating))].map((_, i) => (
                      <i key={i} className="fas fa-star text-sm"></i>
                    ))}
                    {accommodation.rating % 1 >= 0.5 && (
                      <i className="fas fa-star-half-alt text-sm"></i>
                    )}
                    {accommodation.rating % 1 < 0.5 &&
                      accommodation.rating % 1 > 0 && (
                        <i className="far fa-star text-sm"></i>
                      )}
                  </div>
                  <span className="text-gray-700 text-sm ml-1">
                    {accommodation.rating.toFixed(1)} ({accommodation.reviewCount})
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {accommodation.amenities.map((amenity, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {amenity}
                    </span>
                  ))}
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-bold text-gray-900">${accommodation.pricePerNight}</span>
                    <span className="text-gray-700 text-sm"> / night</span>
                  </div>
                  <Button className="text-sm px-4 py-2 bg-primary text-white rounded-full hover:bg-primary/90">
                    Book Now
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Button
            variant="outline"
            className="px-6 py-3 border border-primary text-primary rounded-full shadow-sm hover:bg-primary hover:text-white transition-colors"
          >
            View All Accommodations
          </Button>
        </div>
      </div>
    </section>
  );
};

export default LuxuryAccommodations;

import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Destination, categories } from "@/lib/destinations";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const PopularDestinations = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [filteredDestinations, setFilteredDestinations] = useState<Destination[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All Destinations");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const response = await apiRequest("GET", `/api/destinations`, undefined);
        const data = await response.json();
        setDestinations(data);
        setFilteredDestinations(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching destinations:", error);
        toast({
          title: "Error",
          description: "Failed to load destinations. Please try again later.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    fetchDestinations();
  }, [toast]);

  const handleCategoryChange = async (category: string) => {
    setSelectedCategory(category);
    setLoading(true);
    
    try {
      const response = await apiRequest(
        "GET", 
        `/api/destinations?category=${encodeURIComponent(category)}`, 
        undefined
      );
      const data = await response.json();
      setFilteredDestinations(data);
    } catch (error) {
      console.error("Error filtering destinations:", error);
      toast({
        title: "Error",
        description: "Failed to filter destinations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <section id="destinations" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-montserrat font-bold text-3xl md:text-4xl mb-4">Popular Destinations</h2>
          <p className="text-gray-700 max-w-2xl mx-auto">
            Explore our handpicked selection of the most breathtaking locations around the world, with immersive 3D previews.
          </p>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className={`px-5 py-2 rounded-full shadow-sm ${
                selectedCategory === category 
                  ? "bg-primary text-white" 
                  : "bg-white text-gray-700 border border-gray-200 hover:border-primary hover:text-primary"
              }`}
              onClick={() => handleCategoryChange(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Destination Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div 
                key={n}
                className="bg-white rounded-xl shadow-md overflow-hidden h-96 animate-pulse"
              >
                <div className="h-56 bg-gray-200"></div>
                <div className="p-4 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {filteredDestinations.map((destination) => (
              <motion.div
                key={destination.id}
                className="bg-white rounded-xl shadow-md overflow-hidden card-hover group"
                variants={itemVariants}
              >
                <Link href={`/destinations/${destination.id}`}>
                  <div className="relative h-56 overflow-hidden cursor-pointer">
                    <img
                      src={destination.imageUrl}
                      alt={`${destination.name}, ${destination.country}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                      <div className="flex justify-between items-end">
                        <div>
                          <h3 className="font-playfair text-xl text-white font-semibold">{destination.name}</h3>
                          <div className="flex items-center text-white/90 text-sm">
                            <i className="fas fa-map-marker-alt mr-1"></i>
                            <span>{destination.country}</span>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg px-2 py-1 text-sm font-bold text-primary">
                          ${destination.price}
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <i className="far fa-heart text-primary"></i>
                    </div>
                  </div>
                </Link>
                <div className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center">
                      <div className="flex text-yellow-400">
                        {[...Array(Math.floor(destination.rating))].map((_, i) => (
                          <i key={i} className="fas fa-star text-sm"></i>
                        ))}
                        {destination.rating % 1 >= 0.5 && (
                          <i className="fas fa-star-half-alt text-sm"></i>
                        )}
                        {destination.rating % 1 < 0.5 &&
                          destination.rating % 1 > 0 && (
                            <i className="far fa-star text-sm"></i>
                          )}
                        {[...Array(5 - Math.ceil(destination.rating))].map((_, i) => (
                          <i key={i} className="far fa-star text-sm"></i>
                        ))}
                      </div>
                      <span className="text-gray-700 text-sm ml-1">
                        {destination.rating.toFixed(1)} ({destination.reviewCount})
                      </span>
                    </div>
                    <div className="text-sm text-gray-700">
                      <i className="far fa-clock mr-1"></i>
                      <span>{destination.duration} days</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <Link href={`/destinations/${destination.id}`}>
                      <Button variant="ghost" className="text-sm font-medium text-primary">
                        View Details
                      </Button>
                    </Link>
                    <Link href={`/booking/${destination.id}`}>
                      <Button variant="secondary" className="text-sm px-3 py-1 bg-primary/10 text-primary rounded-full hover:bg-primary/20">
                        Book Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        <div className="text-center mt-10">
          <Button
            variant="outline"
            className="px-6 py-3 border border-primary text-primary rounded-full shadow-sm hover:bg-primary hover:text-white"
          >
            View All Destinations
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PopularDestinations;

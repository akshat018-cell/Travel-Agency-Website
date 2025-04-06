import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Globe from "./Globe";
import { getCitySuggestions } from "@/lib/destinations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const HeroSection = () => {
  const [destination, setDestination] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [checkInDate, setCheckInDate] = useState<Date | undefined>(undefined);
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>(undefined);
  const suggestionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (destination.trim().length > 0) {
      const matchingSuggestions = getCitySuggestions(destination);
      setSuggestions(matchingSuggestions);
      setShowSuggestions(matchingSuggestions.length > 0);
    } else {
      setShowSuggestions(false);
    }

    // Close suggestions when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionRef.current &&
        !suggestionRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [destination]);

  const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDestination(e.target.value);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setDestination(suggestion);
    setShowSuggestions(false);
  };

  const handleExplore = () => {
    // Redirect to destinations section or filter destinations
    const destinationsSection = document.getElementById("destinations");
    if (destinationsSection) {
      destinationsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="relative pt-24 min-h-[90vh] overflow-hidden bg-cover bg-center bg-no-repeat" style={{
      backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.4)), url("https://images.unsplash.com/photo-1530789253388-582c481c54b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")',
      backgroundAttachment: 'fixed'
    }}>
      {/* Animated overlay particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="stars-container absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.7 + 0.3
              }}
              animate={{
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.5, 1]
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between py-12 lg:py-28">
          {/* Left Content */}
          <motion.div
            className="w-full lg:w-1/2 mb-10 lg:mb-0"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-montserrat font-bold text-4xl md:text-6xl lg:text-7xl leading-tight mb-6 text-white text-shadow">
              <span className="block">Discover the world's</span>
              <span className="text-primary">magical destinations</span>
            </h1>
            <p className="text-white text-xl md:text-2xl mb-10 max-w-2xl font-light leading-relaxed">
              Experience breathtaking journeys and create unforgettable memories with our immersive 3D travel experiences.
            </p>

            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-xl max-w-2xl">
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="w-full sm:flex-1 relative">
                  <Input
                    type="text"
                    placeholder="Where to?"
                    className="w-full px-5 py-3 pr-10 bg-white/80 border border-white rounded-full focus:border-primary focus:ring-2 focus:ring-primary/20"
                    value={destination}
                    onChange={handleDestinationChange}
                  />
                  <i className="fas fa-map-marker-alt absolute right-4 top-3.5 text-primary"></i>

                  {showSuggestions && (
                    <div
                      ref={suggestionRef}
                      className="absolute z-10 mt-2 w-full bg-white shadow-lg rounded-lg max-h-48 overflow-y-auto"
                    >
                      {suggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="w-full sm:flex-1">
                  <div className="relative">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full px-5 py-3 pr-10 bg-white/80 border border-white rounded-full justify-start text-left font-normal"
                        >
                          {checkInDate ? (
                            format(checkInDate, "PPP")
                          ) : (
                            <span className="text-gray-500">When?</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={checkInDate}
                          onSelect={setCheckInDate}
                          initialFocus
                          disabled={{ before: new Date() }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              <Button
                className="w-full bg-primary text-white px-6 py-6 rounded-full font-medium hover:bg-primary/90 shadow-lg hover:shadow-xl text-lg transition-all duration-300"
                onClick={handleExplore}
              >
                <i className="fas fa-compass mr-2"></i> Explore Now
              </Button>
            </div>

            <div className="flex items-center space-x-4 mt-8">
              <span className="text-white/90 font-light">Trusted by:</span>
              <div className="flex space-x-4">
                <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <i className="fab fa-tripadvisor text-white"></i>
                </div>
                <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <i className="fab fa-airbnb text-white"></i>
                </div>
                <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <i className="fab fa-booking text-white"></i>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Content - 3D Globe */}
          <motion.div
            className="w-full lg:w-1/2 flex justify-center relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
              <div className="w-[500px] h-[500px] rounded-full bg-gradient-to-br from-primary/30 to-transparent blur-3xl animate-pulse-slow"></div>
            </div>
            <Globe />
          </motion.div>
        </div>

        {/* Statistics Bar */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 px-6 bg-white/10 backdrop-blur-md rounded-xl mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="text-center">
            <div className="font-montserrat font-bold text-3xl md:text-4xl text-primary">150+</div>
            <div className="text-white/90 text-sm md:text-lg font-light">Destinations</div>
          </div>
          <div className="text-center">
            <div className="font-montserrat font-bold text-3xl md:text-4xl text-primary">10k+</div>
            <div className="text-white/90 text-sm md:text-lg font-light">Travelers</div>
          </div>
          <div className="text-center">
            <div className="font-montserrat font-bold text-3xl md:text-4xl text-primary">230+</div>
            <div className="text-white/90 text-sm md:text-lg font-light">Hotels</div>
          </div>
          <div className="text-center">
            <div className="font-montserrat font-bold text-3xl md:text-4xl text-primary">4.9</div>
            <div className="text-white/90 text-sm md:text-lg font-light">Rating</div>
          </div>
        </motion.div>
      </div>

      {/* Wave Shape Divider */}
      <div className="absolute bottom-0 left-0 right-0 w-full">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-24 md:h-32 lg:h-40">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" className="fill-white"></path>
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" className="fill-white"></path>
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" className="fill-white"></path>
        </svg>
      </div>
    </header>
  );
};

export default HeroSection;

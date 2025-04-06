import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCitySuggestions } from "@/lib/destinations";
import { useToast } from "@/hooks/use-toast";

const BookingProcess = () => {
  const [destination, setDestination] = useState("");
  const [checkInDate, setCheckInDate] = useState<Date | undefined>();
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>();
  const [adults, setAdults] = useState("2");
  const [children, setChildren] = useState("0");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { toast } = useToast();

  const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDestination(value);
    
    if (value.trim().length > 0) {
      const matches = getCitySuggestions(value);
      setSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setDestination(suggestion);
    setShowSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!destination) {
      toast({
        title: "Error",
        description: "Please select a destination",
        variant: "destructive",
      });
      return;
    }
    
    if (!checkInDate || !checkOutDate) {
      toast({
        title: "Error",
        description: "Please select check-in and check-out dates",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Success",
      description: "Searching for available options...",
    });
    
    // In a real application, this would redirect to search results
    setTimeout(() => {
      window.location.href = "#destinations";
    }, 1500);
  };

  return (
    <section id="booking" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-montserrat font-bold text-3xl md:text-4xl mb-4">Book Your Dream Vacation</h2>
          <p className="text-gray-700 max-w-2xl mx-auto">
            Just a few simple steps to start your journey. Our streamlined booking process makes planning your next adventure effortless.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Step 1 */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <i className="fas fa-search text-primary text-xl"></i>
            </div>
            <h3 className="font-montserrat font-bold text-xl mb-2">Choose Destination</h3>
            <p className="text-gray-700">
              Browse our curated selection of destinations and find the perfect match for your travel style.
            </p>
          </motion.div>

          {/* Step 2 */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <i className="fas fa-calendar-alt text-primary text-xl"></i>
            </div>
            <h3 className="font-montserrat font-bold text-xl mb-2">Select Dates</h3>
            <p className="text-gray-700">
              Pick your travel dates with our interactive calendar and check real-time availability.
            </p>
          </motion.div>

          {/* Step 3 */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <i className="fas fa-credit-card text-primary text-xl"></i>
            </div>
            <h3 className="font-montserrat font-bold text-xl mb-2">Secure Booking</h3>
            <p className="text-gray-700">
              Complete your reservation with our secure payment system and receive instant confirmation.
            </p>
          </motion.div>
        </div>

        {/* Booking Form */}
        <motion.div
          className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="md:flex">
            {/* Form Left Column */}
            <div className="md:w-1/2 p-8">
              <h3 className="font-montserrat font-bold text-2xl mb-6">Start Planning Your Trip</h3>
              <form id="booking-form" onSubmit={handleSubmit}>
                <div className="mb-4">
                  <Label htmlFor="destination" className="block text-gray-700 text-sm font-medium mb-2">
                    Destination
                  </Label>
                  <div className="relative">
                    <Input
                      id="destination"
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg"
                      placeholder="Search destinations..."
                      value={destination}
                      onChange={handleDestinationChange}
                    />
                    <i className="fas fa-map-marker-alt absolute right-3 top-3 text-primary"></i>
                    
                    {showSuggestions && (
                      <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-lg max-h-48 overflow-y-auto">
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
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="check-in" className="block text-gray-700 text-sm font-medium mb-2">
                      Check-in Date
                    </Label>
                    <div className="relative">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !checkInDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {checkInDate ? format(checkInDate, "PPP") : <span>Select date</span>}
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
                  <div>
                    <Label htmlFor="check-out" className="block text-gray-700 text-sm font-medium mb-2">
                      Check-out Date
                    </Label>
                    <div className="relative">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !checkOutDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {checkOutDate ? format(checkOutDate, "PPP") : <span>Select date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={checkOutDate}
                            onSelect={setCheckOutDate}
                            initialFocus
                            disabled={checkInDate 
                              ? { before: new Date(checkInDate.getTime() + 86400000) } 
                              : { before: new Date() }
                            }
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="adults" className="block text-gray-700 text-sm font-medium mb-2">
                      Adults
                    </Label>
                    <Select value={adults} onValueChange={setAdults}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select number of adults" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Adult</SelectItem>
                        <SelectItem value="2">2 Adults</SelectItem>
                        <SelectItem value="3">3 Adults</SelectItem>
                        <SelectItem value="4">4 Adults</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="children" className="block text-gray-700 text-sm font-medium mb-2">
                      Children
                    </Label>
                    <Select value={children} onValueChange={setChildren}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select number of children" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0 Children</SelectItem>
                        <SelectItem value="1">1 Child</SelectItem>
                        <SelectItem value="2">2 Children</SelectItem>
                        <SelectItem value="3">3 Children</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="mt-2 w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90"
                >
                  Search Availability
                </Button>
              </form>
            </div>

            {/* Form Right Column with Image */}
            <div className="md:w-1/2 bg-gradient-to-br from-primary to-[#00D1B2] p-8 text-white flex items-center">
              <div>
                <h3 className="font-montserrat font-bold text-2xl mb-4">Special Offer</h3>
                <p className="mb-4">
                  Book now and get up to 20% off on selected destinations for summer trips!
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <i className="fas fa-check-circle mr-2"></i>
                    <span>Free cancellation on most bookings</span>
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check-circle mr-2"></i>
                    <span>24/7 customer support</span>
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check-circle mr-2"></i>
                    <span>Exclusive member discounts</span>
                  </li>
                </ul>
                <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  Use code: <span className="font-bold">SUMMER2023</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BookingProcess;

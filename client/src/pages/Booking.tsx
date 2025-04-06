import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";
import { Destination } from "@/lib/destinations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { format, addDays, differenceInDays } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/navigation/Navbar";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import LoginModal from "@/components/auth/LoginModal";
import { apiRequest } from "@/lib/queryClient";
import { auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";

// Mock payment methods
const paymentMethods = [
  { id: "credit", name: "Credit Card", icon: "fa-credit-card" },
  { id: "paypal", name: "PayPal", icon: "fa-paypal" },
  { id: "bank", name: "Bank Transfer", icon: "fa-university" },
];

const BookingSteps = {
  DETAILS: 0,
  PAYMENT: 1,
  CONFIRMATION: 2,
};

const Booking = () => {
  const [, params] = useRoute("/booking/:id");
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [step, setStep] = useState(BookingSteps.DETAILS);
  const [checkInDate, setCheckInDate] = useState<Date | undefined>(new Date());
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>(addDays(new Date(), 7));
  const [adults, setAdults] = useState("2");
  const [children, setChildren] = useState("0");
  const [totalPrice, setTotalPrice] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("credit");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVC, setCardCVC] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [bookingReference, setBookingReference] = useState("");
  const [user] = useAuthState(auth);
  const { toast } = useToast();

  const destinationId = params?.id ? parseInt(params.id) : null;

  useEffect(() => {
    if (!destinationId) return;

    const fetchDestination = async () => {
      try {
        setLoading(true);
        const response = await apiRequest(
          "GET",
          `/api/destinations/${destinationId}`,
          undefined
        );
        const data = await response.json();
        setDestination(data);
        calculateTotal(data.price);
      } catch (error) {
        console.error("Error fetching destination:", error);
        toast({
          title: "Error",
          description: "Failed to load destination details. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDestination();
  }, [destinationId, toast]);

  useEffect(() => {
    // Check if user is logged in
    if (!user && !loading) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to book a trip",
        variant: "default",
      });
      setIsLoginModalOpen(true);
    }
  }, [user, loading, toast]);

  useEffect(() => {
    if (destination) {
      calculateTotal(destination.price);
    }
  }, [checkInDate, checkOutDate, adults, children, destination]);

  const calculateTotal = (basePrice: number) => {
    if (!checkInDate || !checkOutDate) return;

    const days = differenceInDays(checkOutDate, checkInDate);
    const numAdults = parseInt(adults);
    const numChildren = parseInt(children);
    const totalPeople = numAdults + numChildren;
    
    // Base calculation
    let total = basePrice * days;
    
    // Add per person cost
    total = total + (totalPeople * 50); // $50 per person
    
    // Additional fees
    const serviceFee = basePrice * 0.1; // 10% service fee
    
    setTotalPrice(total + serviceFee);
  };

  const handleOpenLogin = () => {
    setIsLoginModalOpen(true);
  };

  const handleCloseLogin = () => {
    setIsLoginModalOpen(false);
  };

  const handleContinue = () => {
    if (!checkInDate || !checkOutDate) {
      toast({
        title: "Error",
        description: "Please select check-in and check-out dates",
        variant: "destructive",
      });
      return;
    }

    if (checkInDate >= checkOutDate) {
      toast({
        title: "Error",
        description: "Check-out date must be after check-in date",
        variant: "destructive",
      });
      return;
    }

    setStep(BookingSteps.PAYMENT);
    window.scrollTo(0, 0);
  };

  const validatePaymentDetails = () => {
    if (paymentMethod === "credit") {
      if (!cardNumber.trim() || !cardName.trim() || !cardExpiry.trim() || !cardCVC.trim()) {
        toast({
          title: "Error",
          description: "Please fill in all card details",
          variant: "destructive",
        });
        return false;
      }

      // Simple validation - you would have more robust validation in production
      if (cardNumber.replace(/\s/g, '').length !== 16) {
        toast({
          title: "Error",
          description: "Please enter a valid 16-digit card number",
          variant: "destructive",
        });
        return false;
      }

      if (cardCVC.length !== 3) {
        toast({
          title: "Error",
          description: "Please enter a valid 3-digit CVC",
          variant: "destructive",
        });
        return false;
      }
    }

    if (!agreeTerms) {
      toast({
        title: "Error",
        description: "Please accept the terms and conditions",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handlePayment = async () => {
    if (!validatePaymentDetails()) return;
    
    if (!user || !destination || !checkInDate || !checkOutDate) {
      toast({
        title: "Error",
        description: "Missing required booking information",
        variant: "destructive",
      });
      return;
    }

    setProcessingPayment(true);

    try {
      // Get user ID from our database
      const userResponse = await apiRequest(
        "GET",
        `/api/users/firebase/${user.uid}`,
        undefined
      );
      
      if (!userResponse.ok) {
        throw new Error("Failed to get user information");
      }
      
      const userData = await userResponse.json();
      
      // Create booking
      const bookingData = {
        userId: userData.id,
        destinationId: destination.id,
        checkInDate: checkInDate.toISOString(),
        checkOutDate: checkOutDate.toISOString(),
        adults: parseInt(adults),
        children: parseInt(children),
        totalPrice: Math.round(totalPrice),
        status: "confirmed"
      };
      
      const bookingResponse = await apiRequest(
        "POST",
        "/api/bookings",
        bookingData
      );
      
      if (!bookingResponse.ok) {
        throw new Error("Failed to create booking");
      }
      
      const booking = await bookingResponse.json();
      
      // Generate a booking reference
      const reference = `VYG-${Date.now().toString().slice(-6)}-${booking.id}`;
      setBookingReference(reference);
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setBookingComplete(true);
      setStep(BookingSteps.CONFIRMATION);
      
      toast({
        title: "Success",
        description: "Your booking has been confirmed!",
      });
    } catch (error) {
      console.error("Booking error:", error);
      toast({
        title: "Error",
        description: "Failed to process your booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar onOpenLogin={handleOpenLogin} user={user} />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <div className="flex justify-center items-center h-[60vh]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar onOpenLogin={handleOpenLogin} user={user} />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <h2 className="text-2xl font-bold mb-4">Destination Not Found</h2>
            <p className="text-gray-600 mb-6">
              The destination you're trying to book doesn't exist or has been removed.
            </p>
            <Link href="/">
              <Button className="bg-primary text-white hover:bg-primary/90">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-10">
      <div className="flex items-center">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          step >= BookingSteps.DETAILS ? "bg-primary text-white" : "bg-gray-200 text-gray-500"
        }`}>
          1
        </div>
        <div className="text-sm font-medium ml-2">Details</div>
      </div>
      <div className={`w-16 h-1 mx-2 ${
        step >= BookingSteps.PAYMENT ? "bg-primary" : "bg-gray-200"
      }`}></div>
      <div className="flex items-center">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          step >= BookingSteps.PAYMENT ? "bg-primary text-white" : "bg-gray-200 text-gray-500"
        }`}>
          2
        </div>
        <div className="text-sm font-medium ml-2">Payment</div>
      </div>
      <div className={`w-16 h-1 mx-2 ${
        step >= BookingSteps.CONFIRMATION ? "bg-primary" : "bg-gray-200"
      }`}></div>
      <div className="flex items-center">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          step >= BookingSteps.CONFIRMATION ? "bg-primary text-white" : "bg-gray-200 text-gray-500"
        }`}>
          3
        </div>
        <div className="text-sm font-medium ml-2">Confirmation</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onOpenLogin={handleOpenLogin} user={user} />
      
      <div className="container mx-auto px-4 pt-24 pb-16">
        <h1 className="text-3xl md:text-4xl font-bold font-montserrat text-center mb-6">
          {step === BookingSteps.CONFIRMATION ? 
            "Booking Confirmed!" : 
            `Book Your Trip to ${destination.name}`
          }
        </h1>
        
        {renderStepIndicator()}
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="lg:w-2/3">
            {step === BookingSteps.DETAILS && (
              <motion.div
                className="bg-white rounded-xl shadow-md p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-2xl font-montserrat font-bold mb-6">Trip Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <Label htmlFor="check-in">Check-in Date</Label>
                    <div className="mt-1">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
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
                    <Label htmlFor="check-out">Check-out Date</Label>
                    <div className="mt-1">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <Label htmlFor="adults">Adults</Label>
                    <Select value={adults} onValueChange={setAdults}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select number of adults" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Adult</SelectItem>
                        <SelectItem value="2">2 Adults</SelectItem>
                        <SelectItem value="3">3 Adults</SelectItem>
                        <SelectItem value="4">4 Adults</SelectItem>
                        <SelectItem value="5">5 Adults</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="children">Children</Label>
                    <Select value={children} onValueChange={setChildren}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select number of children" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0 Children</SelectItem>
                        <SelectItem value="1">1 Child</SelectItem>
                        <SelectItem value="2">2 Children</SelectItem>
                        <SelectItem value="3">3 Children</SelectItem>
                        <SelectItem value="4">4 Children</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button
                    className="bg-primary text-white hover:bg-primary/90 px-6"
                    onClick={handleContinue}
                  >
                    Continue to Payment
                  </Button>
                </div>
              </motion.div>
            )}
            
            {step === BookingSteps.PAYMENT && (
              <motion.div
                className="bg-white rounded-xl shadow-md p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-2xl font-montserrat font-bold mb-6">Payment Information</h2>
                
                <div className="mb-6">
                  <Label className="text-lg font-medium mb-3 block">Payment Method</Label>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                    className="flex flex-col space-y-3"
                  >
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className={`flex items-center p-4 border rounded-lg cursor-pointer ${
                          paymentMethod === method.id
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <RadioGroupItem value={method.id} id={method.id} className="mr-3" />
                        <Label htmlFor={method.id} className="flex items-center cursor-pointer">
                          <i className={`fab ${method.icon} text-lg mr-3 ${
                            method.id === "credit" ? "text-blue-600" :
                            method.id === "paypal" ? "text-blue-700" :
                            "text-gray-700"
                          }`}></i>
                          {method.name}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                
                {paymentMethod === "credit" && (
                  <div className="space-y-4 mb-6">
                    <div>
                      <Label htmlFor="card-number">Card Number</Label>
                      <Input
                        id="card-number"
                        placeholder="1234 5678 9012 3456"
                        className="mt-1"
                        value={cardNumber}
                        onChange={(e) => {
                          // Format card number with spaces
                          const value = e.target.value.replace(/\s/g, "");
                          const formatted = value.replace(/(\d{4})/g, "$1 ").trim();
                          setCardNumber(formatted.slice(0, 19));
                        }}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="card-name">Cardholder Name</Label>
                      <Input
                        id="card-name"
                        placeholder="John Smith"
                        className="mt-1"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="card-expiry">Expiry Date</Label>
                        <Input
                          id="card-expiry"
                          placeholder="MM/YY"
                          className="mt-1"
                          value={cardExpiry}
                          onChange={(e) => {
                            // Format expiry date
                            const value = e.target.value.replace(/\D/g, "");
                            if (value.length <= 2) {
                              setCardExpiry(value);
                            } else {
                              setCardExpiry(`${value.slice(0, 2)}/${value.slice(2, 4)}`);
                            }
                          }}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="card-cvc">CVC</Label>
                        <Input
                          id="card-cvc"
                          placeholder="123"
                          className="mt-1"
                          maxLength={3}
                          value={cardCVC}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "");
                            setCardCVC(value.slice(0, 3));
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {paymentMethod === "paypal" && (
                  <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <p className="text-gray-700">
                      You will be redirected to PayPal to complete your payment securely.
                    </p>
                  </div>
                )}
                
                {paymentMethod === "bank" && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-6 space-y-2">
                    <p className="text-gray-700 font-medium">Bank Transfer Details:</p>
                    <p className="text-gray-700">Bank: Voyager International Bank</p>
                    <p className="text-gray-700">Account: 1234567890</p>
                    <p className="text-gray-700">IBAN: VY12 3456 7890 1234</p>
                    <p className="text-gray-700">Reference: {destination.name}-{format(new Date(), "yyyyMMdd")}</p>
                  </div>
                )}
                
                <div className="flex items-start space-x-2 mb-6">
                  <Checkbox
                    id="terms"
                    checked={agreeTerms}
                    onCheckedChange={(checked) => setAgreeTerms(!!checked)}
                  />
                  <Label
                    htmlFor="terms"
                    className="text-sm text-gray-600 cursor-pointer"
                  >
                    I agree to the{" "}
                    <a href="#" className="text-primary hover:underline">
                      Terms & Conditions
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-primary hover:underline">
                      Privacy Policy
                    </a>
                  </Label>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep(BookingSteps.DETAILS)}
                    disabled={processingPayment}
                  >
                    Back to Details
                  </Button>
                  <Button
                    className="bg-primary text-white hover:bg-primary/90 px-6"
                    onClick={handlePayment}
                    disabled={processingPayment}
                  >
                    {processingPayment ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      `Pay $${totalPrice.toFixed(2)}`
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
            
            {step === BookingSteps.CONFIRMATION && (
              <motion.div
                className="bg-white rounded-xl shadow-md p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-center mb-6">
                  <div className="flex justify-center mb-4">
                    <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
                      <i className="fas fa-check text-3xl text-green-500"></i>
                    </div>
                  </div>
                  <h2 className="text-2xl font-montserrat font-bold mb-2">Booking Confirmed!</h2>
                  <p className="text-gray-600">
                    Your trip to {destination.name} has been booked successfully.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Booking Reference:</span>
                    <span className="font-bold">{bookingReference}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Destination:</span>
                    <span>{destination.name}, {destination.country}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Travel Dates:</span>
                    <span>
                      {checkInDate && checkOutDate ? (
                        `${format(checkInDate, "MMM d, yyyy")} - ${format(checkOutDate, "MMM d, yyyy")}`
                      ) : (
                        "Dates not selected"
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Guests:</span>
                    <span>{adults} Adults, {children} Children</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-bold text-primary">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <h3 className="font-medium text-gray-800 mb-2">
                    <i className="fas fa-info-circle text-blue-500 mr-2"></i>
                    What's Next?
                  </h3>
                  <p className="text-gray-600 mb-2">
                    A confirmation email has been sent to your email address with all the details of your booking.
                  </p>
                  <p className="text-gray-600">
                    Our travel experts will contact you shortly to go through the final details and answer any questions you might have.
                  </p>
                </div>
                
                <div className="flex justify-center">
                  <Link href="/">
                    <Button className="bg-primary text-white hover:bg-primary/90 px-6">
                      Return to Home
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
          
          {/* Booking Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h3 className="text-xl font-montserrat font-bold mb-6">Booking Summary</h3>
              
              <div className="flex mb-6">
                <div className="w-24 h-24 rounded-lg overflow-hidden mr-4">
                  <img
                    src={destination.imageUrl}
                    alt={destination.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-lg">{destination.name}</h4>
                  <p className="text-gray-600">{destination.country}</p>
                  <div className="flex items-center mt-1">
                    <div className="flex text-yellow-400">
                      {[...Array(Math.floor(destination.rating))].map((_, i) => (
                        <i key={i} className="fas fa-star text-xs"></i>
                      ))}
                      {destination.rating % 1 >= 0.5 && (
                        <i className="fas fa-star-half-alt text-xs"></i>
                      )}
                    </div>
                    <span className="text-gray-600 text-sm ml-1">
                      ({destination.reviewCount})
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Check-in:</span>
                  <span>{checkInDate ? format(checkInDate, "MMM d, yyyy") : "Not selected"}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Check-out:</span>
                  <span>{checkOutDate ? format(checkOutDate, "MMM d, yyyy") : "Not selected"}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Duration:</span>
                  <span>
                    {checkInDate && checkOutDate
                      ? `${differenceInDays(checkOutDate, checkInDate)} days`
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Guests:</span>
                  <span>{adults} Adults, {children} Children</span>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Base Price:</span>
                  <span>${destination.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Service Fee:</span>
                  <span>${(destination.price * 0.1).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span className="text-primary">${totalPrice.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="bg-green-50 p-3 rounded-lg text-green-700 text-sm flex items-start mb-4">
                <i className="fas fa-shield-alt mt-1 mr-2"></i>
                <div>
                  <p className="font-medium">Secure Booking</p>
                  <p>Your payment information is encrypted and secure</p>
                </div>
              </div>
              
              <div className="text-xs text-gray-500">
                By proceeding with this booking, you agree to Voyager's{" "}
                <a href="#" className="text-primary">Terms of Service</a> and{" "}
                <a href="#" className="text-primary">Cancellation Policy</a>.
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
      <BackToTop />
      <LoginModal isOpen={isLoginModalOpen} onClose={handleCloseLogin} />
    </div>
  );
};

export default Booking;

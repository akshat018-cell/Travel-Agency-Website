import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { User } from "firebase/auth";
import { auth, logOut } from "@/lib/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";

interface NavbarProps {
  onOpenLogin: () => void;
  user: User | null;
}

const Navbar = ({ onOpenLogin, user }: NavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      // Update the navbar background
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Get all sections to track active section for highlighting nav items
      const sections = document.querySelectorAll('section[id], header');
      let currentSection = 'home';
      
      sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        const sectionId = section.id || 'home';
        
        if (sectionTop < 100) {
          currentSection = sectionId;
        }
      });
      
      setActiveSection(currentSection);
    };

    // Handle clicks outside mobile menu to close it
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current && 
        isMobileMenuOpen && 
        !mobileMenuRef.current.contains(event.target as Node) &&
        !(event.target as Element).classList.contains('menu-toggle')
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);
    
    // Initial call to set correct values
    handleScroll();
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  const handleSignOut = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const getInitials = () => {
    if (!user || !user.displayName) return "U";
    return user.displayName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  const navItems = [
    { id: "destinations", label: "Destinations", icon: "fa-map-marked-alt" },
    { id: "accommodations", label: "Accommodations", icon: "fa-hotel" },
    { id: "booking", label: "Book Now", icon: "fa-calendar-alt" },
    { id: "about", label: "About Us", icon: "fa-info-circle" }
  ];

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link href="/">
            <motion.div 
              className="flex items-center cursor-pointer group"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="h-12 w-12 relative overflow-hidden rounded-full bg-gradient-to-r from-primary to-[#00D1B2] flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <span className="text-white font-bold text-xl">V</span>
              </div>
              <motion.span 
                className={`font-montserrat font-bold text-2xl ml-2 transition-colors duration-300 ${
                  isScrolled ? "text-primary" : "text-white"
                }`}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Voyager
              </motion.span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex space-x-1 items-center">
            {navItems.map((item, index) => (
              <motion.button
                key={item.id}
                className={`px-4 py-2 rounded-full font-medium transition-all duration-300 flex items-center ${
                  activeSection === item.id
                    ? "bg-primary/10 text-primary"
                    : isScrolled
                    ? "text-gray-700 hover:bg-gray-100"
                    : "text-white/90 hover:text-white hover:bg-white/10"
                }`}
                onClick={() => scrollToSection(item.id)}
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ y: -3 }}
              >
                <i className={`fas ${item.icon} mr-2`}></i>
                {item.label}
              </motion.button>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            {/* Search button */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                variant="ghost"
                size="icon"
                className={`rounded-full ${
                  isScrolled
                    ? "text-gray-700 hover:bg-gray-100"
                    : "text-white hover:bg-white/10"
                }`}
              >
                <i className="fas fa-search"></i>
              </Button>
            </motion.div>

            {/* User profile/login */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full p-0 hover:bg-primary/10"
                    >
                      <Avatar className="h-10 w-10 border-2 border-primary">
                        <AvatarImage src={user.photoURL || undefined} />
                        <AvatarFallback className="bg-primary text-white">
                          {getInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl">
                    <DropdownMenuItem className="font-semibold rounded-lg py-2">
                      <i className="fas fa-user-circle mr-2 text-primary"></i>
                      {user.displayName || user.email}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="rounded-lg py-2">
                      <i className="fas fa-user-cog mr-2"></i> My Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-lg py-2">
                      <i className="fas fa-suitcase mr-2"></i> My Bookings
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-lg py-2">
                      <i className="fas fa-cog mr-2"></i> Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleSignOut} 
                      className="rounded-lg py-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <i className="fas fa-sign-out-alt mr-2"></i>
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant={isScrolled ? "default" : "outline"}
                  className={`px-5 py-6 rounded-full ${
                    isScrolled
                      ? "bg-primary text-white hover:bg-primary/90"
                      : "border-white text-white hover:bg-white/20"
                  }`}
                  onClick={onOpenLogin}
                >
                  <i className="fas fa-user-circle mr-2"></i>
                  Sign In
                </Button>
              )}
            </motion.div>

            {/* Mobile menu button */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="lg:hidden"
            >
              <Button
                variant="ghost"
                size="icon"
                className={`rounded-full menu-toggle ${
                  isScrolled
                    ? "text-gray-700 hover:bg-gray-100"
                    : "text-white hover:bg-white/10"
                }`}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <i className={`fas ${isMobileMenuOpen ? "fa-times" : "fa-bars"} text-xl`}></i>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Mobile Menu with Animation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              ref={mobileMenuRef}
              className="lg:hidden mt-4 py-4 rounded-xl bg-white/95 backdrop-blur-md shadow-xl"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col space-y-1 px-2">
                {navItems.map((item) => (
                  <Button
                    key={item.id}
                    variant="ghost"
                    className={`justify-start py-3 px-4 rounded-lg ${
                      activeSection === item.id
                        ? "bg-primary/10 text-primary"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => scrollToSection(item.id)}
                  >
                    <i className={`fas ${item.icon} mr-3 w-5 text-center`}></i>
                    {item.label}
                  </Button>
                ))}

                {!user && (
                  <Button
                    className="mt-4 w-full py-3 bg-primary text-white rounded-lg hover:bg-primary/90"
                    onClick={() => {
                      onOpenLogin();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <i className="fas fa-user-circle mr-2"></i>
                    Sign In
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;

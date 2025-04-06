import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
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

interface NavbarProps {
  onOpenLogin: () => void;
  user: User | null;
}

const Navbar = ({ onOpenLogin, user }: NavbarProps) => {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white bg-opacity-95 backdrop-blur shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-1">
            <Link href="/">
              <div className="flex items-center cursor-pointer">
                <div className="h-10 w-10 relative overflow-hidden rounded-full bg-gradient-to-r from-primary to-[#00D1B2] flex items-center justify-center">
                  <span className="text-white font-bold text-lg">V</span>
                </div>
                <span className="font-montserrat font-bold text-2xl text-primary ml-1">
                  Voyager
                </span>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex space-x-8 items-center">
            <a
              href="#destinations"
              className={`font-medium hover:text-primary transition-colors ${
                location === "#destinations" ? "text-primary" : ""
              }`}
            >
              Destinations
            </a>
            <a
              href="#experiences"
              className={`font-medium hover:text-primary transition-colors ${
                location === "#experiences" ? "text-primary" : ""
              }`}
            >
              Experiences
            </a>
            <a
              href="#deals"
              className={`font-medium hover:text-primary transition-colors ${
                location === "#deals" ? "text-primary" : ""
              }`}
            >
              Deals
            </a>
            <a
              href="#about"
              className={`font-medium hover:text-primary transition-colors ${
                location === "#about" ? "text-primary" : ""
              }`}
            >
              About
            </a>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-700 hover:text-primary"
            >
              <i className="fas fa-search"></i>
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL || undefined} />
                      <AvatarFallback className="bg-primary text-white">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="font-semibold">
                    {user.displayName || user.email}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>My Profile</DropdownMenuItem>
                  <DropdownMenuItem>My Bookings</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="outline"
                className="hidden md:block border-primary text-primary hover:bg-primary hover:text-white rounded-full"
                onClick={onOpenLogin}
              >
                Sign In
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <i className={`fas ${isMobileMenuOpen ? "fa-times" : "fa-bars"}`}></i>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-3">
              <a
                href="#destinations"
                className="font-medium hover:text-primary transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Destinations
              </a>
              <a
                href="#experiences"
                className="font-medium hover:text-primary transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Experiences
              </a>
              <a
                href="#deals"
                className="font-medium hover:text-primary transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Deals
              </a>
              <a
                href="#about"
                className="font-medium hover:text-primary transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </a>
              {!user && (
                <Button
                  className="mt-2 w-full border border-primary text-primary rounded-full hover:bg-primary hover:text-white transition-colors"
                  onClick={() => {
                    onOpenLogin();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

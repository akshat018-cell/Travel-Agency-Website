import { Link } from "wouter";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div>
            <Link href="/">
              <div className="flex items-center space-x-2 mb-6 cursor-pointer">
                <div className="h-10 w-10 relative overflow-hidden rounded-full bg-gradient-to-r from-primary to-[#00D1B2] flex items-center justify-center">
                  <span className="text-white font-bold text-lg">V</span>
                </div>
                <span className="font-montserrat font-bold text-2xl text-white">Voyager</span>
              </div>
            </Link>
            <p className="text-gray-400 mb-4">
              Transforming the way you experience travel with immersive 3D destinations and personalized journeys.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-pinterest"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-montserrat font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#destinations" className="text-gray-400 hover:text-white transition-colors">
                  Destinations
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Tours & Activities
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Hotels & Resorts
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Travel Guides
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Special Offers
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-montserrat font-bold text-lg mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Trust & Safety
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Accessibility
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-montserrat font-bold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <i className="fas fa-map-marker-alt mt-1 mr-3 text-primary"></i>
                <span className="text-gray-400">Indore, Madhya Pradesh</span>
              </li>
              <li className="flex items-center">
                <i className="fas fa-phone-alt mr-3 text-primary"></i>
                <span className="text-gray-400">+91 7974644795</span>
              </li>
              <li className="flex items-center">
                <i className="fas fa-envelope mr-3 text-primary"></i>
                <span className="text-gray-400">info@voyager.com</span>
              </li>
            </ul>
            <div className="mt-4 bg-gray-800/50 rounded-lg p-3">
              <h4 className="font-medium text-white mb-2">Business Hours</h4>
              <p className="text-gray-400 text-sm">Monday - Friday: 9:00 AM - 8:00 PM</p>
              <p className="text-gray-400 text-sm">Saturday: 10:00 AM - 6:00 PM</p>
              <p className="text-gray-400 text-sm">Sunday: Closed</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
            <div className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} Voyager Travel. All rights reserved.
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-gray-500">
                <i className="fas fa-globe mr-2"></i>
                <select className="bg-transparent border-none text-sm focus:outline-none">
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <i className="fab fa-cc-visa text-xl text-gray-500"></i>
                <i className="fab fa-cc-mastercard text-xl text-gray-500"></i>
                <i className="fab fa-cc-amex text-xl text-gray-500"></i>
                <i className="fab fa-cc-paypal text-xl text-gray-500"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

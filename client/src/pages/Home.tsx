import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Components
import Navbar from "@/components/navigation/Navbar";
import HeroSection from "@/components/home/HeroSection";
import PopularDestinations from "@/components/home/PopularDestinations";
import ParallaxExperience from "@/components/home/ParallaxExperience";
import LuxuryAccommodations from "@/components/home/LuxuryAccommodations";
import Testimonials from "@/components/home/Testimonials";
import BookingProcess from "@/components/home/BookingProcess";
import Newsletter from "@/components/home/Newsletter";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import LoginModal from "@/components/auth/LoginModal";
import UsernameModal from "@/components/auth/UsernameModal";
import ChatInterface from "@/components/chat/ChatInterface";

interface HomeProps {
  user: User | null;
}

const Home = ({ user }: HomeProps) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // If user logs in with Firebase but doesn't have a name, show username modal
    if (user && !user.displayName) {
      setIsUsernameModalOpen(true);
    }
    
    // If user logs in, fetch or create user in our database
    if (user && user.uid) {
      const fetchOrCreateUser = async () => {
        try {
          const response = await apiRequest("GET", `/api/users/firebase/${user.uid}`, undefined);
          
          if (response.status === 200) {
            const userData = await response.json();
            setUserId(userData.id);
          } else if (response.status === 404) {
            // User doesn't exist in our DB, create one
            const createResponse = await apiRequest("POST", "/api/users", {
              username: user.email || `user_${Date.now()}`,
              password: "", // We don't need this for Firebase users
              email: user.email,
              name: user.displayName,
              firebaseId: user.uid
            });
            
            if (createResponse.ok) {
              const newUser = await createResponse.json();
              setUserId(newUser.id);
            }
          }
        } catch (error) {
          console.error("Error fetching/creating user:", error);
          toast({
            title: "Error",
            description: "Failed to synchronize user data",
            variant: "destructive",
          });
        }
      };
      
      fetchOrCreateUser();
    } else {
      setUserId(null);
    }
  }, [user, toast]);

  const handleOpenChat = () => {
    setIsChatOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
  };

  const handleOpenLogin = () => {
    setIsLoginModalOpen(true);
  };

  const handleCloseLogin = () => {
    setIsLoginModalOpen(false);
  };

  const handleOpenUsernameModal = () => {
    setIsUsernameModalOpen(true);
  };

  const handleCloseUsernameModal = () => {
    setIsUsernameModalOpen(false);
  };

  return (
    <div className="min-h-screen">
      <Navbar onOpenLogin={handleOpenLogin} user={user} />
      <HeroSection />
      <PopularDestinations />
      <ParallaxExperience />
      <LuxuryAccommodations />
      <Testimonials />
      <BookingProcess />
      <Newsletter onOpenChat={handleOpenChat} />
      <Footer />
      <BackToTop />
      
      {/* Modals */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={handleCloseLogin} 
      />
      
      <UsernameModal 
        isOpen={isUsernameModalOpen} 
        onClose={handleCloseUsernameModal} 
        initialName={user?.displayName || ""}
      />
      
      <ChatInterface 
        isOpen={isChatOpen} 
        onClose={handleCloseChat} 
        user={user}
        userId={userId}
        onShowUsernameModal={handleOpenUsernameModal}
      />
    </div>
  );
};

export default Home;

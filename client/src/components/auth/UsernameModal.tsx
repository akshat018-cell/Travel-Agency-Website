import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { auth } from "@/lib/firebase";
import { updateProfile } from "firebase/auth";

interface UsernameModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialName?: string;
}

const UsernameModal = ({ isOpen, onClose, initialName = "" }: UsernameModalProps) => {
  const [username, setUsername] = useState(initialName);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast({
        title: "Error",
        description: "Please enter your name",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Save to Firebase if user is authenticated
      const currentUser = auth.currentUser;
      if (currentUser) {
        await updateProfile(currentUser, {
          displayName: username
        });
        
        // Could also save to our backend here
        // await apiRequest("POST", "/api/users/profile", { name: username });
      }
      
      toast({
        title: "Success",
        description: "Your name has been saved successfully!",
      });
      
      onClose();
    } catch (error) {
      console.error("Error saving username:", error);
      toast({
        title: "Error",
        description: "Failed to save your name. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center font-montserrat">
              Welcome to Voyager AI
            </DialogTitle>
          </DialogHeader>
          
          <p className="text-gray-700 text-center mb-6">
            Please tell us your name so we can personalize your experience.
          </p>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <Label htmlFor="username" className="block text-gray-700 text-sm font-medium mb-2">
                Your Name
              </Label>
              <Input
                id="username"
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="Enter your name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <Button
              type="submit"
              className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                "Get Started"
              )}
            </Button>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default UsernameModal;

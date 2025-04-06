import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface NewsletterProps {
  onOpenChat: () => void;
}

const Newsletter = ({ onOpenChat }: NewsletterProps) => {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !email.includes('@')) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Success",
      description: "Thank you for subscribing to our newsletter!",
    });
    
    setEmail("");
  };

  return (
    <section className="py-16 bg-gradient-to-r from-primary/10 to-[#00D1B2]/10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          {/* Newsletter */}
          <motion.div 
            className="md:w-1/2 mb-8 md:mb-0"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-montserrat font-bold text-2xl md:text-3xl mb-4">Join Our Travel Community</h2>
            <p className="text-gray-700 mb-6">
              Subscribe to our newsletter and get exclusive offers, travel tips, and destination inspiration.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
              <Input
                type="email"
                placeholder="Your email address"
                className="flex-grow px-4 py-3 rounded-l-lg border border-gray-300"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <Button 
                type="submit"
                className="px-6 py-3 bg-primary text-white rounded-r-lg font-medium hover:bg-primary/90"
              >
                Subscribe
              </Button>
            </form>
          </motion.div>

          {/* AI Chat Assistant Teaser */}
          <motion.div 
            className="md:w-2/5"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-xl shadow-md p-6 relative">
              <div className="absolute -top-5 -right-5 bg-[#00D1B2] text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                New
              </div>
              <h3 className="font-montserrat font-bold text-xl mb-4 flex items-center">
                <i className="fas fa-robot text-[#00D1B2] mr-2"></i>
                AI Travel Assistant
              </h3>
              <p className="text-gray-700 mb-4">
                Get personalized travel recommendations, instant answers to your questions, and plan your perfect trip with our AI assistant.
              </p>

              {/* Chat Preview */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4 max-w-xs">
                <div className="flex items-start mb-2">
                  <div className="h-8 w-8 rounded-full bg-[#00D1B2] flex items-center justify-center text-white mr-2 flex-shrink-0">
                    <i className="fas fa-robot text-sm"></i>
                  </div>
                  <div className="bg-white rounded-lg p-2 text-sm shadow-sm">
                    Hi there! I'm Voyager AI. How can I help plan your next adventure?
                  </div>
                </div>
              </div>

              <Button 
                variant="outline"
                className="w-full py-2 border border-[#00D1B2] text-[#00D1B2] rounded-lg font-medium hover:bg-[#00D1B2] hover:text-white"
                onClick={onOpenChat}
              >
                Chat with Voyager AI
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;

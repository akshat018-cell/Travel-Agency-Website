import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import ChatInterface from './ChatInterface';
import { User } from 'firebase/auth';

interface ChatButtonProps {
  user: User | null;
  userId: number | null;
  onShowUsernameModal: () => void;
}

const ChatButton = ({ user, userId, onShowUsernameModal }: ChatButtonProps) => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <motion.div 
        className="fixed bottom-8 right-8 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <Button
          onClick={toggleChat}
          className={`h-16 w-16 rounded-full shadow-xl ${
            isChatOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'
          } transition-colors duration-300`}
        >
          <i className={`text-2xl text-white ${isChatOpen ? 'fas fa-times' : 'fas fa-comment-dots'}`}></i>
        </Button>
      </motion.div>

      {/* Chat Interface */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            className="fixed bottom-28 right-8 z-50 w-[380px] h-[500px] shadow-2xl rounded-2xl overflow-hidden"
            initial={{ y: 20, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <ChatInterface
              isOpen={isChatOpen}
              onClose={toggleChat}
              user={user}
              userId={userId}
              onShowUsernameModal={onShowUsernameModal}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatButton;
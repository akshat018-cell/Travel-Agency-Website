import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Message, sendMessage } from "@/lib/openai";
import { motion, AnimatePresence } from "framer-motion";
import { User } from "firebase/auth";

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  userId: number | null;
  onShowUsernameModal: () => void;
}

const ChatInterface = ({
  isOpen,
  onClose,
  user,
  userId,
  onShowUsernameModal,
}: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial welcome message
    if (isOpen && messages.length === 0) {
      const initialMessages: Message[] = [
        {
          id: 1,
          userId: null,
          content: "Hello! 👋 I'm your Voyager AI travel assistant. I can help you discover destinations, find activities, and answer your travel questions.",
          isUserMessage: false,
          timestamp: new Date(),
        },
      ];

      // If no username, prompt for it
      if (!user?.displayName) {
        initialMessages.push({
          id: 2,
          userId: null,
          content: "Before we start, could you tell me your name?",
          isUserMessage: false,
          timestamp: new Date(),
        });
      } else {
        initialMessages.push({
          id: 2,
          userId: null,
          content: `Hi ${user.displayName}! How can I help with your travel plans today?`,
          isUserMessage: false,
          timestamp: new Date(),
        });
      }

      setMessages(initialMessages);
    }
  }, [isOpen, user]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    // Check if this is the first message and user has no name
    if (!user?.displayName && messages.length === 2) {
      // This is a response to the name question
      setMessages([
        ...messages,
        {
          id: Date.now(),
          userId: userId,
          content: input,
          isUserMessage: true,
          timestamp: new Date(),
        },
        {
          id: Date.now() + 1,
          userId: userId,
          content: `Nice to meet you, ${input}! How can I help with your travel plans today?`,
          isUserMessage: false,
          timestamp: new Date(),
        },
      ]);
      setInput("");
      
      // Show username modal to save the name
      onShowUsernameModal();
      return;
    }

    // Regular message flow
    const userMessage: Message = {
      id: Date.now(),
      userId: userId,
      content: input,
      isUserMessage: true,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Send message to OpenAI API
      const response = await sendMessage(userId, input);
      
      if (response && response.aiResponse) {
        setMessages((prevMessages) => [
          ...prevMessages,
          response.aiResponse,
        ]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Add error message
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Date.now(),
          userId: userId,
          content: "I'm having trouble connecting right now. Please try again later.",
          isUserMessage: false,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed bottom-4 right-4 w-80 md:w-96 bg-white rounded-xl shadow-xl overflow-hidden z-50"
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-primary px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mr-2">
            <i className="fas fa-robot text-white"></i>
          </div>
          <h3 className="text-white font-medium">Voyager AI Assistant</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:text-white/70 p-1 h-auto"
          onClick={onClose}
        >
          <i className="fas fa-times"></i>
        </Button>
      </div>

      <div
        ref={chatMessagesRef}
        className="h-80 p-4 overflow-y-auto bg-gray-50"
      >
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              className={`flex items-start mb-4 ${
                message.isUserMessage ? "justify-end" : ""
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {!message.isUserMessage && (
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white mr-2 flex-shrink-0">
                  <i className="fas fa-robot"></i>
                </div>
              )}
              <div
                className={`p-3 rounded-lg max-w-[80%] ${
                  message.isUserMessage
                    ? "bg-primary/10 text-primary"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <div className="flex items-start mb-4">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white mr-2 flex-shrink-0">
              <i className="fas fa-robot"></i>
            </div>
            <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0s" }}></div>
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.4s" }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 p-3">
        <form onSubmit={handleSendMessage} className="flex items-center">
          <Input
            type="text"
            placeholder="Type your message..."
            className="flex-grow px-3 py-2 border border-gray-300 rounded-lg mr-2"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={isLoading}
            className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            <i className="fas fa-paper-plane"></i>
          </Button>
        </form>
      </div>
    </motion.div>
  );
};

export default ChatInterface;

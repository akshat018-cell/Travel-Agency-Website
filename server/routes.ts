import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBookingSchema, insertMessageSchema, insertUserSchema } from "@shared/schema";
import OpenAI from "openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "sk-dummy",
  });

  // API routes
  
  // User endpoints
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.get("/api/users/firebase/:firebaseId", async (req, res) => {
    try {
      const firebaseId = req.params.firebaseId;
      const user = await storage.getUserByFirebaseId(firebaseId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Destination endpoints
  app.get("/api/destinations", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      let destinations;
      
      if (category && category !== "All Destinations") {
        destinations = await storage.getDestinationsByCategory(category);
      } else {
        destinations = await storage.getDestinations();
      }
      
      res.json(destinations);
    } catch (error) {
      console.error("Error fetching destinations:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/destinations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const destination = await storage.getDestination(id);
      
      if (!destination) {
        return res.status(404).json({ message: "Destination not found" });
      }
      
      res.json(destination);
    } catch (error) {
      console.error("Error fetching destination:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Booking endpoints
  app.post("/api/bookings", async (req, res) => {
    try {
      const bookingData = insertBookingSchema.parse(req.body);
      const booking = await storage.createBooking(bookingData);
      res.json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(400).json({ message: "Invalid booking data" });
    }
  });

  app.get("/api/users/:userId/bookings", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const bookings = await storage.getUserBookings(userId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Chat/Message endpoints
  app.post("/api/messages", async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(messageData);
      
      // If it's a user message, generate AI response
      if (messageData.isUserMessage) {
        try {
          // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content: "You are a travel assistant for Voyager Travel Agency. You can provide information about destinations, travel tips, and booking assistance. Keep your responses friendly, informative, and concise. Focus on travel-related queries."
              },
              {
                role: "user",
                content: messageData.content
              }
            ],
            max_tokens: 300
          });
          
          const aiResponseContent = response.choices[0].message.content || "I'm sorry, I couldn't process that. How else can I help with your travel plans?";
          
          const aiMessage = await storage.createMessage({
            userId: messageData.userId,
            content: aiResponseContent,
            isUserMessage: false
          });
          
          return res.json({
            userMessage: message,
            aiResponse: aiMessage
          });
        } catch (aiError) {
          console.error("Error generating AI response:", aiError);
          
          // Still send back the user message but with a default AI response
          const fallbackAiMessage = await storage.createMessage({
            userId: messageData.userId,
            content: "I'm having trouble connecting to my knowledge base right now. Please try again later or contact our customer service for immediate assistance.",
            isUserMessage: false
          });
          
          return res.json({
            userMessage: message,
            aiResponse: fallbackAiMessage
          });
        }
      }
      
      res.json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(400).json({ message: "Invalid message data" });
    }
  });

  app.get("/api/users/:userId/messages", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const messages = await storage.getMessages(userId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

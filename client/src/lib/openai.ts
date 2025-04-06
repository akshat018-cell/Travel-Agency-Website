import { apiRequest } from "./queryClient";

export interface Message {
  id: number;
  userId: number | null;
  content: string;
  isUserMessage: boolean;
  timestamp: Date;
}

export interface ChatResponse {
  userMessage: Message;
  aiResponse: Message;
}

export async function sendMessage(userId: number | null, content: string): Promise<ChatResponse> {
  try {
    const response = await apiRequest("POST", "/api/messages", {
      userId,
      content,
      isUserMessage: true
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}

export async function getMessages(userId: number): Promise<Message[]> {
  try {
    const response = await apiRequest("GET", `/api/users/${userId}/messages`, undefined);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
}

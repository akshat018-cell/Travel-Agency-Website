import { users, type User, type InsertUser, destinations, type Destination, type InsertDestination, bookings, type Booking, type InsertBooking, messages, type Message, type InsertMessage } from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByFirebaseId(firebaseId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Destination methods
  getDestination(id: number): Promise<Destination | undefined>;
  getDestinations(): Promise<Destination[]>;
  getDestinationsByCategory(category: string): Promise<Destination[]>;
  createDestination(destination: InsertDestination): Promise<Destination>;
  
  // Booking methods
  getBooking(id: number): Promise<Booking | undefined>;
  getUserBookings(userId: number): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: number, status: string): Promise<Booking | undefined>;
  
  // Message methods
  getMessages(userId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private destinations: Map<number, Destination>;
  private bookings: Map<number, Booking>;
  private messages: Map<number, Message>;
  private currentUserId: number;
  private currentDestinationId: number;
  private currentBookingId: number;
  private currentMessageId: number;

  constructor() {
    this.users = new Map();
    this.destinations = new Map();
    this.bookings = new Map();
    this.messages = new Map();
    this.currentUserId = 1;
    this.currentDestinationId = 1;
    this.currentBookingId = 1;
    this.currentMessageId = 1;
    
    // Initialize with some demo destinations
    this.initializeDestinations();
  }

  private initializeDestinations() {
    const demoDestinations: InsertDestination[] = [
      {
        name: "Santorini",
        country: "Greece",
        description: "Experience the stunning white buildings and blue domes overlooking the Aegean Sea.",
        imageUrl: "https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
        price: 1299,
        duration: 7,
        rating: 4.7,
        reviewCount: 234,
        category: "Islands"
      },
      {
        name: "Bali",
        country: "Indonesia",
        description: "Tropical paradise with lush landscapes, beautiful beaches, and vibrant culture.",
        imageUrl: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
        price: 1099,
        duration: 10,
        rating: 4.9,
        reviewCount: 547,
        category: "Beaches"
      },
      {
        name: "Kyoto",
        country: "Japan",
        description: "Historical city with beautiful temples, traditional gardens, and rich cultural heritage.",
        imageUrl: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
        price: 1499,
        duration: 8,
        rating: 4.4,
        reviewCount: 312,
        category: "Historic"
      },
      {
        name: "Cape Town",
        country: "South Africa",
        description: "Stunning coastal city with Table Mountain, beautiful beaches, and diverse culture.",
        imageUrl: "https://images.unsplash.com/photo-1526392060635-9d6019884377?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
        price: 1399,
        duration: 9,
        rating: 4.7,
        reviewCount: 209,
        category: "Urban"
      },
      {
        name: "Swiss Alps",
        country: "Switzerland",
        description: "Breathtaking mountain landscapes with pristine ski slopes and charming villages.",
        imageUrl: "https://images.unsplash.com/photo-1465056836041-7f43ac27dcb5?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
        price: 1599,
        duration: 6,
        rating: 4.8,
        reviewCount: 321,
        category: "Mountains"
      },
      {
        name: "Maldives",
        country: "Maldives",
        description: "Paradise on earth with crystal clear waters, white sand beaches, and overwater bungalows.",
        imageUrl: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
        price: 1999,
        duration: 7,
        rating: 4.9,
        reviewCount: 456,
        category: "Beaches"
      },
      {
        name: "Paris",
        country: "France",
        description: "Romantic city of lights with iconic architecture, world-class cuisine, and art.",
        imageUrl: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
        price: 1199,
        duration: 5,
        rating: 4.6,
        reviewCount: 589,
        category: "Urban"
      },
      {
        name: "Machu Picchu",
        country: "Peru",
        description: "Ancient Incan citadel set high in the Andes Mountains, offering breathtaking views.",
        imageUrl: "https://images.unsplash.com/photo-1526392060635-9d6019884377?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
        price: 1699,
        duration: 8,
        rating: 4.8,
        reviewCount: 345,
        category: "Historic"
      }
    ];

    demoDestinations.forEach(destination => {
      this.createDestination(destination);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByFirebaseId(firebaseId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.firebaseId === firebaseId,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = await this.getUser(id);
    if (!existingUser) return undefined;
    
    const updatedUser = { ...existingUser, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Destination methods
  async getDestination(id: number): Promise<Destination | undefined> {
    return this.destinations.get(id);
  }

  async getDestinations(): Promise<Destination[]> {
    return Array.from(this.destinations.values());
  }

  async getDestinationsByCategory(category: string): Promise<Destination[]> {
    return Array.from(this.destinations.values()).filter(
      (destination) => destination.category === category
    );
  }

  async createDestination(insertDestination: InsertDestination): Promise<Destination> {
    const id = this.currentDestinationId++;
    const destination: Destination = { ...insertDestination, id };
    this.destinations.set(id, destination);
    return destination;
  }

  // Booking methods
  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getUserBookings(userId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.userId === userId
    );
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.currentBookingId++;
    const now = new Date();
    const booking: Booking = { ...insertBooking, id, createdAt: now };
    this.bookings.set(id, booking);
    return booking;
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    const existingBooking = await this.getBooking(id);
    if (!existingBooking) return undefined;
    
    const updatedBooking = { ...existingBooking, status };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  // Message methods
  async getMessages(userId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (message) => message.userId === userId
    );
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const now = new Date();
    const message: Message = { ...insertMessage, id, timestamp: now };
    this.messages.set(id, message);
    return message;
  }
}

export const storage = new MemStorage();

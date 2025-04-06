export interface Destination {
  id: number;
  name: string;
  country: string;
  description: string;
  imageUrl: string;
  price: number;
  duration: number;
  rating: number;
  reviewCount: number;
  category: string;
}

export const categories = [
  "All Destinations",
  "Beaches",
  "Mountains",
  "Urban",
  "Historic",
  "Islands"
];

export const experiences = [
  {
    id: 1,
    title: "Underwater Diving",
    description: "Explore vibrant coral reefs and marine life in crystal clear waters with professional guides.",
    price: 299,
    imageUrl: "https://images.unsplash.com/photo-1530866495561-507c9faab2ed?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    category: "Adventure"
  },
  {
    id: 2,
    title: "Hot Air Balloon Ride",
    description: "Soar above breathtaking landscapes at sunrise with champagne breakfast included.",
    price: 349,
    imageUrl: "https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    category: "Romantic"
  },
  {
    id: 3,
    title: "Traditional Cooking Class",
    description: "Learn authentic local recipes from expert chefs and enjoy the meal you prepare.",
    price: 129,
    imageUrl: "https://images.unsplash.com/photo-1589834390005-5d4fb9bf3d32?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    category: "Cultural"
  }
];

export const accommodations = [
  {
    id: 1,
    name: "Grand Azure Resort",
    location: "Maldives",
    rating: 5.0,
    reviewCount: 128,
    pricePerNight: 599,
    imageUrl: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    amenities: ["Beachfront", "Spa", "Fine Dining"]
  },
  {
    id: 2,
    name: "Mountain View Lodge",
    location: "Switzerland",
    rating: 4.8,
    reviewCount: 97,
    pricePerNight: 429,
    imageUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    amenities: ["Mountain View", "Ski Access", "Fireplace"]
  },
  {
    id: 3,
    name: "Urban Oasis Hotel",
    location: "Singapore",
    rating: 4.9,
    reviewCount: 176,
    pricePerNight: 499,
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    amenities: ["Infinity Pool", "City View", "Luxury Spa"]
  }
];

export const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    package: "Bali Adventure Package",
    rating: 5,
    comment: "Our trip to Bali was absolutely magical. The accommodations were luxurious, the activities were perfectly planned, and our guide was incredibly knowledgeable. Voyager truly delivered an experience beyond our expectations!",
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
  },
  {
    id: 2,
    name: "David Mitchell",
    package: "Japan Cultural Experience",
    rating: 5,
    comment: "The Japan cultural tour exceeded all expectations. From the moment we landed until our departure, everything was seamless. The traditional ryokan stay and tea ceremony were highlights. Would book with Voyager again in a heartbeat!",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
  },
  {
    id: 3,
    name: "Emma & James",
    package: "Santorini Honeymoon Package",
    rating: 4.5,
    comment: "Our honeymoon in Santorini was absolutely perfect. The sunset cruise, private dinner, and luxury villa with infinity pool made for the most romantic getaway. The Voyager team thought of every detail to make our trip special.",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
  }
];

// Helper function to get cities starting with a search string
export function getCitySuggestions(searchTerm: string): string[] {
  const cities = [
    "Bangkok, Thailand",
    "Barcelona, Spain",
    "Bali, Indonesia",
    "Berlin, Germany",
    "Boston, USA",
    "Budapest, Hungary",
    "Cairo, Egypt",
    "Cape Town, South Africa",
    "Chicago, USA",
    "Dubai, UAE",
    "Dublin, Ireland",
    "Hong Kong, China",
    "Istanbul, Turkey",
    "Kyoto, Japan",
    "London, UK",
    "Los Angeles, USA",
    "Madrid, Spain",
    "Marrakech, Morocco",
    "Melbourne, Australia",
    "Mexico City, Mexico",
    "Miami, USA",
    "Milan, Italy",
    "Moscow, Russia",
    "Mumbai, India",
    "New York, USA",
    "Paris, France",
    "Prague, Czech Republic",
    "Rio de Janeiro, Brazil",
    "Rome, Italy",
    "San Francisco, USA",
    "Santorini, Greece",
    "Seoul, South Korea",
    "Shanghai, China",
    "Singapore",
    "Sydney, Australia",
    "Tokyo, Japan",
    "Toronto, Canada",
    "Venice, Italy",
    "Vienna, Austria",
    "Zurich, Switzerland"
  ];
  
  return cities.filter(city => 
    city.toLowerCase().startsWith(searchTerm.toLowerCase())
  );
}

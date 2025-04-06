import { useState, useEffect, useRef } from "react";
import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";
import { Destination } from "@/lib/destinations";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/navigation/Navbar";
import Footer from "@/components/Footer";
import LoginModal from "@/components/auth/LoginModal";
import BackToTop from "@/components/BackToTop";
import { apiRequest } from "@/lib/queryClient";
import { auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import * as THREE from "three";

const DestinationDetails = () => {
  const [, params] = useRoute("/destinations/:id");
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [user] = useAuthState(auth);
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  const destinationId = params?.id ? parseInt(params.id) : null;

  useEffect(() => {
    if (!destinationId) return;

    const fetchDestination = async () => {
      try {
        setLoading(true);
        const response = await apiRequest(
          "GET",
          `/api/destinations/${destinationId}`,
          undefined
        );
        const data = await response.json();
        setDestination(data);
      } catch (error) {
        console.error("Error fetching destination:", error);
        toast({
          title: "Error",
          description: "Failed to load destination details. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDestination();
  }, [destinationId, toast]);

  // Setup Three.js scene
  useEffect(() => {
    if (!canvasRef.current || !destination) return;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      canvasRef.current.clientWidth / canvasRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    rendererRef.current = renderer;

    // Create a simple 3D representation of the destination
    const geometry = new THREE.SphereGeometry(2, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      color: 0x0066FF,
      wireframe: true,
      transparent: true,
      opacity: 0.7,
    });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Add some points of interest
    const addPoint = (lat: number, lng: number, size: number = 0.05, color: number = 0xFF9500) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      
      const pointGeometry = new THREE.SphereGeometry(size, 8, 8);
      const pointMaterial = new THREE.MeshBasicMaterial({ color });
      
      const point = new THREE.Mesh(pointGeometry, pointMaterial);
      
      // Position the point on the sphere surface
      const x = -2.1 * Math.sin(phi) * Math.cos(theta);
      const y = 2.1 * Math.cos(phi);
      const z = 2.1 * Math.sin(phi) * Math.sin(theta);
      
      point.position.set(x, y, z);
      
      scene.add(point);
      return point;
    };

    // Add random points based on destination
    const points = [
      addPoint(30, 20),
      addPoint(-10, 40),
      addPoint(50, -30),
      addPoint(-40, -60),
      addPoint(0, 90),
    ];

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      
      if (sphere) {
        sphere.rotation.y += 0.003;
      }
      
      // Pulsate points
      points.forEach((point, i) => {
        const pulseFactor = Math.sin(Date.now() * 0.001 + i) * 0.2 + 0.8;
        point.scale.set(pulseFactor, pulseFactor, pulseFactor);
      });
      
      renderer.render(scene, camera);
    };
    
    animate();

    // Handle resize
    const handleResize = () => {
      if (!canvasRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const width = canvasRef.current.clientWidth;
      const height = canvasRef.current.clientHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      
      // Clean up resources
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [destination]);

  const handleOpenLogin = () => {
    setIsLoginModalOpen(true);
  };

  const handleCloseLogin = () => {
    setIsLoginModalOpen(false);
  };

  const handleBookNow = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to book this destination",
        variant: "default",
      });
      handleOpenLogin();
      return;
    }

    if (destinationId) {
      window.location.href = `/booking/${destinationId}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar onOpenLogin={handleOpenLogin} user={user} />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <div className="flex justify-center items-center h-[60vh]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar onOpenLogin={handleOpenLogin} user={user} />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <h2 className="text-2xl font-bold mb-4">Destination Not Found</h2>
            <p className="text-gray-600 mb-6">
              The destination you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/">
              <Button className="bg-primary text-white hover:bg-primary/90">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Mock additional images based on the main image
  const images = [
    destination.imageUrl,
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1530866495561-507c9faab2ed?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onOpenLogin={handleOpenLogin} user={user} />
      
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Images and 3D View */}
          <div className="lg:w-3/5">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Main Image */}
              <div className="relative h-[400px] overflow-hidden">
                <motion.img
                  src={images[selectedImageIndex]}
                  alt={destination.name}
                  className="w-full h-full object-cover"
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              
              {/* Thumbnail Images */}
              <div className="p-4 grid grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className={`cursor-pointer h-20 overflow-hidden rounded-md ${
                      selectedImageIndex === index ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* 3D Interactive View */}
            <div className="mt-6 bg-white rounded-xl shadow-md p-4">
              <h3 className="font-montserrat font-bold text-lg mb-4">
                <i className="fas fa-cube text-primary mr-2"></i>
                3D Interactive View
              </h3>
              <div className="aspect-video relative">
                <canvas
                  ref={canvasRef}
                  className="w-full h-full rounded-lg bg-gray-100"
                />
                <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-md text-xs text-gray-600">
                  <i className="fas fa-hand-pointer mr-1"></i> Drag to rotate
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Destination Details */}
          <div className="lg:w-2/5">
            <div className="bg-white rounded-xl shadow-md p-6 h-full">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="font-montserrat font-bold text-3xl mb-2">
                    {destination.name}
                  </h1>
                  <div className="flex items-center mb-4">
                    <i className="fas fa-map-marker-alt text-primary mr-2"></i>
                    <span className="text-gray-600">{destination.country}</span>
                  </div>
                </div>
                <div className="bg-primary/10 text-primary font-bold text-lg px-4 py-2 rounded-lg">
                  ${destination.price}
                </div>
              </div>
              
              {/* Rating */}
              <div className="flex items-center mb-6">
                <div className="flex text-yellow-400">
                  {[...Array(Math.floor(destination.rating))].map((_, i) => (
                    <i key={i} className="fas fa-star"></i>
                  ))}
                  {destination.rating % 1 >= 0.5 && (
                    <i className="fas fa-star-half-alt"></i>
                  )}
                  {destination.rating % 1 < 0.5 &&
                    destination.rating % 1 > 0 && (
                      <i className="far fa-star"></i>
                    )}
                  {[...Array(5 - Math.ceil(destination.rating))].map((_, i) => (
                    <i key={i} className="far fa-star"></i>
                  ))}
                </div>
                <span className="text-gray-600 ml-2">
                  {destination.rating.toFixed(1)} ({destination.reviewCount} reviews)
                </span>
              </div>
              
              {/* Description */}
              <div className="mb-6">
                <h3 className="font-montserrat font-bold text-lg mb-2">Description</h3>
                <p className="text-gray-600">{destination.description}</p>
              </div>
              
              {/* Details */}
              <div className="mb-6">
                <h3 className="font-montserrat font-bold text-lg mb-2">Trip Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <i className="far fa-clock text-primary mr-2"></i>
                    <div>
                      <p className="text-sm text-gray-500">Duration</p>
                      <p className="font-medium">{destination.duration} days</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-users text-primary mr-2"></i>
                    <div>
                      <p className="text-sm text-gray-500">Group Size</p>
                      <p className="font-medium">Up to 12 people</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-calendar-alt text-primary mr-2"></i>
                    <div>
                      <p className="text-sm text-gray-500">Available</p>
                      <p className="font-medium">All year round</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-language text-primary mr-2"></i>
                    <div>
                      <p className="text-sm text-gray-500">Languages</p>
                      <p className="font-medium">English, Spanish</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Included/Not Included */}
              <div className="mb-6">
                <h3 className="font-montserrat font-bold text-lg mb-2">What's Included</h3>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-2"></i>
                    <p className="text-gray-600">Accommodation</p>
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-2"></i>
                    <p className="text-gray-600">Airport transfers</p>
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-2"></i>
                    <p className="text-gray-600">Breakfast & dinner</p>
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-times text-red-500 mr-2"></i>
                    <p className="text-gray-600">International flights</p>
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-times text-red-500 mr-2"></i>
                    <p className="text-gray-600">Travel insurance</p>
                  </div>
                </div>
              </div>
              
              {/* Booking Button */}
              <div className="mt-8">
                <Button
                  className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 text-lg"
                  onClick={handleBookNow}
                >
                  Book Now
                </Button>
                <p className="text-center text-gray-500 text-sm mt-2">
                  <i className="fas fa-lock mr-1"></i> Secure payment, free cancellation
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Additional Section - Similar Destinations */}
        <div className="mt-12">
          <h2 className="font-montserrat font-bold text-2xl mb-6">You Might Also Like</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="bg-white rounded-xl shadow-md overflow-hidden"
                whileHover={{ y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="h-40 overflow-hidden">
                  <img 
                    src={`https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80`}
                    alt="Similar destination"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-montserrat font-bold">Similar Destination {i}</h3>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-primary font-bold">${(destination.price * 0.8).toFixed(0)}</span>
                    <Button variant="outline" size="sm" className="text-xs">
                      View Details
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      <Footer />
      <BackToTop />
      <LoginModal isOpen={isLoginModalOpen} onClose={handleCloseLogin} />
    </div>
  );
};

export default DestinationDetails;

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';

const Globe = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<THREE.Group | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(300, 300);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Globe creation
    const group = new THREE.Group();
    globeRef.current = group;
    scene.add(group);

    // Create Earth sphere
    const sphereGeometry = new THREE.SphereGeometry(2, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x0066FF,
      transparent: true,
      opacity: 0.8,
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    group.add(sphere);

    // Add landmasses as simple shapes on the globe
    const addLandmass = (lat: number, lng: number, size: number) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      
      const geometry = new THREE.CircleGeometry(size, 8);
      const material = new THREE.MeshBasicMaterial({ 
        color: 0xFFFFFF,
        transparent: true,
        opacity: 0.3
      });
      
      const landmass = new THREE.Mesh(geometry, material);
      
      // Convert lat/lng to xyz coordinates on sphere
      const x = -(2 * Math.sin(phi) * Math.cos(theta));
      const y = 2 * Math.cos(phi);
      const z = 2 * Math.sin(phi) * Math.sin(theta);
      
      landmass.position.set(x, y, z);
      
      // Make landmass face outward from center of the sphere
      landmass.lookAt(0, 0, 0);
      
      group.add(landmass);
    };

    // Add some locations (approximations for visual effect)
    addLandmass(40, -100, 0.5); // North America
    addLandmass(50, 10, 0.4);   // Europe
    addLandmass(25, 120, 0.5);  // Asia
    addLandmass(-25, 135, 0.3); // Australia
    addLandmass(-10, -60, 0.4); // South America
    addLandmass(5, 20, 0.5);    // Africa

    // Add location pins
    const addLocationPin = (lat: number, lng: number, color: number) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      
      const geometry = new THREE.SphereGeometry(0.06, 8, 8);
      const material = new THREE.MeshBasicMaterial({ color });
      
      const pin = new THREE.Mesh(geometry, material);
      
      // Position the pin slightly above the globe surface
      const x = -(2.1 * Math.sin(phi) * Math.cos(theta));
      const y = 2.1 * Math.cos(phi);
      const z = 2.1 * Math.sin(phi) * Math.sin(theta);
      
      pin.position.set(x, y, z);
      
      group.add(pin);
    };

    // Add pins for popular destinations
    addLocationPin(37, -115, 0xFF9500);  // Las Vegas
    addLocationPin(35, 140, 0xFF9500);   // Tokyo
    addLocationPin(-33, 151, 0xFF9500);  // Sydney
    addLocationPin(41, 28, 0x00D1B2);    // Istanbul
    addLocationPin(1, 104, 0x00D1B2);    // Singapore
    addLocationPin(-34, 18, 0x00D1B2);   // Cape Town

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      if (globeRef.current) {
        globeRef.current.rotation.y += 0.003;
      }
      
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    
    animate();

    // Clean up
    return () => {
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
    };
  }, []);

  return (
    <div className="globe-container relative w-full max-w-md h-[400px] flex items-center justify-center">
      <motion.div 
        ref={containerRef}
        className="globe absolute inset-0 flex items-center justify-center"
        animate={{ y: [0, -10, 0] }}
        transition={{ 
          repeat: Infinity, 
          duration: 6,
          ease: "easeInOut"
        }}
      />
      
      {/* Floating destination cards */}
      <motion.div 
        className="absolute top-[15%] right-[5%] bg-white p-2 rounded-lg shadow-lg transform -rotate-6 scale-75"
        animate={{ scale: [0.75, 0.78, 0.75] }}
        transition={{ repeat: Infinity, duration: 4 }}
      >
        <div className="w-24 h-16 bg-gray-300 rounded overflow-hidden">
          <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">Paris</div>
        </div>
        <p className="text-xs font-bold text-center mt-1">Paris</p>
      </motion.div>
      
      <motion.div 
        className="absolute bottom-[25%] left-[10%] bg-white p-2 rounded-lg shadow-lg transform rotate-6 scale-75"
        animate={{ scale: [0.75, 0.78,, 0.75] }}
        transition={{ repeat: Infinity, duration: 4, delay: 2 }}
      >
        <div className="w-24 h-16 bg-gray-300 rounded overflow-hidden">
          <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">Maldives</div>
        </div>
        <p className="text-xs font-bold text-center mt-1">Maldives</p>
      </motion.div>
    </div>
  );
};

export default Globe;

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';

const Globe = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<THREE.Group | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const pinsRef = useRef<THREE.Object3D[]>([]);

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
    renderer.setSize(400, 400); // Increased size
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    // Globe creation
    const group = new THREE.Group();
    globeRef.current = group;
    scene.add(group);

    // Create Earth sphere with gradient texture
    const sphereGeometry = new THREE.SphereGeometry(2, 64, 64);
    
    // Create a canvas for the gradient texture
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, '#0066FF');  // Primary color at top
    gradient.addColorStop(0.5, '#00D1B2'); // Secondary color in middle
    gradient.addColorStop(1, '#0099FF');  // Back to similar color at bottom
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    
    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    
    // Create material with texture
    const sphereMaterial = new THREE.MeshPhongMaterial({
      map: texture,
      transparent: true,
      opacity: 0.95,
      shininess: 100
    });
    
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    group.add(sphere);

    // Create a glowing atmosphere
    const atmosphereGeometry = new THREE.SphereGeometry(2.15, 50, 50);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.1,
      side: THREE.BackSide
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    group.add(atmosphere);

    // Add animated ring around globe
    const ringGeometry = new THREE.RingGeometry(2.5, 2.6, 50);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    group.add(ring);

    // Add continents with better shape
    const addContinent = (lat: number, lng: number, size: number, color: number = 0xFFFFFF) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      
      // Use a more complex shape for continents
      const shape = new THREE.Shape();
      const segments = 8;
      const angleStep = (Math.PI * 2) / segments;
      
      // Create an irregular shape
      for (let i = 0; i <= segments; i++) {
        const angle = i * angleStep;
        const radius = size * (0.8 + Math.random() * 0.4); // Random variation in radius
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        
        if (i === 0) {
          shape.moveTo(x, y);
        } else {
          shape.lineTo(x, y);
        }
      }
      
      const geometry = new THREE.ShapeGeometry(shape);
      const material = new THREE.MeshPhongMaterial({ 
        color,
        transparent: true,
        opacity: 0.7,
        shininess: 30
      });
      
      const continent = new THREE.Mesh(geometry, material);
      
      // Convert lat/lng to xyz coordinates on sphere
      const x = -(2.01 * Math.sin(phi) * Math.cos(theta));
      const y = 2.01 * Math.cos(phi);
      const z = 2.01 * Math.sin(phi) * Math.sin(theta);
      
      continent.position.set(x, y, z);
      
      // Make continent face outward from center of the sphere
      continent.lookAt(0, 0, 0);
      
      group.add(continent);
    };

    // Add continents with different colors
    addContinent(40, -100, 0.6, 0x00D1B2); // North America
    addContinent(50, 10, 0.5, 0xFFFFFF);   // Europe
    addContinent(25, 120, 0.7, 0x00D1B2);  // Asia
    addContinent(-25, 135, 0.5, 0xFFFFFF); // Australia
    addContinent(-10, -60, 0.55, 0x00D1B2); // South America
    addContinent(5, 20, 0.6, 0xFFFFFF);    // Africa

    // Add location pins with animations
    const addLocationPin = (lat: number, lng: number, color: number) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      
      // Create pin with cone and sphere
      const pinGroup = new THREE.Group();
      
      // Head of pin (sphere)
      const headGeometry = new THREE.SphereGeometry(0.08, 16, 16);
      const headMaterial = new THREE.MeshPhongMaterial({ 
        color, 
        emissive: color,
        emissiveIntensity: 0.5,
        shininess: 100
      });
      const head = new THREE.Mesh(headGeometry, headMaterial);
      
      // Tail of pin (cone)
      const tailGeometry = new THREE.ConeGeometry(0.05, 0.2, 8);
      const tailMaterial = new THREE.MeshPhongMaterial({ color });
      const tail = new THREE.Mesh(tailGeometry, tailMaterial);
      tail.position.y = -0.14;
      tail.rotation.x = Math.PI;
      
      pinGroup.add(head);
      pinGroup.add(tail);
      
      // Position the pin slightly above the globe surface
      const distance = 2.2; // Slightly above surface
      const x = -(distance * Math.sin(phi) * Math.cos(theta));
      const y = distance * Math.cos(phi);
      const z = distance * Math.sin(phi) * Math.sin(theta);
      
      pinGroup.position.set(x, y, z);
      pinGroup.lookAt(0, 0, 0);
      
      group.add(pinGroup);
      pinsRef.current.push(pinGroup);
    };

    // Add pins for popular destinations
    addLocationPin(37, -115, 0xFF9500);  // Las Vegas
    addLocationPin(35, 140, 0xFF9500);   // Tokyo
    addLocationPin(-33, 151, 0xFF9500);  // Sydney
    addLocationPin(41, 28, 0x00D1B2);    // Istanbul
    addLocationPin(1, 104, 0x00D1B2);    // Singapore
    addLocationPin(-34, 18, 0x00D1B2);   // Cape Town
    addLocationPin(19, 73, 0xFF9500);    // Mumbai
    addLocationPin(48, 2, 0xFF9500);     // Paris
    addLocationPin(-1, 37, 0x00D1B2);    // Nairobi

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      if (globeRef.current) {
        globeRef.current.rotation.y += 0.003;
        ring.rotation.z += 0.001; // Rotate ring independently
        atmosphere.rotation.y -= 0.001; // Rotate atmosphere in opposite direction
      }
      
      // Animate pins pulsing
      pinsRef.current.forEach((pin, index) => {
        const time = Date.now() * 0.001;
        const pulseFactor = 0.95 + 0.05 * Math.sin(time * 2 + index * 0.5);
        pin.scale.set(pulseFactor, pulseFactor, pulseFactor);
      });
      
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    
    animate();

    // Responsive handling
    const handleResize = () => {
      if (containerRef.current && rendererRef.current) {
        const size = Math.min(
          containerRef.current.parentElement?.offsetWidth || 400, 
          containerRef.current.parentElement?.offsetHeight || 400
        );
        rendererRef.current.setSize(size, size);
        
        if (cameraRef.current) {
          cameraRef.current.aspect = 1;
          cameraRef.current.updateProjectionMatrix();
        }
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
    };
  }, []);

  return (
    <div className="globe-container relative w-full max-w-md h-[500px] flex items-center justify-center">
      {/* Glow effect behind globe */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[380px] h-[380px] rounded-full bg-primary/10 blur-3xl"></div>
      </div>
      
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
        className="absolute top-[10%] right-[5%] bg-white p-3 rounded-lg shadow-xl transform -rotate-6 scale-75 z-10"
        animate={{ 
          scale: [0.75, 0.8, 0.75],
          rotate: [-6, -5, -6] 
        }}
        transition={{ repeat: Infinity, duration: 4 }}
      >
        <div className="w-28 h-20 bg-gray-100 rounded overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1499856871958-5b9627545d1a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" 
            alt="Paris"
            className="w-full h-full object-cover"
          />
        </div>
        <p className="text-xs font-bold text-center mt-1">Paris, France</p>
        <div className="flex items-center justify-center text-yellow-400 text-xs mt-1">
          <i className="fas fa-star"></i>
          <i className="fas fa-star"></i>
          <i className="fas fa-star"></i>
          <i className="fas fa-star"></i>
          <i className="fas fa-star-half-alt"></i>
        </div>
      </motion.div>
      
      <motion.div 
        className="absolute bottom-[20%] left-[5%] bg-white p-3 rounded-lg shadow-xl transform rotate-6 scale-75 z-10"
        animate={{ 
          scale: [0.75, 0.8, 0.75],
          rotate: [6, 5, 6] 
        }}
        transition={{ repeat: Infinity, duration: 4, delay: 2 }}
      >
        <div className="w-28 h-20 bg-gray-100 rounded overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1589979481772-93a3bf7304b2?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" 
            alt="Maldives"
            className="w-full h-full object-cover"
          />
        </div>
        <p className="text-xs font-bold text-center mt-1">Maldives</p>
        <div className="flex items-center justify-center text-yellow-400 text-xs mt-1">
          <i className="fas fa-star"></i>
          <i className="fas fa-star"></i>
          <i className="fas fa-star"></i>
          <i className="fas fa-star"></i>
          <i className="fas fa-star"></i>
        </div>
      </motion.div>
      
      <motion.div 
        className="absolute top-[40%] left-[10%] bg-white p-3 rounded-lg shadow-xl transform rotate-[-10deg] scale-75 z-10"
        animate={{ 
          scale: [0.75, 0.8, 0.75],
          rotate: [-10, -9, -10] 
        }}
        transition={{ repeat: Infinity, duration: 5, delay: 1 }}
      >
        <div className="w-28 h-20 bg-gray-100 rounded overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1548214649-c4b25d147b05?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" 
            alt="Tokyo"
            className="w-full h-full object-cover"
          />
        </div>
        <p className="text-xs font-bold text-center mt-1">Tokyo, Japan</p>
        <div className="flex items-center justify-center text-yellow-400 text-xs mt-1">
          <i className="fas fa-star"></i>
          <i className="fas fa-star"></i>
          <i className="fas fa-star"></i>
          <i className="fas fa-star"></i>
          <i className="fas fa-star-half-alt"></i>
        </div>
      </motion.div>
    </div>
  );
};

export default Globe;

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
  const textureLoader = useRef<THREE.TextureLoader | null>(null);

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

    // Renderer setup - higher quality
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      precision: 'highp',
      powerPreference: 'high-performance'
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(450, 450);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Texture loader setup
    textureLoader.current = new THREE.TextureLoader();

    // Lighting setup for realistic rendering
    // Ambient light for general illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Add directional light (sun)
    const sunLight = new THREE.DirectionalLight(0xffffff, 1);
    sunLight.position.set(5, 3, 5);
    scene.add(sunLight);

    // Add a softer fill light from the opposite side
    const fillLight = new THREE.DirectionalLight(0x3366ff, 0.3);
    fillLight.position.set(-5, 1, -5);
    scene.add(fillLight);

    // Add a subtle rim light for edge definition
    const rimLight = new THREE.DirectionalLight(0x91e4ff, 0.2);
    rimLight.position.set(0, -5, 0);
    scene.add(rimLight);

    // Globe creation
    const group = new THREE.Group();
    globeRef.current = group;
    scene.add(group);

    // Create Earth with realistic Earth texture
    const sphereGeometry = new THREE.SphereGeometry(2, 64, 64);
    
    // Create Earth material with realistic textures
    const earthMaterial = new THREE.MeshPhongMaterial({
      shininess: 15,
      transparent: true,
      opacity: 1
    });

    // Load Earth texture map and bump map for realistic terrain
    const earthTexture = "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg";
    const bumpMap = "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_normal_2048.jpg";
    const cloudMap = "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_clouds_1024.png";
    const specularMap = "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_specular_2048.jpg";

    if (textureLoader.current) {
      // Load Earth texture
      textureLoader.current.load(earthTexture, (texture) => {
        earthMaterial.map = texture;
        earthMaterial.needsUpdate = true;
      });

      // Load bump map for terrain
      textureLoader.current.load(bumpMap, (texture) => {
        earthMaterial.normalMap = texture;
        earthMaterial.normalScale.set(0.05, 0.05);
        earthMaterial.needsUpdate = true;
      });

      // Load specular map for oceans
      textureLoader.current.load(specularMap, (texture) => {
        earthMaterial.specularMap = texture;
        earthMaterial.needsUpdate = true;
      });
    }
    
    const earth = new THREE.Mesh(sphereGeometry, earthMaterial);
    group.add(earth);

    // Add cloud layer around Earth
    const cloudGeometry = new THREE.SphereGeometry(2.02, 64, 64);
    const cloudMaterial = new THREE.MeshPhongMaterial({
      transparent: true,
      opacity: 0.4,
      alphaTest: 0.05,
      depthWrite: false
    });

    if (textureLoader.current) {
      // Load cloud texture
      textureLoader.current.load(cloudMap, (texture) => {
        cloudMaterial.map = texture;
        cloudMaterial.alphaMap = texture;
        cloudMaterial.needsUpdate = true;
      });
    }

    const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
    group.add(clouds);

    // Add atmospheric glow
    const glowGeometry = new THREE.SphereGeometry(2.1, 50, 50);
    const glowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        "c": { value: 0.2 },
        "p": { value: 5.5 },
        glowColor: { value: new THREE.Color(0x00a6ff) },
        viewVector: { value: camera.position }
      },
      vertexShader: `
        uniform vec3 viewVector;
        uniform float c;
        uniform float p;
        varying float intensity;
        void main() {
          vec3 vNormal = normalize(normalMatrix * normal);
          vec3 vNormel = normalize(normalMatrix * viewVector);
          intensity = pow(c - dot(vNormal, vNormel), p);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying float intensity;
        void main() {
          vec3 glow = glowColor * intensity;
          gl_FragColor = vec4(glow, 1.0);
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });

    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    group.add(glow);

    // Add star field background
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xFFFFFF,
      size: 0.03,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    });

    const starsVertices = [];
    for (let i = 0; i < 2000; i++) {
      const x = (Math.random() - 0.5) * 30;
      const y = (Math.random() - 0.5) * 30;
      const z = (Math.random() - 0.5) * 30;
      
      // Make sure stars are not inside the globe
      if (Math.sqrt(x*x + y*y + z*z) < 4) continue;
      
      starsVertices.push(x, y, z);
    }

    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // Add a larger ring around the globe
    const ringGeometry = new THREE.RingGeometry(3, 3.05, 80);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    group.add(ring);

    // Secondary ring with different rotation
    const ringGeometry2 = new THREE.RingGeometry(3.2, 3.23, 80);
    const ringMaterial2 = new THREE.MeshBasicMaterial({
      color: 0xff9900,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    const ring2 = new THREE.Mesh(ringGeometry2, ringMaterial2);
    ring2.rotation.x = Math.PI / 3;
    ring2.rotation.y = Math.PI / 6;
    group.add(ring2);

    // Add location markers with glowing effect and flight path arcs
    const addLocationMarker = (lat: number, lng: number, color: number) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      
      // Create marker group
      const markerGroup = new THREE.Group();
      
      // Main marker (pulsing dot)
      const markerGeometry = new THREE.SphereGeometry(0.05, 16, 16);
      const markerMaterial = new THREE.MeshPhongMaterial({ 
        color, 
        emissive: color,
        emissiveIntensity: 0.8,
        transparent: true,
        opacity: 0.8
      });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      
      // Position marker on globe surface
      const distance = 2.01;
      const x = -(distance * Math.sin(phi) * Math.cos(theta));
      const y = distance * Math.cos(phi);
      const z = distance * Math.sin(phi) * Math.sin(theta);
      
      markerGroup.position.set(x, y, z);
      markerGroup.lookAt(0, 0, 0);
      
      // Add ripple effect rings
      const rippleGeometry = new THREE.RingGeometry(0.05, 0.1, 16);
      const rippleMaterial = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
      });
      const ripple = new THREE.Mesh(rippleGeometry, rippleMaterial);
      ripple.rotation.x = Math.PI / 2;
      
      // Create animated glow for marker
      const glowGeometry = new THREE.SphereGeometry(0.08, 16, 16);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.3
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      
      markerGroup.add(marker);
      markerGroup.add(ripple);
      markerGroup.add(glow);
      
      group.add(markerGroup);
      pinsRef.current.push(markerGroup);
      
      // Return position for flight path creation
      return { lat, lng, x, y, z, marker: markerGroup };
    };

    // Create flight paths between cities
    const createFlightPath = (start: any, end: any, color: number) => {
      const startAngle = {
        theta: (90 - start.lat) * (Math.PI / 180),
        phi: (start.lng + 180) * (Math.PI / 180)
      };
      
      const endAngle = {
        theta: (90 - end.lat) * (Math.PI / 180),
        phi: (end.lng + 180) * (Math.PI / 180)
      };
      
      // Create a curve between the two points with an arc
      const distance = 2; // Radius of globe
      const arcHeight = 0.3; // How high above the surface
      
      const curvePoints = [];
      for (let i = 0; i <= 50; i++) {
        const t = i / 50;
        
        // Interpolate between start and end angles
        const lat = start.lat + t * (end.lat - start.lat);
        const lng = start.lng + t * (end.lng - start.lng);
        
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lng + 180) * (Math.PI / 180);
        
        // Add curve height in the middle
        const heightFactor = Math.sin(t * Math.PI) * arcHeight;
        const radius = distance + heightFactor;
        
        const x = -(radius * Math.sin(phi) * Math.cos(theta));
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);
        
        curvePoints.push(new THREE.Vector3(x, y, z));
      }
      
      const curve = new THREE.CatmullRomCurve3(curvePoints);
      const pathGeometry = new THREE.TubeGeometry(curve, 50, 0.01, 8, false);
      const pathMaterial = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.5
      });
      const pathMesh = new THREE.Mesh(pathGeometry, pathMaterial);
      
      group.add(pathMesh);
      
      // Add animated particle along the path
      const particleGeometry = new THREE.SphereGeometry(0.02, 8, 8);
      const particleMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.8
      });
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      
      // Set initial position at start
      const initialPoint = curve.getPoint(0);
      particle.position.set(initialPoint.x, initialPoint.y, initialPoint.z);
      
      group.add(particle);
      
      // Store animation info
      return {
        particle,
        curve,
        progress: Math.random()  // Start at random point on path
      };
    };

    // Add major cities as markers
    const cities = [
      { name: 'New York', lat: 40.71, lng: -74.01 },
      { name: 'London', lat: 51.51, lng: -0.13 },
      { name: 'Tokyo', lat: 35.68, lng: 139.76 },
      { name: 'Sydney', lat: -33.87, lng: 151.21 },
      { name: 'Rio de Janeiro', lat: -22.91, lng: -43.17 },
      { name: 'Cairo', lat: 30.05, lng: 31.25 },
      { name: 'Dubai', lat: 25.20, lng: 55.27 },
      { name: 'Singapore', lat: 1.35, lng: 103.82 },
      { name: 'Los Angeles', lat: 34.05, lng: -118.24 },
      { name: 'Paris', lat: 48.86, lng: 2.35 },
      { name: 'Moscow', lat: 55.75, lng: 37.62 },
      { name: 'Cape Town', lat: -33.92, lng: 18.42 }
    ];

    const cityMarkers = cities.map(city => {
      const color = (Math.random() > 0.5) ? 0x00ffff : 0xff9900;
      return addLocationMarker(city.lat, city.lng, color);
    });

    // Create some flight paths between cities
    interface FlightPath {
      particle: THREE.Mesh;
      curve: THREE.CatmullRomCurve3;
      progress: number;
    }
    
    const flightPaths: FlightPath[] = [];
    for (let i = 0; i < 8; i++) {
      const start = cityMarkers[i];
      const end = cityMarkers[(i + 5) % cityMarkers.length];
      const color = (Math.random() > 0.5) ? 0x00ffff : 0xff9900;
      
      flightPaths.push(createFlightPath(start, end, color));
    }

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Rotate globe
      if (globeRef.current) {
        globeRef.current.rotation.y += 0.002;
        clouds.rotation.y += 0.0025; // Clouds rotate slightly faster
      }
      
      // Animate rings
      ring.rotation.z += 0.001;
      ring2.rotation.z -= 0.0015;
      
      // Animate markers with pulsing
      pinsRef.current.forEach((pin, index) => {
        const time = Date.now() * 0.001;
        
        // Different pulse rates for variety
        const pulseFactor = 0.8 + 0.2 * Math.sin(time * 1.5 + index * 0.5);
        
        // Find child elements - these indices match the order we added them
        if (pin.children.length >= 3) {
          const marker = pin.children[0];
          const ripple = pin.children[1] as THREE.Mesh;
          const glow = pin.children[2] as THREE.Mesh;
          
          // Scale ripple effect
          const rippleScale = 0.5 + 0.5 * Math.sin(time * 2 + index);
          ripple.scale.set(rippleScale, rippleScale, rippleScale);
          
          // Adjust ripple opacity based on scale
          if (ripple.material instanceof THREE.MeshBasicMaterial) {
            ripple.material.opacity = 0.6 * (1 - rippleScale/2);
          }
          
          // Animate glow
          glow.scale.set(pulseFactor, pulseFactor, pulseFactor);
          if (glow.material instanceof THREE.MeshBasicMaterial) {
            glow.material.opacity = 0.3 * pulseFactor;
          }
        }
      });
      
      // Animate flight paths
      flightPaths.forEach(path => {
        // Move particle along path
        path.progress += 0.002;
        if (path.progress > 1) path.progress = 0;
        
        const point = path.curve.getPoint(path.progress);
        path.particle.position.set(point.x, point.y, point.z);
      });
      
      // Render scene
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    
    animate();

    // Handle responsive sizing
    const handleResize = () => {
      if (containerRef.current && rendererRef.current) {
        // Determine size based on container
        const width = Math.min(
          containerRef.current.parentElement?.offsetWidth || 450,
          450
        );
        const height = Math.min(
          containerRef.current.parentElement?.offsetHeight || 450,
          450
        );
        
        // Update renderer size
        rendererRef.current.setSize(width, height);
        
        // Update camera aspect ratio
        if (cameraRef.current) {
          cameraRef.current.aspect = width / height;
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
      
      // Clear references
      pinsRef.current = [];
      sceneRef.current = null;
      globeRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
    };
  }, []);

  return (
    <div className="globe-container relative w-full max-w-xl h-[500px] flex items-center justify-center">
      {/* Glow effect behind globe */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[450px] h-[450px] rounded-full bg-blue-500/10 blur-3xl"></div>
      </div>
      
      {/* Globe container */}
      <motion.div 
        ref={containerRef}
        className="globe absolute inset-0 flex items-center justify-center"
        animate={{ y: [0, -8, 0] }}
        transition={{ 
          repeat: Infinity, 
          duration: 5,
          ease: "easeInOut"
        }}
      />
      
      {/* Floating destination cards */}
      <motion.div 
        className="absolute top-[10%] right-[5%] bg-white/90 p-3 rounded-lg shadow-xl transform -rotate-6 scale-75 z-10 backdrop-blur-sm"
        animate={{ 
          scale: [0.75, 0.8, 0.75],
          rotate: [-6, -5, -6] 
        }}
        transition={{ repeat: Infinity, duration: 4 }}
      >
        <div className="w-28 h-20 rounded overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1431274172761-fca41d930114?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" 
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
        className="absolute bottom-[20%] left-[5%] bg-white/90 p-3 rounded-lg shadow-xl transform rotate-6 scale-75 z-10 backdrop-blur-sm"
        animate={{ 
          scale: [0.75, 0.8, 0.75],
          rotate: [6, 5, 6] 
        }}
        transition={{ repeat: Infinity, duration: 4, delay: 2 }}
      >
        <div className="w-28 h-20 rounded overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1573843981267-be1999ff37cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" 
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
        className="absolute top-[40%] left-[8%] bg-white/90 p-3 rounded-lg shadow-xl transform rotate-[-10deg] scale-75 z-10 backdrop-blur-sm"
        animate={{ 
          scale: [0.75, 0.8, 0.75],
          rotate: [-10, -9, -10] 
        }}
        transition={{ repeat: Infinity, duration: 5, delay: 1 }}
      >
        <div className="w-28 h-20 rounded overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" 
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

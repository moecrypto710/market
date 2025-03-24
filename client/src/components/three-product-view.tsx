import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * ThreeProductView Component
 * 
 * Provides a 3D visualization of products using Three.js
 * Based on the Three.js example provided
 */
interface ThreeProductViewProps {
  productModel?: string; // Path to 3D model if available
  color?: string; // Color for the default cube if no model provided
  rotationSpeed?: number; // Speed of automatic rotation
  className?: string;
  width?: string | number;
  height?: string | number;
  cameraPosition?: { x: number; y: number; z: number };
  showControls?: boolean;
  backgroundColor?: string;
}

export default function ThreeProductView({
  productModel,
  color = '#f59e0b', // amber-500 default
  rotationSpeed = 0.01,
  className = '',
  width = '100%',
  height = '300px',
  cameraPosition = { x: 0, y: 0, z: 5 },
  showControls = true,
  backgroundColor = '#1a1a2e',
}: ThreeProductViewProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const objectRef = useRef<THREE.Mesh | null>(null);
  
  useEffect(() => {
    if (!mountRef.current) return;
    
    // Initialize scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(backgroundColor);
    sceneRef.current = scene;
    
    // Initialize camera
    const camera = new THREE.PerspectiveCamera(
      75, 
      mountRef.current.clientWidth / mountRef.current.clientHeight, 
      0.1, 
      1000
    );
    camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
    cameraRef.current = camera;
    
    // Initialize renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    rendererRef.current = renderer;
    
    // Add renderer to DOM
    mountRef.current.appendChild(renderer.domElement);
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    // Create object
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshStandardMaterial({ 
      color: new THREE.Color(color),
      metalness: 0.3,
      roughness: 0.4,
    });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    objectRef.current = cube;
    
    // Animation function
    const animate = () => {
      if (!objectRef.current || !rendererRef.current || !sceneRef.current || !cameraRef.current) return;
      
      requestAnimationFrame(animate);
      
      // Rotate the object
      objectRef.current.rotation.x += rotationSpeed;
      objectRef.current.rotation.y += rotationSpeed;
      
      // Render the scene
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };
    
    // Start animation
    animate();
    
    // Handle window resize
    const handleResize = () => {
      if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      
      rendererRef.current.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      
      if (objectRef.current) {
        if (objectRef.current.geometry) objectRef.current.geometry.dispose();
        if (objectRef.current.material) {
          if (Array.isArray(objectRef.current.material)) {
            objectRef.current.material.forEach((material: THREE.Material) => material.dispose());
          } else {
            objectRef.current.material.dispose();
          }
        }
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [color, rotationSpeed, backgroundColor, cameraPosition.x, cameraPosition.y, cameraPosition.z]);
  
  return (
    <div 
      ref={mountRef} 
      className={`three-product-view overflow-hidden rounded-lg ${className}`}
      style={{ 
        width: width, 
        height: height,
        position: 'relative',
      }}
    >
      {showControls && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-10">
          <button 
            className="px-2 py-1 bg-black/30 text-white rounded hover:bg-black/50 text-sm"
            onClick={() => {
              if (objectRef.current) {
                objectRef.current.rotation.set(0, 0, 0);
              }
            }}
          >
            إعادة ضبط
          </button>
          <button 
            className="px-2 py-1 bg-black/30 text-white rounded hover:bg-black/50 text-sm"
            onClick={() => {
              if (cameraRef.current) {
                cameraRef.current.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
                cameraRef.current.lookAt(0, 0, 0);
              }
            }}
          >
            ضبط الكاميرا
          </button>
        </div>
      )}
    </div>
  );
}
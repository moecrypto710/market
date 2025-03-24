import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// Import the building data
import buildingData from '../../public/models/building-data';

/**
 * ThreeBuildingModel Component
 * 
 * Creates a 3D building model using Three.js and the building data
 * This is a simplified implementation that creates a building model from parameters
 * instead of loading a GLB/GLTF file directly
 */
interface ThreeBuildingModelProps {
  type?: 'travel' | 'clothing' | 'electronics' | 'other';
  color?: string;
  width?: number;
  height?: number;
  depth?: number;
  rotation?: number;
  scale?: number;
  className?: string;
  modelHeight?: string | number;
  showControls?: boolean;
  onClick?: () => void;
}

export default function ThreeBuildingModel({
  type = 'travel',
  color = '#2563eb', // blue-600 default
  width = buildingData.width,
  height = buildingData.height,
  depth = buildingData.depth,
  rotation = 0,
  scale = 1,
  className = '',
  modelHeight = '300px',
  showControls = false,
  onClick
}: ThreeBuildingModelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    // Don't proceed if no container
    if (!containerRef.current) return;
    
    // Basic Three.js setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#1a1a2e');
    
    // Set up container dimensions
    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = typeof modelHeight === 'number' ? modelHeight : 300;
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(60, containerWidth / containerHeight, 0.1, 1000);
    camera.position.set(0, 5, 15);
    camera.lookAt(0, 0, 0);
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerWidth, containerHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;
    // Set up shadows for better quality
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    scene.add(directionalLight);
    
    // Building material
    const buildingMaterial = new THREE.MeshPhongMaterial({
      color: new THREE.Color(color),
      specular: 0x111111,
      shininess: 30
    });
    
    // Use building type to select appropriate colors and features
    let mainColor = color;
    let windowColor = buildingData.facades.windows;
    let roofColor = buildingData.facades.roof;
    
    switch (type) {
      case 'travel':
        roofColor = '#3b82f6';
        break;
      case 'clothing':
        mainColor = '#f59e0b';
        roofColor = '#d97706';
        break;
      case 'electronics':
        mainColor = '#10b981';
        roofColor = '#059669';
        break;
    }
    
    // Create building
    const createBuilding = () => {
      const buildingGroup = new THREE.Group();
    
      // Main building structure
      const buildingGeometry = new THREE.BoxGeometry(width, height, depth);
      const buildingMesh = new THREE.Mesh(
        buildingGeometry,
        new THREE.MeshPhongMaterial({ color: new THREE.Color(mainColor) })
      );
      buildingMesh.position.y = height / 2;
      buildingMesh.castShadow = true;
      buildingMesh.receiveShadow = true;
      buildingGroup.add(buildingMesh);
      
      // Roof
      const roofGeometry = new THREE.BoxGeometry(width + 0.5, 1, depth + 0.5);
      const roofMesh = new THREE.Mesh(
        roofGeometry,
        new THREE.MeshPhongMaterial({ color: new THREE.Color(roofColor) })
      );
      roofMesh.position.y = height + 0.5;
      roofMesh.castShadow = true;
      buildingGroup.add(roofMesh);
      
      // Windows
      const createWindows = () => {
        const floors = buildingData.features.floors;
        const windowsPerFloor = buildingData.features.windowsPerFloor;
        const windowWidth = buildingData.features.windowWidth;
        const windowHeight = buildingData.features.windowHeight;
        
        const windowGeometry = new THREE.PlaneGeometry(windowWidth, windowHeight);
        const windowMaterial = new THREE.MeshPhongMaterial({ 
          color: new THREE.Color(windowColor),
          transparent: true,
          opacity: 0.7,
          shininess: 100
        });
        
        // Front windows
        for (let floor = 0; floor < floors; floor++) {
          for (let w = 0; w < windowsPerFloor; w++) {
            const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
            
            // Position windows evenly across the facade
            const xPos = (w - (windowsPerFloor - 1) / 2) * (width / windowsPerFloor);
            const yPos = 1 + floor * (height / floors);
            const zPos = depth / 2 + 0.05; // Slightly in front of the facade
            
            windowMesh.position.set(xPos, yPos, zPos);
            buildingGroup.add(windowMesh);
          }
        }
        
        // Side windows
        for (let floor = 0; floor < floors; floor++) {
          for (let w = 0; w < windowsPerFloor - 1; w++) {
            const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
            
            // Position windows evenly across the side facade
            const zPos = (w - (windowsPerFloor - 2) / 2) * (depth / (windowsPerFloor - 1));
            const yPos = 1 + floor * (height / floors);
            const xPos = width / 2 + 0.05; // Slightly to the side of the facade
            
            windowMesh.position.set(xPos, yPos, zPos);
            windowMesh.rotation.y = Math.PI / 2; // Rotate to face outward
            buildingGroup.add(windowMesh);
          }
        }
      };
      
      // Add windows
      createWindows();
      
      // Door
      const doorGeometry = new THREE.PlaneGeometry(2, 3);
      const doorMaterial = new THREE.MeshPhongMaterial({ 
        color: new THREE.Color(buildingData.facades.door)
      });
      const doorMesh = new THREE.Mesh(doorGeometry, doorMaterial);
      doorMesh.position.set(0, 1.5, depth / 2 + 0.05);
      buildingGroup.add(doorMesh);
      
      // Ground/base
      const baseGeometry = new THREE.BoxGeometry(width + 2, 0.5, depth + 2);
      const baseMaterial = new THREE.MeshPhongMaterial({ 
        color: new THREE.Color(buildingData.facades.ground) 
      });
      const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
      baseMesh.position.y = -0.25;
      baseMesh.receiveShadow = true;
      buildingGroup.add(baseMesh);
      
      // Add the building to the scene
      buildingGroup.scale.set(scale, scale, scale);
      buildingGroup.rotation.y = rotation * (Math.PI / 180);
      scene.add(buildingGroup);
      
      return buildingGroup;
    };
    
    // Create and add building
    const building = createBuilding();
    
    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshPhongMaterial({
      color: 0x333333,
      side: THREE.DoubleSide
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = Math.PI / 2;
    ground.position.y = -0.5;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Animation function
    function animate() {
      requestAnimationFrame(animate);
      
      // Optional: Add subtle rotation
      if (showControls) {
        building.rotation.y += 0.005;
      }
      
      // Render the scene
      renderer.render(scene, camera);
    }
    
    // Start animation
    animate();
    setIsLoaded(true);
    
    // Handle resizing
    const handleResize = () => {
      if (!containerRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = typeof modelHeight === 'number' ? modelHeight : 300;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Clean up on unmount
    return () => {
      // Stop any animation loops
      renderer.dispose();
      
      // Remove event listeners
      window.removeEventListener('resize', handleResize);
      
      // Remove the canvas from the DOM
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [type, color, width, height, depth, rotation, scale, modelHeight, showControls]);
  
  return (
    <div 
      ref={containerRef}
      className={`three-building-model ${className}`}
      style={{ 
        height: modelHeight,
        width: '100%',
        overflow: 'hidden',
        borderRadius: '0.5rem',
        cursor: onClick ? 'pointer' : 'default'
      }}
      onClick={onClick}
    >
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900 bg-opacity-75 text-white">
          جاري تحميل النموذج...
        </div>
      )}
    </div>
  );
}
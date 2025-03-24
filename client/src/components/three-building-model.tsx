import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
// Using direct THREE.js geometry instead of GLTF loader
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// Import the building data
// Using the path relative to the public directory for Vite
const buildingData = {
  // Building dimensions
  width: 10,
  height: 15,
  depth: 10,
  
  // Building colors
  facades: {
    // Main building color
    main: '#2a4b8d', 
    // Windows color
    windows: '#a3c6ff',
    // Roof color
    roof: '#1a365d',
    // Door color
    door: '#4a6da7',
    // Ground floor color
    ground: '#3b5998',
    // Arabic style dome color
    dome: '#d4af37',
    // Arabic style pattern color
    pattern: '#e2c275',
    // Arabic style mosaic color
    mosaic: '#40a9ff',
  },
  
  // Building features
  features: {
    // Number of floors
    floors: 5,
    // Windows per floor per side
    windowsPerFloor: 3,
    // Window dimensions
    windowWidth: 1.5,
    windowHeight: 2,
    // Has balconies
    hasBalconies: true,
    // Has a roof structure
    hasRoofStructure: true,
    // Building style
    style: 'modern', // 'modern', 'classical', 'arabic'
    // Arabic architectural details
    arabicStyle: {
      // Has dome
      hasDome: true,
      // Has arched windows
      hasArchedWindows: true,
      // Has decorative patterns
      hasGeometricPatterns: true,
      // Has minaret
      hasMinaret: false,
      // Has mashrabiya (wooden lattice screens)
      hasMashrabiya: true,
    },
  },
  
  // Building type metadata
  metadata: {
    type: 'commercial',
    name: 'المبنى التجاري',
    description: 'مبنى تجاري حديث متعدد الطوابق',
  }
};

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
    
    // Create enhanced building with more architectural details and stylistic elements
    const createBuilding = () => {
      const buildingGroup = new THREE.Group();
      
      // Create building style elements based on type
      const buildingStyle = type === 'travel' ? 'modern' : 
                            type === 'clothing' ? 'arabic-boutique' : 
                            type === 'electronics' ? 'tech' : 'standard';
      
      // Main building structure with facade variation by type
      let buildingGeometry;
      
      // Apply different geometry based on building type
      if (buildingStyle === 'modern') {
        // Sleek, slightly tapered modern skyscraper for travel agency
        // Create a more complex shape for the modern building
        const points = [];
        const widthFactor = width * 0.5;
        
        // Create a slightly tapered shape - wider at bottom, narrower at top
        points.push(new THREE.Vector2(-widthFactor - 0.2, 0));
        points.push(new THREE.Vector2(-widthFactor, 0));
        points.push(new THREE.Vector2(-widthFactor * 0.95, height * 0.3));
        points.push(new THREE.Vector2(-widthFactor * 0.9, height * 0.7));
        points.push(new THREE.Vector2(-widthFactor * 0.85, height));
        points.push(new THREE.Vector2(widthFactor * 0.85, height));
        points.push(new THREE.Vector2(widthFactor * 0.9, height * 0.7));
        points.push(new THREE.Vector2(widthFactor * 0.95, height * 0.3));
        points.push(new THREE.Vector2(widthFactor, 0));
        points.push(new THREE.Vector2(widthFactor + 0.2, 0));
        
        // Create a shape from the points
        const shape = new THREE.Shape(points);
        
        // Extrude the shape to create a 3D building
        buildingGeometry = new THREE.ExtrudeGeometry(shape, {
          steps: 2,
          depth: depth,
          bevelEnabled: true,
          bevelThickness: 0.2,
          bevelSize: 0.1,
          bevelOffset: 0,
          bevelSegments: 3
        });
        
        // Rotate to correct orientation
        buildingGeometry.rotateX(Math.PI / 2);
      } else if (buildingStyle === 'arabic-boutique') {
        // Arabic style boutique building with decorative elements
        buildingGeometry = new THREE.BoxGeometry(width, height * 0.9, depth);
      } else if (buildingStyle === 'boutique') {
        // Elegant boutique building with decorative elements
        buildingGeometry = new THREE.BoxGeometry(width, height, depth);
      } else if (buildingStyle === 'tech') {
        // High-tech geometric building for electronics
        // Create a more complex shape for tech buildings
        buildingGeometry = new THREE.BoxGeometry(width, height, depth);
      } else {
        // Standard building
        buildingGeometry = new THREE.BoxGeometry(width, height, depth);
      }
      
      // Create materials with better shading and texture effects
      const buildingMaterial = new THREE.MeshPhongMaterial({ 
        color: new THREE.Color(mainColor),
        specular: 0x333333,
        shininess: 30,
      });
      
      const buildingMesh = new THREE.Mesh(buildingGeometry, buildingMaterial);
      
      // Position the building correctly based on its geometry
      if (buildingStyle === 'modern') {
        buildingMesh.position.y = height / 2;
        buildingMesh.position.z = -depth / 2;
      } else {
        buildingMesh.position.y = height / 2;
      }
      
      buildingMesh.castShadow = true;
      buildingMesh.receiveShadow = true;
      buildingGroup.add(buildingMesh);
      
      // Add building type-specific details and architectural elements
      if (buildingStyle === 'modern') {
        // Modern skyscraper with glass facade and spire
        
        // Glass panels overlay
        const glassPanelsGeometry = new THREE.BoxGeometry(width * 0.95, height * 0.9, depth * 0.95);
        const glassPanelsMaterial = new THREE.MeshPhongMaterial({
          color: new THREE.Color(mainColor).lerp(new THREE.Color('#ffffff'), 0.2),
          transparent: true,
          opacity: 0.3,
          specular: 0xffffff,
          shininess: 100,
          envMap: null, // Would add environment map for reflections in a full implementation
        });
        
        const glassPanelsMesh = new THREE.Mesh(glassPanelsGeometry, glassPanelsMaterial);
        glassPanelsMesh.position.y = height / 2 + 0.1;
        buildingGroup.add(glassPanelsMesh);
        
        // Add spire/antenna at the top
        const spireGeometry = new THREE.CylinderGeometry(0.1, 0.3, height * 0.2, 8);
        const spireMaterial = new THREE.MeshPhongMaterial({
          color: 0x888888,
          specular: 0xffffff,
        });
        
        const spireMesh = new THREE.Mesh(spireGeometry, spireMaterial);
        spireMesh.position.y = height + height * 0.1;
        spireMesh.castShadow = true;
        buildingGroup.add(spireMesh);
        
        // Add communication dish
        const dishGeometry = new THREE.SphereGeometry(0.5, 16, 8, 0, Math.PI);
        const dishMaterial = new THREE.MeshPhongMaterial({
          color: 0xdddddd,
          side: THREE.DoubleSide,
        });
        
        const dishMesh = new THREE.Mesh(dishGeometry, dishMaterial);
        dishMesh.rotation.x = Math.PI / 2;
        dishMesh.position.set(width * 0.3, height + 0.5, 0);
        buildingGroup.add(dishMesh);
        
        // Add helipad on roof
        const helipadGeometry = new THREE.CylinderGeometry(1.5, 1.5, 0.1, 16);
        const helipadMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
        
        const helipadMesh = new THREE.Mesh(helipadGeometry, helipadMaterial);
        helipadMesh.position.y = height + 0.05;
        helipadMesh.position.x = -width * 0.2;
        buildingGroup.add(helipadMesh);
        
        // Add H marking
        const hMarkingGeometry = new THREE.PlaneGeometry(1, 1);
        const hMarkingMaterial = new THREE.MeshBasicMaterial({ 
          color: 0xffffff,
          side: THREE.DoubleSide,
        });
        
        const hMarkingMesh = new THREE.Mesh(hMarkingGeometry, hMarkingMaterial);
        hMarkingMesh.rotation.x = -Math.PI / 2;
        hMarkingMesh.position.y = height + 0.11;
        hMarkingMesh.position.x = -width * 0.2;
        buildingGroup.add(hMarkingMesh);
        
      } else if (buildingStyle === 'boutique') {
        // Boutique building with decorative elements
        
        // Decorative awning
        const awningGeometry = new THREE.BoxGeometry(width + 1, 0.2, depth / 2 + 0.5);
        const awningMaterial = new THREE.MeshPhongMaterial({ 
          color: new THREE.Color(mainColor).lerp(new THREE.Color('#000000'), 0.3),
        });
        
        const awningMesh = new THREE.Mesh(awningGeometry, awningMaterial);
        awningMesh.position.y = height / 3;
        awningMesh.position.z = depth / 4 + 0.25;
        awningMesh.castShadow = true;
        buildingGroup.add(awningMesh);
        
        // Decorative pillars at entrance
        for (let side = -1; side <= 1; side += 2) {
          const pillarGeometry = new THREE.CylinderGeometry(0.2, 0.2, height / 2, 8);
          const pillarMaterial = new THREE.MeshPhongMaterial({ 
            color: new THREE.Color(mainColor).lerp(new THREE.Color('#ffffff'), 0.2),
          });
          
          const pillarMesh = new THREE.Mesh(pillarGeometry, pillarMaterial);
          pillarMesh.position.set(side * (width / 3), height / 4, depth / 2 + 0.2);
          pillarMesh.castShadow = true;
          buildingGroup.add(pillarMesh);
        }
        
        // Decorative roof elements
        const decorativeRoofGeometry = new THREE.SphereGeometry(width / 4, 16, 8, 0, Math.PI);
        const decorativeRoofMaterial = new THREE.MeshPhongMaterial({ 
          color: new THREE.Color(roofColor),
          side: THREE.DoubleSide,
        });
        
        const decorativeRoofMesh = new THREE.Mesh(decorativeRoofGeometry, decorativeRoofMaterial);
        decorativeRoofMesh.rotation.x = Math.PI;
        decorativeRoofMesh.position.y = height + width / 4;
        decorativeRoofMesh.castShadow = true;
        buildingGroup.add(decorativeRoofMesh);
        
      } else if (buildingStyle === 'tech') {
        // High-tech building with geometric patterns and LED-like details
        
        // Solar panels on roof
        const solarPanelsGeometry = new THREE.BoxGeometry(width * 0.8, 0.1, depth * 0.8);
        const solarPanelsMaterial = new THREE.MeshPhongMaterial({ 
          color: 0x111111,
          specular: 0x333333,
        });
        
        const solarPanelsMesh = new THREE.Mesh(solarPanelsGeometry, solarPanelsMaterial);
        solarPanelsMesh.position.y = height + 0.05;
        buildingGroup.add(solarPanelsMesh);
        
        // Grid pattern for solar panels
        const gridSize = 6;
        const panelSize = {
          width: (width * 0.8) / gridSize,
          depth: (depth * 0.8) / gridSize,
        };
        
        for (let x = 0; x < gridSize; x++) {
          for (let z = 0; z < gridSize; z++) {
            const panelGeometry = new THREE.PlaneGeometry(panelSize.width * 0.9, panelSize.depth * 0.9);
            const panelMaterial = new THREE.MeshPhongMaterial({ 
              color: 0x1a4c7c,
              specular: 0x333333,
              shininess: 30,
            });
            
            const panelMesh = new THREE.Mesh(panelGeometry, panelMaterial);
            
            // Position within the grid
            const xPos = (x * panelSize.width) - (width * 0.8 / 2) + (panelSize.width / 2);
            const zPos = (z * panelSize.depth) - (depth * 0.8 / 2) + (panelSize.depth / 2);
            
            panelMesh.rotation.x = -Math.PI / 2; // Make it face up
            panelMesh.position.set(xPos, height + 0.11, zPos);
            buildingGroup.add(panelMesh);
          }
        }
        
        // Add satellite dish
        const dishGeometry = new THREE.SphereGeometry(0.6, 16, 8, 0, Math.PI);
        const dishMaterial = new THREE.MeshPhongMaterial({
          color: 0xdddddd,
          side: THREE.DoubleSide,
        });
        
        const dishMesh = new THREE.Mesh(dishGeometry, dishMaterial);
        dishMesh.rotation.x = Math.PI / 2;
        dishMesh.rotation.z = Math.PI / 4;
        dishMesh.position.set(width * 0.3, height + 0.5, depth * 0.3);
        buildingGroup.add(dishMesh);
        
        // Add glowing elements (LED-like strips)
        const stripGeometry = new THREE.BoxGeometry(width * 0.9, 0.1, 0.1);
        const stripMaterial = new THREE.MeshBasicMaterial({ 
          color: new THREE.Color(mainColor).lerp(new THREE.Color('#ffffff'), 0.5),
          transparent: true,
          opacity: 0.7,
        });
        
        // Add multiple strips at different heights
        for (let h = 1; h < 5; h++) {
          const stripMesh = new THREE.Mesh(stripGeometry, stripMaterial);
          stripMesh.position.set(0, height * (h / 5), depth / 2 + 0.06);
          buildingGroup.add(stripMesh);
        }
      }
      
      // Enhanced Roof with more detail
      let roofGeometry;
      
      if (buildingStyle === 'modern') {
        // Modern building gets a flat roof with details
        roofGeometry = new THREE.BoxGeometry(width, 0.5, depth);
      } else if (buildingStyle === 'boutique') {
        // Boutique gets a slightly sloped roof
        const roofShape = new THREE.Shape();
        roofShape.moveTo(-width / 2 - 0.5, -depth / 2 - 0.5);
        roofShape.lineTo(width / 2 + 0.5, -depth / 2 - 0.5);
        roofShape.lineTo(width / 2 + 0.5, depth / 2 + 0.5);
        roofShape.lineTo(-width / 2 - 0.5, depth / 2 + 0.5);
        roofShape.lineTo(-width / 2 - 0.5, -depth / 2 - 0.5);
        
        roofGeometry = new THREE.ExtrudeGeometry(roofShape, {
          steps: 1,
          depth: 1.5,
          bevelEnabled: true,
          bevelThickness: 0.2,
          bevelSize: 0.2,
          bevelOffset: 0,
          bevelSegments: 3
        });
      } else {
        // Standard flat roof
        roofGeometry = new THREE.BoxGeometry(width + 0.5, 1, depth + 0.5);
      }
      
      const roofMaterial = new THREE.MeshPhongMaterial({ 
        color: new THREE.Color(roofColor)
      });
      
      const roofMesh = new THREE.Mesh(roofGeometry, roofMaterial);
      
      if (buildingStyle === 'boutique') {
        roofMesh.position.y = height;
        roofMesh.rotation.x = Math.PI / 2;
      } else {
        roofMesh.position.y = height + 0.5;
      }
      
      roofMesh.castShadow = true;
      buildingGroup.add(roofMesh);
      
      // Enhanced Windows with better materials and more variation
      const createWindows = () => {
        const floors = buildingData.features.floors;
        const windowsPerFloor = buildingData.features.windowsPerFloor;
        const windowWidth = buildingData.features.windowWidth;
        const windowHeight = buildingData.features.windowHeight;
        
        // More realistic window material with reflections
        const windowMaterial = new THREE.MeshPhongMaterial({ 
          color: new THREE.Color(windowColor),
          transparent: true,
          opacity: 0.7,
          specular: 0xffffff,
          shininess: 100,
        });
        
        // Material for window frames
        const frameMaterial = new THREE.MeshPhongMaterial({
          color: 0x444444,
        });
        
        // Front windows - create frames and glass
        for (let floor = 0; floor < floors; floor++) {
          for (let w = 0; w < windowsPerFloor; w++) {
            // Create window group including frame and glass
            const windowGroup = new THREE.Group();
            
            // Create window frame
            const frameGeometry = new THREE.BoxGeometry(windowWidth + 0.1, windowHeight + 0.1, 0.05);
            const frameMesh = new THREE.Mesh(frameGeometry, frameMaterial);
            windowGroup.add(frameMesh);
            
            // Create window glass
            const windowGeometry = new THREE.PlaneGeometry(windowWidth, windowHeight);
            const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
            windowMesh.position.z = 0.03; // Slightly in front of the frame
            windowGroup.add(windowMesh);
            
            // Position the window group
            const xPos = (w - (windowsPerFloor - 1) / 2) * (width / windowsPerFloor);
            const yPos = 1 + floor * (height / floors);
            const zPos = depth / 2 + 0.05;
            
            windowGroup.position.set(xPos, yPos, zPos);
            
            // Add some random variation to make it more realistic
            if (Math.random() > 0.8) {
              // Some windows are open
              windowMesh.rotation.y = Math.random() * 0.2;
              windowMesh.position.x += 0.1;
            }
            
            // Add light glow for some random windows (at night)
            if (Math.random() > 0.6) {
              const glowGeometry = new THREE.PlaneGeometry(windowWidth * 0.9, windowHeight * 0.9);
              const glowMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffaa,
                transparent: true,
                opacity: 0.3 + Math.random() * 0.3,
              });
              
              const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
              glowMesh.position.z = 0.02;
              windowGroup.add(glowMesh);
            }
            
            buildingGroup.add(windowGroup);
          }
        }
        
        // Side windows
        for (let floor = 0; floor < floors; floor++) {
          for (let w = 0; w < windowsPerFloor - 1; w++) {
            const windowGroup = new THREE.Group();
            
            // Frame
            const frameGeometry = new THREE.BoxGeometry(windowWidth + 0.1, windowHeight + 0.1, 0.05);
            const frameMesh = new THREE.Mesh(frameGeometry, frameMaterial);
            windowGroup.add(frameMesh);
            
            // Glass
            const windowGeometry = new THREE.PlaneGeometry(windowWidth, windowHeight);
            const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
            windowMesh.position.z = 0.03;
            windowGroup.add(windowMesh);
            
            // Position windows evenly across the side facade
            const zPos = (w - (windowsPerFloor - 2) / 2) * (depth / (windowsPerFloor - 1));
            const yPos = 1 + floor * (height / floors);
            const xPos = width / 2 + 0.05;
            
            windowGroup.position.set(xPos, yPos, zPos);
            windowGroup.rotation.y = Math.PI / 2; // Rotate to face outward
            
            // Add random glow for some windows
            if (Math.random() > 0.7) {
              const glowGeometry = new THREE.PlaneGeometry(windowWidth * 0.9, windowHeight * 0.9);
              const glowMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffaa,
                transparent: true,
                opacity: 0.3 + Math.random() * 0.3,
              });
              
              const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
              glowMesh.position.z = 0.02;
              windowGroup.add(glowMesh);
            }
            
            buildingGroup.add(windowGroup);
          }
        }
      };
      
      // Add windows
      createWindows();
      
      // Enhanced door with better geometry and materials
      const doorWidth = 2;
      const doorHeight = 3;
      
      // Door frame
      const doorFrameGeometry = new THREE.BoxGeometry(doorWidth + 0.3, doorHeight + 0.3, 0.2);
      const doorFrameMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x333333
      });
      
      const doorFrameMesh = new THREE.Mesh(doorFrameGeometry, doorFrameMaterial);
      doorFrameMesh.position.set(0, 1.5, depth / 2 + 0.1);
      buildingGroup.add(doorFrameMesh);
      
      // Door with material based on building type
      const doorGeometry = new THREE.PlaneGeometry(doorWidth, doorHeight);
      let doorMaterial;
      
      if (buildingStyle === 'modern') {
        // Glass door for modern building
        doorMaterial = new THREE.MeshPhongMaterial({ 
          color: 0x88ccff,
          transparent: true,
          opacity: 0.7,
          specular: 0xffffff,
          shininess: 100
        });
      } else if (buildingStyle === 'boutique') {
        // Fancy wood door for boutique
        doorMaterial = new THREE.MeshPhongMaterial({ 
          color: 0x8B4513, // Saddle brown
          specular: 0x333333,
          shininess: 30
        });
      } else {
        // Standard door
        doorMaterial = new THREE.MeshPhongMaterial({ 
          color: new THREE.Color(buildingData.facades.door)
        });
      }
      
      const doorMesh = new THREE.Mesh(doorGeometry, doorMaterial);
      doorMesh.position.set(0, 1.5, depth / 2 + 0.15);
      buildingGroup.add(doorMesh);
      
      // Add door handle
      const handleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
      const handleMaterial = new THREE.MeshPhongMaterial({ color: 0xAAAAAA });
      
      const handleMesh = new THREE.Mesh(handleGeometry, handleMaterial);
      handleMesh.position.set(doorWidth/3, 1.5, depth / 2 + 0.2);
      buildingGroup.add(handleMesh);
      
      // Enhanced Ground/base with texture and details
      const baseGeometry = new THREE.BoxGeometry(width + 2, 0.5, depth + 2);
      const baseMaterial = new THREE.MeshPhongMaterial({ 
        color: new THREE.Color(buildingData.facades.ground), 
        specular: 0x111111,
        shininess: 10
      });
      
      const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
      baseMesh.position.y = -0.25;
      baseMesh.receiveShadow = true;
      buildingGroup.add(baseMesh);
      
      // Add some environment details around the building
      
      // Add small decorative elements based on building type
      if (buildingStyle === 'modern') {
        // Modern building gets planters
        for (let side = -1; side <= 1; side += 2) {
          const planterGeometry = new THREE.BoxGeometry(1, 0.5, 1);
          const planterMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
          
          const planterMesh = new THREE.Mesh(planterGeometry, planterMaterial);
          planterMesh.position.set(side * (width / 2 + 1), 0.25, depth / 2 + 1);
          planterMesh.castShadow = true;
          planterMesh.receiveShadow = true;
          buildingGroup.add(planterMesh);
          
          // Add plant
          const plantGeometry = new THREE.SphereGeometry(0.4, 8, 8);
          const plantMaterial = new THREE.MeshPhongMaterial({ color: 0x228B22 }); // Forest green
          
          const plantMesh = new THREE.Mesh(plantGeometry, plantMaterial);
          plantMesh.position.set(side * (width / 2 + 1), 0.7, depth / 2 + 1);
          plantMesh.castShadow = true;
          buildingGroup.add(plantMesh);
        }
      } else if (buildingStyle === 'boutique') {
        // Boutique gets decorative lamps
        for (let side = -1; side <= 1; side += 2) {
          // Lamp post
          const postGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2, 8);
          const postMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
          
          const postMesh = new THREE.Mesh(postGeometry, postMaterial);
          postMesh.position.set(side * (width / 2 + 0.5), 1, depth / 2 + 0.5);
          postMesh.castShadow = true;
          buildingGroup.add(postMesh);
          
          // Lamp shade
          const shadeGeometry = new THREE.SphereGeometry(0.2, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2);
          const shadeMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xFFD700, 
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8
          });
          
          const shadeMesh = new THREE.Mesh(shadeGeometry, shadeMaterial);
          shadeMesh.position.set(side * (width / 2 + 0.5), 2, depth / 2 + 0.5);
          shadeMesh.castShadow = true;
          buildingGroup.add(shadeMesh);
          
          // Light source inside lamp
          const lightGeometry = new THREE.SphereGeometry(0.1, 8, 8);
          const lightMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFCC });
          
          const lightMesh = new THREE.Mesh(lightGeometry, lightMaterial);
          lightMesh.position.set(side * (width / 2 + 0.5), 2, depth / 2 + 0.5);
          buildingGroup.add(lightMesh);
        }
      } else if (buildingStyle === 'tech') {
        // Tech building gets security cameras
        for (let side = -1; side <= 1; side += 2) {
          // Camera mount
          const mountGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.5);
          const mountMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
          
          const mountMesh = new THREE.Mesh(mountGeometry, mountMaterial);
          mountMesh.position.set(side * (width / 2 - 0.3), height - 2, depth / 2 + 0.3);
          buildingGroup.add(mountMesh);
          
          // Camera body
          const cameraGeometry = new THREE.CylinderGeometry(0.1, 0.15, 0.3, 8);
          const cameraMaterial = new THREE.MeshPhongMaterial({ color: 0x111111 });
          
          const cameraMesh = new THREE.Mesh(cameraGeometry, cameraMaterial);
          cameraMesh.rotation.x = Math.PI / 2;
          cameraMesh.position.set(side * (width / 2 - 0.3), height - 2, depth / 2 + 0.5);
          buildingGroup.add(cameraMesh);
          
          // Camera lens
          const lensGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.1, 8);
          const lensMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x000000,
            specular: 0xFFFFFF,
            shininess: 100
          });
          
          const lensMesh = new THREE.Mesh(lensGeometry, lensMaterial);
          lensMesh.rotation.x = Math.PI / 2;
          lensMesh.position.set(side * (width / 2 - 0.3), height - 2, depth / 2 + 0.65);
          buildingGroup.add(lensMesh);
        }
      }
      
      // Add the building to the scene
      buildingGroup.scale.set(scale, scale, scale);
      buildingGroup.rotation.y = rotation * (Math.PI / 180);
      scene.add(buildingGroup);
      
      return buildingGroup;
    };
    
    // Helper function to create palm trees
    const createPalmTree = (x: number, z: number, height: number) => {
      const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, height, 8);
      const trunkMaterial = new THREE.MeshPhongMaterial({
        color: 0x8B4513, // Brown color for trunk
        shininess: 5
      });
      
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
      trunk.position.set(x, height/2 - 0.5, z);
      trunk.castShadow = true;
      
      // Create palm leaves
      const leavesGroup = new THREE.Group();
      const leafCount = 7;
      const leafGeometry = new THREE.BoxGeometry(0.1, 1.5, 0.5);
      leafGeometry.translate(0, 0.75, 0);
      
      const leafMaterial = new THREE.MeshPhongMaterial({
        color: 0x2E8B57, // Green color for leaves
        shininess: 10
      });
      
      for (let i = 0; i < leafCount; i++) {
        const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
        leaf.position.y = height - 0.2;
        leaf.rotation.y = (i / leafCount) * Math.PI * 2;
        leaf.rotation.x = -Math.PI / 6; // Tilt leaves down a bit
        leaf.castShadow = true;
        leavesGroup.add(leaf);
      }
      
      const treeGroup = new THREE.Group();
      treeGroup.add(trunk);
      treeGroup.add(leavesGroup);
      
      return treeGroup;
    };
    
    // Helper function to create an Arabic-inspired fountain
    const createArabicFountain = (x: number, z: number) => {
      const fountainGroup = new THREE.Group();
      
      // Base of the fountain
      const baseGeometry = new THREE.CylinderGeometry(2, 2.2, 0.5, 16);
      const baseMaterial = new THREE.MeshPhongMaterial({
        color: new THREE.Color(buildingData.facades.dome),
        shininess: 30
      });
      
      const base = new THREE.Mesh(baseGeometry, baseMaterial);
      base.position.y = -0.25;
      base.castShadow = true;
      fountainGroup.add(base);
      
      // Middle tier
      const middleGeometry = new THREE.CylinderGeometry(1.2, 1.5, 0.6, 16);
      const middle = new THREE.Mesh(middleGeometry, baseMaterial);
      middle.position.y = 0.3;
      middle.castShadow = true;
      fountainGroup.add(middle);
      
      // Top tier
      const topGeometry = new THREE.CylinderGeometry(0.6, 0.8, 0.4, 16);
      const top = new THREE.Mesh(topGeometry, baseMaterial);
      top.position.y = 0.8;
      top.castShadow = true;
      fountainGroup.add(top);
      
      // Water surface (simple blue circle)
      const waterGeometry = new THREE.CircleGeometry(1.9, 32);
      const waterMaterial = new THREE.MeshPhongMaterial({
        color: 0x40a9ff,
        shininess: 100,
        transparent: true,
        opacity: 0.7
      });
      
      const water = new THREE.Mesh(waterGeometry, waterMaterial);
      water.rotation.x = -Math.PI / 2;
      water.position.y = 0.01;
      fountainGroup.add(water);
      
      // Position the fountain
      fountainGroup.position.set(x, 0, z);
      
      return fountainGroup;
    };
    
    // Helper function to add decorative mosaic patterns
    const createMosaicPattern = (size: number) => {
      // In a real implementation, we would create a proper texture with mosaic patterns
      // For this simplified version, we'll just return a color
      return new THREE.Color(buildingData.facades.mosaic);
    };
    
    // Create and add building
    const building = createBuilding();
    scene.add(building);
    
    // Add Arabic architectural elements based on building type
    if (type === 'travel' || type === 'clothing') {
      // Add palm trees around the building
      const palmPositions = [
        { x: width + 2, z: depth + 2 },
        { x: -width - 2, z: depth + 2 },
        { x: width + 2, z: -depth - 2 },
        { x: -width - 2, z: -depth - 2 }
      ];
      
      palmPositions.forEach(pos => {
        const palmHeight = 4 + Math.random() * 2; // Vary palm heights for natural look
        const palm = createPalmTree(pos.x, pos.z, palmHeight);
        scene.add(palm);
      });
      
      // Add a fountain in front of travel buildings
      if (type === 'travel') {
        const fountain = createArabicFountain(0, depth * 2);
        scene.add(fountain);
      }
    }
    
    // Enhanced ground plane with decorative patterns
    const groundSize = 50;
    const groundGeometry = new THREE.PlaneGeometry(groundSize, groundSize, 10, 10);
    
    // Create a more interesting ground material
    const groundMaterial = new THREE.MeshPhongMaterial({
      color: type === 'travel' ? 0x1e3a8a : 
             type === 'clothing' ? 0x7f6d5f :
             type === 'electronics' ? 0x1a472a : 0x333333,
      side: THREE.DoubleSide,
      shininess: 10
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
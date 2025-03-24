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
    // Accent color for architectural details
    accent: '#f5b942',
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
      hasMinaret: true,
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
      // Define possible building styles
      type BuildingStyle = 'modern' | 'arabic-boutique' | 'tech' | 'standard';
      
      // Assign style based on building type
      const buildingStyle: BuildingStyle = 
                          type === 'travel' ? 'modern' : 
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
        
      } else if (buildingStyle === 'arabic-boutique') {
        // Arabic style boutique building with decorative elements
        
        // Add decorative arch at entrance
        const createArchedEntrance = () => {
          // Base for the arch
          const baseWidth = width / 2;
          const baseHeight = height / 3;
          const baseDepth = 0.5;
          
          const baseGeometry = new THREE.BoxGeometry(baseWidth, baseHeight, baseDepth);
          const baseMaterial = new THREE.MeshPhongMaterial({
            color: new THREE.Color(mainColor).lerp(new THREE.Color('#ffffff'), 0.1),
            shininess: 20
          });
          
          const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
          baseMesh.position.set(0, baseHeight / 2, depth / 2 + baseDepth / 2);
          buildingGroup.add(baseMesh);
          
          // Arabic pointed arch (horseshoe shape)
          const archRadius = baseWidth / 2.5;
          const archSegments = 16;
          const archHeight = baseHeight * 0.7;
          
          // Create custom shape for the arch
          const archShape = new THREE.Shape();
          archShape.moveTo(-baseWidth / 2, 0);
          
          // Left side of arch
          archShape.lineTo(-baseWidth / 2, baseHeight - archHeight);
          
          // Draw the arch curve
          for (let i = 0; i <= archSegments; i++) {
            const angle = Math.PI - (i / archSegments) * Math.PI;
            const x = -archRadius * Math.cos(angle);
            const y = baseHeight - archHeight + archRadius * Math.sin(angle);
            archShape.lineTo(x, y);
          }
          
          // Right side of arch
          archShape.lineTo(baseWidth / 2, baseHeight - archHeight);
          archShape.lineTo(baseWidth / 2, 0);
          archShape.lineTo(-baseWidth / 2, 0);
          
          // Extrude the shape
          const archGeometry = new THREE.ExtrudeGeometry(archShape, {
            steps: 1,
            depth: baseDepth,
            bevelEnabled: false
          });
          
          const archMaterial = new THREE.MeshPhongMaterial({
            color: new THREE.Color(mainColor).lerp(new THREE.Color('#ffffff'), 0.15),
            shininess: 30
          });
          
          const archMesh = new THREE.Mesh(archGeometry, archMaterial);
          archMesh.rotation.x = Math.PI / 2;
          archMesh.position.set(0, 0, depth / 2 + baseDepth);
          buildingGroup.add(archMesh);
          
          // Decorative patterns inside the arch
          const patternGeometry = new THREE.PlaneGeometry(baseWidth * 0.9, baseHeight * 0.8);
          const patternMaterial = new THREE.MeshPhongMaterial({
            color: new THREE.Color(buildingData.facades.mosaic),
            shininess: 50,
            side: THREE.DoubleSide
          });
          
          const patternMesh = new THREE.Mesh(patternGeometry, patternMaterial);
          patternMesh.position.set(0, baseHeight / 2, depth / 2 + baseDepth + 0.02);
          buildingGroup.add(patternMesh);
        };
        
        // Add central dome - key feature of Arabic architecture
        const createDome = () => {
          const domeRadius = width / 2.5;
          const domeSegments = 32;
          
          // Create dome geometry
          const domeGeometry = new THREE.SphereGeometry(
            domeRadius, domeSegments, domeSegments, 
            0, Math.PI * 2, 0, Math.PI / 2
          );
          
          // Dome material with slight lustre to simulate tiled surface
          const domeMaterial = new THREE.MeshPhongMaterial({
            color: new THREE.Color(buildingData.facades.dome),
            shininess: 50,
            specular: 0x333333
          });
          
          const dome = new THREE.Mesh(domeGeometry, domeMaterial);
          dome.position.set(0, height + 0.1, 0); // Position on top of building
          dome.castShadow = true;
          buildingGroup.add(dome);
          
          // Add dome base (drum)
          const drumHeight = domeRadius * 0.3;
          const drumGeometry = new THREE.CylinderGeometry(
            domeRadius * 1.05, domeRadius * 1.05, drumHeight, domeSegments
          );
          
          const drumMaterial = new THREE.MeshPhongMaterial({
            color: new THREE.Color(mainColor).lerp(new THREE.Color('#ffffff'), 0.2),
            shininess: 30
          });
          
          const drum = new THREE.Mesh(drumGeometry, drumMaterial);
          drum.position.set(0, height - drumHeight/2, 0);
          drum.castShadow = true;
          buildingGroup.add(drum);
          
          // Add decorative finial at the top of dome
          const finialGeometry = new THREE.ConeGeometry(domeRadius * 0.1, domeRadius * 0.3, 16);
          const finialMaterial = new THREE.MeshPhongMaterial({
            color: 0xd4af37, // Gold color
            shininess: 100,
            specular: 0x555555
          });
          
          const finial = new THREE.Mesh(finialGeometry, finialMaterial);
          finial.position.set(0, height + domeRadius + 0.1, 0);
          finial.castShadow = true;
          buildingGroup.add(finial);
          
          // Add decorative arched windows around the drum
          const windowCount = 8;
          const windowWidth = domeRadius * 0.4;
          const windowHeight = drumHeight * 0.7;
          
          for (let i = 0; i < windowCount; i++) {
            const angle = (i / windowCount) * Math.PI * 2;
            const x = Math.sin(angle) * domeRadius;
            const z = Math.cos(angle) * domeRadius;
            
            // Create arched window
            const windowGeometry = new THREE.PlaneGeometry(windowWidth, windowHeight);
            const windowMaterial = new THREE.MeshPhongMaterial({
              color: 0x3366ff, // Blue tinted glass
              transparent: true,
              opacity: 0.7,
              shininess: 100,
              side: THREE.DoubleSide
            });
            
            const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
            windowMesh.position.set(x, height - drumHeight/2, z);
            windowMesh.lookAt(0, height - drumHeight/2, 0); // Make it face center
            windowMesh.rotation.y += Math.PI; // Flip to face outward
            buildingGroup.add(windowMesh);
            
            // Add decorated arch frame
            const frameGeometry = new THREE.TorusGeometry(
              windowWidth * 0.35, windowWidth * 0.05, 8, 12, Math.PI
            );
            const frameMaterial = new THREE.MeshPhongMaterial({
              color: new THREE.Color(buildingData.facades.pattern),
              shininess: 30
            });
            
            const frameMesh = new THREE.Mesh(frameGeometry, frameMaterial);
            frameMesh.position.set(x, height - drumHeight/2 + windowHeight * 0.35, z);
            frameMesh.lookAt(0, height - drumHeight/2, 0);
            frameMesh.rotation.y += Math.PI;
            frameMesh.rotation.x += Math.PI / 2;
            buildingGroup.add(frameMesh);
          }
        };
        
        // Create mashrabiya (wooden lattice screens) for windows
        const createMashrabiya = () => {
          const windowWidth = 1.2;
          const windowHeight = 2;
          const floors = 3;
          const windowsPerWall = 3;
          
          // Create only on front and sides
          for (let side = -1; side <= 1; side += 2) {
            for (let floor = 0; floor < floors; floor++) {
              for (let w = 0; w < windowsPerWall; w++) {
                const mashrabiyaGroup = new THREE.Group();
                
                // Window base frame
                const frameGeometry = new THREE.BoxGeometry(windowWidth + 0.2, windowHeight + 0.2, 0.1);
                const frameMaterial = new THREE.MeshPhongMaterial({
                  color: 0x5c4033, // Brown wooden color
                  shininess: 10
                });
                
                const frameMesh = new THREE.Mesh(frameGeometry, frameMaterial);
                mashrabiyaGroup.add(frameMesh);
                
                // Create wooden lattice pattern (simplified)
                const latticeSize = 0.1;
                const latticeSpacing = 0.2;
                const horizontalCount = Math.floor(windowWidth / latticeSpacing);
                const verticalCount = Math.floor(windowHeight / latticeSpacing);
                
                // Vertical lattice pieces
                for (let v = 0; v < horizontalCount; v++) {
                  const latticeGeometry = new THREE.BoxGeometry(latticeSize, windowHeight * 0.9, latticeSize);
                  const latticeMaterial = new THREE.MeshPhongMaterial({
                    color: 0x8b4513, // Darker wood for lattice
                    shininess: 5
                  });
                  
                  const latticeMesh = new THREE.Mesh(latticeGeometry, latticeMaterial);
                  const xPos = -windowWidth/2 + v * latticeSpacing + latticeSize;
                  latticeMesh.position.set(xPos, 0, 0.05);
                  mashrabiyaGroup.add(latticeMesh);
                }
                
                // Horizontal lattice pieces
                for (let h = 0; h < verticalCount; h++) {
                  const latticeGeometry = new THREE.BoxGeometry(windowWidth * 0.9, latticeSize, latticeSize);
                  const latticeMaterial = new THREE.MeshPhongMaterial({
                    color: 0x8b4513,
                    shininess: 5
                  });
                  
                  const latticeMesh = new THREE.Mesh(latticeGeometry, latticeMaterial);
                  const yPos = -windowHeight/2 + h * latticeSpacing + latticeSize;
                  latticeMesh.position.set(0, yPos, 0.05);
                  mashrabiyaGroup.add(latticeMesh);
                }
                
                // Position the window on the building
                const xPos = (w - 1) * windowWidth * 1.2;
                const yPos = 1.5 + floor * 3;
                let zPos = depth / 2 + 0.05;
                let rotation = 0;
                
                if (side === -1) {
                  // Side windows
                  zPos = (w - 1) * windowWidth * 1.2;
                  rotation = Math.PI / 2;
                  mashrabiyaGroup.position.set(-width/2 - 0.05, yPos, zPos);
                } else {
                  // Front windows
                  mashrabiyaGroup.position.set(xPos, yPos, zPos);
                }
                
                mashrabiyaGroup.rotation.y = rotation;
                buildingGroup.add(mashrabiyaGroup);
              }
            }
          }
        };
        
        // Add decorative columns with ornate capitals
        const createDecorativeColumns = () => {
          // Create columns at the entrance
          for (let side = -1; side <= 1; side += 2) {
            // Skip center position
            if (side === 0) continue;
            
            // Column base
            const baseGeometry = new THREE.CylinderGeometry(0.3, 0.35, 0.4, 8);
            const baseMaterial = new THREE.MeshPhongMaterial({
              color: new THREE.Color(mainColor).lerp(new THREE.Color('#ffffff'), 0.3),
              shininess: 30
            });
            
            const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
            baseMesh.position.set(side * (width / 4), 0.2, depth / 2 + 0.2);
            buildingGroup.add(baseMesh);
            
            // Column shaft
            const shaftGeometry = new THREE.CylinderGeometry(0.25, 0.3, height / 2, 16);
            const shaftMaterial = new THREE.MeshPhongMaterial({
              color: 0xf5f5dc, // Beige marble-like color
              shininess: 50
            });
            
            const shaftMesh = new THREE.Mesh(shaftGeometry, shaftMaterial);
            shaftMesh.position.set(side * (width / 4), height / 4, depth / 2 + 0.2);
            buildingGroup.add(shaftMesh);
            
            // Ornate capital
            const capitalGeometry = new THREE.CylinderGeometry(0.4, 0.25, 0.5, 16);
            const capitalMaterial = new THREE.MeshPhongMaterial({
              color: 0xdeb887, // Burlywood color for decorative capital
              shininess: 30
            });
            
            const capitalMesh = new THREE.Mesh(capitalGeometry, capitalMaterial);
            capitalMesh.position.set(side * (width / 4), height / 2 + 0.25, depth / 2 + 0.2);
            buildingGroup.add(capitalMesh);
          }
        };
        
        // Create muqarnas (honeycomb vaulting) - distinctive feature of Islamic architecture
        const createMuqarnas = () => {
          // Position for the muqarnas (above entrance)
          const baseWidth = width / 2;
          const baseHeight = height / 3;
          const baseDepth = 0.5;
          
          // Create the base structure
          const muqarnasGroup = new THREE.Group();
          
          // Create multiple tiers for the honeycomb effect
          const tiers = 5;
          const maxBlocks = 12;
          
          for (let tier = 0; tier < tiers; tier++) {
            const tierRadius = (baseWidth / 2) * (1 - tier / tiers);
            const blockCount = Math.max(3, Math.floor(maxBlocks * (1 - tier / tiers)));
            const blockHeight = 0.2;
            const blockWidth = (2 * Math.PI * tierRadius) / blockCount * 0.8;
            const yPosition = baseHeight + tier * blockHeight;
            
            for (let i = 0; i < blockCount; i++) {
              const angle = (i / blockCount) * Math.PI * 2;
              const xPosition = Math.sin(angle) * tierRadius;
              const zPosition = Math.cos(angle) * tierRadius + depth / 2 + baseDepth + 0.3;
              
              // Create a geometric block for each cell in the honeycomb
              const blockGeometry = new THREE.BoxGeometry(blockWidth, blockHeight, blockWidth);
              const blockMaterial = new THREE.MeshPhongMaterial({
                color: tier % 2 === 0 ? 
                  new THREE.Color(buildingData.facades.dome).lerp(new THREE.Color('#ffffff'), 0.2) : 
                  new THREE.Color(buildingData.facades.pattern).lerp(new THREE.Color('#ffffff'), 0.1),
                shininess: 40
              });
              
              const block = new THREE.Mesh(blockGeometry, blockMaterial);
              block.position.set(xPosition, yPosition, zPosition);
              block.lookAt(new THREE.Vector3(0, yPosition, depth / 2 + baseDepth));
              block.castShadow = true;
              
              muqarnasGroup.add(block);
            }
          }
          
          // Add the muqarnas decoration to the building
          buildingGroup.add(muqarnasGroup);
        };
        
        // Create arabesque geometric patterns (on walls)
        const createArabesquePatterns = () => {
          // Creating a wall section with geometric patterns
          const patternWidth = width * 0.8;
          const patternHeight = height * 0.3;
          
          // Base for the pattern
          const baseGeometry = new THREE.PlaneGeometry(patternWidth, patternHeight);
          const baseMaterial = new THREE.MeshPhongMaterial({
            color: new THREE.Color(buildingData.facades.mosaic),
            shininess: 30,
            side: THREE.DoubleSide
          });
          
          const patternBase = new THREE.Mesh(baseGeometry, baseMaterial);
          patternBase.position.set(0, height * 0.75, depth / 2 + 0.02);
          buildingGroup.add(patternBase);
          
          // Create star patterns (simplified representation)
          const starCount = 5;
          const starSize = patternWidth / (starCount * 2.5);
          
          for (let i = 0; i < starCount; i++) {
            // Star pattern - Islamic 8-pointed star (simplified)
            const starGeometry = new THREE.CircleGeometry(starSize, 8);
            const starMaterial = new THREE.MeshPhongMaterial({
              color: new THREE.Color(buildingData.facades.pattern),
              shininess: 50,
              side: THREE.DoubleSide
            });
            
            const star = new THREE.Mesh(starGeometry, starMaterial);
            const xPos = ((i - (starCount - 1) / 2) * patternWidth / starCount);
            star.position.set(xPos, height * 0.75, depth / 2 + 0.03);
            star.rotation.z = Math.PI / 8; // Rotate to create star appearance
            buildingGroup.add(star);
            
            // Add connecting geometric lines
            if (i < starCount - 1) {
              const connectGeometry = new THREE.PlaneGeometry(patternWidth / starCount, starSize / 4);
              const connectMaterial = new THREE.MeshPhongMaterial({
                color: new THREE.Color(buildingData.facades.pattern),
                shininess: 50,
                side: THREE.DoubleSide
              });
              
              const connect = new THREE.Mesh(connectGeometry, connectMaterial);
              connect.position.set(xPos + patternWidth / (starCount * 2), height * 0.75, depth / 2 + 0.025);
              buildingGroup.add(connect);
            }
          }
        };
        
        // Create intricate minarets (towers)
        const createMinarets = () => {
          if (!buildingData.features.arabicStyle.hasMinaret) return;
          
          // Minaret dimensions
          const minaret = {
            baseRadius: 0.5,
            baseHeight: 1.0,
            shaftRadius: 0.4,
            shaftHeight: height * 0.8,
            balconyRadius: 0.6,
            balconyHeight: 0.3,
            topRadius: 0.3,
            topHeight: 1.5,
            finialHeight: 0.8
          };
          
          // Create two minarets at corners
          for (let side = -1; side <= 1; side += 2) {
            const minaretGroup = new THREE.Group();
            
            // Base (square)
            const baseGeometry = new THREE.BoxGeometry(
              minaret.baseRadius * 2, 
              minaret.baseHeight, 
              minaret.baseRadius * 2
            );
            const baseMaterial = new THREE.MeshPhongMaterial({
              color: new THREE.Color(mainColor).lerp(new THREE.Color('#ffffff'), 0.2),
              shininess: 30
            });
            
            const base = new THREE.Mesh(baseGeometry, baseMaterial);
            base.position.y = minaret.baseHeight / 2;
            minaretGroup.add(base);
            
            // Shaft (cylindrical)
            const shaftGeometry = new THREE.CylinderGeometry(
              minaret.shaftRadius, 
              minaret.shaftRadius, 
              minaret.shaftHeight, 
              16
            );
            const shaftMaterial = new THREE.MeshPhongMaterial({
              color: new THREE.Color(buildingData.facades.dome).lerp(new THREE.Color('#ffffff'), 0.3),
              shininess: 40
            });
            
            const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
            shaft.position.y = minaret.baseHeight + minaret.shaftHeight / 2;
            minaretGroup.add(shaft);
            
            // Balcony
            const balconyGeometry = new THREE.CylinderGeometry(
              minaret.balconyRadius, 
              minaret.balconyRadius, 
              minaret.balconyHeight, 
              16
            );
            const balconyMaterial = new THREE.MeshPhongMaterial({
              color: new THREE.Color(buildingData.facades.mosaic),
              shininess: 40
            });
            
            const balcony = new THREE.Mesh(balconyGeometry, balconyMaterial);
            balcony.position.y = minaret.baseHeight + minaret.shaftHeight;
            minaretGroup.add(balcony);
            
            // Top part (conical)
            const topGeometry = new THREE.ConeGeometry(
              minaret.topRadius, 
              minaret.topHeight, 
              16
            );
            const topMaterial = new THREE.MeshPhongMaterial({
              color: new THREE.Color(buildingData.facades.dome),
              shininess: 60
            });
            
            const top = new THREE.Mesh(topGeometry, topMaterial);
            top.position.y = minaret.baseHeight + minaret.shaftHeight + minaret.balconyHeight + minaret.topHeight / 2;
            minaretGroup.add(top);
            
            // Finial (decorative top)
            const finialGeometry = new THREE.SphereGeometry(minaret.topRadius / 2, 16, 16);
            const finialMaterial = new THREE.MeshPhongMaterial({
              color: 0xd4af37, // Gold
              shininess: 100,
              specular: 0x777777
            });
            
            const finial = new THREE.Mesh(finialGeometry, finialMaterial);
            finial.position.y = minaret.baseHeight + minaret.shaftHeight + minaret.balconyHeight + minaret.topHeight + minaret.topRadius / 2;
            minaretGroup.add(finial);
            
            // Windows on the shaft (simplified)
            const windowCount = 4;
            for (let i = 0; i < windowCount; i++) {
              const windowHeight = minaret.shaftHeight / (windowCount + 1);
              const windowY = minaret.baseHeight + windowHeight * (i + 1);
              
              // Create windows in four directions
              for (let angle = 0; angle < 4; angle++) {
                const windowGeometry = new THREE.PlaneGeometry(
                  minaret.shaftRadius * 0.6, 
                  windowHeight * 0.5
                );
                const windowMaterial = new THREE.MeshPhongMaterial({
                  color: 0x3a7cd5,
                  transparent: true,
                  opacity: 0.7,
                  side: THREE.DoubleSide
                });
                
                const window = new THREE.Mesh(windowGeometry, windowMaterial);
                
                // Position windows around the shaft
                const windowAngle = angle * Math.PI / 2;
                const windowX = Math.sin(windowAngle) * (minaret.shaftRadius + 0.01);
                const windowZ = Math.cos(windowAngle) * (minaret.shaftRadius + 0.01);
                
                window.position.set(windowX, windowY, windowZ);
                window.lookAt(new THREE.Vector3(windowX * 2, windowY, windowZ * 2));
                
                minaretGroup.add(window);
              }
            }
            
            // Position the minaret at a corner
            minaretGroup.position.set(
              side * (width / 2 + minaret.baseRadius), 
              0, 
              depth / 2 - minaret.baseRadius
            );
            
            buildingGroup.add(minaretGroup);
          }
        };
        
        // Execute all the creation functions to build the Arabic structure
        createArchedEntrance();
        createDome();
        createMashrabiya();
        createDecorativeColumns();
        createMuqarnas();
        createArabesquePatterns();
        createMinarets(); // Only if minaret is enabled in buildingData
        
      } else if (buildingStyle === 'arabic-boutique') {
        // Arabic boutique building with decorative elements
        
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
      } else if (buildingStyle === 'arabic-boutique') {
        // Arabic boutique gets a slightly sloped roof
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
      
      {
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
      
      // Add environmental elements for arabic style buildings
      if (type === 'clothing') { // The arabic-boutique style building
        // Add palm trees
        const createPalmTree = (x: number, z: number, height: number, lean: number = 0) => {
          const palmGroup = new THREE.Group();
          
          // Trunk
          const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, height, 8);
          const trunkMaterial = new THREE.MeshPhongMaterial({
            color: 0x8B4513, // Brown
            shininess: 5
          });
          
          const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
          trunk.position.y = height / 2;
          
          // Apply lean if specified
          if (lean !== 0) {
            trunk.rotation.x = Math.random() * 0.05 * lean;
            trunk.rotation.z = Math.random() * 0.2 * lean;
          }
          
          palmGroup.add(trunk);
          
          // Leaves
          const leafCount = 7 + Math.floor(Math.random() * 5);
          const leafLength = height * 0.7;
          const leafWidth = 0.3;
          
          for (let i = 0; i < leafCount; i++) {
            const angle = (i / leafCount) * Math.PI * 2;
            
            // Create a simplified leaf shape
            const leafGeometry = new THREE.BoxGeometry(leafLength, 0.1, leafWidth);
            const leafMaterial = new THREE.MeshPhongMaterial({
              color: 0x2E8B57, // Dark green
              shininess: 10
            });
            
            const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
            
            // Position at trunk top and angle outward
            leaf.position.y = height - 0.2;
            leaf.position.x = leafLength / 2; // Offset to make it grow from the trunk
            leaf.rotateY(angle);
            leaf.rotateZ(Math.PI / 4 + Math.random() * 0.2); // Angle downward
            
            palmGroup.add(leaf);
          }
          
          // Position the complete palm tree
          palmGroup.position.set(x, 0, z);
          
          return palmGroup;
        };
        
        // Add fountain - a common feature in Arabic plazas
        const createFountain = (x: number, z: number, radius: number = 2) => {
          const fountainGroup = new THREE.Group();
          
          // Fountain base (circular)
          const baseGeometry = new THREE.CylinderGeometry(radius, radius * 1.1, 0.5, 32);
          const baseMaterial = new THREE.MeshPhongMaterial({
            color: 0xEEEEEE, // Light stone color
            shininess: 30
          });
          
          const base = new THREE.Mesh(baseGeometry, baseMaterial);
          base.position.y = 0.25;
          fountainGroup.add(base);
          
          // Water basin
          const basinGeometry = new THREE.CylinderGeometry(radius * 0.9, radius * 0.9, 0.4, 32);
          const basinMaterial = new THREE.MeshPhongMaterial({
            color: 0x3A7BD5, // Blue water
            transparent: true,
            opacity: 0.7,
            shininess: 100
          });
          
          const basin = new THREE.Mesh(basinGeometry, basinMaterial);
          basin.position.y = 0.45;
          fountainGroup.add(basin);
          
          // Center pedestal
          const pedestalGeometry = new THREE.CylinderGeometry(radius * 0.2, radius * 0.3, 1.2, 16);
          const pedestalMaterial = new THREE.MeshPhongMaterial({
            color: 0xDDDDDD, // Light stone
            shininess: 40
          });
          
          const pedestal = new THREE.Mesh(pedestalGeometry, pedestalMaterial);
          pedestal.position.y = 0.6 + 0.5;
          fountainGroup.add(pedestal);
          
          // Top ornament
          const ornamentGeometry = new THREE.SphereGeometry(radius * 0.15, 16, 16);
          const ornamentMaterial = new THREE.MeshPhongMaterial({
            color: 0xD4AF37, // Gold
            shininess: 100,
            specular: 0x777777
          });
          
          const ornament = new THREE.Mesh(ornamentGeometry, ornamentMaterial);
          ornament.position.y = 1.5;
          fountainGroup.add(ornament);
          
          // Add decorative patterns on the base
          const patternCount = 8;
          for (let i = 0; i < patternCount; i++) {
            const angle = (i / patternCount) * Math.PI * 2;
            const patternGeometry = new THREE.BoxGeometry(0.4, 0.2, 0.05);
            const patternMaterial = new THREE.MeshPhongMaterial({
              color: 0x1E90FF, // Blue pattern
              shininess: 50
            });
            
            const pattern = new THREE.Mesh(patternGeometry, patternMaterial);
            const patternX = Math.sin(angle) * (radius * 0.95);
            const patternZ = Math.cos(angle) * (radius * 0.95);
            pattern.position.set(patternX, 0.45, patternZ);
            pattern.lookAt(new THREE.Vector3(0, 0.45, 0));
            
            fountainGroup.add(pattern);
          }
          
          // Position the complete fountain
          fountainGroup.position.set(x, 0, z);
          
          return fountainGroup;
        };
        
        // Add environmental elements to the scene
        // Add palm trees around the building
        scene.add(createPalmTree(-width - 1, -depth - 1, 4, 1));
        scene.add(createPalmTree(width + 1, -depth - 2, 5, -1));
        scene.add(createPalmTree(-width - 2, depth, 4.5, 0.5));
        scene.add(createPalmTree(width + 1.5, depth + 1, 5, -0.5));
        
        // Add a fountain in front of the building
        scene.add(createFountain(0, depth * 2, 2.5));
      }
      
      return buildingGroup;
    };
    
    // Use our enhanced palm tree and fountain functions from above
    
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
      
      // Use the enhanced palm tree function created above
      palmPositions.forEach(pos => {
        // Get a random palm height and lean
        const palmHeight = 4 + Math.random() * 2; // Vary palm heights for natural look
        const palmLean = Math.random() * 2 - 1;
        
        // Create a palm tree at this position
        const palm = new THREE.Group();
        
        // Create the trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, palmHeight, 8);
        const trunkMaterial = new THREE.MeshPhongMaterial({
          color: 0x8B4513, // Brown color
          shininess: 5
        });
        
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = palmHeight / 2;
        
        // Apply lean if specified
        if (palmLean !== 0) {
          trunk.rotation.x = Math.random() * 0.05 * palmLean;
          trunk.rotation.z = Math.random() * 0.2 * palmLean;
        }
        
        palm.add(trunk);
        
        // Add palm leaves
        const leafCount = 7;
        const leafGeometry = new THREE.BoxGeometry(0.1, 1.5, 0.5);
        leafGeometry.translate(0, 0.75, 0);
        
        const leafMaterial = new THREE.MeshPhongMaterial({
          color: 0x2E8B57, // Green color for leaves
          shininess: 10
        });
        
        for (let i = 0; i < leafCount; i++) {
          const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
          leaf.position.y = palmHeight - 0.2;
          leaf.rotation.y = (i / leafCount) * Math.PI * 2;
          leaf.rotation.x = -Math.PI / 6; // Tilt leaves down a bit
          leaf.castShadow = true;
          palm.add(leaf);
        }
        
        // Position the palm tree
        palm.position.set(pos.x, 0, pos.z);
        scene.add(palm);
      });
      
      // Add a fountain in front of travel buildings
      if (type === 'travel') {
        // Create a fountain directly instead of calling the function
        const fountainGroup = new THREE.Group();
        const radius = 2.5;
        
        // Fountain base (circular)
        const baseGeometry = new THREE.CylinderGeometry(radius, radius * 1.1, 0.5, 32);
        const baseMaterial = new THREE.MeshPhongMaterial({
          color: 0xEEEEEE, // Light stone color
          shininess: 30
        });
        
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0.25;
        fountainGroup.add(base);
        
        // Water basin
        const basinGeometry = new THREE.CylinderGeometry(radius * 0.9, radius * 0.9, 0.4, 32);
        const basinMaterial = new THREE.MeshPhongMaterial({
          color: 0x3A7BD5, // Blue water
          transparent: true,
          opacity: 0.7,
          shininess: 100
        });
        
        const basin = new THREE.Mesh(basinGeometry, basinMaterial);
        basin.position.y = 0.45;
        fountainGroup.add(basin);
        
        // Center pedestal
        const pedestalGeometry = new THREE.CylinderGeometry(radius * 0.2, radius * 0.3, 1.2, 16);
        const pedestalMaterial = new THREE.MeshPhongMaterial({
          color: 0xDDDDDD, // Light stone
          shininess: 40
        });
        
        const pedestal = new THREE.Mesh(pedestalGeometry, pedestalMaterial);
        pedestal.position.y = 0.6 + 0.5;
        fountainGroup.add(pedestal);
        
        // Top ornament
        const ornamentGeometry = new THREE.SphereGeometry(radius * 0.15, 16, 16);
        const ornamentMaterial = new THREE.MeshPhongMaterial({
          color: 0xD4AF37, // Gold
          shininess: 100,
          specular: 0x777777
        });
        
        const ornament = new THREE.Mesh(ornamentGeometry, ornamentMaterial);
        ornament.position.y = 1.5;
        fountainGroup.add(ornament);
        
        // Position the fountain
        fountainGroup.position.set(0, 0, depth * 2);
        scene.add(fountainGroup);
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
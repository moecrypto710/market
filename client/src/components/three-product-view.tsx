import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Simplified ThreeProductView Component
 * 
 * Provides a basic 3D visualization of products using Three.js
 * Based on the Three.js example provided, but with fewer features for reliability
 */
interface ThreeProductViewProps {
  color?: string; 
  rotationSpeed?: number;
  className?: string;
  height?: string | number;
  showControls?: boolean;
}

export default function ThreeProductView({
  color = '#10b981', // emerald-500 default
  rotationSpeed = 0.01,
  className = '',
  height = '300px',
  showControls = false,
}: ThreeProductViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Don't proceed if no container
    if (!containerRef.current) return;
    
    // Basic Three.js setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#1a1a2e');
    
    // Set up container dimensions
    const container = containerRef.current;
    const width = container.clientWidth;
    const h = typeof height === 'number' ? height : 300;
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, width / h, 0.1, 1000);
    camera.position.z = 5;
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, h);
    container.appendChild(renderer.domElement);
    
    // Create a simple cube
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: color });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    
    // Basic animation function
    function animate() {
      requestAnimationFrame(animate);
      
      // Rotate the cube
      cube.rotation.x += rotationSpeed;
      cube.rotation.y += rotationSpeed;
      
      // Render the scene
      renderer.render(scene, camera);
    }
    
    // Start animation
    animate();
    
    // Clean up on unmount
    return () => {
      // Stop any animation loops
      renderer.dispose();
      
      // Clean up geometry and material
      geometry.dispose();
      material.dispose();
      
      // Remove the canvas from the DOM
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [color, rotationSpeed, height]);
  
  return (
    <div 
      ref={containerRef}
      className={`three-product-view ${className}`}
      style={{ 
        height: height,
        width: '100%',
        overflow: 'hidden',
        borderRadius: '0.5rem'
      }}
    />
  );
}
// This file provides a simple building model definition
// that can be used to create a 3D building in Three.js
// without requiring an actual GLB file

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
  },
  
  // Building type metadata
  metadata: {
    type: 'commercial',
    name: 'المبنى التجاري',
    description: 'مبنى تجاري حديث متعدد الطوابق',
  }
};

// Export for use in Three.js - using ES module export
export default buildingData;
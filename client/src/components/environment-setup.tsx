import React, { useEffect, useState, useRef } from 'react';
import { Product } from "@shared/schema";

// Interface inspired by Unity's GameObject and Transform structure
interface GameObject {
  id: string;
  name: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  prefab: string;
  components: Component[];
  children: GameObject[];
  parent?: GameObject;
  active: boolean;
}

// Component interface similar to Unity components
interface Component {
  type: string;
  properties: Record<string, any>;
}

// Props for the EnvironmentSetup component
interface EnvironmentSetupProps {
  scene: string;
  onSceneLoaded?: () => void;
  ambientColor?: string;
  products?: Product[];
  enableShadows?: boolean;
  enableDynamicLighting?: boolean;
  weatherEffect?: 'none' | 'rain' | 'snow' | 'fog' | 'sandstorm';
  timeOfDay?: 'morning' | 'noon' | 'evening' | 'night';
  onGameObjectClick?: (gameObject: GameObject) => void;
}

const EnvironmentSetup: React.FC<EnvironmentSetupProps> = ({
  scene,
  onSceneLoaded,
  ambientColor = '#9c27b0',
  products = [],
  enableShadows = true,
  enableDynamicLighting = true,
  weatherEffect = 'none',
  timeOfDay = 'morning',
  onGameObjectClick
}) => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [gameObjects, setGameObjects] = useState<GameObject[]>([]);
  const [sceneLoaded, setSceneLoaded] = useState<boolean>(false);
  const [lighting, setLighting] = useState<{
    intensity: number;
    color: string;
    direction: { x: number; y: number; z: number };
  }>({
    intensity: 1.0,
    color: '#ffffff',
    direction: { x: -1, y: -1, z: -1 }
  });

  // Instantiate a game object (similar to Unity's Instantiate)
  const instantiate = (prefab: string, position: { x: number; y: number; z: number }, rotation: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 }) => {
    const newGameObject: GameObject = {
      id: `go-${Math.random().toString(36).substr(2, 9)}`,
      name: `${prefab}-instance`,
      position,
      rotation,
      scale: { x: 1, y: 1, z: 1 },
      prefab,
      components: [],
      children: [],
      active: true
    };

    setGameObjects(prev => [...prev, newGameObject]);
    return newGameObject;
  };

  // Add a component to a game object (like Unity's AddComponent)
  const addComponent = (gameObject: GameObject, componentType: string, properties: Record<string, any> = {}) => {
    const newComponent: Component = {
      type: componentType,
      properties
    };

    const updatedGameObjects = gameObjects.map(go => {
      if (go.id === gameObject.id) {
        return {
          ...go,
          components: [...go.components, newComponent]
        };
      }
      return go;
    });

    setGameObjects(updatedGameObjects);
    return newComponent;
  };

  // Set up lights (similar to Unity's directional light)
  const setupLighting = () => {
    // Directional light based on time of day
    let lightIntensity = 1.0;
    let lightColor = '#ffffff';
    let lightDirection = { x: -1, y: -1, z: -1 };

    switch (timeOfDay) {
      case 'morning':
        lightIntensity = 0.8;
        lightColor = '#ffe0b2';
        lightDirection = { x: -0.5, y: -0.8, z: -0.3 };
        break;
      case 'noon':
        lightIntensity = 1.0;
        lightColor = '#ffffff';
        lightDirection = { x: 0, y: -1, z: 0 };
        break;
      case 'evening':
        lightIntensity = 0.7;
        lightColor = '#ffb74d';
        lightDirection = { x: 0.5, y: -0.5, z: -0.7 };
        break;
      case 'night':
        lightIntensity = 0.3;
        lightColor = '#42a5f5';
        lightDirection = { x: 0, y: -0.9, z: -0.1 };
        break;
    }

    setLighting({
      intensity: lightIntensity,
      color: lightColor,
      direction: lightDirection
    });
  };

  // Apply weather effects
  const applyWeatherEffect = () => {
    if (!sceneRef.current) return;

    // Clear any existing weather effects
    const existingWeather = sceneRef.current.querySelector('.weather-effect');
    if (existingWeather) {
      existingWeather.remove();
    }

    if (weatherEffect === 'none') return;

    const weatherElement = document.createElement('div');
    weatherElement.className = `weather-effect weather-${weatherEffect}`;
    
    // Add unique elements based on weather type
    if (weatherEffect === 'rain') {
      for (let i = 0; i < 100; i++) {
        const drop = document.createElement('div');
        drop.className = 'rain-drop';
        drop.style.left = `${Math.random() * 100}%`;
        drop.style.animationDuration = `${0.5 + Math.random() * 0.7}s`;
        drop.style.animationDelay = `${Math.random() * 2}s`;
        weatherElement.appendChild(drop);
      }
    } else if (weatherEffect === 'snow') {
      for (let i = 0; i < 50; i++) {
        const flake = document.createElement('div');
        flake.className = 'snow-flake';
        flake.style.left = `${Math.random() * 100}%`;
        flake.style.opacity = `${0.4 + Math.random() * 0.6}`;
        flake.style.animationDuration = `${5 + Math.random() * 10}s`;
        flake.style.animationDelay = `${Math.random() * 5}s`;
        weatherElement.appendChild(flake);
      }
    } else if (weatherEffect === 'fog') {
      weatherElement.style.background = 'linear-gradient(to bottom, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)';
      weatherElement.style.backdropFilter = 'blur(4px)';
    } else if (weatherEffect === 'sandstorm') {
      weatherElement.style.background = 'linear-gradient(to bottom, rgba(255, 204, 128, 0.2) 0%, rgba(255, 203, 128, 0.1) 100%)';
      
      for (let i = 0; i < 70; i++) {
        const sandParticle = document.createElement('div');
        sandParticle.className = 'sand-particle';
        sandParticle.style.left = `${Math.random() * 100}%`;
        sandParticle.style.top = `${Math.random() * 100}%`;
        sandParticle.style.opacity = `${0.2 + Math.random() * 0.5}`;
        sandParticle.style.animationDuration = `${1 + Math.random() * 3}s`;
        sandParticle.style.animationDelay = `${Math.random() * 2}s`;
        weatherElement.appendChild(sandParticle);
      }
    }

    sceneRef.current.appendChild(weatherElement);
  };

  // Load scene (similar to Unity's scene loading)
  useEffect(() => {
    const loadScene = async () => {
      // Reset state when loading a new scene
      setGameObjects([]);
      setSceneLoaded(false);
      
      // Setup scene-specific lighting
      setupLighting();

      // Apply scene-specific setup
      if (scene === 'airport') {
        // Create airplane building at spawn point
        const airplaneBuilding = instantiate('airplaneBuilding', { x: 0, y: 0, z: -20 }, { x: 0, y: 180, z: 0 });
        addComponent(airplaneBuilding, 'Collider', { isTrigger: true, size: { x: 10, y: 5, z: 30 } });
        addComponent(airplaneBuilding, 'InteractableObject', { 
          type: 'building',
          interactionType: 'enter',
          message: 'اضغط E للدخول إلى المبنى'
        });

        // Create Emirates gate
        const emiratesGate = instantiate('gateBuilding', { x: 20, y: 0, z: -25 }, { x: 0, y: 200, z: 0 });
        addComponent(emiratesGate, 'SignRenderer', { 
          text: 'Emirates Airlines',
          textColor: '#ff0000',
          backgroundColor: '#ffffff' 
        });
        
        // Create ground
        const ground = instantiate('ground', { x: 0, y: -1, z: 0 });
        addComponent(ground, 'Renderer', { 
          material: 'airport-tarmac', 
          tiling: { x: 20, y: 20 } 
        });
        
        // Create sky
        const sky = instantiate('sky', { x: 0, y: 0, z: 0 });
        addComponent(sky, 'SkyboxRenderer', { 
          type: 'procedural',
          topColor: timeOfDay === 'night' ? '#0c1445' : '#87ceeb',
          bottomColor: timeOfDay === 'night' ? '#000910' : '#e0f7ff',
          sunSize: 0.04
        });
      } else if (scene === 'mall') {
        // Create mall building
        const mallBuilding = instantiate('mallBuilding', { x: 0, y: 0, z: 0 });
        addComponent(mallBuilding, 'LightmapReceiver', { baked: true });
        
        // Create stores based on products
        products.forEach((product, index) => {
          const storePosition = {
            x: (index % 3) * 15 - 15,
            y: 0,
            z: Math.floor(index / 3) * 15 - 15
          };
          
          const store = instantiate('storeBuilding', storePosition, { x: 0, y: Math.random() * 40 - 20, z: 0 });
          addComponent(store, 'StoreController', { 
            storeName: `${product.category} Store ${index + 1}`,
            products: [product],
            category: product.category
          });
          addComponent(store, 'Interactable', { 
            action: 'Enter Store',
            callbackId: `store-${index}`
          });
        });
        
        // Create lighting for the mall
        const mainLight = instantiate('directionalLight', { x: 0, y: 10, z: 0 });
        addComponent(mainLight, 'Light', { 
          type: 'directional', 
          intensity: lighting.intensity,
          color: lighting.color,
          shadows: enableShadows,
          direction: lighting.direction
        });
        
        // Add ambient lights
        const ambientLight = instantiate('ambientLight', { x: 0, y: 0, z: 0 });
        addComponent(ambientLight, 'Light', { 
          type: 'ambient', 
          intensity: 0.3,
          color: ambientColor
        });
        
        // Add point lights for stores
        for (let i = 0; i < 5; i++) {
          const pointLight = instantiate('pointLight', { 
            x: (Math.random() * 40) - 20,
            y: 3,
            z: (Math.random() * 40) - 20
          });
          addComponent(pointLight, 'Light', { 
            type: 'point', 
            intensity: 0.7,
            color: '#ffffff',
            range: 15,
            shadows: enableShadows
          });
        }
      }
      
      // Apply weather effects based on scene
      if (weatherEffect !== 'none') {
        setTimeout(() => {
          applyWeatherEffect();
        }, 500);
      }
      
      // Notify that scene is loaded
      setSceneLoaded(true);
      if (onSceneLoaded) {
        onSceneLoaded();
      }
    };
    
    loadScene();
  }, [scene, timeOfDay, weatherEffect]);

  // Helper function to get style for a game object based on its transform
  const getGameObjectStyle = (gameObject: GameObject) => {
    return {
      position: 'absolute' as const,
      transform: `translate3d(${gameObject.position.x}px, ${gameObject.position.y}px, ${gameObject.position.z}px) 
                  rotateX(${gameObject.rotation.x}deg) 
                  rotateY(${gameObject.rotation.y}deg) 
                  rotateZ(${gameObject.rotation.z}deg)
                  scale3d(${gameObject.scale.x}, ${gameObject.scale.y}, ${gameObject.scale.z})`,
      transformStyle: 'preserve-3d' as const,
      pointerEvents: gameObject.active ? 'auto' : 'none' as const,
      opacity: gameObject.active ? 1 : 0.5,
    };
  };

  // Render game objects based on their prefab and components
  const renderGameObject = (gameObject: GameObject) => {
    // Handle click on game object
    const handleClick = () => {
      if (onGameObjectClick && gameObject.active) {
        onGameObjectClick(gameObject);
      }
    };

    // Render different prefabs
    if (gameObject.prefab === 'airplaneBuilding') {
      return (
        <div 
          key={gameObject.id} 
          className="advanced-airplane-building emirates"
          style={getGameObjectStyle(gameObject)}
          onClick={handleClick}
        >
          <div className="airplane-3d-container">
            <div className="airplane-fuselage emirates">
              <div className="airplane-nose"></div>
              <div className="airplane-body">
                {/* Windows */}
                {[...Array(8)].map((_, i) => (
                  <div 
                    key={i} 
                    className="airplane-window-enhanced" 
                    style={{ 
                      left: `${30 + i * 12}px`, 
                      top: '15px',
                      animationDelay: `${i * 0.1}s`
                    }}
                  ></div>
                ))}
              </div>
              <div className="airplane-tail">
                <div className="tail-fin emirates"></div>
              </div>
            </div>
            
            <div className="airplane-wings">
              <div className="wing-left emirates">
                <div className="wing-detail"></div>
              </div>
              <div className="wing-right emirates">
                <div className="wing-detail"></div>
              </div>
            </div>
            
            <div className="airplane-engines">
              <div className="engine-left">
                <div className="engine-intake"></div>
                <div className="engine-turbine animate-spin-slow"></div>
              </div>
              <div className="engine-right">
                <div className="engine-intake"></div>
                <div className="engine-turbine animate-spin-slow"></div>
              </div>
            </div>
            
            <div className="airplane-entrance enhanced">
              <div className="entrance-door"></div>
              <div className="entrance-stairs"></div>
              <div className="entrance-lights">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="entrance-light-dot" style={{ animationDelay: `${i * 0.2}s` }}></div>
                ))}
              </div>
            </div>
            
            <div className="airplane-runway enhanced">
              <div className="runway-surface"></div>
              <div className="runway-lights">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="runway-light" style={{ left: `${i * 12}%`, animationDelay: `${i * 0.15}s` }}></div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="absolute top-[-20px] left-[50%] transform -translate-x-1/2 text-white font-bold airline-logo">
            <span className="text-glow airline-text">EMIRATES</span>
            <div className="logo-underline"></div>
          </div>
          
          <div className="interactive-elements">
            <div className="glow-marker" style={{ top: '40%', left: '20%' }}></div>
            <div className="glow-marker" style={{ top: '30%', right: '25%' }}></div>
            <div className="glow-marker pulse" style={{ bottom: '20%', left: '50%' }}></div>
          </div>
        </div>
      );
    } else if (gameObject.prefab === 'storeBuilding') {
      // Get store controller component if exists
      const storeComponent = gameObject.components.find(c => c.type === 'StoreController');
      const storeName = storeComponent?.properties?.storeName || 'Store';
      const category = storeComponent?.properties?.category || '';
      
      // Get store colors based on category
      let storeColor = '#9c27b0';
      if (category === 'electronics') storeColor = '#3f51b5';
      if (category === 'clothing') storeColor = '#e91e63';
      if (category === 'food') storeColor = '#ff9800';
      if (category === 'travel') storeColor = '#2196f3';
      
      return (
        <div 
          key={gameObject.id} 
          className="store-building"
          style={{
            ...getGameObjectStyle(gameObject),
            background: `linear-gradient(to top, ${storeColor}80, ${storeColor}40)`,
            width: '12rem',
            height: '8rem',
            borderRadius: '0.5rem',
            boxShadow: `0 0 20px ${storeColor}40`,
            border: `1px solid ${storeColor}60`,
            position: 'absolute'
          }}
          onClick={handleClick}
        >
          <div className="store-name" style={{ 
            color: 'white', 
            textAlign: 'center', 
            padding: '0.5rem', 
            fontWeight: 'bold',
            textShadow: `0 0 5px ${storeColor}`
          }}>
            {storeName}
          </div>
          
          <div className="store-entrance" style={{
            width: '40%',
            height: '50%',
            margin: '0 auto',
            background: `linear-gradient(to bottom, ${storeColor}30, ${storeColor}10)`,
            borderRadius: '0.25rem',
            border: `1px solid ${storeColor}40`,
            position: 'relative'
          }}>
            <div className="entrance-glow" style={{
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(circle at center, ${storeColor}20 0%, transparent 70%)`,
              animation: 'pulse 2s infinite alternate'
            }}></div>
          </div>
        </div>
      );
    } else if (gameObject.prefab.includes('Light')) {
      const lightComponent = gameObject.components.find(c => c.type === 'Light');
      const lightType = lightComponent?.properties?.type || 'point';
      const lightIntensity = lightComponent?.properties?.intensity || 1;
      const lightColor = lightComponent?.properties?.color || '#ffffff';
      
      // Render different light types
      if (lightType === 'point') {
        const lightRange = lightComponent?.properties?.range || 10;
        return (
          <div 
            key={gameObject.id} 
            className="point-light"
            style={{
              ...getGameObjectStyle(gameObject),
              width: `${lightRange * 2}px`,
              height: `${lightRange * 2}px`,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${lightColor}${Math.round(lightIntensity * 30).toString(16)} 0%, transparent 70%)`,
              boxShadow: `0 0 ${lightRange}px ${lightIntensity * 5}px ${lightColor}${Math.round(lightIntensity * 40).toString(16)}`,
              pointerEvents: 'none'
            }}
          />
        );
      }
      
      // For directional lights or other types, return an empty div (they'll affect the scene globally)
      return <div key={gameObject.id} style={{ position: 'absolute', pointerEvents: 'none' }} />;
    }
    
    // Default rendering for unknown prefabs
    return (
      <div 
        key={gameObject.id} 
        style={{
          ...getGameObjectStyle(gameObject),
          width: '50px',
          height: '50px',
          background: '#ffffff20',
          borderRadius: '5px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '10px'
        }}
        onClick={handleClick}
      >
        {gameObject.name}
      </div>
    );
  };

  // Render the scene with all game objects
  return (
    <div
      ref={sceneRef}
      className={`unity-scene scene-${scene} ${sceneLoaded ? 'loaded' : 'loading'}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        perspective: '1000px',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Scene loading indicator */}
      {!sceneLoaded && (
        <div className="scene-loading-indicator" style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'white',
          textAlign: 'center'
        }}>
          <div className="loading-spinner" style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: `4px solid ${ambientColor}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 15px auto'
          }}></div>
          <div>جاري تحميل المشهد...</div>
        </div>
      )}
      
      {/* Ambient light overlay based on time of day */}
      <div className="ambient-lighting" style={{
        position: 'absolute',
        inset: 0,
        background: timeOfDay === 'night' 
          ? 'linear-gradient(to bottom, rgba(0, 10, 40, 0.4), rgba(0, 0, 20, 0.7))' 
          : timeOfDay === 'evening'
            ? 'linear-gradient(to bottom, rgba(255, 183, 77, 0.2), rgba(0, 0, 0, 0.4))'
            : 'transparent',
        pointerEvents: 'none',
        zIndex: 1
      }}></div>
      
      {/* Render all game objects */}
      {gameObjects.map(gameObject => renderGameObject(gameObject))}
      
      {/* Hidden styles for weather effects */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0% { opacity: 0.7; }
          100% { opacity: 1; }
        }
        
        .rain-drop {
          position: absolute;
          top: -20px;
          width: 1px;
          height: 15px;
          background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.7));
          animation: rain-fall linear infinite;
        }
        
        @keyframes rain-fall {
          0% { transform: translateY(-20px); }
          100% { transform: translateY(120vh); }
        }
        
        .snow-flake {
          position: absolute;
          top: -10px;
          width: 5px;
          height: 5px;
          background: white;
          border-radius: 50%;
          animation: snow-fall linear infinite;
        }
        
        @keyframes snow-fall {
          0% { 
            transform: translateY(-10px) rotate(0deg); 
          }
          100% { 
            transform: translateY(120vh) rotate(360deg); 
          }
        }
        
        .sand-particle {
          position: absolute;
          width: 3px;
          height: 3px;
          background: #ffd180;
          border-radius: 50%;
          animation: sand-blow linear infinite;
        }
        
        @keyframes sand-blow {
          0% { 
            transform: translate(0, 0); 
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          100% { 
            transform: translate(-50vw, 20vh); 
            opacity: 0;
          }
        }
        
        .weather-effect {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 10;
        }
      `}</style>
    </div>
  );
};

export default EnvironmentSetup;
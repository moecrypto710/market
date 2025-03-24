import React, { useState, useEffect, useRef } from 'react';

interface NavigationPoint {
  id: string;
  name: string;
  position: { x: number; y: number; z: number };
  lookAt?: { x: number; y: number; z: number };
  description?: string;
  icon?: string;
  isInteractive?: boolean;
  connectedPoints?: string[]; // IDs of connected points
}

interface GazeNavigationProps {
  points: NavigationPoint[];
  onNavigate: (pointId: string, position: { x: number; y: number; z: number }) => void;
  currentPosition: { x: number; y: number; z: number };
  gazeDuration?: number; // Time in ms to trigger navigation (default: 2000ms)
  enableGaze?: boolean;
  showLabels?: boolean;
  currentPointId?: string;
  onGazeStart?: (pointId: string) => void;
  onGazeEnd?: (pointId: string, completed: boolean) => void;
}

const GazeNavigation: React.FC<GazeNavigationProps> = ({
  points,
  onNavigate,
  currentPosition,
  gazeDuration = 2000,
  enableGaze = true,
  showLabels = true,
  currentPointId,
  onGazeStart,
  onGazeEnd
}) => {
  const [gazePoint, setGazePoint] = useState<string | null>(null);
  const [gazeProgress, setGazeProgress] = useState<number>(0);
  const gazeTimerRef = useRef<number | null>(null);
  const mousePosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Track mouse position for gaze input simulation
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        mousePosition.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Handle gaze input
  useEffect(() => {
    if (!enableGaze) {
      if (gazePoint) {
        setGazePoint(null);
        setGazeProgress(0);
        if (gazeTimerRef.current) {
          window.clearTimeout(gazeTimerRef.current);
          gazeTimerRef.current = null;
        }
      }
      return;
    }

    // Function to check if mouse is over a navigation point
    const checkGaze = () => {
      let foundPoint = null;
      let closestDistance = Infinity;

      points.forEach(point => {
        // Skip current point - can't navigate to where we already are
        if (point.id === currentPointId) return;

        // Get point screen position based on 3D coordinates relative to current position
        const screenPos = getScreenPosition(point.position, currentPosition);
        if (!screenPos) return;

        const distance = Math.sqrt(
          Math.pow(mousePosition.current.x - screenPos.x, 2) +
          Math.pow(mousePosition.current.y - screenPos.y, 2)
        );

        // Check if mouse is close enough to this point (50px threshold)
        if (distance < 50 && distance < closestDistance) {
          closestDistance = distance;
          foundPoint = point.id;
        }
      });

      return foundPoint;
    };

    const gazeInterval = setInterval(() => {
      const pointUnderGaze = checkGaze();
      
      if (pointUnderGaze) {
        if (pointUnderGaze !== gazePoint) {
          // Started gazing at a new point
          if (gazePoint && onGazeEnd) {
            onGazeEnd(gazePoint, false);
          }
          
          setGazePoint(pointUnderGaze);
          setGazeProgress(0);
          
          if (onGazeStart) {
            onGazeStart(pointUnderGaze);
          }
          
          // Clear existing timer
          if (gazeTimerRef.current) {
            window.clearTimeout(gazeTimerRef.current);
          }
          
          // Set new timer for navigation
          gazeTimerRef.current = window.setTimeout(() => {
            const point = points.find(p => p.id === pointUnderGaze);
            if (point) {
              onNavigate(point.id, point.position);
              
              if (onGazeEnd) {
                onGazeEnd(pointUnderGaze, true);
              }
            }
            
            setGazePoint(null);
            setGazeProgress(0);
            gazeTimerRef.current = null;
          }, gazeDuration);
        }
        
        // Update progress
        setGazeProgress(prev => {
          const newProgress = prev + (100 / (gazeDuration / 100));
          return Math.min(newProgress, 100);
        });
      } else if (gazePoint) {
        // Stopped gazing at a point
        if (onGazeEnd) {
          onGazeEnd(gazePoint, false);
        }
        
        setGazePoint(null);
        setGazeProgress(0);
        
        if (gazeTimerRef.current) {
          window.clearTimeout(gazeTimerRef.current);
          gazeTimerRef.current = null;
        }
      }
    }, 100);

    return () => {
      clearInterval(gazeInterval);
      if (gazeTimerRef.current) {
        window.clearTimeout(gazeTimerRef.current);
        gazeTimerRef.current = null;
      }
    };
  }, [points, gazePoint, enableGaze, gazeDuration, onNavigate, currentPosition, onGazeStart, onGazeEnd, currentPointId]);

  // Calculate screen position for a 3D point
  const getScreenPosition = (position: { x: number; y: number; z: number }, viewerPosition: { x: number; y: number; z: number }) => {
    if (!containerRef.current) return null;

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    // Calculate relative position
    const relX = position.x - viewerPosition.x;
    const relY = position.y - viewerPosition.y;
    const relZ = position.z - viewerPosition.z;

    // Very simple perspective projection for demonstration
    // In a real app, you'd use proper 3D math
    const distance = Math.sqrt(relX * relX + relZ * relZ);
    if (distance === 0) return null; // Can't see points at same position as viewer

    // Only show points in front of the viewer (negative Z is forward)
    if (relZ > 0) return null;

    // Simple perspective calculation
    const fov = Math.PI / 3; // 60 degrees
    const scale = containerHeight / (2 * Math.tan(fov / 2));
    
    const x = containerWidth / 2 + (relX / -relZ) * scale;
    const y = containerHeight / 2 + (relY / -relZ) * scale;

    return { x, y };
  };

  // Handle click on navigation point
  const handlePointClick = (point: NavigationPoint) => {
    if (point.id !== currentPointId) {
      onNavigate(point.id, point.position);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="gaze-navigation-container" 
      style={{ 
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none' 
      }}
    >
      {/* Gaze cursor */}
      <div 
        className="gaze-cursor"
        style={{
          position: 'absolute',
          left: `${mousePosition.current.x}px`,
          top: `${mousePosition.current.y}px`,
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          border: '2px solid white',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          zIndex: 1000,
          display: enableGaze ? 'block' : 'none'
        }}
      />

      {/* Navigation points */}
      {points.map(point => {
        const screenPos = getScreenPosition(point.position, currentPosition);
        if (!screenPos) return null;

        // Determine if this point is accessible from current position
        const isAccessible = !currentPointId || 
          (points.find(p => p.id === currentPointId)?.connectedPoints || []).includes(point.id);
        
        // Skip rendering current point
        if (point.id === currentPointId) return null;
        
        // Determine point color based on status
        let pointColor = isAccessible ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.3)';
        let borderColor = isAccessible ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.4)';
        
        if (gazePoint === point.id) {
          pointColor = 'rgba(100, 217, 232, 0.7)';
          borderColor = 'rgba(100, 217, 232, 1)';
        }

        return (
          <div 
            key={point.id}
            className="navigation-point"
            style={{
              position: 'absolute',
              left: `${screenPos.x}px`,
              top: `${screenPos.y}px`,
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              backgroundColor: pointColor,
              border: `2px solid ${borderColor}`,
              boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
              transform: 'translate(-50%, -50%)',
              pointerEvents: isAccessible ? 'auto' : 'none',
              opacity: isAccessible ? 1 : 0.5,
              cursor: isAccessible ? 'pointer' : 'default',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              color: 'white'
            }}
            onClick={() => isAccessible && handlePointClick(point)}
          >
            {/* Icon or text for the point */}
            {point.icon ? (
              <i className={`fa fa-${point.icon}`}></i>
            ) : (
              <i className="fa fa-circle"></i>
            )}

            {/* Gaze progress circle */}
            {gazePoint === point.id && (
              <svg 
                width="40" 
                height="40" 
                style={{
                  position: 'absolute',
                  left: '-5px',
                  top: '-5px',
                  transform: 'rotate(-90deg)',
                  zIndex: -1
                }}
              >
                <circle
                  cx="20"
                  cy="20"
                  r="18"
                  fill="none"
                  stroke="rgba(100, 217, 232, 0.8)"
                  strokeWidth="4"
                  strokeDasharray={`${2 * Math.PI * 18 * gazeProgress / 100} ${2 * Math.PI * 18 * (1 - gazeProgress / 100)}`}
                />
              </svg>
            )}

            {/* Label */}
            {showLabels && (
              <div 
                className="point-label"
                style={{
                  position: 'absolute',
                  bottom: '40px',
                  width: 'max-content',
                  padding: '5px 10px',
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  borderRadius: '5px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  opacity: gazePoint === point.id ? 1 : 0,
                  transform: `translateY(${gazePoint === point.id ? 0 : '10px'})`,
                  transition: 'all 0.2s ease',
                  pointerEvents: 'none',
                  textAlign: 'center',
                  maxWidth: '200px',
                  whiteSpace: 'normal',
                  direction: 'rtl' // For Arabic support
                }}
              >
                {point.name}
                {point.description && (
                  <div 
                    className="point-description"
                    style={{
                      fontSize: '12px',
                      fontWeight: 'normal',
                      marginTop: '3px',
                      opacity: 0.8
                    }}
                  >
                    {point.description}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default GazeNavigation;
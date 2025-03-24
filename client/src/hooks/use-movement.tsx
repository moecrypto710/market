import { useState, useEffect, useRef, useCallback } from 'react';
import { useIsMobile } from './use-mobile';

// Define a collision object type
type CollisionObject = {
  id: string;
  position: { x: number; y: number; z: number };
  size: { width: number; height: number; depth: number };
  type: 'wall' | 'object' | 'trigger';
  onCollision?: () => void;
};

type MovementState = {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  speed: number;
  sensitivity: number;
  collisions: CollisionObject[];
};

type MovementReturn = {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  isMoving: boolean;
  moveForward: () => void;
  moveBackward: () => void;
  moveLeft: () => void;
  moveRight: () => void;
  rotate: (deltaX: number, deltaY: number) => void;
  resetPosition: () => void;
  setSpeed: (speed: number) => void;
  addCollisionObject: (object: CollisionObject) => void;
  removeCollisionObject: (id: string) => void;
  isColliding: (position: { x: number; y: number; z: number }) => boolean;
};

const DEFAULT_POSITION = { x: 0, y: 0, z: 0 };
const DEFAULT_ROTATION = { x: 0, y: 0, z: 0 };
const DEFAULT_SPEED = 5;
const DEFAULT_SENSITIVITY = 0.1;

/**
 * Hook for handling movement in a 3D space
 * Adapts the Unity PlayerMovement and CameraControl scripts for React
 * Handles both mobile touch and desktop keyboard/mouse controls
 */
export function useMovement(
  initialPosition = DEFAULT_POSITION,
  initialRotation = DEFAULT_ROTATION
): MovementReturn {
  const isMobile = useIsMobile();
  const [state, setState] = useState<MovementState>({
    position: initialPosition,
    rotation: initialRotation,
    speed: DEFAULT_SPEED,
    sensitivity: DEFAULT_SENSITIVITY,
    collisions: [], // Initialize empty collisions array
  });
  const [isMoving, setIsMoving] = useState(false);
  const lastTouchPosition = useRef<{ x: number; y: number } | null>(null);
  const keysPressed = useRef<Set<string>>(new Set());
  const animationFrameId = useRef<number | null>(null);

  // Collision detection function - defined first so it can be used in updateMovement
  const isColliding = useCallback((newPosition: { x: number; y: number; z: number }): boolean => {
    // Calculate the player's bounding box (assuming a 1x2x1 box centered on position)
    const playerSize = { width: 1, height: 2, depth: 1 };
    const playerMin = {
      x: newPosition.x - playerSize.width / 2,
      y: newPosition.y,
      z: newPosition.z - playerSize.depth / 2
    };
    const playerMax = {
      x: newPosition.x + playerSize.width / 2,
      y: newPosition.y + playerSize.height,
      z: newPosition.z + playerSize.depth / 2
    };
    
    // Check collision with each object
    for (const obj of state.collisions) {
      // Calculate object's bounding box
      const objMin = {
        x: obj.position.x - obj.size.width / 2,
        y: obj.position.y,
        z: obj.position.z - obj.size.depth / 2
      };
      const objMax = {
        x: obj.position.x + obj.size.width / 2,
        y: obj.position.y + obj.size.height,
        z: obj.position.z + obj.size.depth / 2
      };
      
      // Check for AABB collision
      if (
        playerMin.x <= objMax.x && playerMax.x >= objMin.x &&
        playerMin.y <= objMax.y && playerMax.y >= objMin.y &&
        playerMin.z <= objMax.z && playerMax.z >= objMin.z
      ) {
        // Handle trigger objects
        if (obj.type === 'trigger' && obj.onCollision) {
          obj.onCollision();
        }
        
        // Only block movement for walls and solid objects
        if (obj.type !== 'trigger') {
          return true;
        }
      }
    }
    
    return false;
  }, [state.collisions]);

  // Handle keyboard controls (desktop)
  useEffect(() => {
    if (isMobile) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key.toLowerCase());
      if (!animationFrameId.current) {
        animationFrameId.current = requestAnimationFrame(updateMovement);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key.toLowerCase());
      if (keysPressed.current.size === 0 && animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
        setIsMoving(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isMobile]);

  // Handle touch controls (mobile)
  useEffect(() => {
    if (!isMobile) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        lastTouchPosition.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && lastTouchPosition.current) {
        const touch = e.touches[0];
        const deltaX = touch.clientX - lastTouchPosition.current.x;
        const deltaY = touch.clientY - lastTouchPosition.current.y;

        // Update rotation based on touch movement
        rotate(deltaX * state.sensitivity, deltaY * state.sensitivity);

        lastTouchPosition.current = {
          x: touch.clientX,
          y: touch.clientY,
        };
        
        setIsMoving(true);
      }
    };

    const handleTouchEnd = () => {
      lastTouchPosition.current = null;
      setIsMoving(false);
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, state.sensitivity]);

  // Function to update movement based on keys pressed with collision detection
  const updateMovement = useCallback(() => {
    const keys = keysPressed.current;
    let movementVector = { x: 0, y: 0, z: 0 };
    
    if (keys.has('w') || keys.has('arrowup')) {
      movementVector.z -= 1; // Move forward
    }
    if (keys.has('s') || keys.has('arrowdown')) {
      movementVector.z += 1; // Move backward
    }
    if (keys.has('a') || keys.has('arrowleft')) {
      movementVector.x -= 1; // Move left
    }
    if (keys.has('d') || keys.has('arrowright')) {
      movementVector.x += 1; // Move right
    }

    // Only update if there's movement
    if (movementVector.x !== 0 || movementVector.z !== 0) {
      setIsMoving(true);
      
      // Normalize movement vector if moving diagonally
      const length = Math.sqrt(movementVector.x * movementVector.x + movementVector.z * movementVector.z);
      if (length > 0) {
        movementVector.x /= length;
        movementVector.z /= length;
      }

      // Apply rotation to movement direction (similar to Unity's transform.Translate in world space)
      const angle = state.rotation.y * (Math.PI / 180);
      const rotatedX = movementVector.x * Math.cos(angle) - movementVector.z * Math.sin(angle);
      const rotatedZ = movementVector.x * Math.sin(angle) + movementVector.z * Math.cos(angle);

      // Calculate new position
      const newPosition = {
        x: state.position.x + rotatedX * state.speed * 0.016,
        y: state.position.y,
        z: state.position.z + rotatedZ * state.speed * 0.016,
      };

      // Check for collisions before updating position
      if (!isColliding(newPosition)) {
        setState((prevState) => ({
          ...prevState,
          position: newPosition,
        }));
      }
    } else {
      setIsMoving(false);
    }

    animationFrameId.current = requestAnimationFrame(updateMovement);
  }, [state.rotation.y, state.speed, state.position, isColliding]);

  // Movement functions
  const moveForward = useCallback(() => {
    setState((prevState) => {
      const angle = prevState.rotation.y * (Math.PI / 180);
      const newPosition = {
        x: prevState.position.x - Math.sin(angle) * prevState.speed * 0.016,
        y: prevState.position.y,
        z: prevState.position.z - Math.cos(angle) * prevState.speed * 0.016,
      };
      
      // Only move if no collision
      if (!isColliding(newPosition)) {
        return {
          ...prevState,
          position: newPosition,
        };
      }
      return prevState;
    });
    setIsMoving(true);
  }, [isColliding]);

  const moveBackward = useCallback(() => {
    setState((prevState) => {
      const angle = prevState.rotation.y * (Math.PI / 180);
      const newPosition = {
        x: prevState.position.x + Math.sin(angle) * prevState.speed * 0.016,
        y: prevState.position.y,
        z: prevState.position.z + Math.cos(angle) * prevState.speed * 0.016,
      };
      
      // Only move if no collision
      if (!isColliding(newPosition)) {
        return {
          ...prevState,
          position: newPosition,
        };
      }
      return prevState;
    });
    setIsMoving(true);
  }, [isColliding]);

  const moveLeft = useCallback(() => {
    setState((prevState) => {
      const angle = prevState.rotation.y * (Math.PI / 180);
      const newPosition = {
        x: prevState.position.x - Math.cos(angle) * prevState.speed * 0.016,
        y: prevState.position.y,
        z: prevState.position.z + Math.sin(angle) * prevState.speed * 0.016,
      };
      
      // Only move if no collision
      if (!isColliding(newPosition)) {
        return {
          ...prevState,
          position: newPosition,
        };
      }
      return prevState;
    });
    setIsMoving(true);
  }, [isColliding]);

  const moveRight = useCallback(() => {
    setState((prevState) => {
      const angle = prevState.rotation.y * (Math.PI / 180);
      const newPosition = {
        x: prevState.position.x + Math.cos(angle) * prevState.speed * 0.016,
        y: prevState.position.y,
        z: prevState.position.z - Math.sin(angle) * prevState.speed * 0.016,
      };
      
      // Only move if no collision
      if (!isColliding(newPosition)) {
        return {
          ...prevState,
          position: newPosition,
        };
      }
      return prevState;
    });
    setIsMoving(true);
  }, [isColliding]);

  // Rotation function
  const rotate = useCallback((deltaX: number, deltaY: number) => {
    setState((prevState) => ({
      ...prevState,
      rotation: {
        x: Math.max(-90, Math.min(90, prevState.rotation.x - deltaY)), // Limit vertical rotation
        y: (prevState.rotation.y + deltaX) % 360, // Full 360 horizontal rotation
        z: prevState.rotation.z,
      },
    }));
  }, []);

  // Reset position function
  const resetPosition = useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      position: initialPosition,
      rotation: initialRotation,
    }));
    setIsMoving(false);
  }, [initialPosition, initialRotation]);

  // Set movement speed
  const setSpeed = useCallback((speed: number) => {
    setState((prevState) => ({
      ...prevState,
      speed,
    }));
  }, []);

  // Add collision object function
  const addCollisionObject = useCallback((object: CollisionObject) => {
    setState(prevState => ({
      ...prevState,
      collisions: [...prevState.collisions, object]
    }));
  }, []);
  
  // Remove collision object function
  const removeCollisionObject = useCallback((id: string) => {
    setState(prevState => ({
      ...prevState,
      collisions: prevState.collisions.filter(obj => obj.id !== id)
    }));
  }, []);

  return {
    position: state.position,
    rotation: state.rotation,
    isMoving,
    moveForward,
    moveBackward,
    moveLeft,
    moveRight,
    rotate,
    resetPosition,
    setSpeed,
    addCollisionObject,
    removeCollisionObject,
    isColliding
  };
}
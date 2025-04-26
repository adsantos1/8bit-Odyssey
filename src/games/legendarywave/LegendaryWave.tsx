import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Vector3, Mesh } from 'three';
import { GameState, PlayerState, ProjectileState, JoystickState } from './types';
import './LegendaryWave.css';

const INITIAL_PLAYER_STATE: PlayerState = {
  position: new Vector3(0, 1, 0),
  rotation: new Vector3(0, 0, 0),
  velocity: new Vector3(0, 0, 0)
};

const Player: React.FC<{ state: PlayerState }> = ({ state }) => {
  const meshRef = useRef<Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.copy(state.position);
      meshRef.current.rotation.y = state.rotation.y;
    }
  });

  return (
    <mesh ref={meshRef} castShadow>
      <capsuleGeometry args={[0.5, 1, 4]} />
      <meshStandardMaterial color="cyan" />
    </mesh>
  );
};

const Projectile: React.FC<{ state: ProjectileState }> = ({ state }) => {
  const meshRef = useRef<Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.copy(state.position);
      state.position.add(state.direction.multiplyScalar(0.2));
    }
  });

  return (
    <mesh ref={meshRef} castShadow>
      <sphereGeometry args={[0.2]} />
      <meshStandardMaterial color="red" emissive="red" emissiveIntensity={0.2} />
    </mesh>
  );
};

const Ground: React.FC = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial color="#444" />
    </mesh>
  );
};

interface LegendaryWaveProps {
  onGoBack?: () => void;
}

const LegendaryWave: React.FC<LegendaryWaveProps> = ({ onGoBack }) => {
  const [gameState, setGameState] = useState<GameState>({
    player: INITIAL_PLAYER_STATE,
    projectiles: [],
    score: 0
  });

  const [joystick, setJoystick] = useState<JoystickState>({
    x: 0,
    y: 0,
    isActive: false
  });

  useEffect(() => {
    const movePlayer = () => {
      if (!joystick.isActive) return;

      setGameState(prev => {
        const newPosition = new Vector3(
          prev.player.position.x + joystick.x * 0.1,
          prev.player.position.y,
          prev.player.position.z + joystick.y * 0.1
        );

        const newRotation = new Vector3(
          0,
          Math.atan2(joystick.x, joystick.y),
          0
        );

        return {
          ...prev,
          player: {
            ...prev.player,
            position: newPosition,
            rotation: newRotation
          }
        };
      });
    };

    const gameLoop = setInterval(movePlayer, 16);
    return () => clearInterval(gameLoop);
  }, [joystick]);

  const handleJoystickStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const joystickElement = e.currentTarget.getBoundingClientRect();
    
    setJoystick({
      x: (touch.clientX - joystickElement.left - joystickElement.width / 2) / (joystickElement.width / 2),
      y: (touch.clientY - joystickElement.top - joystickElement.height / 2) / (joystickElement.height / 2),
      isActive: true
    });
  };

  const handleJoystickMove = (e: React.TouchEvent) => {
    if (!joystick.isActive) return;
    
    const touch = e.touches[0];
    const joystickElement = e.currentTarget.getBoundingClientRect();
    
    setJoystick(prev => ({
      ...prev,
      x: (touch.clientX - joystickElement.left - joystickElement.width / 2) / (joystickElement.width / 2),
      y: (touch.clientY - joystickElement.top - joystickElement.height / 2) / (joystickElement.height / 2)
    }));
  };

  const handleJoystickEnd = () => {
    setJoystick({ x: 0, y: 0, isActive: false });
  };

  const handleFire = () => {
    setGameState(prev => {
      const direction = new Vector3(
        Math.sin(prev.player.rotation.y),
        0,
        Math.cos(prev.player.rotation.y)
      ).normalize();

      const newProjectile: ProjectileState = {
        id: Date.now().toString(),
        position: prev.player.position.clone(),
        direction: direction,
        createdAt: Date.now()
      };

      return {
        ...prev,
        projectiles: [...prev.projectiles, newProjectile]
      };
    });
  };

  useEffect(() => {
    const cleanup = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        projectiles: prev.projectiles.filter(p => Date.now() - p.createdAt < 2000)
      }));
    }, 100);

    return () => clearInterval(cleanup);
  }, []);

  return (
    <div className="legendarywave-root">
      {onGoBack && (
        <button
          style={{
            position: 'fixed',
            top: 20,
            left: 20,
            zIndex: 100,
            background: 'rgba(0,0,0,0.5)',
            color: '#fff',
            border: '2px solid cyan',
            borderRadius: 8,
            padding: '8px 16px',
            cursor: 'pointer'
          }}
          onClick={onGoBack}
        >
          ← Back
        </button>
      )}
      
      <Canvas shadows camera={{ position: [15, 15, 15], fov: 50, near: 0.1, far: 100 }}>
        <color attach="background" args={['#111']} />
        <fog attach="fog" args={['#111', 30, 50]} />
        
        <ambientLight intensity={0.2} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        
        <Player state={gameState.player} />
        {gameState.projectiles.map(projectile => (
          <Projectile key={projectile.id} state={projectile} />
        ))}
        <Ground />
        
        <OrbitControls
          target={[0, 0, 0]}
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 2.5}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>

      <div 
        className="joystick"
        onTouchStart={handleJoystickStart}
        onTouchMove={handleJoystickMove}
        onTouchEnd={handleJoystickEnd}
      >
        <div 
          className="joystick-thumb"
          style={{
            transform: `translate(${joystick.x * 50}px, ${joystick.y * 50}px)`
          }}
        />
      </div>

      <button className="fire-button" onClick={handleFire}>
        Fire
      </button>
    </div>
  );
};

export default LegendaryWave; 
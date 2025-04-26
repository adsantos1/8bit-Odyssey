import { Vector3 } from 'three';

export interface PlayerState {
  position: Vector3;
  rotation: Vector3;
  velocity: Vector3;
}

export interface ProjectileState {
  id: string;
  position: Vector3;
  direction: Vector3;
  createdAt: number;
}

export interface GameState {
  player: PlayerState;
  projectiles: ProjectileState[];
  score: number;
}

export interface JoystickState {
  x: number;
  y: number;
  isActive: boolean;
} 
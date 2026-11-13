/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type BuildingType =
  | 'brick_apt'
  | 'nordic_wood'
  | 'cafe_bistro'
  | 'modern_glass'
  | 'pastel_townhouse'
  | 'retro_shophouse'
  | 'penthouse_loft'
  | 'japanese_machiya';

export type PowerUpType = 'slow' | 'magnet' | 'widen';

export interface ItemInventory {
  slow: number;
  magnet: number;
  widen: number;
}

export interface ActivePowerUps {
  slowTimer: number; // frames remaining (60fps -> 360 = 6s)
  magnetCharges: number; // remaining drops with magnetic auto-align
}

export interface BuildingConfig {
  type: BuildingType;
  name: string;
  wallColor: string;
  wallShadeColor: string;
  trimColor: string;
  windowColor: string;
  height: number;
}

export interface Block {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  buildingType: BuildingType;
  wallColor: string;
  wallShadeColor: string;
  trimColor: string;
  windowColor: string;
  isBase?: boolean;
  cutLeft?: boolean;
  cutRight?: boolean;
  bonusItem?: PowerUpType;
}

export interface DebrisPiece {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  alpha: number;
  buildingType: BuildingType;
  wallColor: string;
  wallShadeColor: string;
  trimColor: string;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  shape: 'star' | 'circle' | 'crumb' | 'sparkle';
  life: number;
  maxLife: number;
  rotation: number;
  vRot: number;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  subText?: string;
  color: string;
  scale: number;
  opacity: number;
  vy: number;
  life: number;
}

export interface Pendulum {
  anchorX: number;
  anchorY: number;
  length: number;
  angle: number;
  maxAngle: number;
  speed: number;
  phase: number;
}

export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export interface GameStats {
  score: number;
  height: number;
  perfectCount: number;
  maxCombo: number;
  currentCombo: number;
  isFever: boolean;
  feverTimer: number;
  inventory: ItemInventory;
  activePowerUps: ActivePowerUps;
}

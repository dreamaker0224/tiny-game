/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type DessertType =
  | 'souffle_pancake'
  | 'strawberry_shortcake'
  | 'matcha_roll'
  | 'caramel_pudding'
  | 'french_macaron'
  | 'honey_toast'
  | 'chocolate_brownie'
  | 'custard_tart'
  | 'berry_cheesecake'
  | 'rainbow_donut';

export interface DessertConfig {
  type: DessertType;
  name: string;
  nameEn: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  height: number;
  decorations: string[];
}

export interface Block {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  dessertType: DessertType;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  isBase?: boolean;
  cutLeft?: boolean;
  cutRight?: boolean;
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
  dessertType: DessertType;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  shape: 'star' | 'circle' | 'crumb' | 'sparkle' | 'heart';
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
  height: number; // in floors
  perfectCount: number;
  maxCombo: number;
  currentCombo: number;
  isFever: boolean;
  feverTimer: number;
}

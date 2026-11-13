/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BuildingConfig, BuildingType, PowerUpType } from './types.ts';

export const BUILDING_PALETTE: BuildingConfig[] = [
  {
    type: 'brick_apt',
    name: '紅磚暖居公寓',
    wallColor: '#E07A5F',
    wallShadeColor: '#C85A3F',
    trimColor: '#F4F1DE',
    windowColor: '#BAE6FD',
    height: 44,
  },
  {
    type: 'cafe_bistro',
    name: '街角奶油咖啡屋',
    wallColor: '#FEF3C7',
    wallShadeColor: '#FDE68A',
    trimColor: '#B45309',
    windowColor: '#7DD3FC',
    height: 44,
  },
  {
    type: 'nordic_wood',
    name: '北歐原木閣樓',
    wallColor: '#D99B66',
    wallShadeColor: '#B87A46',
    trimColor: '#FFFBEB',
    windowColor: '#E0F2FE',
    height: 42,
  },
  {
    type: 'pastel_townhouse',
    name: '薄荷綠洋房',
    wallColor: '#81B29A',
    wallShadeColor: '#5F9279',
    trimColor: '#FFFFFF',
    windowColor: '#DBEAFE',
    height: 44,
  },
  {
    type: 'modern_glass',
    name: '都會藍晶玻璃層',
    wallColor: '#64748B',
    wallShadeColor: '#475569',
    trimColor: '#E2E8F0',
    windowColor: '#38BDF8',
    height: 44,
  },
  {
    type: 'retro_shophouse',
    name: '復古鵝黃老街樓',
    wallColor: '#F2CC8F',
    wallShadeColor: '#DFB16B',
    trimColor: '#9A3412',
    windowColor: '#93C5FD',
    height: 42,
  },
  {
    type: 'japanese_machiya',
    name: '和風木格町家',
    wallColor: '#57534E',
    wallShadeColor: '#44403C',
    trimColor: '#D6D3D1',
    windowColor: '#FDE047',
    height: 42,
  },
  {
    type: 'penthouse_loft',
    name: '天際景觀豪宅',
    wallColor: '#F1F5F9',
    wallShadeColor: '#CBD5E1',
    trimColor: '#0F172A',
    windowColor: '#60A5FA',
    height: 46,
  },
];

export function getBuildingConfig(type: BuildingType): BuildingConfig {
  return BUILDING_PALETTE.find((b) => b.type === type) || BUILDING_PALETTE[0];
}

export function getRandomBuilding(previousType?: BuildingType): BuildingConfig {
  const available = BUILDING_PALETTE.filter((b) => b.type !== previousType);
  return available[Math.floor(Math.random() * available.length)];
}

export function getRandomPowerUp(): PowerUpType {
  const items: PowerUpType[] = ['slow', 'magnet', 'widen'];
  return items[Math.floor(Math.random() * items.length)];
}

export const POWERUP_INFO: Record<PowerUpType, { label: string; emoji: string; color: string; desc: string }> = {
  slow: {
    label: '緩速時鐘',
    emoji: '⏱️',
    color: '#0EA5E9',
    desc: '吊車擺動減速 6 秒',
  },
  magnet: {
    label: '磁吸對齊',
    emoji: '🧲',
    color: '#8B5CF6',
    desc: '下 2 層自動磁吸完美對齊',
  },
  widen: {
    label: '鋼骨加寬',
    emoji: '🏗️',
    color: '#F59E0B',
    desc: '立即拓寬頂樓承重空間',
  },
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import {
  Block,
  DebrisPiece,
  FloatingText,
  GameState,
  GameStats,
  Particle,
  Pendulum,
  PowerUpType,
} from './types.ts';
import { getRandomBuilding, getBuildingConfig, getRandomPowerUp, POWERUP_INFO } from './buildings.ts';
import { drawBuildingBlock, drawDebrisPiece, drawRoundedRect } from './buildingRenderer.ts';
import { soundManager } from '../audio/soundManager.ts';

export interface GameCanvasHandle {
  activatePowerUp: (type: PowerUpType) => void;
  triggerDrop: () => void;
}

interface GameCanvasProps {
  gameState: GameState;
  onGameOver: (stats: GameStats) => void;
  onUpdateStats: (stats: GameStats) => void;
  isPaused: boolean;
}

export const GameCanvas = forwardRef<GameCanvasHandle, GameCanvasProps>(({
  gameState,
  onGameOver,
  onUpdateStats,
  isPaused,
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const CANVAS_WIDTH = 380;
  const CANVAS_HEIGHT = 680;

  const stateRef = useRef<{
    blocks: Block[];
    fallingBlock: Block | null;
    fallingVelocity: { vx: number; vy: number };
    debris: DebrisPiece[];
    particles: Particle[];
    floatingTexts: FloatingText[];
    pendulum: Pendulum;
    nextBuilding: ReturnType<typeof getRandomBuilding>;
    nextBonusItem: PowerUpType | undefined;
    currentBlockWidth: number;
    stats: GameStats;
    cameraY: number;
    targetCameraY: number;
    screenShake: number;
    shakeOffset: { x: number; y: number };
    isGameOverTriggered: boolean;
    clouds: { x: number; y: number; speed: number; scale: number }[];
    stars: { x: number; y: number; size: number; twinklePhase: number }[];
  }>({
    blocks: [],
    fallingBlock: null,
    fallingVelocity: { vx: 0, vy: 0 },
    debris: [],
    particles: [],
    floatingTexts: [],
    pendulum: {
      anchorX: 190,
      anchorY: 72,
      length: 120,
      angle: 0,
      maxAngle: 0.85,
      speed: 0.034,
      phase: 0,
    },
    nextBuilding: getRandomBuilding(),
    nextBonusItem: undefined,
    currentBlockWidth: 180,
    stats: {
      score: 0,
      height: 0,
      perfectCount: 0,
      maxCombo: 0,
      currentCombo: 0,
      isFever: false,
      feverTimer: 0,
      inventory: { slow: 1, magnet: 1, widen: 1 },
      activePowerUps: { slowTimer: 0, magnetCharges: 0 },
    },
    cameraY: 0,
    targetCameraY: 0,
    screenShake: 0,
    shakeOffset: { x: 0, y: 0 },
    isGameOverTriggered: false,
    clouds: [
      { x: 40, y: 180, speed: 0.18, scale: 0.9 },
      { x: 240, y: 120, speed: 0.12, scale: 1.1 },
      { x: 150, y: 270, speed: 0.22, scale: 0.75 },
    ],
    stars: Array.from({ length: 32 }, () => ({
      x: Math.random() * 380,
      y: Math.random() * 480,
      size: 1 + Math.random() * 1.8,
      twinklePhase: Math.random() * Math.PI * 2,
    })),
  });

  // Particle spawn helpers
  const spawnParticles = useCallback((x: number, y: number, count: number, colors: string[], shape: Particle['shape'] = 'star') => {
    const p = stateRef.current.particles;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4.5;
      p.push({
        id: `p-${Math.random()}`,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        size: 3 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape,
        life: 0,
        maxLife: 25 + Math.random() * 25,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
      });
    }
  }, []);

  const addFloatingText = useCallback((x: number, y: number, text: string, color: string = '#F59E0B', subText?: string) => {
    stateRef.current.floatingTexts.push({
      id: `ft-${Math.random()}`,
      x,
      y,
      text,
      subText,
      color,
      scale: 1.4,
      opacity: 1,
      vy: -1.5,
      life: 0,
    });
  }, []);

  // Initialize a fresh game
  const initGame = useCallback(() => {
    const baseBuilding = getBuildingConfig('brick_apt');
    const firstBlock: Block = {
      id: 'base-0',
      x: (CANVAS_WIDTH - 180) / 2,
      y: CANVAS_HEIGHT - 120,
      width: 180,
      height: 46,
      buildingType: 'brick_apt',
      wallColor: baseBuilding.wallColor,
      wallShadeColor: baseBuilding.wallShadeColor,
      trimColor: baseBuilding.trimColor,
      windowColor: baseBuilding.windowColor,
      isBase: true,
    };

    stateRef.current = {
      ...stateRef.current,
      blocks: [firstBlock],
      fallingBlock: null,
      fallingVelocity: { vx: 0, vy: 0 },
      debris: [],
      particles: [],
      floatingTexts: [],
      pendulum: {
        anchorX: CANVAS_WIDTH / 2,
        anchorY: 72,
        length: 120,
        angle: 0,
        maxAngle: 0.85,
        speed: 0.034,
        phase: 0,
      },
      nextBuilding: getRandomBuilding('brick_apt'),
      nextBonusItem: undefined,
      currentBlockWidth: 180,
      stats: {
        score: 0,
        height: 0,
        perfectCount: 0,
        maxCombo: 0,
        currentCombo: 0,
        isFever: false,
        feverTimer: 0,
        inventory: { slow: 1, magnet: 1, widen: 1 },
        activePowerUps: { slowTimer: 0, magnetCharges: 0 },
      },
      cameraY: 0,
      targetCameraY: 0,
      screenShake: 0,
      shakeOffset: { x: 0, y: 0 },
      isGameOverTriggered: false,
    };

    onUpdateStats({ ...stateRef.current.stats });
  }, [onUpdateStats]);

  // Handle game state resets
  useEffect(() => {
    if (gameState === 'PLAYING') {
      initGame();
    }
  }, [gameState, initGame]);

  // Power-Up Activation
  const activatePowerUp = useCallback((type: PowerUpType) => {
    if (gameState !== 'PLAYING' || isPaused) return;
    const s = stateRef.current;
    if (s.isGameOverTriggered) return;
    if (s.stats.inventory[type] <= 0) return;

    const topBlock = s.blocks[s.blocks.length - 1];
    if (!topBlock) return;

    if (type === 'slow') {
      if (s.stats.activePowerUps.slowTimer > 300) return; // avoid accidental double waste
      s.stats.inventory.slow -= 1;
      s.stats.activePowerUps.slowTimer = 360; // 6 seconds at 60fps
      soundManager.playPowerUp('slow');
      spawnParticles(CANVAS_WIDTH / 2, 160 - s.cameraY, 22, ['#38BDF8', '#0EA5E9', '#E0F2FE'], 'sparkle');
      addFloatingText(CANVAS_WIDTH / 2, topBlock.y - 30, '⏱️ 緩速時間！', '#0284C7', '吊車擺動減速 6 秒');
    } else if (type === 'magnet') {
      s.stats.inventory.magnet -= 1;
      s.stats.activePowerUps.magnetCharges += 2;
      soundManager.playPowerUp('magnet');
      spawnParticles(topBlock.x + topBlock.width / 2, topBlock.y, 24, ['#A78BFA', '#8B5CF6', '#38BDF8'], 'sparkle');
      addFloatingText(topBlock.x + topBlock.width / 2, topBlock.y - 30, '🧲 磁吸雷射啟動！', '#7C3AED', '自動對齊保護 2 層');
    } else if (type === 'widen') {
      if (topBlock.width >= 190 && s.currentBlockWidth >= 190) {
        addFloatingText(topBlock.x + topBlock.width / 2, topBlock.y - 25, '已達最大寬度！', '#D97706');
        return;
      }
      s.stats.inventory.widen -= 1;
      const newW = Math.min(190, topBlock.width + 36);
      const diff = newW - topBlock.width;
      topBlock.width = newW;
      topBlock.x = Math.max(12, Math.min(CANVAS_WIDTH - newW - 12, topBlock.x - diff / 2));
      topBlock.cutLeft = false;
      topBlock.cutRight = false;
      s.currentBlockWidth = newW;
      if (s.fallingBlock) {
        s.fallingBlock.width = newW;
      }
      s.screenShake = 5;
      soundManager.playPowerUp('widen');
      spawnParticles(topBlock.x + topBlock.width / 2, topBlock.y + 10, 26, ['#FBBF24', '#F59E0B', '#FFFFFF'], 'star');
      addFloatingText(topBlock.x + topBlock.width / 2, topBlock.y - 30, `🏗️ 鋼骨擴建 +${Math.round(diff)}px！`, '#D97706');
    }

    onUpdateStats({
      ...s.stats,
      inventory: { ...s.stats.inventory },
      activePowerUps: { ...s.stats.activePowerUps },
    });
  }, [gameState, isPaused, onUpdateStats, spawnParticles, addFloatingText]);

  // Release block from crane
  const handleDrop = useCallback(() => {
    if (gameState !== 'PLAYING' || isPaused) return;
    const s = stateRef.current;
    if (s.fallingBlock !== null || s.isGameOverTriggered) return;

    const { anchorX, anchorY, length, angle } = s.pendulum;
    const bobX = anchorX + Math.sin(angle) * length;
    const bobScreenY = anchorY + Math.cos(angle) * length;
    const bobWorldY = bobScreenY - s.cameraY;

    const topBlock = s.blocks[s.blocks.length - 1];
    const blockWidth = topBlock ? topBlock.width : s.currentBlockWidth;
    s.currentBlockWidth = blockWidth;

    const building = s.nextBuilding;
    const newBlock: Block = {
      id: `block-${s.blocks.length}`,
      x: bobX - blockWidth / 2,
      y: bobWorldY,
      width: blockWidth,
      height: building.height,
      buildingType: building.type,
      wallColor: building.wallColor,
      wallShadeColor: building.wallShadeColor,
      trimColor: building.trimColor,
      windowColor: building.windowColor,
      bonusItem: s.nextBonusItem,
    };

    s.fallingBlock = newBlock;

    const swingVx = Math.cos(angle) * s.pendulum.maxAngle * s.pendulum.speed * length * 0.2;
    s.fallingVelocity = {
      vx: swingVx,
      vy: 2.5,
    };

    // Prepare next building floor; every 5th upcoming floor carries a bonus power-up!
    const nextFloorNum = s.stats.height + 2;
    s.nextBuilding = getRandomBuilding(building.type);
    s.nextBonusItem = nextFloorNum % 5 === 0 ? getRandomPowerUp() : undefined;

    soundManager.playDropSwoosh();
  }, [gameState, isPaused]);

  useImperativeHandle(ref, () => ({
    activatePowerUp,
    triggerDrop: handleDrop,
  }), [activatePowerUp, handleDrop]);

  // Main 60fps Game Loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      animId = requestAnimationFrame(render);
      const s = stateRef.current;

      // Drift background clouds
      for (const cloud of s.clouds) {
        cloud.x += cloud.speed;
        if (cloud.x > CANVAS_WIDTH + 60) cloud.x = -70;
      }
      for (const star of s.stars) {
        star.twinklePhase += 0.04;
      }

      if (!isPaused && gameState === 'PLAYING') {
        // 1. Slow-mo & Pendulum Update
        let speedFactor = 1.0;
        if (s.stats.activePowerUps.slowTimer > 0) {
          s.stats.activePowerUps.slowTimer -= 1;
          speedFactor = 0.48;
          if (s.stats.activePowerUps.slowTimer % 15 === 0 || s.stats.activePowerUps.slowTimer === 0) {
            onUpdateStats({
              ...s.stats,
              inventory: { ...s.stats.inventory },
              activePowerUps: { ...s.stats.activePowerUps },
            });
          }
        }

        s.pendulum.phase += s.pendulum.speed * speedFactor;
        s.pendulum.angle = s.pendulum.maxAngle * Math.sin(s.pendulum.phase);

        // 2. Fever Timer Update
        if (s.stats.isFever) {
          s.stats.feverTimer -= 1;
          if (s.stats.feverTimer <= 0) {
            s.stats.isFever = false;
            addFloatingText(CANVAS_WIDTH / 2, s.blocks[s.blocks.length - 1].y - 25, '狂熱時間結束', '#94A3B8');
          }
        }

        // 3. Falling Floor Physics & Landing Collision
        if (s.fallingBlock) {
          s.fallingVelocity.vy += 0.74;
          s.fallingBlock.y += s.fallingVelocity.vy;
          s.fallingBlock.x += s.fallingVelocity.vx * 0.42;

          // Subtle magnetic homing pull while falling if magnet is active and reasonably close
          const topBlock = s.blocks[s.blocks.length - 1];
          if (s.stats.activePowerUps.magnetCharges > 0) {
            const distToTarget = topBlock.x - s.fallingBlock.x;
            if (Math.abs(distToTarget) < 42) {
              s.fallingBlock.x += distToTarget * 0.14;
            }
          }

          const targetLandingY = topBlock.y - s.fallingBlock.height;

          if (s.fallingBlock.y >= targetLandingY) {
            const fb = s.fallingBlock;
            const diffX = fb.x - topBlock.x;

            const hasMagnet = s.stats.activePowerUps.magnetCharges > 0;
            const PERFECT_TOLERANCE = hasMagnet ? 36 : 3.8;

            const overlapLeft = Math.max(fb.x, topBlock.x);
            const overlapRight = Math.min(fb.x + fb.width, topBlock.x + topBlock.width);
            const overlapWidth = overlapRight - overlapLeft;

            if (overlapWidth <= 0 || overlapWidth < 6) {
              // === MISS & GAME OVER ===
              if (!s.isGameOverTriggered) {
                s.isGameOverTriggered = true;
                soundManager.playMiss();
                s.screenShake = 14;

                s.debris.push({
                  id: `miss-${Math.random()}`,
                  x: fb.x,
                  y: fb.y,
                  width: fb.width,
                  height: fb.height,
                  vx: s.fallingVelocity.vx * 1.2,
                  vy: s.fallingVelocity.vy,
                  rotation: 0,
                  vRot: (s.fallingVelocity.vx > 0 ? 0.07 : -0.07),
                  alpha: 1,
                  buildingType: fb.buildingType,
                  wallColor: fb.wallColor,
                  wallShadeColor: fb.wallShadeColor,
                  trimColor: fb.trimColor,
                });

                s.fallingBlock = null;
                addFloatingText(CANVAS_WIDTH / 2, targetLandingY - 20, 'MISS!', '#EF4444', overlapWidth < 6 && overlapWidth > 0 ? '太窄無法承重！' : '樓層墜落了...');

                setTimeout(() => {
                  onGameOver({
                    ...s.stats,
                    inventory: { ...s.stats.inventory },
                    activePowerUps: { ...s.stats.activePowerUps },
                  });
                }, 900);
              }
            } else if (Math.abs(diffX) <= PERFECT_TOLERANCE) {
              // === PERFECT LANDING ===
              const triggeredMagnet = hasMagnet && Math.abs(diffX) > 3.8;
              if (hasMagnet) {
                s.stats.activePowerUps.magnetCharges -= 1;
              }

              fb.x = topBlock.x;
              fb.y = targetLandingY;
              fb.width = topBlock.width;

              s.stats.perfectCount += 1;
              s.stats.currentCombo += 1;
              s.stats.maxCombo = Math.max(s.stats.maxCombo, s.stats.currentCombo);

              // Consecutive perfects symmetrically expand width!
              let comboBonusText = triggeredMagnet ? '🧲 磁吸精準對齊！' : '';
              if (s.stats.currentCombo >= 3 && fb.width < 190) {
                const expand = Math.min(8, 190 - fb.width);
                if (expand > 0) {
                  fb.width += expand;
                  fb.x -= expand / 2;
                  comboBonusText = `+${expand}px 結構加寬！`;
                }
              }

              // Collect bonus crate if floor had one
              if (fb.bonusItem) {
                const item = fb.bonusItem;
                s.stats.inventory[item] += 1;
                soundManager.playItemGet();
                const info = POWERUP_INFO[item];
                addFloatingText(fb.x + fb.width / 2, fb.y - 42, `🎁 獲得 ${info.emoji} ${info.label}!`, info.color);
                fb.bonusItem = undefined;
              } else if (s.stats.currentCombo > 0 && s.stats.currentCombo % 4 === 0) {
                // Award bonus item every 4-combo streak!
                const reward = getRandomPowerUp();
                s.stats.inventory[reward] += 1;
                soundManager.playItemGet();
                const info = POWERUP_INFO[reward];
                addFloatingText(fb.x + fb.width / 2, fb.y - 42, `🔥 連擊贈禮 ${info.emoji} ${info.label}+1`, info.color);
              }

              s.currentBlockWidth = fb.width;

              // Fever mode trigger at 5 combo
              if (s.stats.currentCombo >= 5 && !s.stats.isFever) {
                s.stats.isFever = true;
                s.stats.feverTimer = 360;
                soundManager.playFever();
                spawnParticles(CANVAS_WIDTH / 2, fb.y, 40, ['#F59E0B', '#EC4899', '#8B5CF6', '#10B981', '#38BDF8']);
                addFloatingText(CANVAS_WIDTH / 2, fb.y - 58, '✨ 摩天狂熱 FEVER! ✨', '#EC4899', '得分雙倍！');
              }

              const multiplier = s.stats.isFever ? 2 : 1;
              const points = (200 + s.stats.currentCombo * 50) * multiplier;
              s.stats.score += points;
              s.stats.height += 1;

              soundManager.playLand(true, s.stats.currentCombo);
              s.screenShake = 4;

              spawnParticles(
                fb.x + fb.width / 2,
                fb.y + fb.height,
                22,
                triggeredMagnet ? ['#8B5CF6', '#38BDF8', '#FFFFFF'] : ['#FCD34D', '#38BDF8', '#34D399', '#FFFFFF'],
                'sparkle'
              );

              const comboRank = s.stats.currentCombo;
              let title = `PERFECT! +${points}`;
              if (comboRank === 2) title = `GREAT! +${points}`;
              else if (comboRank === 3) title = `AMAZING! +${points}`;
              else if (comboRank >= 4) title = `COMBO x${comboRank}! +${points}`;

              addFloatingText(fb.x + fb.width / 2, fb.y - 14, title, triggeredMagnet ? '#7C3AED' : '#D97706', comboBonusText);

              s.blocks.push(fb);
              s.fallingBlock = null;
              s.pendulum.speed = Math.min(0.066, 0.034 + s.stats.height * 0.0009);

            } else {
              // === SLICE & OVERHANG FALL ===
              if (hasMagnet) {
                s.stats.activePowerUps.magnetCharges -= 1;
              }
              fb.y = targetLandingY;
              s.stats.currentCombo = 0;

              soundManager.playLand(false, 0);
              s.screenShake = 6;

              const points = 100 * (s.stats.isFever ? 2 : 1);
              s.stats.score += points;
              s.stats.height += 1;

              // Collect bonus crate even on sliced landing
              if (fb.bonusItem) {
                const item = fb.bonusItem;
                s.stats.inventory[item] += 1;
                soundManager.playItemGet();
                const info = POWERUP_INFO[item];
                addFloatingText(fb.x + fb.width / 2, fb.y - 40, `🎁 獲得 ${info.emoji} ${info.label}!`, info.color);
                fb.bonusItem = undefined;
              }

              let debrisX = 0;
              let debrisW = 0;
              let debrisVx = 0;

              if (fb.x < topBlock.x) {
                debrisW = topBlock.x - fb.x;
                debrisX = fb.x;
                debrisVx = -2.4 - Math.random() * 1.4;

                fb.x = topBlock.x;
                fb.width = overlapWidth;
                fb.cutLeft = true;
              } else {
                debrisW = (fb.x + fb.width) - (topBlock.x + topBlock.width);
                debrisX = topBlock.x + topBlock.width;
                debrisVx = 2.4 + Math.random() * 1.4;

                fb.width = overlapWidth;
                fb.cutRight = true;
              }

              s.currentBlockWidth = fb.width;

              s.debris.push({
                id: `debris-${Math.random()}`,
                x: debrisX,
                y: targetLandingY,
                width: debrisW,
                height: fb.height,
                vx: debrisVx,
                vy: -1.8,
                rotation: 0,
                vRot: debrisVx > 0 ? 0.08 : -0.08,
                alpha: 1,
                buildingType: fb.buildingType,
                wallColor: fb.wallColor,
                wallShadeColor: fb.wallShadeColor,
                trimColor: fb.trimColor,
              });

              spawnParticles(debrisX + debrisW / 2, targetLandingY + fb.height / 2, 14, [fb.wallColor, '#94A3B8', '#CBD5E1'], 'crumb');
              addFloatingText(fb.x + fb.width / 2, fb.y - 14, `+${points}`, '#475569');

              s.blocks.push(fb);
              s.fallingBlock = null;
              s.pendulum.speed = Math.min(0.066, 0.034 + s.stats.height * 0.0009);
            }

            onUpdateStats({
              ...s.stats,
              inventory: { ...s.stats.inventory },
              activePowerUps: { ...s.stats.activePowerUps },
            });
          }
        }

        // 4. Update Debris
        for (let i = s.debris.length - 1; i >= 0; i--) {
          const deb = s.debris[i];
          deb.vy += 0.65;
          deb.x += deb.vx;
          deb.y += deb.vy;
          deb.rotation += deb.vRot;
          deb.alpha -= 0.012;

          if (deb.alpha <= 0 || deb.y + s.cameraY > CANVAS_HEIGHT + 120) {
            s.debris.splice(i, 1);
          }
        }

        // 5. Update Particles
        for (let i = s.particles.length - 1; i >= 0; i--) {
          const p = s.particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.15;
          p.rotation += p.vRot;
          p.life += 1;
          if (p.life >= p.maxLife) {
            s.particles.splice(i, 1);
          }
        }

        // 6. Update Floating Texts
        for (let i = s.floatingTexts.length - 1; i >= 0; i--) {
          const ft = s.floatingTexts[i];
          ft.y += ft.vy;
          ft.scale = Math.max(1, ft.scale - 0.02);
          ft.life += 1;
          if (ft.life > 22) {
            ft.opacity -= 0.038;
          }
          if (ft.opacity <= 0) {
            s.floatingTexts.splice(i, 1);
          }
        }

        // 7. Camera Tracking
        const topY = s.blocks[s.blocks.length - 1].y;
        const desiredTopScreenY = CANVAS_HEIGHT * 0.54;
        s.targetCameraY = Math.max(0, desiredTopScreenY - topY);
        s.cameraY += (s.targetCameraY - s.cameraY) * 0.085;

        // 8. Screen Shake Decay
        if (s.screenShake > 0) {
          s.shakeOffset = {
            x: (Math.random() - 0.5) * s.screenShake,
            y: (Math.random() - 0.5) * s.screenShake,
          };
          s.screenShake *= 0.86;
          if (s.screenShake < 0.3) {
            s.screenShake = 0;
            s.shakeOffset = { x: 0, y: 0 };
          }
        }
      }

      // === RENDERING ===
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.save();
      ctx.translate(s.shakeOffset.x, s.shakeOffset.y);

      // Sky gradient progression based on building height
      const h = s.stats.height;
      const isNightMode = h >= 22;
      const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);

      if (s.stats.isFever) {
        bgGrad.addColorStop(0, '#1E1B4B');
        bgGrad.addColorStop(0.5, '#701A75');
        bgGrad.addColorStop(1, '#F59E0B');
      } else if (h < 12) {
        // Crisp morning sky
        bgGrad.addColorStop(0, '#BAE6FD');
        bgGrad.addColorStop(0.65, '#E0F2FE');
        bgGrad.addColorStop(1, '#FEF9C3');
      } else if (h < 22) {
        // Golden sunset
        bgGrad.addColorStop(0, '#FDBA74');
        bgGrad.addColorStop(0.55, '#FED7AA');
        bgGrad.addColorStop(1, '#FEF08A');
      } else if (h < 35) {
        // Twilight purple
        bgGrad.addColorStop(0, '#1E1B4B');
        bgGrad.addColorStop(0.6, '#4C1D95');
        bgGrad.addColorStop(1, '#F472B6');
      } else {
        // Starry deep night sky
        bgGrad.addColorStop(0, '#020617');
        bgGrad.addColorStop(0.6, '#0F172A');
        bgGrad.addColorStop(1, '#1E293B');
      }

      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Twinkling stars at dusk / night / fever
      if (isNightMode || s.stats.isFever) {
        for (const star of s.stars) {
          const alpha = 0.35 + 0.65 * Math.abs(Math.sin(star.twinklePhase));
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Soft drifting clouds
      if (!isNightMode) {
        for (const cloud of s.clouds) {
          ctx.save();
          ctx.translate(cloud.x, cloud.y);
          ctx.scale(cloud.scale, cloud.scale);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
          ctx.beginPath();
          ctx.arc(0, 0, 16, 0, Math.PI * 2);
          ctx.arc(16, -4, 20, 0, Math.PI * 2);
          ctx.arc(34, 0, 15, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // Slow-mo cool blue atmospheric vignette
      if (s.stats.activePowerUps.slowTimer > 0) {
        ctx.fillStyle = 'rgba(14, 165, 233, 0.12)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      }

      // Floor Altitude Ruler on left
      ctx.fillStyle = isNightMode || s.stats.isFever ? 'rgba(255, 255, 255, 0.45)' : 'rgba(51, 65, 85, 0.35)';
      ctx.strokeStyle = isNightMode || s.stats.isFever ? 'rgba(255, 255, 255, 0.25)' : 'rgba(51, 65, 85, 0.2)';
      ctx.font = '10px Outfit, sans-serif';
      const startFloor = Math.max(0, Math.floor((s.cameraY - 20) / 44));
      for (let f = startFloor; f <= startFloor + 16; f++) {
        const floorY = (CANVAS_HEIGHT - 120) - f * 44 + s.cameraY;
        if (floorY > 85 && floorY < CANVAS_HEIGHT - 60) {
          ctx.beginPath();
          ctx.moveTo(10, floorY);
          ctx.lineTo(f % 5 === 0 ? 24 : 16, floorY);
          ctx.stroke();
          if (f % 5 === 0 && f > 0) {
            ctx.fillText(`${f}F`, 28, floorY + 3);
          }
        }
      }

      // --- WORLD RENDERING ---
      ctx.save();
      ctx.translate(0, s.cameraY);

      for (let i = 0; i < s.blocks.length; i++) {
        const b = s.blocks[i];
        if (b.y + s.cameraY > -100 && b.y + s.cameraY < CANVAS_HEIGHT + 160) {
          drawBuildingBlock(ctx, b, CANVAS_WIDTH, s.stats.isFever, isNightMode);
        }
      }

      if (s.fallingBlock) {
        drawBuildingBlock(ctx, s.fallingBlock, CANVAS_WIDTH, s.stats.isFever, isNightMode);
      }

      for (let i = 0; i < s.debris.length; i++) {
        drawDebrisPiece(ctx, s.debris[i]);
      }

      // Particles
      for (let i = 0; i < s.particles.length; i++) {
        const pt = s.particles[i];
        ctx.save();
        ctx.translate(pt.x, pt.y);
        ctx.rotate(pt.rotation);
        ctx.globalAlpha = 1 - pt.life / pt.maxLife;
        ctx.fillStyle = pt.color;

        if (pt.shape === 'star') {
          ctx.beginPath();
          ctx.moveTo(0, -pt.size);
          ctx.lineTo(pt.size * 0.3, -pt.size * 0.3);
          ctx.lineTo(pt.size, 0);
          ctx.lineTo(pt.size * 0.3, pt.size * 0.3);
          ctx.lineTo(0, pt.size);
          ctx.lineTo(-pt.size * 0.3, pt.size * 0.3);
          ctx.lineTo(-pt.size, 0);
          ctx.lineTo(-pt.size * 0.3, -pt.size * 0.3);
          ctx.closePath();
          ctx.fill();
        } else if (pt.shape === 'crumb') {
          ctx.fillRect(-pt.size / 2, -pt.size / 2, pt.size, pt.size);
        } else {
          ctx.beginPath();
          ctx.moveTo(0, -pt.size * 1.3);
          ctx.lineTo(pt.size * 0.8, 0);
          ctx.lineTo(0, pt.size * 1.3);
          ctx.lineTo(-pt.size * 0.8, 0);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }

      // Floating texts
      for (let i = 0; i < s.floatingTexts.length; i++) {
        const ft = s.floatingTexts[i];
        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.opacity);
        ctx.font = 'bold 15px "M PLUS Rounded 1c", sans-serif';
        ctx.textAlign = 'center';

        ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
        ctx.fillText(ft.text, ft.x, ft.y + 1.5);
        ctx.fillStyle = ft.color;
        ctx.fillText(ft.text, ft.x, ft.y);

        if (ft.subText) {
          ctx.font = 'bold 11px "M PLUS Rounded 1c", sans-serif';
          ctx.fillStyle = isNightMode ? '#FDE68A' : '#B45309';
          ctx.fillText(ft.subText, ft.x, ft.y + 15);
        }
        ctx.restore();
      }

      ctx.restore(); // End world space

      // --- SCREEN SPACE: CONSTRUCTION CRANE & SWINGING FLOOR ---
      const p = s.pendulum;
      const craneAnchorX = p.anchorX;
      const craneAnchorY = p.anchorY;
      const bobX = craneAnchorX + Math.sin(p.angle) * p.length;
      const bobY = craneAnchorY + Math.cos(p.angle) * p.length;

      // Construction Steel Girder Beam at top
      ctx.fillStyle = '#F59E0B';
      drawRoundedRect(ctx, craneAnchorX - 58, 0, 116, 15, 3);
      ctx.fill();
      // Hazard diagonal stripes on beam
      ctx.fillStyle = '#1E293B';
      for (let sx = craneAnchorX - 48; sx < craneAnchorX + 48; sx += 16) {
        ctx.fillRect(sx, 2, 6, 11);
      }

      // Steel pulley wheel
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(craneAnchorX, craneAnchorY - 34, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = '#E2E8F0';
      ctx.beginPath();
      ctx.arc(craneAnchorX, craneAnchorY - 34, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Crane steel cable
      ctx.strokeStyle = s.stats.activePowerUps.slowTimer > 0 ? '#38BDF8' : '#334155';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(craneAnchorX, craneAnchorY - 23);
      ctx.lineTo(bobX, bobY);
      ctx.stroke();

      // Magnetic Alignment Laser Guides (when Magnet Power-Up is active!)
      if (s.stats.activePowerUps.magnetCharges > 0 && !s.fallingBlock && gameState === 'PLAYING') {
        const currentTop = s.blocks[s.blocks.length - 1];
        const w = currentTop ? currentTop.width : s.currentBlockWidth;
        const leftX = bobX - w / 2;
        const rightX = bobX + w / 2;
        const targetScreenY = currentTop ? currentTop.y + s.cameraY : CANVAS_HEIGHT - 120;

        ctx.save();
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.75)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(leftX, bobY + 42);
        ctx.lineTo(leftX, targetScreenY);
        ctx.moveTo(rightX, bobY + 42);
        ctx.lineTo(rightX, targetScreenY);
        ctx.stroke();

        // Highlight target zone on top block
        if (currentTop) {
          ctx.setLineDash([]);
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
          ctx.lineWidth = 2;
          ctx.strokeRect(currentTop.x - 1, targetScreenY - 1, currentTop.width + 2, 4);
        }
        ctx.restore();
      }

      // Crane spreader bar & steel hooks
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(bobX, bobY - 7, 4, 0, Math.PI * 2);
      ctx.stroke();

      const currentTop = s.blocks[s.blocks.length - 1];
      const blockWidth = currentTop ? currentTop.width : s.currentBlockWidth;
      s.currentBlockWidth = blockWidth;

      // Spreader beam wires
      if (!s.fallingBlock && gameState === 'PLAYING') {
        const hookSpan = Math.min(blockWidth * 0.42, 48);
        ctx.strokeStyle = '#64748B';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(bobX, bobY - 3);
        ctx.lineTo(bobX - hookSpan, bobY + 2);
        ctx.moveTo(bobX, bobY - 3);
        ctx.lineTo(bobX + hookSpan, bobY + 2);
        ctx.stroke();

        const nextB = s.nextBuilding;
        const previewBlock: Block = {
          id: 'swinging-preview',
          x: bobX - blockWidth / 2,
          y: bobY,
          width: blockWidth,
          height: nextB.height,
          buildingType: nextB.type,
          wallColor: nextB.wallColor,
          wallShadeColor: nextB.wallShadeColor,
          trimColor: nextB.trimColor,
          windowColor: nextB.windowColor,
          bonusItem: s.nextBonusItem,
        };

        // Strictly horizontal swinging floor
        drawBuildingBlock(ctx, previewBlock, CANVAS_WIDTH, s.stats.isFever, isNightMode);
      }

      ctx.restore();
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [gameState, isPaused, onGameOver, onUpdateStats, spawnParticles, addFloatingText]);

  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden cursor-pointer touch-none"
      onClick={handleDrop}
    >
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="w-full h-full max-w-[420px] max-h-[760px] object-contain shadow-inner"
        style={{ imageRendering: 'crisp-edges' }}
      />
    </div>
  );
});

GameCanvas.displayName = 'GameCanvas';

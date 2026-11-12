/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Block, DebrisPiece, FloatingText, GameState, GameStats, Particle, Pendulum } from './types.ts';
import { getRandomDessert, getDessertConfig } from './desserts.ts';
import { drawDessertBlock, drawDebrisPiece, drawRoundedRect } from './dessertRenderer.ts';
import { soundManager } from '../audio/soundManager.ts';
import confetti from 'canvas-confetti';

interface GameCanvasProps {
  gameState: GameState;
  onGameOver: (stats: GameStats) => void;
  onUpdateStats: (stats: GameStats) => void;
  isPaused: boolean;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  onGameOver,
  onUpdateStats,
  isPaused,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Core mutable game loop state kept in refs for 60fps performance
  const stateRef = useRef<{
    blocks: Block[];
    fallingBlock: Block | null;
    fallingVelocity: { vx: number; vy: number };
    debris: DebrisPiece[];
    particles: Particle[];
    floatingTexts: FloatingText[];
    pendulum: Pendulum;
    nextDessertType: ReturnType<typeof getRandomDessert>;
    currentBlockWidth: number;
    stats: GameStats;
    cameraY: number;
    targetCameraY: number;
    screenShake: number;
    shakeOffset: { x: number; y: number };
    isGameOverTriggered: boolean;
  }>({
    blocks: [],
    fallingBlock: null,
    fallingVelocity: { vx: 0, vy: 0 },
    debris: [],
    particles: [],
    floatingTexts: [],
    pendulum: {
      anchorX: 190,
      anchorY: 70,
      length: 130,
      angle: 0,
      maxAngle: 0.85,
      speed: 0.035,
      phase: 0,
    },
    nextDessertType: getRandomDessert(),
    currentBlockWidth: 180,
    stats: {
      score: 0,
      height: 0,
      perfectCount: 0,
      maxCombo: 0,
      currentCombo: 0,
      isFever: false,
      feverTimer: 0,
    },
    cameraY: 0,
    targetCameraY: 0,
    screenShake: 0,
    shakeOffset: { x: 0, y: 0 },
    isGameOverTriggered: false,
  });

  // Base canvas resolution
  const CANVAS_WIDTH = 380;
  const CANVAS_HEIGHT = 680;

  // Initialize a fresh game
  const initGame = useCallback(() => {
    const baseDessert = getDessertConfig('souffle_pancake');
    const firstBlock: Block = {
      id: 'base-0',
      x: (CANVAS_WIDTH - 180) / 2,
      y: CANVAS_HEIGHT - 90,
      width: 180,
      height: 42,
      dessertType: 'souffle_pancake',
      primaryColor: baseDessert.primaryColor,
      secondaryColor: baseDessert.secondaryColor,
      accentColor: baseDessert.accentColor,
      isBase: true,
    };

    stateRef.current = {
      blocks: [firstBlock],
      fallingBlock: null,
      fallingVelocity: { vx: 0, vy: 0 },
      debris: [],
      particles: [],
      floatingTexts: [],
      pendulum: {
        anchorX: CANVAS_WIDTH / 2,
        anchorY: 70,
        length: 125,
        angle: 0,
        maxAngle: 0.85,
        speed: 0.034,
        phase: 0,
      },
      nextDessertType: getRandomDessert('souffle_pancake'),
      currentBlockWidth: 180,
      stats: {
        score: 0,
        height: 0,
        perfectCount: 0,
        maxCombo: 0,
        currentCombo: 0,
        isFever: false,
        feverTimer: 0,
      },
      cameraY: 0,
      targetCameraY: 0,
      screenShake: 0,
      shakeOffset: { x: 0, y: 0 },
      isGameOverTriggered: false,
    };

    onUpdateStats(stateRef.current.stats);
  }, [onUpdateStats]);

  // Handle game state resets
  useEffect(() => {
    if (gameState === 'PLAYING') {
      initGame();
    }
  }, [gameState, initGame]);

  // Release block from pendulum
  const handleDrop = useCallback(() => {
    if (gameState !== 'PLAYING' || isPaused) return;
    const s = stateRef.current;
    if (s.fallingBlock !== null || s.isGameOverTriggered) return;

    // Calculate pendulum bob position in screen coords
    const { anchorX, anchorY, length, angle } = s.pendulum;
    const bobX = anchorX + Math.sin(angle) * length;
    const bobScreenY = anchorY + Math.cos(angle) * length;
    // World Y must be screen Y minus camera offset (Y_screen = Y_world + cameraY)
    const bobWorldY = bobScreenY - s.cameraY;

    // Ensure block width strictly matches the current top block of the tower
    const topBlock = s.blocks[s.blocks.length - 1];
    const blockWidth = topBlock ? topBlock.width : s.currentBlockWidth;
    s.currentBlockWidth = blockWidth;

    // Release current dessert block (strictly horizontal, matching tower width)
    const dessert = s.nextDessertType;
    const newBlock: Block = {
      id: `block-${s.blocks.length}`,
      x: bobX - blockWidth / 2,
      y: bobWorldY,
      width: blockWidth,
      height: dessert.height,
      dessertType: dessert.type,
      primaryColor: dessert.primaryColor,
      secondaryColor: dessert.secondaryColor,
      accentColor: dessert.accentColor,
    };

    s.fallingBlock = newBlock;

    // Tangential release momentum (slight natural physics, controllable)
    const swingVx = Math.cos(angle) * s.pendulum.maxAngle * s.pendulum.speed * length * 0.22;
    s.fallingVelocity = {
      vx: swingVx,
      vy: 2.2, // initial downward momentum
    };

    // Prepare next dessert for the pendulum
    s.nextDessertType = getRandomDessert(dessert.type);

    soundManager.playDropSwoosh();
  }, [gameState, isPaused]);

  // Particle spawn helpers
  const spawnParticles = (x: number, y: number, count: number, colors: string[], shape: Particle['shape'] = 'star') => {
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
  };

  const addFloatingText = (x: number, y: number, text: string, color: string = '#F59E0B', subText?: string) => {
    stateRef.current.floatingTexts.push({
      id: `ft-${Math.random()}`,
      x,
      y,
      text,
      subText,
      color,
      scale: 1.4,
      opacity: 1,
      vy: -1.6,
      life: 0,
    });
  };

  // Main game animation loop
  useEffect(() => {
    let animId: number;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      animId = requestAnimationFrame(render);
      const s = stateRef.current;

      // When paused, still draw the current frozen frame
      if (!isPaused && gameState === 'PLAYING') {
        // 1. Update Pendulum physics
        s.pendulum.phase += s.pendulum.speed;
        s.pendulum.angle = s.pendulum.maxAngle * Math.sin(s.pendulum.phase);

        // 2. Update Fever Timer
        if (s.stats.isFever) {
          s.stats.feverTimer -= 1;
          if (s.stats.feverTimer <= 0) {
            s.stats.isFever = false;
            addFloatingText(CANVAS_WIDTH / 2, s.blocks[s.blocks.length - 1].y - 20, 'Fever Ended', '#9CA3AF');
          }
        }

        // 3. Update Falling Block
        if (s.fallingBlock) {
          s.fallingVelocity.vy += 0.72; // Gravity
          s.fallingBlock.y += s.fallingVelocity.vy;
          s.fallingBlock.x += s.fallingVelocity.vx * 0.45;

          const topBlock = s.blocks[s.blocks.length - 1];
          const targetLandingY = topBlock.y - s.fallingBlock.height;

          // Check for collision with top of the tower
          if (s.fallingBlock.y >= targetLandingY) {
            const fb = s.fallingBlock;
            const diffX = fb.x - topBlock.x;
            const PERFECT_TOLERANCE = 3.5;

            // Overlap calculations
            const overlapLeft = Math.max(fb.x, topBlock.x);
            const overlapRight = Math.min(fb.x + fb.width, topBlock.x + topBlock.width);
            const overlapWidth = overlapRight - overlapLeft;

            if (overlapWidth <= 0 || overlapWidth < 6) {
              // === MISS & GAME OVER ===
              if (!s.isGameOverTriggered) {
                s.isGameOverTriggered = true;
                soundManager.playMiss();
                s.screenShake = 14;

                // Debris becomes whole falling block
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
                  dessertType: fb.dessertType,
                  primaryColor: fb.primaryColor,
                  secondaryColor: fb.secondaryColor,
                  accentColor: fb.accentColor,
                });

                s.fallingBlock = null;
                addFloatingText(CANVAS_WIDTH / 2, targetLandingY - 20, 'MISS!', '#EF4444', overlapWidth < 6 ? '太窄無法支撐！' : '甜點掉落了...');

                // Trigger game over after tumble animation
                setTimeout(() => {
                  onGameOver(s.stats);
                }, 900);
              }
            } else if (Math.abs(diffX) <= PERFECT_TOLERANCE) {
              // === PERFECT DROP ===
              // Snap strictly to the top block dimensions
              fb.x = topBlock.x;
              fb.y = targetLandingY;
              fb.width = topBlock.width;

              s.stats.perfectCount += 1;
              s.stats.currentCombo += 1;
              s.stats.maxCombo = Math.max(s.stats.maxCombo, s.stats.currentCombo);

              // Consecutive perfects widen the block symmetrically and slightly!
              let comboBonusText = '';
              if (s.stats.currentCombo >= 3 && fb.width < 180) {
                const expand = Math.min(6, 180 - fb.width);
                if (expand > 0) {
                  fb.width += expand;
                  fb.x -= expand / 2; // Symmetric expansion to keep tower centered
                  comboBonusText = `+${expand}px 甜點加寬！`;
                }
              }

              // The next swinging dessert strictly matches this newly placed block
              s.currentBlockWidth = fb.width;

              // Fever mode trigger
              if (s.stats.currentCombo >= 5 && !s.stats.isFever) {
                s.stats.isFever = true;
                s.stats.feverTimer = 360; // ~6 seconds
                soundManager.playFever();
                spawnParticles(CANVAS_WIDTH / 2, fb.y, 40, ['#F59E0B', '#EC4899', '#8B5CF6', '#10B981', '#3B82F6']);
                addFloatingText(CANVAS_WIDTH / 2, fb.y - 40, '🌈 FEVER MODE! 🌈', '#EC4899', '得分雙倍！');
              }

              const multiplier = s.stats.isFever ? 2 : 1;
              const points = (200 + s.stats.currentCombo * 50) * multiplier;
              s.stats.score += points;
              s.stats.height += 1;

              soundManager.playLand(true, s.stats.currentCombo);
              s.screenShake = 4;

              // Visual feedback
              spawnParticles(fb.x + fb.width / 2, fb.y, 24, ['#FCD34D', '#F472B6', '#34D399', '#60A5FA', '#FFFFFF'], 'sparkle');
              
              const comboRank = s.stats.currentCombo;
              let title = `PERFECT! +${points}`;
              if (comboRank === 2) title = `SWEET! +${points}`;
              else if (comboRank === 3) title = `DELICIOUS! +${points}`;
              else if (comboRank >= 4) title = `COMBO x${comboRank}! +${points}`;

              addFloatingText(fb.x + fb.width / 2, fb.y - 15, title, '#F59E0B', comboBonusText);

              // Add to tower
              s.blocks.push(fb);
              s.fallingBlock = null;

              // Accelerate pendulum slightly with height
              s.pendulum.speed = Math.min(0.065, 0.034 + s.stats.height * 0.001);

            } else {
              // === SLICE & OVERHANG FALL ===
              fb.y = targetLandingY;
              s.stats.currentCombo = 0; // Combo broken

              soundManager.playLand(false, 0);
              s.screenShake = 6;

              const points = 100 * (s.stats.isFever ? 2 : 1);
              s.stats.score += points;
              s.stats.height += 1;

              let debrisX = 0;
              let debrisW = 0;
              let debrisVx = 0;

              if (fb.x < topBlock.x) {
                // Left overhang
                debrisW = topBlock.x - fb.x;
                debrisX = fb.x;
                debrisVx = -2.5 - Math.random() * 1.5;

                fb.x = topBlock.x;
                fb.width = overlapWidth;
                fb.cutLeft = true;
              } else {
                // Right overhang
                debrisW = (fb.x + fb.width) - (topBlock.x + topBlock.width);
                debrisX = topBlock.x + topBlock.width;
                debrisVx = 2.5 + Math.random() * 1.5;

                // fb.x remains fb.x, right edge trimmed to overlapWidth
                fb.width = overlapWidth;
                fb.cutRight = true;
              }

              // Next swinging block strictly matches the new trimmed overlap width!
              s.currentBlockWidth = fb.width;

              // Create falling debris slice
              s.debris.push({
                id: `debris-${Math.random()}`,
                x: debrisX,
                y: targetLandingY,
                width: debrisW,
                height: fb.height,
                vx: debrisVx,
                vy: -1.8,
                rotation: 0,
                vRot: (debrisVx > 0 ? 0.08 : -0.08),
                alpha: 1,
                dessertType: fb.dessertType,
                primaryColor: fb.primaryColor,
                secondaryColor: fb.secondaryColor,
                accentColor: fb.accentColor,
              });

              // Slice crumbs
              spawnParticles(debrisX + debrisW / 2, targetLandingY + fb.height / 2, 14, [fb.primaryColor, fb.secondaryColor, '#D97706'], 'crumb');
              addFloatingText(fb.x + fb.width / 2, fb.y - 15, `+${points}`, '#78716C');

              // Add to tower
              s.blocks.push(fb);
              s.fallingBlock = null;

              s.pendulum.speed = Math.min(0.065, 0.034 + s.stats.height * 0.001);
            }

            // Sync stats to UI HUD
            onUpdateStats({ ...s.stats });
          }
        }

        // 4. Update Debris Pieces
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
          p.vy += 0.15; // particle gravity
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
          if (ft.life > 20) {
            ft.opacity -= 0.04;
          }
          if (ft.opacity <= 0) {
            s.floatingTexts.splice(i, 1);
          }
        }

        // 7. Update Camera Tracking
        // Keep the top of the tower comfortably in the lower half of screen
        const topY = s.blocks[s.blocks.length - 1].y;
        const desiredTopScreenY = CANVAS_HEIGHT * 0.52;
        s.targetCameraY = Math.max(0, desiredTopScreenY - topY);
        // Smooth lerp camera
        s.cameraY += (s.targetCameraY - s.cameraY) * 0.085;

        // 8. Screen Shake decay
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

      // === DRAWING CANVAS ===
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.save();
      ctx.translate(s.shakeOffset.x, s.shakeOffset.y);

      // Background Bakery Atmosphere (Gradually warms up as height ascends)
      const heightPercent = Math.min(1, s.stats.height / 35);
      const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      
      if (s.stats.isFever) {
        // Rainbow fever background
        bgGrad.addColorStop(0, '#FEF3C7');
        bgGrad.addColorStop(0.5, '#FCE7F3');
        bgGrad.addColorStop(1, '#EDE9FE');
      } else {
        // Morning cream -> Afternoon sakura -> Sunset honey
        bgGrad.addColorStop(0, '#FDFBF7');
        bgGrad.addColorStop(0.5, heightPercent > 0.5 ? '#FFF1F2' : '#FFFBEB');
        bgGrad.addColorStop(1, heightPercent > 0.5 ? '#FED7AA' : '#FEF3C7');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Subtle bakery shelf / wallpaper striping
      ctx.strokeStyle = 'rgba(180, 83, 9, 0.03)';
      ctx.lineWidth = 1;
      for (let y = 0; y < CANVAS_HEIGHT; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
      }

      // Height ruler / meter on left side
      ctx.fillStyle = 'rgba(120, 113, 108, 0.35)';
      ctx.font = '10px Outfit, sans-serif';
      const startFloor = Math.max(0, Math.floor((s.cameraY - 20) / 40));
      for (let f = startFloor; f <= startFloor + 18; f++) {
        const floorY = (CANVAS_HEIGHT - 90) - f * 40 + s.cameraY;
        if (floorY > 80 && floorY < CANVAS_HEIGHT - 10) {
          ctx.beginPath();
          ctx.moveTo(12, floorY);
          ctx.lineTo(f % 5 === 0 ? 28 : 20, floorY);
          ctx.stroke();
          if (f % 5 === 0 && f > 0) {
            ctx.fillText(`${f}F`, 32, floorY + 3);
          }
        }
      }

      // --- WORLD RENDERING (Subject to Camera Y) ---
      ctx.save();
      ctx.translate(0, s.cameraY);

      // Draw all stacked tower blocks
      for (let i = 0; i < s.blocks.length; i++) {
        const b = s.blocks[i];
        // Only draw visible blocks
        if (b.y + s.cameraY > -100 && b.y + s.cameraY < CANVAS_HEIGHT + 100) {
          drawDessertBlock(ctx, b, s.stats.isFever);
        }
      }

      // Draw currently falling block
      if (s.fallingBlock) {
        drawDessertBlock(ctx, s.fallingBlock, s.stats.isFever);
      }

      // Draw falling debris pieces
      for (let i = 0; i < s.debris.length; i++) {
        drawDebrisPiece(ctx, s.debris[i]);
      }

      // Draw particles
      for (let i = 0; i < s.particles.length; i++) {
        const p = s.particles[i];
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = 1 - p.life / p.maxLife;
        ctx.fillStyle = p.color;

        if (p.shape === 'star') {
          // 4-point star
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.lineTo(p.size * 0.3, -p.size * 0.3);
          ctx.lineTo(p.size, 0);
          ctx.lineTo(p.size * 0.3, p.size * 0.3);
          ctx.lineTo(0, p.size);
          ctx.lineTo(-p.size * 0.3, p.size * 0.3);
          ctx.lineTo(-p.size, 0);
          ctx.lineTo(-p.size * 0.3, -p.size * 0.3);
          ctx.closePath();
          ctx.fill();
        } else if (p.shape === 'crumb') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Sparkle diamond
          ctx.beginPath();
          ctx.moveTo(0, -p.size * 1.3);
          ctx.lineTo(p.size * 0.8, 0);
          ctx.lineTo(0, p.size * 1.3);
          ctx.lineTo(-p.size * 0.8, 0);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }

      // Draw floating score / combo texts
      for (let i = 0; i < s.floatingTexts.length; i++) {
        const ft = s.floatingTexts[i];
        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.opacity);
        ctx.font = 'bold 15px "M PLUS Rounded 1c", sans-serif';
        ctx.textAlign = 'center';

        // Text shadow
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillText(ft.text, ft.x, ft.y + 1);

        ctx.fillStyle = ft.color;
        ctx.fillText(ft.text, ft.x, ft.y);

        if (ft.subText) {
          ctx.font = 'bold 11px "M PLUS Rounded 1c", sans-serif';
          ctx.fillStyle = '#D97706';
          ctx.fillText(ft.subText, ft.x, ft.y + 14);
        }
        ctx.restore();
      }

      ctx.restore(); // End of camera-translated world

      // --- SCREEN-SPACE RENDERING (HUD & Pendulum Crane) ---

      // 1. Draw Pendulum Top Crane Mechanism
      const p = s.pendulum;
      const craneAnchorX = p.anchorX;
      const craneAnchorY = p.anchorY;

      // Decorative bakery wooden beam at top
      ctx.fillStyle = '#78350F';
      drawRoundedRect(ctx, craneAnchorX - 45, 0, 90, 16, 4);
      ctx.fill();

      // Golden brass pulley wheel
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(craneAnchorX, craneAnchorY - 35, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Brass center bolt
      ctx.fillStyle = '#78350F';
      ctx.beginPath();
      ctx.arc(craneAnchorX, craneAnchorY - 35, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Pendulum string / suspension cable
      const bobX = craneAnchorX + Math.sin(p.angle) * p.length;
      const bobY = craneAnchorY + Math.cos(p.angle) * p.length;

      ctx.strokeStyle = '#92400E';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(craneAnchorX, craneAnchorY - 24);
      ctx.lineTo(bobX, bobY);
      ctx.stroke();

      // Suspension ring and level clamp holding the horizontal dessert
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(bobX, bobY - 6, 4, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#B45309';
      drawRoundedRect(ctx, bobX - 10, bobY - 2, 20, 4, 2);
      ctx.fill();

      // 2. Draw Dessert suspended on Pendulum (strictly horizontal and size-matched)
      if (!s.fallingBlock && gameState === 'PLAYING') {
        const nextDessert = s.nextDessertType;
        const currentTop = s.blocks[s.blocks.length - 1];
        const blockWidth = currentTop ? currentTop.width : s.currentBlockWidth;
        s.currentBlockWidth = blockWidth;

        const previewBlock: Block = {
          id: 'swinging-preview',
          x: bobX - blockWidth / 2,
          y: bobY,
          width: blockWidth,
          height: nextDessert.height,
          dessertType: nextDessert.type,
          primaryColor: nextDessert.primaryColor,
          secondaryColor: nextDessert.secondaryColor,
          accentColor: nextDessert.accentColor,
        };

        // Draw preview block strictly horizontal (no tilt/rotation)
        drawDessertBlock(ctx, previewBlock, s.stats.isFever);
      }

      ctx.restore(); // Restore shake offset
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [gameState, isPaused, onGameOver, onUpdateStats]);

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
};

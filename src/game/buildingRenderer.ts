/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Block, DebrisPiece } from './types.ts';
import { POWERUP_INFO } from './buildings.ts';

/**
 * Utility to draw rounded rectangles with custom corner radius
 */
export function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number = 4,
  cutLeft: boolean = false,
  cutRight: boolean = false
) {
  const r = Math.min(radius, width / 2, height / 2);
  const tl = cutLeft ? 0 : r;
  const bl = cutLeft ? 0 : r;
  const tr = cutRight ? 0 : r;
  const br = cutRight ? 0 : r;

  ctx.beginPath();
  ctx.moveTo(x + tl, y);
  ctx.lineTo(x + width - tr, y);
  if (tr > 0) ctx.quadraticCurveTo(x + width, y, x + width, y + tr);
  else ctx.lineTo(x + width, y);

  ctx.lineTo(x + width, y + height - br);
  if (br > 0) ctx.quadraticCurveTo(x + width, y + height, x + width - br, y + height);
  else ctx.lineTo(x + width, y + height);

  ctx.lineTo(x + bl, y + height);
  if (bl > 0) ctx.quadraticCurveTo(x, y + height, x, y + height - bl);
  else ctx.lineTo(x, y + height);

  ctx.lineTo(x, y + tl);
  if (tl > 0) ctx.quadraticCurveTo(x, y, x + tl, y);
  else ctx.lineTo(x, y);

  ctx.closePath();
}

/**
 * Draw ground lawn, sidewalk, bushes, and stone house foundation
 */
export function drawGroundFoundation(ctx: CanvasRenderingContext2D, block: Block, canvasWidth: number) {
  const { x, y, width, height } = block;
  const groundTopY = y + height;

  ctx.save();

  // Grassy lawn strip across the bottom
  const grassGrad = ctx.createLinearGradient(0, groundTopY, 0, groundTopY + 140);
  grassGrad.addColorStop(0, '#84CC16');
  grassGrad.addColorStop(0.25, '#65A30D');
  grassGrad.addColorStop(1, '#3F6212');
  ctx.fillStyle = grassGrad;
  ctx.fillRect(-30, groundTopY + 10, canvasWidth + 60, 180);

  // Sidewalk / concrete curb
  ctx.fillStyle = '#E2E8F0';
  ctx.fillRect(-30, groundTopY + 2, canvasWidth + 60, 12);
  ctx.fillStyle = '#CBD5E1';
  ctx.fillRect(-30, groundTopY + 11, canvasWidth + 60, 3);

  // Cute bushes on left and right of the house
  const drawBush = (bx: number, by: number, scale: number) => {
    ctx.fillStyle = '#4D7C0F';
    ctx.beginPath();
    ctx.arc(bx, by, 14 * scale, 0, Math.PI * 2);
    ctx.arc(bx - 12 * scale, by + 4 * scale, 10 * scale, 0, Math.PI * 2);
    ctx.arc(bx + 12 * scale, by + 4 * scale, 11 * scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#65A30D';
    ctx.beginPath();
    ctx.arc(bx - 2 * scale, by - 2 * scale, 10 * scale, 0, Math.PI * 2);
    ctx.fill();
  };

  drawBush(x - 38, groundTopY - 2, 1.0);
  drawBush(x + width + 38, groundTopY - 1, 0.95);

  // Solid stone foundation slab under 1F
  const slabGrad = ctx.createLinearGradient(x, groundTopY - 6, x, groundTopY + 8);
  slabGrad.addColorStop(0, '#94A3B8');
  slabGrad.addColorStop(1, '#64748B');
  ctx.fillStyle = slabGrad;
  drawRoundedRect(ctx, x - 10, groundTopY - 2, width + 20, 10, 3);
  ctx.fill();
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Warm front door on ground floor (if it's wide enough)
  if (block.isBase && width >= 80) {
    const doorW = 24;
    const doorH = 30;
    const doorX = x + width / 2 - doorW / 2;
    const doorY = y + height - doorH;

    // Door frame
    ctx.fillStyle = '#FFFBEB';
    drawRoundedRect(ctx, doorX - 2, doorY - 2, doorW + 4, doorH + 2, 3);
    ctx.fill();

    // Wooden door
    ctx.fillStyle = '#78350F';
    drawRoundedRect(ctx, doorX, doorY, doorW, doorH, 2);
    ctx.fill();

    // Door window & brass knob
    ctx.fillStyle = '#FDE68A';
    ctx.fillRect(doorX + 5, doorY + 5, doorW - 10, 9);
    ctx.fillStyle = '#FBBF24';
    ctx.beginPath();
    ctx.arc(doorX + doorW - 5, doorY + 18, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Render an individual house / building floor block
 */
export function drawBuildingBlock(
  ctx: CanvasRenderingContext2D,
  block: Block,
  canvasWidth: number,
  isFever: boolean = false,
  isNightMode: boolean = false,
  alpha: number = 1
) {
  const { x, y, width, height, wallColor, wallShadeColor, trimColor, cutLeft, cutRight } = block;

  ctx.save();
  ctx.globalAlpha = alpha;

  // Main exterior wall gradient
  const grad = ctx.createLinearGradient(x, y, x + width, y);
  grad.addColorStop(0, wallColor);
  grad.addColorStop(0.82, wallColor);
  grad.addColorStop(1, wallShadeColor);

  ctx.fillStyle = grad;
  drawRoundedRect(ctx, x, y, width, height, 3, cutLeft, cutRight);
  ctx.fill();

  // Roofline / concrete floor slab molding along the top
  ctx.fillStyle = trimColor;
  ctx.fillRect(x, y, width, 4);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.12)';
  ctx.fillRect(x, y + 4, width, 2);

  // Bottom slab ledge
  ctx.fillStyle = 'rgba(15, 23, 42, 0.14)';
  ctx.fillRect(x, y + height - 3, width, 3);

  // Architectural wall details & windows
  drawBuildingDetails(ctx, block, isNightMode);

  // Draw ground foundation & front door for the base floor
  if (block.isBase) {
    drawGroundFoundation(ctx, block, canvasWidth);
  }

  // Sliced concrete/rebar cross-section when trimmed
  if (cutLeft) {
    drawCutCrossSection(ctx, x, y, 5, height, wallShadeColor);
  }
  if (cutRight) {
    drawCutCrossSection(ctx, x + width - 5, y, 5, height, wallShadeColor);
  }

  // Crisp structural outline
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.22)';
  ctx.lineWidth = 1;
  drawRoundedRect(ctx, x, y, width, height, 3, cutLeft, cutRight);
  ctx.stroke();

  // Fever golden architectural aura
  if (isFever && !block.isBase) {
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.85)';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#F59E0B';
    ctx.shadowBlur = 10;
    drawRoundedRect(ctx, x - 1, y - 1, width + 2, height + 2, 4, cutLeft, cutRight);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // Bonus Power-Up Badge on special swinging/falling floors
  if (block.bonusItem && width >= 24) {
    const info = POWERUP_INFO[block.bonusItem];
    const cx = x + width / 2;
    const cy = y + height / 2;

    // Glowing aura circle
    ctx.save();
    ctx.fillStyle = info.color;
    ctx.shadowColor = info.color;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(cx, cy, 13, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.font = '13px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(info.emoji, cx, cy + 1);
    ctx.restore();
  }

  ctx.restore();
}

/**
 * Draw style-specific windows, balconies, awnings, and textures
 */
function drawBuildingDetails(ctx: CanvasRenderingContext2D, block: Block, isNightMode: boolean) {
  const { x, y, width, height, buildingType, trimColor, windowColor, isBase } = block;

  // Texture lines per building style
  if (buildingType === 'brick_apt') {
    ctx.fillStyle = 'rgba(124, 45, 18, 0.14)';
    for (let row = 0; row < 3; row++) {
      const ly = y + 12 + row * 10;
      for (let lx = x + 6 + (row % 2) * 8; lx < x + width - 10; lx += 16) {
        ctx.fillRect(lx, ly, 8, 3);
      }
    }
  } else if (buildingType === 'nordic_wood' || buildingType === 'japanese_machiya') {
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;
    for (let ly = y + 10; ly < y + height - 4; ly += 8) {
      ctx.beginPath();
      ctx.moveTo(x + 1, ly);
      ctx.lineTo(x + width - 1, ly);
      ctx.stroke();
    }
  } else if (buildingType === 'modern_glass') {
    // Diagonal glass reflection
    ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.beginPath();
    ctx.moveTo(x + width * 0.15, y + 6);
    ctx.lineTo(x + width * 0.35, y + 6);
    ctx.lineTo(x + width * 0.2, y + height - 3);
    ctx.lineTo(x + width * 0.05, y + height - 3);
    ctx.closePath();
    ctx.fill();
  }

  // Windows layout (skip center if base floor has front door)
  const winW = buildingType === 'modern_glass' ? 22 : 16;
  const winH = 18;
  const minMargin = 10;
  const usableWidth = width - minMargin * 2;
  if (usableWidth < winW) return;

  const spacing = buildingType === 'modern_glass' ? 28 : 32;
  const count = Math.max(1, Math.floor((usableWidth + (spacing - winW)) / spacing));
  const totalWinSpan = count * winW + (count - 1) * (spacing - winW);
  const startX = x + (width - totalWinSpan) / 2;
  const winY = y + 12;

  for (let i = 0; i < count; i++) {
    const wx = startX + i * spacing;
    // Skip center window on base floor where the front door sits
    if (isBase && Math.abs((wx + winW / 2) - (x + width / 2)) < 20) {
      continue;
    }

    // Window frame
    ctx.fillStyle = trimColor;
    drawRoundedRect(ctx, wx - 2, winY - 2, winW + 4, winH + 4, 2);
    ctx.fill();

    // Glass pane (lit warmly at dusk/night, crisp sky reflection during day)
    const lit = isNightMode || buildingType === 'japanese_machiya' || buildingType === 'cafe_bistro';
    if (lit) {
      const winGrad = ctx.createLinearGradient(wx, winY, wx, winY + winH);
      winGrad.addColorStop(0, '#FEF08A');
      winGrad.addColorStop(1, '#F59E0B');
      ctx.fillStyle = winGrad;
    } else {
      const winGrad = ctx.createLinearGradient(wx, winY, wx + winW, winY + winH);
      winGrad.addColorStop(0, '#FFFFFF');
      winGrad.addColorStop(0.35, windowColor);
      winGrad.addColorStop(1, '#38BDF8');
      ctx.fillStyle = winGrad;
    }
    ctx.fillRect(wx, winY, winW, winH);

    // Window mullions / cross bars
    ctx.strokeStyle = trimColor;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(wx + winW / 2, winY);
    ctx.lineTo(wx + winW / 2, winY + winH);
    if (buildingType !== 'modern_glass') {
      ctx.moveTo(wx, winY + winH / 2);
      ctx.lineTo(wx + winW, winY + winH / 2);
    }
    ctx.stroke();

    // Cafe striped awning or brick flower planter
    if (buildingType === 'cafe_bistro') {
      ctx.fillStyle = i % 2 === 0 ? '#EF4444' : '#DC2626';
      ctx.fillRect(wx - 3, winY - 4, winW + 6, 5);
    } else if (buildingType === 'brick_apt' || buildingType === 'pastel_townhouse') {
      // Cute flower box sill
      ctx.fillStyle = '#78350F';
      ctx.fillRect(wx - 2, winY + winH + 1, winW + 4, 4);
      ctx.fillStyle = '#16A34A';
      ctx.fillRect(wx, winY + winH - 1, winW, 2.5);
      ctx.fillStyle = '#F43F5E';
      ctx.beginPath();
      ctx.arc(wx + 4, winY + winH - 1, 1.5, 0, Math.PI * 2);
      ctx.arc(wx + winW - 4, winY + winH - 1, 1.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (buildingType === 'retro_shophouse' || buildingType === 'penthouse_loft') {
      // Balcony rail
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(wx - 2, winY + winH - 5, winW + 4, 6);
    }
  }
}

/**
 * Draw concrete / brick rough edge when sliced
 */
function drawCutCrossSection(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  shadeColor: string
) {
  ctx.fillStyle = shadeColor;
  ctx.fillRect(x, y + 4, width, height - 7);

  // Exposed structural flecks
  ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
  for (let py = y + 8; py < y + height - 6; py += 7) {
    ctx.fillRect(x + 1, py, 2.5, 2.5);
  }
}

/**
 * Render sliced falling building debris with rotation
 */
export function drawDebrisPiece(ctx: CanvasRenderingContext2D, debris: DebrisPiece) {
  const { x, y, width, height, rotation, alpha, wallColor, wallShadeColor, trimColor } = debris;

  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
  ctx.translate(x + width / 2, y + height / 2);
  ctx.rotate(rotation);

  const grad = ctx.createLinearGradient(-width / 2, -height / 2, width / 2, height / 2);
  grad.addColorStop(0, wallColor);
  grad.addColorStop(1, wallShadeColor);

  ctx.fillStyle = grad;
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.22)';
  ctx.lineWidth = 1;
  drawRoundedRect(ctx, -width / 2, -height / 2, width, height, 2);
  ctx.fill();
  ctx.stroke();

  // Top slab trim
  ctx.fillStyle = trimColor;
  ctx.fillRect(-width / 2, -height / 2, width, 4);

  ctx.restore();
}

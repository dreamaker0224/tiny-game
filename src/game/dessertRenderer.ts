/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Block, DebrisPiece } from './types.ts';

/**
 * Utility to draw rounded rectangles with custom corner radius
 */
export function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number = 8,
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
 * Draw base plate / cake stand at the very bottom
 */
export function drawPlateBase(ctx: CanvasRenderingContext2D, block: Block) {
  const { x, y, width, height } = block;

  // Shadow under plate
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
  ctx.beginPath();
  ctx.ellipse(x + width / 2, y + height + 6, width / 2 + 16, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Ceramic plate
  const plateGrad = ctx.createLinearGradient(x, y, x, y + height);
  plateGrad.addColorStop(0, '#FFFFFF');
  plateGrad.addColorStop(0.7, '#F3F4F6');
  plateGrad.addColorStop(1, '#E5E7EB');

  ctx.fillStyle = plateGrad;
  ctx.strokeStyle = '#D1D5DB';
  ctx.lineWidth = 1.5;
  drawRoundedRect(ctx, x - 12, y + height - 14, width + 24, 14, 6);
  ctx.fill();
  ctx.stroke();

  // Gold rim accent on plate
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x - 8, y + height - 11);
  ctx.lineTo(x + width + 8, y + height - 11);
  ctx.stroke();

  // Plate pedestal
  ctx.fillStyle = '#E5E7EB';
  drawRoundedRect(ctx, x + width / 2 - 24, y + height, 48, 10, 4);
  ctx.fill();

  ctx.restore();
}

/**
 * Render an individual dessert block
 */
export function drawDessertBlock(
  ctx: CanvasRenderingContext2D,
  block: Block,
  isFever: boolean = false,
  alpha: number = 1
) {
  const { x, y, width, height, dessertType, primaryColor, secondaryColor, accentColor, cutLeft, cutRight } = block;

  ctx.save();
  ctx.globalAlpha = alpha;

  // If this is the starting ground base
  if (block.isBase) {
    drawPlateBase(ctx, block);
  }

  // Soft drop shadow below the dessert
  ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
  ctx.fillRect(x + 2, y + height - 3, width - 4, 6);

  // Main block background gradient
  const grad = ctx.createLinearGradient(x, y, x, y + height);
  grad.addColorStop(0, primaryColor);
  grad.addColorStop(1, secondaryColor);

  ctx.fillStyle = grad;
  drawRoundedRect(ctx, x, y, width, height, 7, cutLeft, cutRight);
  ctx.fill();

  // Highlight along top edge
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.beginPath();
  drawRoundedRect(ctx, x + (cutLeft ? 0 : 2), y + 1, width - (cutLeft ? 0 : 2) - (cutRight ? 0 : 2), 4, 3, cutLeft, cutRight);
  ctx.fill();

  // Draw dessert-specific delicious details
  drawDessertDetails(ctx, block);

  // Sliced edge cross-sections (sponge texture if cut)
  if (cutLeft) {
    drawSpongeTexture(ctx, x, y, 6, height, primaryColor, secondaryColor);
  }
  if (cutRight) {
    drawSpongeTexture(ctx, x + width - 6, y, 6, height, primaryColor, secondaryColor);
  }

  // Subtle border
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
  ctx.lineWidth = 1;
  drawRoundedRect(ctx, x, y, width, height, 7, cutLeft, cutRight);
  ctx.stroke();

  // Fever Mode aura
  if (isFever && !block.isBase) {
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.7)';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#F59E0B';
    ctx.shadowBlur = 8;
    drawRoundedRect(ctx, x - 1, y - 1, width + 2, height + 2, 8, cutLeft, cutRight);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Dessert-specific toppings, glazes, and layers
 */
function drawDessertDetails(ctx: CanvasRenderingContext2D, block: Block) {
  const { x, y, width, height, dessertType, accentColor, secondaryColor, cutLeft, cutRight } = block;

  switch (dessertType) {
    case 'souffle_pancake': {
      // Golden butter cube on top center
      if (width > 24 && !cutLeft && !cutRight) {
        const bx = x + width / 2 - 8;
        const by = y - 6;
        ctx.fillStyle = accentColor;
        drawRoundedRect(ctx, bx, by, 16, 10, 2);
        ctx.fill();
        ctx.strokeStyle = '#D97706';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
      // Dripping syrup
      ctx.fillStyle = '#B45309';
      ctx.beginPath();
      const dripX = x + width * 0.3;
      if (dripX > x && dripX < x + width) {
        ctx.arc(dripX, y + 10, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'strawberry_shortcake': {
      // Strawberry cream middle line
      ctx.fillStyle = secondaryColor;
      ctx.fillRect(x, y + height * 0.45, width, 5);

      // Cute fresh strawberry in the center or spaced out
      if (width > 26) {
        const count = Math.min(3, Math.max(1, Math.floor(width / 45)));
        const step = width / (count + 1);
        for (let i = 1; i <= count; i++) {
          const sx = x + step * i;
          const sy = y - 5;
          // Red strawberry
          ctx.fillStyle = '#EF4444';
          ctx.beginPath();
          ctx.moveTo(sx, sy + 8);
          ctx.quadraticCurveTo(sx - 6, sy + 3, sx - 4, sy - 2);
          ctx.quadraticCurveTo(sx, sy - 5, sx + 4, sy - 2);
          ctx.quadraticCurveTo(sx + 6, sy + 3, sx, sy + 8);
          ctx.fill();

          // Green leaf crown
          ctx.fillStyle = '#10B981';
          ctx.beginPath();
          ctx.ellipse(sx - 2, sy - 4, 3, 1.5, -0.4, 0, Math.PI * 2);
          ctx.ellipse(sx + 2, sy - 4, 3, 1.5, 0.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    }

    case 'matcha_roll': {
      // Swirled cream center
      ctx.fillStyle = '#FEF3C7';
      ctx.beginPath();
      ctx.ellipse(x + width / 2, y + height / 2, Math.min(18, width * 0.25), height * 0.28, 0, 0, Math.PI * 2);
      ctx.fill();

      // Red azuki bean on top
      ctx.fillStyle = '#78350F';
      ctx.beginPath();
      ctx.ellipse(x + width / 2, y + height / 2, 4, 2.8, 0.3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'caramel_pudding': {
      // Caramel layer on top
      ctx.fillStyle = accentColor;
      drawRoundedRect(ctx, x, y, width, 9, 4, cutLeft, cutRight);
      ctx.fill();

      // Caramel drips
      ctx.beginPath();
      ctx.arc(x + width * 0.25, y + 11, 2.5, 0, Math.PI * 2);
      ctx.arc(x + width * 0.75, y + 12, 3, 0, Math.PI * 2);
      ctx.fill();

      // Cherry on top center
      if (width > 24) {
        ctx.fillStyle = '#DC2626';
        ctx.beginPath();
        ctx.arc(x + width / 2, y - 4, 5, 0, Math.PI * 2);
        ctx.fill();
        // stem
        ctx.strokeStyle = '#4B5563';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x + width / 2, y - 8);
        ctx.quadraticCurveTo(x + width / 2 + 6, y - 14, x + width / 2 + 10, y - 10);
        ctx.stroke();
      }
      break;
    }

    case 'french_macaron': {
      // Macaron cream layer in middle
      ctx.fillStyle = '#FEF2F2';
      ctx.fillRect(x + 2, y + height * 0.4, width - 4, 6);

      // Macaron skirt texture
      ctx.fillStyle = secondaryColor;
      for (let mx = x + 3; mx < x + width - 3; mx += 6) {
        ctx.beginPath();
        ctx.arc(mx, y + height * 0.38, 1.5, 0, Math.PI * 2);
        ctx.arc(mx + 2, y + height * 0.62, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'honey_toast': {
      // Crust border
      ctx.strokeStyle = '#92400E';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 1, y + 1, width - 2, height - 2);

      // Honey drizzle diagonals
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(x + 6, y + 6);
      ctx.lineTo(x + width - 8, y + height - 8);
      ctx.moveTo(x + 16, y + 4);
      ctx.lineTo(x + width - 4, y + height - 16);
      ctx.stroke();
      break;
    }

    case 'chocolate_brownie': {
      // Cocoa cracks & walnut dots
      ctx.fillStyle = '#381A0D';
      ctx.fillRect(x, y + 4, width, 3);

      ctx.fillStyle = accentColor;
      for (let wx = x + 10; wx < x + width - 8; wx += 24) {
        ctx.beginPath();
        ctx.arc(wx, y + height * 0.5, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'custard_tart': {
      // Golden fluted base crust
      ctx.fillStyle = secondaryColor;
      ctx.fillRect(x, y + height - 8, width, 8);

      // Fruit slices / mint leaf
      ctx.fillStyle = '#10B981';
      ctx.beginPath();
      ctx.ellipse(x + width / 2, y - 3, 5, 2.5, -0.4, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'berry_cheesecake': {
      // Graham cracker crust base
      ctx.fillStyle = '#B45309';
      ctx.fillRect(x, y + height - 7, width, 7);

      // Blueberry jam topping
      ctx.fillStyle = '#5B21B6';
      drawRoundedRect(ctx, x, y, width, 6, 3, cutLeft, cutRight);
      ctx.fill();

      // Whole blueberries
      ctx.fillStyle = '#312E81';
      if (width > 20) {
        ctx.beginPath();
        ctx.arc(x + width / 2 - 5, y - 1, 3.5, 0, Math.PI * 2);
        ctx.arc(x + width / 2 + 5, y - 1, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'rainbow_donut': {
      // Colorful sprinkles
      const colors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#FFFFFF'];
      for (let sx = x + 6; sx < x + width - 6; sx += 14) {
        ctx.fillStyle = colors[Math.floor(sx % colors.length)];
        ctx.save();
        ctx.translate(sx, y + 10);
        ctx.rotate((sx * 37) % 3);
        ctx.fillRect(-3, -1, 6, 2.2);
        ctx.restore();
      }
      break;
    }
  }
}

/**
 * Draw cake sponge porous cross-section when block is sliced
 */
function drawSpongeTexture(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  primaryColor: string,
  secondaryColor: string
) {
  ctx.fillStyle = secondaryColor;
  ctx.fillRect(x, y, width, height);

  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  for (let py = y + 4; py < y + height - 3; py += 6) {
    ctx.beginPath();
    ctx.arc(x + width / 2, py, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Render cut debris falling with physics and spin
 */
export function drawDebrisPiece(ctx: CanvasRenderingContext2D, debris: DebrisPiece) {
  const { x, y, width, height, rotation, alpha, dessertType, primaryColor, secondaryColor, accentColor } = debris;

  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
  ctx.translate(x + width / 2, y + height / 2);
  ctx.rotate(rotation);

  // Debris block
  const grad = ctx.createLinearGradient(-width / 2, -height / 2, -width / 2, height / 2);
  grad.addColorStop(0, primaryColor);
  grad.addColorStop(1, secondaryColor);

  ctx.fillStyle = grad;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
  ctx.lineWidth = 1;
  drawRoundedRect(ctx, -width / 2, -height / 2, width, height, 4);
  ctx.fill();
  ctx.stroke();

  // Crumb dots on falling debris
  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.arc(-width / 4, 0, 1.5, 0, Math.PI * 2);
  ctx.arc(width / 4, 0, 1.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

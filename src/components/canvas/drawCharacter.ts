import { rotateAround } from './animationHelpers';

export type CharAnim = 'idle' | 'walking' | 'digging' | 'planting' | 'watering' | 'tending' | 'celebrating' | 'crying';

const SKIN    = '#F5C89A';
const HAIR    = '#2A1A0A';
const SHIRT   = '#4A8C5C';
const PANTS   = '#3A5C8A';
const SHOES   = '#2A1A0A';
const TOOL    = '#B0BEC5';
const WOOD    = '#A1887F';
const CAN_TIN = '#78909C';
const SAD     = '#8090A8';

// Draw character with feet at (cx, cy)
export function drawCharacter(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  anim: CharAnim,
  t: number,           // seconds into current anim state
  facingRight = true,
) {
  ctx.save();
  if (!facingRight) {
    ctx.scale(-1, 1);
    cx = -cx;
  }

  const isSad = anim === 'crying';
  const skin  = isSad ? SAD : SKIN;
  const shirt = isSad ? '#5A6878' : SHIRT;
  const pants = isSad ? '#2A3848' : PANTS;

  // Derived animation params
  let legSwingL = 0, legSwingR = 0;
  let armSwingL = 0, armSwingR = 0;
  let bodyBob   = 0;
  let jumpY     = 0;
  let headTilt  = 0;

  switch (anim) {
    case 'walking': {
      const cycle = Math.sin(t * 9);
      legSwingL =  cycle * 7;
      legSwingR = -cycle * 7;
      armSwingL = -cycle * 5;
      armSwingR =  cycle * 5;
      bodyBob   = Math.abs(cycle) * -1.5;
      break;
    }
    case 'digging': {
      const cycle = Math.sin(t * 6);
      armSwingR = -Math.PI / 4 + cycle * (Math.PI / 4);
      armSwingL = -Math.PI / 8 + cycle * (Math.PI / 8);
      bodyBob   = cycle * -2;
      headTilt  = cycle * 0.1;
      break;
    }
    case 'planting': {
      bodyBob   = Math.sin(t * 3) * -3 - 6; // crouching
      armSwingR = Math.PI / 3;
      armSwingL = Math.PI / 4;
      break;
    }
    case 'watering': {
      armSwingR = Math.PI / 5;
      bodyBob   = Math.sin(t * 1.5) * -1.5;
      armSwingL = Math.sin(t * 1.5) * 0.08;
      break;
    }
    case 'tending': {
      bodyBob = Math.sin(t * 1.2) * -1.5;
      armSwingL = Math.sin(t * 1.2) * 0.15;
      armSwingR = -Math.sin(t * 1.2) * 0.15;
      break;
    }
    case 'celebrating': {
      jumpY     = Math.abs(Math.sin(t * 7)) * 18;
      armSwingL = -(Math.PI / 2 + Math.sin(t * 7) * 0.3);
      armSwingR = -(Math.PI / 2 + Math.sin(t * 7) * 0.3);
      bodyBob   = -jumpY * 0.15;
      headTilt  = Math.sin(t * 7) * 0.1;
      break;
    }
    case 'crying': {
      const slump = Math.min(t * 6, 10);
      bodyBob   = slump;
      headTilt  = 0.3;
      armSwingL = Math.PI / 6;
      armSwingR = -Math.PI / 6;
      break;
    }
    case 'idle':
    default: {
      bodyBob   = Math.sin(t * 1.5) * -1;
      armSwingL = Math.sin(t * 1.5) * 0.06;
      armSwingR = -Math.sin(t * 1.5) * 0.06;
      break;
    }
  }

  const by = cy - jumpY + bodyBob;

  // --- Legs ---
  ctx.fillStyle = pants;
  ctx.fillRect(cx - 9, by - 15 - legSwingL, 5, 15);
  ctx.fillRect(cx + 4, by - 15 - legSwingR, 5, 15);

  // --- Shoes ---
  ctx.fillStyle = SHOES;
  ctx.fillRect(cx - 11, by - 3 - legSwingL, 8, 4);
  ctx.fillRect(cx + 3,  by - 3 - legSwingR, 8, 4);

  // --- Body ---
  ctx.fillStyle = shirt;
  ctx.fillRect(cx - 9, by - 34, 18, 20);

  // --- Left arm ---
  rotateAround(ctx, cx - 9, by - 31, armSwingL, () => {
    ctx.fillStyle = shirt;
    ctx.fillRect(cx - 15, by - 31, 6, 13);
    ctx.fillStyle = skin;
    ctx.fillRect(cx - 15, by - 18, 6, 5);
  });

  // --- Right arm (may hold tool) ---
  rotateAround(ctx, cx + 9, by - 31, armSwingR, () => {
    ctx.fillStyle = shirt;
    ctx.fillRect(cx + 9, by - 31, 6, 13);
    ctx.fillStyle = skin;
    ctx.fillRect(cx + 9, by - 18, 6, 5);

    if (anim === 'digging') {
      // Shovel
      ctx.fillStyle = WOOD;
      ctx.fillRect(cx + 11, by - 13, 3, 18);
      ctx.fillStyle = TOOL;
      ctx.fillRect(cx + 8, by + 4, 10, 6);
    }
    if (anim === 'watering') {
      // Watering can
      ctx.fillStyle = CAN_TIN;
      ctx.fillRect(cx + 9, by - 22, 14, 10);
      // Spout
      ctx.fillRect(cx + 22, by - 20, 6, 2);
      // Water drops
      for (let i = 0; i < 3; i++) {
        const wt = (t * 5 + i * 0.8) % 1;
        ctx.fillStyle = `rgba(100,180,255,${1 - wt})`;
        ctx.beginPath();
        ctx.arc(cx + 29 + i * 2, by - 19 + wt * 12, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });

  // --- Head ---
  ctx.save();
  ctx.translate(cx, by - 42 + headTilt * 3);
  ctx.rotate(headTilt);
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.arc(0, 0, 9, 0, Math.PI * 2);
  ctx.fill();

  // Hair
  ctx.fillStyle = HAIR;
  ctx.fillRect(-9, -11, 18, 7);
  ctx.beginPath();
  ctx.arc(0, -6, 9, Math.PI, 0);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#1A0A00';
  if (anim === 'crying') {
    ctx.fillRect(-4, -2, 3, 2);
    ctx.fillRect(2,  -2, 3, 2);
    // Tears
    const tearY = (t * 18) % 12;
    ctx.fillStyle = 'rgba(100,160,220,0.8)';
    ctx.beginPath(); ctx.arc(-3, 1 + tearY, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(3,  1 + tearY, 1.5, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.fillRect(-4, -3, 3, 3);
    ctx.fillRect(2,  -3, 3, 3);
  }

  // Mouth
  ctx.strokeStyle = '#1A0A00';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  if (anim === 'celebrating') {
    ctx.arc(0, 1, 4, 0, Math.PI);
  } else if (anim === 'crying') {
    ctx.arc(0, 5, 3, Math.PI, 0);
  } else {
    ctx.arc(0, 2, 3, 0.1, Math.PI - 0.1);
  }
  ctx.stroke();

  ctx.restore();

  // Planting: show seed in right hand
  if (anim === 'planting') {
    ctx.fillStyle = '#5A3A10';
    ctx.beginPath();
    ctx.arc(cx + 12, by - 14, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

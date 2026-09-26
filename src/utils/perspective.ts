import { Point, QuadPoints, ShadowConfig } from '../types';

/**
 * Bilinear interpolation for 4-point quadrilateral.
 * u and v are normalized coordinates in [0, 1].
 */
export function bilinearQuadInterpolate(quad: QuadPoints, u: number, v: number): Point {
  const topX = quad.topLeft.x + (quad.topRight.x - quad.topLeft.x) * u;
  const topY = quad.topLeft.y + (quad.topRight.y - quad.topLeft.y) * u;

  const botX = quad.bottomLeft.x + (quad.bottomRight.x - quad.bottomLeft.x) * u;
  const botY = quad.bottomLeft.y + (quad.bottomRight.y - quad.bottomLeft.y) * u;

  return {
    x: topX + (botX - topX) * v,
    y: topY + (botY - topY) * v,
  };
}

/**
 * Draws an affine-transformed triangle from source image to destination triangle.
 */
function drawTriangle(
  ctx: CanvasRenderingContext2D,
  img: HTMLCanvasElement | HTMLImageElement,
  x0: number, y0: number,
  x1: number, y1: number,
  x2: number, y2: number,
  u0: number, v0: number,
  u1: number, v1: number,
  u2: number, v2: number
) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.closePath();
  ctx.clip();

  // Compute affine transform matrix mapping (u, v) to (x, y)
  const delta = u0 * (v1 - v2) - v0 * (u1 - u2) + (u1 * v2 - u2 * v1);
  if (Math.abs(delta) < 0.00001) {
    ctx.restore();
    return;
  }

  const deltaA = x0 * (v1 - v2) - v0 * (x1 - x2) + (x1 * v2 - x2 * v1);
  const deltaB = u0 * (x1 - x2) - x0 * (u1 - u2) + (u1 * x2 - u2 * x1);
  const deltaC = x0 * (u1 * v2 - u2 * v1) - u0 * (x1 * v2 - x2 * v1) + v0 * (x1 * u2 - x2 * u1);

  const deltaD = y0 * (v1 - v2) - v0 * (y1 - y2) + (y1 * v2 - y2 * v1);
  const deltaE = u0 * (y1 - y2) - y0 * (u1 - u2) + (u1 * y2 - u2 * y1);
  const deltaF = y0 * (u1 * v2 - u2 * v1) - u0 * (y1 * v2 - y2 * v1) + v0 * (y1 * u2 - y2 * u1);

  ctx.transform(
    deltaA / delta, deltaD / delta,
    deltaB / delta, deltaE / delta,
    deltaC / delta, deltaF / delta
  );

  ctx.drawImage(img, 0, 0);
  ctx.restore();
}

/**
 * Draws the carpet image mapped onto arbitrary 4-point quad with high fidelity.
 * Preserves original colors, fine weaving details, ornaments, and fringes without distortion.
 */
export function drawPerspectiveCarpet(
  ctx: CanvasRenderingContext2D,
  img: HTMLCanvasElement | HTMLImageElement,
  quad: QuadPoints,
  gridSubdivisions: number = 20
) {
  const w = img.width;
  const h = img.height;
  const steps = gridSubdivisions;

  for (let i = 0; i < steps; i++) {
    const v0 = i / steps;
    const v1 = (i + 1) / steps;
    const srcY0 = v0 * h;
    const srcY1 = v1 * h;

    for (let j = 0; j < steps; j++) {
      const u0 = j / steps;
      const u1 = (j + 1) / steps;
      const srcX0 = u0 * w;
      const srcX1 = u1 * w;

      const p00 = bilinearQuadInterpolate(quad, u0, v0);
      const p10 = bilinearQuadInterpolate(quad, u1, v0);
      const p11 = bilinearQuadInterpolate(quad, u1, v1);
      const p01 = bilinearQuadInterpolate(quad, u0, v1);

      // Triangle 1: (p00, p10, p01)
      drawTriangle(
        ctx, img,
        p00.x, p00.y, p10.x, p10.y, p01.x, p01.y,
        srcX0, srcY0, srcX1, srcY0, srcX0, srcY1
      );

      // Triangle 2: (p10, p11, p01)
      drawTriangle(
        ctx, img,
        p10.x, p10.y, p11.x, p11.y, p01.x, p01.y,
        srcX1, srcY0, srcX1, srcY1, srcX0, srcY1
      );
    }
  }
}

/**
 * Draws realistic dual-layer floor shadow adhering to the carpet quad geometry.
 */
export function drawFloorShadow(
  ctx: CanvasRenderingContext2D,
  quad: QuadPoints,
  config: ShadowConfig
) {
  const angleRad = (config.lightAngleDeg * Math.PI) / 180;
  const offsetX = Math.cos(angleRad) * config.elevation;
  const offsetY = Math.sin(angleRad) * config.elevation * 0.6 + config.elevation * 0.4;

  ctx.save();

  // 1. Soft Cast Shadow (Directional, Gaussian blurred)
  if (config.opacity > 0.01) {
    ctx.shadowColor = `rgba(15, 12, 10, ${config.opacity})`;
    ctx.shadowBlur = Math.max(1, config.blurRadius);
    ctx.shadowOffsetX = offsetX;
    ctx.shadowOffsetY = offsetY;

    ctx.fillStyle = `rgba(15, 12, 10, ${config.opacity * 0.7})`;
    ctx.beginPath();
    ctx.moveTo(quad.topLeft.x, quad.topLeft.y);
    ctx.lineTo(quad.topRight.x, quad.topRight.y);
    ctx.lineTo(quad.bottomRight.x, quad.bottomRight.y);
    ctx.lineTo(quad.bottomLeft.x, quad.bottomLeft.y);
    ctx.closePath();
    ctx.fill();
  }

  // 2. Ambient Contact Shadow (Tight dark occlusion along bottom contact edges)
  if (config.ambientOcclusion > 0.05) {
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    ctx.strokeStyle = `rgba(10, 8, 7, ${config.ambientOcclusion})`;
    ctx.lineWidth = 4;
    ctx.filter = 'blur(3px)';
    ctx.beginPath();
    ctx.moveTo(quad.topLeft.x, quad.topLeft.y);
    ctx.lineTo(quad.topRight.x, quad.topRight.y);
    ctx.lineTo(quad.bottomRight.x, quad.bottomRight.y);
    ctx.lineTo(quad.bottomLeft.x, quad.bottomLeft.y);
    ctx.closePath();
    ctx.stroke();
    ctx.filter = 'none';
  }

  ctx.restore();
}

/**
 * Determines if a point is inside the quad using cross product.
 */
export function isPointInsideQuad(x: number, y: number, quad: QuadPoints): boolean {
  function ccw(ax: number, ay: number, bx: number, by: number, px: number, py: number): boolean {
    return (bx - ax) * (py - ay) - (by - ay) * (px - ax) >= 0;
  }

  const b1 = ccw(quad.topLeft.x, quad.topLeft.y, quad.topRight.x, quad.topRight.y, x, y);
  const b2 = ccw(quad.topRight.x, quad.topRight.y, quad.bottomRight.x, quad.bottomRight.y, x, y);
  const b3 = ccw(quad.bottomRight.x, quad.bottomRight.y, quad.bottomLeft.x, quad.bottomLeft.y, x, y);
  const b4 = ccw(quad.bottomLeft.x, quad.bottomLeft.y, quad.topLeft.x, quad.topLeft.y, x, y);

  return b1 === b2 && b2 === b3 && b3 === b4;
}

import { SegmentationParams } from '../types';

/**
 * Intelligent offline carpet background segmenter.
 * Operates purely client-side without any internet or cloud APIs.
 * Preserves 100% of the original carpet colors, brightness, flowers, texture, and fringes.
 */
export async function removeCarpetBackground(
  imageSource: HTMLImageElement | HTMLCanvasElement,
  params: SegmentationParams
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  const w = imageSource.width;
  const h = imageSource.height;
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Cannot acquire canvas context');

  ctx.drawImage(imageSource, 0, 0);
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  // 1. Sample background color profile from 4 corner margins
  const cornerBgColors = sampleBorderBackgrounds(data, w, h);

  // 2. Create foreground/background mask
  const mask = new Uint8Array(w * h);
  const thresholdSq = (params.sensitivity * 255) * (params.sensitivity * 255) * 3;

  for (let y = 0; y < h; y++) {
    const rowOffset = y * w;
    for (let x = 0; x < w; x++) {
      const idx = rowOffset + x;
      const pIdx = idx * 4;
      const r = data[pIdx];
      const g = data[pIdx + 1];
      const b = data[pIdx + 2];

      let minDistanceSq = Number.MAX_VALUE;
      for (const bg of cornerBgColors) {
        const dr = r - bg.r;
        const dg = g - bg.g;
        const db = b - bg.b;
        const dSq = dr * dr + dg * dg + db * db;
        if (dSq < minDistanceSq) minDistanceSq = dSq;
      }

      const isCloseToBg = minDistanceSq < thresholdSq;

      // Fringe Protection check
      if (isCloseToBg && params.protectFringes) {
        if (isFringeCandidate(r, g, b) && checkLocalContrast(data, x, y, w, h)) {
          mask[idx] = 1; // Preserve fringe
          continue;
        }
      }

      mask[idx] = isCloseToBg ? 0 : 1;
    }
  }

  // 3. Flood-fill from outer boundaries
  // Any pixel not reachable from the exterior is guaranteed to be inside the carpet!
  const isCarpet = floodFillExterior(mask, w, h);

  // 4. Update alpha channel without touching RGB values at all!
  for (let i = 0; i < isCarpet.length; i++) {
    const pIdx = i * 4;
    if (isCarpet[i]) {
      // Leave RGB exactly untouched
      data[pIdx + 3] = 255;
    } else {
      // Transparent background
      data[pIdx + 3] = 0;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

function sampleBorderBackgrounds(data: Uint8ClampedArray, w: number, h: number): Array<{ r: number; g: number; b: number }> {
  const samples: Array<{ r: number; g: number; b: number }> = [];
  const sampleSize = Math.min(20, Math.floor(Math.min(w, h) / 8));

  // Top-left
  for (let y = 0; y < sampleSize; y++) {
    for (let x = 0; x < sampleSize; x++) {
      const pIdx = (y * w + x) * 4;
      samples.push({ r: data[pIdx], g: data[pIdx + 1], b: data[pIdx + 2] });
    }
  }

  // Top-right
  for (let y = 0; y < sampleSize; y++) {
    for (let x = w - sampleSize; x < w; x++) {
      const pIdx = (y * w + x) * 4;
      samples.push({ r: data[pIdx], g: data[pIdx + 1], b: data[pIdx + 2] });
    }
  }

  // Bottom-left
  for (let y = h - sampleSize; y < h; y++) {
    for (let x = 0; x < sampleSize; x++) {
      const pIdx = (y * w + x) * 4;
      samples.push({ r: data[pIdx], g: data[pIdx + 1], b: data[pIdx + 2] });
    }
  }

  // Bottom-right
  for (let y = h - sampleSize; y < h; y++) {
    for (let x = w - sampleSize; x < w; x++) {
      const pIdx = (y * w + x) * 4;
      samples.push({ r: data[pIdx], g: data[pIdx + 1], b: data[pIdx + 2] });
    }
  }

  // Group into average clusters
  const chunkSize = Math.max(1, Math.floor(samples.length / 4));
  const clusters: Array<{ r: number; g: number; b: number }> = [];
  for (let i = 0; i < samples.length; i += chunkSize) {
    const chunk = samples.slice(i, i + chunkSize);
    let sr = 0, sg = 0, sb = 0;
    for (const c of chunk) {
      sr += c.r;
      sg += c.g;
      sb += c.b;
    }
    const cnt = chunk.length;
    clusters.push({ r: Math.round(sr / cnt), g: Math.round(sg / cnt), b: Math.round(sb / cnt) });
  }

  return clusters;
}

function isFringeCandidate(r: number, g: number, b: number): boolean {
  const brightness = (r + g + b) / 3;
  const maxC = Math.max(r, g, b);
  const minC = Math.min(r, g, b);
  const saturation = (maxC - minC) / Math.max(1, brightness);
  return brightness > 150 && saturation < 0.3;
}

function checkLocalContrast(data: Uint8ClampedArray, x: number, y: number, w: number, h: number): boolean {
  const centerIdx = (y * w + x) * 4;
  const centerL = (data[centerIdx] + data[centerIdx + 1] + data[centerIdx + 2]) / 3;

  const step = 2;
  for (let dy = -step; dy <= step; dy += step) {
    const ny = y + dy;
    if (ny < 0 || ny >= h) continue;
    for (let dx = -step; dx <= step; dx += step) {
      const nx = x + dx;
      if (nx < 0 || nx >= w) continue;
      const nIdx = (ny * w + nx) * 4;
      const nL = (data[nIdx] + data[nIdx + 1] + data[nIdx + 2]) / 3;
      if (Math.abs(centerL - nL) > 30) return true;
    }
  }
  return false;
}

function floodFillExterior(mask: Uint8Array, w: number, h: number): Uint8Array {
  const visited = new Uint8Array(w * h);
  const queue = new Int32Array(w * h);
  let head = 0;
  let tail = 0;

  function enqueue(x: number, y: number) {
    const idx = y * w + x;
    if (visited[idx] === 0 && mask[idx] === 0) {
      visited[idx] = 1;
      queue[tail++] = idx;
    }
  }

  // Seed boundary edges
  for (let x = 0; x < w; x++) {
    enqueue(x, 0);
    enqueue(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    enqueue(0, y);
    enqueue(w - 1, y);
  }

  while (head < tail) {
    const idx = queue[head++];
    const x = idx % w;
    const y = Math.floor(idx / w);

    if (x > 0) enqueue(x - 1, y);
    if (x < w - 1) enqueue(x + 1, y);
    if (y > 0) enqueue(x, y - 1);
    if (y < h - 1) enqueue(x, y + 1);
  }

  const isCarpet = new Uint8Array(w * h);
  for (let i = 0; i < isCarpet.length; i++) {
    isCarpet[i] = visited[i] === 0 ? 1 : 0;
  }
  return isCarpet;
}

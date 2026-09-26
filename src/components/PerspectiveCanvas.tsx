import React, { useRef, useEffect, useState, useCallback } from 'react';
import { QuadPoints, ShadowConfig } from '../types';
import {
  drawFloorShadow,
  drawPerspectiveCarpet,
  isPointInsideQuad
} from '../utils/perspective';

interface PerspectiveCanvasProps {
  roomImage: HTMLImageElement | HTMLCanvasElement;
  carpetImage: HTMLImageElement | HTMLCanvasElement;
  quad: QuadPoints;
  shadowConfig: ShadowConfig;
  showGuides: boolean;
  onQuadChange: (newQuad: QuadPoints) => void;
  onCommitChange: (newQuad: QuadPoints) => void;
}

type DragTarget = 'NONE' | 'TL' | 'TR' | 'BR' | 'BL' | 'BODY';

export const PerspectiveCanvas: React.FC<PerspectiveCanvasProps> = ({
  roomImage,
  carpetImage,
  quad,
  shadowConfig,
  showGuides,
  onQuadChange,
  onCommitChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [activeTarget, setActiveTarget] = useState<DragTarget>('NONE');
  const dragStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const initialQuadAtDrag = useRef<QuadPoints>(quad);

  // Redraw canvas
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = roomImage.width;
    const h = roomImage.height;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    ctx.clearRect(0, 0, w, h);

    // 1. Draw room background
    ctx.drawImage(roomImage, 0, 0, w, h);

    // 2. Draw realistic floor shadow
    drawFloorShadow(ctx, quad, shadowConfig);

    // 3. Draw perspective-warped carpet
    drawPerspectiveCarpet(ctx, carpetImage, quad, 22);

    // 4. Draw interactive guide polygon and handles
    if (showGuides) {
      ctx.save();

      // Guide Lines
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = Math.max(2, w / 450);
      ctx.setLineDash([8, 6]);

      ctx.beginPath();
      ctx.moveTo(quad.topLeft.x, quad.topLeft.y);
      ctx.lineTo(quad.topRight.x, quad.topRight.y);
      ctx.lineTo(quad.bottomRight.x, quad.bottomRight.y);
      ctx.lineTo(quad.bottomLeft.x, quad.bottomLeft.y);
      ctx.closePath();
      ctx.stroke();

      // Diagonal cross-guides
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = Math.max(1, w / 700);
      ctx.beginPath();
      ctx.moveTo(quad.topLeft.x, quad.topLeft.y);
      ctx.lineTo(quad.bottomRight.x, quad.bottomRight.y);
      ctx.moveTo(quad.topRight.x, quad.topRight.y);
      ctx.lineTo(quad.bottomLeft.x, quad.bottomLeft.y);
      ctx.stroke();

      ctx.setLineDash([]);

      // Corner handles
      const points = [
        { p: quad.topLeft, id: 'TL' },
        { p: quad.topRight, id: 'TR' },
        { p: quad.bottomRight, id: 'BR' },
        { p: quad.bottomLeft, id: 'BL' },
      ];

      const pinRadius = Math.max(10, w / 70);

      points.forEach(({ p, id }) => {
        const isActive = activeTarget === id;

        // Outer glow
        ctx.fillStyle = isActive ? 'rgba(56, 189, 248, 0.45)' : 'rgba(56, 189, 248, 0.2)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, pinRadius * 1.8, 0, Math.PI * 2);
        ctx.fill();

        // White border
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(p.x, p.y, pinRadius, 0, Math.PI * 2);
        ctx.fill();

        // Inner cyan core
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.arc(p.x, p.y, pinRadius * 0.65, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
    }
  }, [roomImage, carpetImage, quad, shadowConfig, showGuides, activeTarget]);

  useEffect(() => {
    render();
  }, [render]);

  // Convert client touch/mouse coords to Canvas internal coordinates
  const getCanvasCoords = (clientX: number, clientY: number): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e.clientX, e.clientY);
    if (!coords) return;

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragStartPos.current = coords;
    initialQuadAtDrag.current = { ...quad };

    const hitRadius = Math.max(35, (canvasRef.current?.width || 1000) / 25);

    const dist = (p: { x: number; y: number }) => Math.hypot(coords.x - p.x, coords.y - p.y);

    if (dist(quad.topLeft) < hitRadius) {
      setActiveTarget('TL');
    } else if (dist(quad.topRight) < hitRadius) {
      setActiveTarget('TR');
    } else if (dist(quad.bottomRight) < hitRadius) {
      setActiveTarget('BR');
    } else if (dist(quad.bottomLeft) < hitRadius) {
      setActiveTarget('BL');
    } else if (isPointInsideQuad(coords.x, coords.y, quad)) {
      setActiveTarget('BODY');
    } else {
      setActiveTarget('NONE');
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activeTarget === 'NONE') return;
    const coords = getCanvasCoords(e.clientX, e.clientY);
    if (!coords) return;

    const dx = coords.x - dragStartPos.current.x;
    const dy = coords.y - dragStartPos.current.y;
    const base = initialQuadAtDrag.current;

    let updated: QuadPoints;

    switch (activeTarget) {
      case 'TL':
        updated = { ...base, topLeft: { x: base.topLeft.x + dx, y: base.topLeft.y + dy } };
        break;
      case 'TR':
        updated = { ...base, topRight: { x: base.topRight.x + dx, y: base.topRight.y + dy } };
        break;
      case 'BR':
        updated = { ...base, bottomRight: { x: base.bottomRight.x + dx, y: base.bottomRight.y + dy } };
        break;
      case 'BL':
        updated = { ...base, bottomLeft: { x: base.bottomLeft.x + dx, y: base.bottomLeft.y + dy } };
        break;
      case 'BODY':
        updated = {
          topLeft: { x: base.topLeft.x + dx, y: base.topLeft.y + dy },
          topRight: { x: base.topRight.x + dx, y: base.topRight.y + dy },
          bottomRight: { x: base.bottomRight.x + dx, y: base.bottomRight.y + dy },
          bottomLeft: { x: base.bottomLeft.x + dx, y: base.bottomLeft.y + dy },
        };
        break;
      default:
        return;
    }

    onQuadChange(updated);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activeTarget !== 'NONE') {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Ignored
      }
      onCommitChange(quad);
      setActiveTarget('NONE');
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center overflow-hidden bg-stone-950 select-none touch-none"
    >
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="max-w-full max-h-full object-contain cursor-crosshair shadow-2xl rounded-sm"
      />
    </div>
  );
};

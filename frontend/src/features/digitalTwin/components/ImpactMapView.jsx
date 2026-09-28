import React, { useRef, useEffect } from 'react';
import { Shield, Navigation } from 'lucide-react';

export default function ImpactMapView({
  scenario,
  params,
  simTime,
  maxTime = 14400,
  isBreached
}) {
  const canvasRef = useRef(null);
  const waveProgress = Math.min(1.0, Math.max(0, simTime / maxTime));

  const settlements = scenario.settlements || [];
  const safeShelters = scenario.safeShelters || [];

  // Canvas drawing for dynamic blue-to-red water depth heatmap
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let tick = 0;

    const render = () => {
      tick++;
      const w = canvas.width;
      const h = canvas.height;

      // Clear
      ctx.clearRect(0, 0, w, h);

      // 1. Draw Satellite Terrain Base Background
      const bgGrad = ctx.createLinearGradient(0, 0, w, h);
      bgGrad.addColorStop(0, '#0a1410');
      bgGrad.addColorStop(0.3, '#102219');
      bgGrad.addColorStop(0.7, '#142013');
      bgGrad.addColorStop(1, '#0c160e');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Topo contour lines (satellite contour effect)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let r = 50; r < Math.max(w, h); r += 60) {
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // River Path Coordinates
      const riverPoints = [
        { x: w * 0.48, y: h * 0.08 },
        { x: w * 0.50, y: h * 0.16 }, // Dam location at y: h * 0.16
        { x: w * 0.46, y: h * 0.28 },
        { x: w * 0.53, y: h * 0.42 },
        { x: w * 0.45, y: h * 0.58 },
        { x: w * 0.55, y: h * 0.74 },
        { x: w * 0.50, y: h * 0.92 }
      ];

      // 2. Base River Bed (Normal Flow)
      ctx.beginPath();
      ctx.moveTo(riverPoints[0].x, riverPoints[0].y);
      for (let i = 1; i < riverPoints.length; i++) {
        const xc = (riverPoints[i - 1].x + riverPoints[i].x) / 2;
        const yc = (riverPoints[i - 1].y + riverPoints[i].y) / 2;
        ctx.quadraticCurveTo(riverPoints[i - 1].x, riverPoints[i - 1].y, xc, yc);
      }
      ctx.lineTo(riverPoints[riverPoints.length - 1].x, riverPoints[riverPoints.length - 1].y);
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 22;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      // Dam Graphic
      const damY = h * 0.16;
      ctx.fillStyle = '#64748b';
      ctx.fillRect(w * 0.35, damY - 5, w * 0.3, 10);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(w * 0.38, damY - 3, w * 0.24, 6);

      // 3. Dynamic Blue-to-Red Water-Depth Heatmap Spreading Over Time
      if (isBreached && waveProgress > 0) {
        const damIndex = 1;
        const totalPoints = riverPoints.length;
        const reachIndex = damIndex + waveProgress * (totalPoints - 1 - damIndex);
        const currentY = riverPoints[damIndex].y + waveProgress * (h * 0.92 - riverPoints[damIndex].y);

        // Heatmap concentric flood bands (Blue -> Cyan -> Green -> Yellow -> Orange -> Crimson Red)
        const depthLayers = [
          { color: 'rgba(2, 132, 199, 0.45)', spreadX: 140, spreadY: 45, maxDepth: '1.2m' }, // Blue
          { color: 'rgba(6, 182, 212, 0.50)', spreadX: 110, spreadY: 38, maxDepth: '2.8m' }, // Cyan
          { color: 'rgba(132, 204, 22, 0.55)', spreadX: 85, spreadY: 30, maxDepth: '4.5m' }, // Green
          { color: 'rgba(245, 158, 11, 0.65)', spreadX: 65, spreadY: 24, maxDepth: '6.2m' }, // Amber Yellow
          { color: 'rgba(249, 115, 22, 0.75)', spreadX: 45, spreadY: 18, maxDepth: '7.8m' }, // Orange
          { color: 'rgba(220, 38, 38, 0.85)', spreadX: 25, spreadY: 12, maxDepth: '9.4m' }   // Crimson Red
        ];

        depthLayers.forEach((layer) => {
          ctx.beginPath();
          // Draw flood footprint from dam to current front
          const startPt = riverPoints[damIndex];
          ctx.moveTo(startPt.x - layer.spreadX * 0.3, startPt.y);

          // Left bank of flood
          for (let i = damIndex; i < riverPoints.length; i++) {
            const pt = riverPoints[i];
            if (pt.y > currentY) break;
            const progressRatio = (pt.y - startPt.y) / (currentY - startPt.y);
            const wSp = layer.spreadX * (0.4 + progressRatio * 0.8);
            ctx.lineTo(pt.x - wSp, pt.y);
          }

          // Leading surge front curve
          const frontX = w * 0.5 + Math.sin(currentY * 0.02) * 20;
          ctx.quadraticCurveTo(
            frontX,
            currentY + layer.spreadY,
            frontX + layer.spreadX * 0.7,
            currentY
          );

          // Right bank of flood back to dam
          for (let i = riverPoints.length - 1; i >= damIndex; i--) {
            const pt = riverPoints[i];
            if (pt.y > currentY) continue;
            const progressRatio = (pt.y - startPt.y) / (currentY - startPt.y);
            const wSp = layer.spreadX * (0.4 + progressRatio * 0.8);
            ctx.lineTo(pt.x + wSp, pt.y);
          }

          ctx.closePath();
          ctx.fillStyle = layer.color;
          ctx.shadowColor = layer.color;
          ctx.shadowBlur = 15;
          ctx.fill();
        });

        // Dynamic leading wave foam edge
        ctx.beginPath();
        ctx.ellipse(
          w * 0.5 + Math.sin(currentY * 0.02) * 20,
          currentY,
          95,
          14,
          0,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // 4. Glowing Evacuation Routes (Dashed Lines with marching pulse)
      const dashOffset = (tick * 0.6) % 24;
      settlements.forEach((s, idx) => {
        const shelter = safeShelters[idx % safeShelters.length];
        if (!shelter) return;

        // Map relative coordinates to canvas space
        const vX = w * (0.5 + s.x / 140);
        const vY = h * (0.16 + (s.z + 110) / 280);
        const sX = w * (0.5 + shelter.x / 140);
        const sY = h * (0.16 + (shelter.z + 110) / 280);

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(vX, vY);
        // Curve around terrain
        const midX = (vX + sX) / 2 + (idx % 2 === 0 ? -30 : 30);
        const midY = (vY + sY) / 2;
        ctx.quadraticCurveTo(midX, midY, sX, sY);

        // Neon Glow route line
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3.5;
        ctx.setLineDash([10, 6]);
        ctx.lineDashOffset = -dashOffset;
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 14;
        ctx.stroke();
        ctx.restore();
      });

      // 5. Green Evacuation Safe Zones (Pulsing Concentric Circles)
      safeShelters.forEach((shelter) => {
        const sX = w * (0.5 + shelter.x / 140);
        const sY = h * (0.16 + (shelter.z + 110) / 280);

        const pulse = 16 + Math.sin(tick * 0.06) * 6;

        // Outer pulsing ring
        ctx.beginPath();
        ctx.arc(sX, sY, pulse + 12, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Inner solid safe buffer
        ctx.beginPath();
        ctx.arc(sX, sY, 14, 0, Math.PI * 2);
        ctx.fillStyle = '#065f46';
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 16;
        ctx.fill();
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [scenario, params, simTime, maxTime, isBreached, waveProgress]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* Background Interactive Map Canvas */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      </div>

      {/* Satellite Map Mode Badge & Legend */}
      <div style={{
        position: 'absolute',
        top: '76px',
        left: '380px',
        background: 'rgba(10, 16, 30, 0.88)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        borderRadius: '12px',
        padding: '10px 16px',
        zIndex: 15,
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Satellite Impact Mode
          </span>
        </div>
        <div style={{ height: '16px', width: '1px', background: 'rgba(255,255,255,0.15)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#94a3b8' }}>
          <span>Depth Heatmap:</span>
          <div style={{
            width: '120px',
            height: '8px',
            borderRadius: '4px',
            background: 'linear-gradient(to right, #0284c7, #06b6d4, #84cc16, #f59e0b, #ef4444)'
          }} />
          <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#e2e8f0' }}>0m → 10m+</span>
        </div>
      </div>

      {/* Floating Settlement & Shelter Interactive Cards */}
      {settlements.map((s, idx) => {
        const isReached = isBreached && simTime >= s.baseArrivalSec;
        const currentDepth = isReached ? Math.min(params.waterLevelM * 0.18, 8.4) : 0;
        const shelter = safeShelters[idx % safeShelters.length];

        // Calculated positions based on layout
        const topOffsets = ['26%', '42%', '60%', '78%'];
        const leftOffsets = ['40%', '64%', '36%', '68%'];

        return (
          <div
            key={s.id}
            style={{
              position: 'absolute',
              top: topOffsets[idx % topOffsets.length],
              left: leftOffsets[idx % leftOffsets.length],
              background: 'rgba(10, 18, 32, 0.92)',
              backdropFilter: 'blur(16px)',
              border: `1px solid ${isReached ? '#ef4444' : '#38bdf8'}`,
              borderRadius: '10px',
              padding: '8px 12px',
              zIndex: 12,
              boxShadow: `0 8px 24px rgba(0,0,0,0.6), 0 0 16px ${isReached ? 'rgba(239,68,68,0.3)' : 'rgba(56,189,248,0.2)'}`,
              minWidth: '180px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#f8fafc' }}>{s.name}</span>
              <span style={{
                fontSize: '9px',
                fontWeight: 700,
                padding: '2px 5px',
                borderRadius: '4px',
                background: isReached ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.25)',
                color: isReached ? '#f87171' : '#34d399',
                border: `1px solid ${isReached ? '#ef4444' : '#10b981'}`
              }}>
                {isReached ? 'INUNDATED' : 'SAFE'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', margin: '4px 0' }}>
              <span>Depth: <strong style={{ color: isReached ? '#ef4444' : '#38bdf8' }}>{currentDepth.toFixed(1)}m</strong></span>
              <span>Pop: <strong style={{ color: '#f1f5f9' }}>{s.pop.toLocaleString()}</strong></span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '10px',
              color: '#34d399',
              background: 'rgba(16,185,129,0.12)',
              padding: '4px 6px',
              borderRadius: '6px',
              border: '1px solid rgba(16,185,129,0.3)',
              marginTop: '4px'
            }}>
              <Navigation size={10} color="#34d399" />
              <span>Route → {shelter ? shelter.name : 'Ridge Shelter'}</span>
            </div>
          </div>
        );
      })}

      {/* Safe Shelter Markers */}
      {safeShelters.map((sh, idx) => {
        const topOffsets = ['22%', '36%', '54%', '72%'];
        const leftOffsets = ['20%', '82%', '18%', '84%'];

        return (
          <div
            key={sh.id}
            style={{
              position: 'absolute',
              top: topOffsets[idx % topOffsets.length],
              left: leftOffsets[idx % leftOffsets.length],
              background: 'rgba(6, 95, 70, 0.92)',
              backdropFilter: 'blur(16px)',
              border: '1px solid #10b981',
              borderRadius: '10px',
              padding: '8px 12px',
              zIndex: 12,
              boxShadow: '0 8px 24px rgba(0,0,0,0.6), 0 0 16px rgba(16,185,129,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Shield size={18} color="#34d399" />
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#f0fdf4' }}>{sh.name}</div>
              <div style={{ fontSize: '9px', color: '#a7f3d0' }}>
                Cap: {sh.capacity.toLocaleString()} | Elev: +{sh.elevM}m
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

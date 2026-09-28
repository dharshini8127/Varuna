import React, { useRef, useEffect, useMemo } from 'react';
import { Users, Clock, AlertTriangle } from 'lucide-react';

export default function RiskMapView({
  scenario,
  params,
  simTime,
  maxTime = 14400,
  isBreached
}) {
  const canvasRef = useRef(null);
  const waveProgress = Math.min(1.0, Math.max(0, simTime / maxTime));

  const settlements = scenario.settlements || [];

  // Calculate live affected population as flood wave progresses
  const { totalAffectedPop, activeSettlementCount, latestArrivalText } = useMemo(() => {
    let pop = 0;
    let count = 0;
    let latestText = 'Wave pending';

    settlements.forEach((s) => {
      if (isBreached && simTime >= s.baseArrivalSec) {
        pop += s.pop;
        count++;
        const mins = Math.floor(s.baseArrivalSec / 60);
        latestText = `${s.name} (T+${mins}m)`;
      }
    });

    return {
      totalAffectedPop: pop,
      activeSettlementCount: count,
      latestArrivalText: latestText
    };
  }, [settlements, isBreached, simTime]);

  // Dark Holographic Canvas with Glowing River and Risk Zones
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

      ctx.clearRect(0, 0, w, h);

      // 1. Dark Holographic Cyber Grid Background
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, w, h);

      // Radial Hologram Spotlight
      const holoGrad = ctx.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, Math.max(w, h) * 0.7);
      holoGrad.addColorStop(0, 'rgba(6, 182, 212, 0.08)');
      holoGrad.addColorStop(0.6, 'rgba(15, 23, 42, 0.9)');
      holoGrad.addColorStop(1, '#020617');
      ctx.fillStyle = holoGrad;
      ctx.fillRect(0, 0, w, h);

      // Grid Coordinates
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
      ctx.lineWidth = 1;
      const gridSize = 45;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // River Path Coordinates
      const riverPoints = [
        { x: w * 0.48, y: h * 0.08 },
        { x: w * 0.50, y: h * 0.16 }, // Dam location
        { x: w * 0.46, y: h * 0.28 },
        { x: w * 0.53, y: h * 0.42 },
        { x: w * 0.45, y: h * 0.58 },
        { x: w * 0.55, y: h * 0.74 },
        { x: w * 0.50, y: h * 0.92 }
      ];

      // 2. Red / Orange / Green Risk Zones (Holographic Neon Polygons)
      const drawZone = (fillColor, strokeColor, spreadFactor, dash = []) => {
        ctx.save();
        ctx.beginPath();
        const start = riverPoints[1];
        ctx.moveTo(start.x - 30 * spreadFactor, start.y);

        for (let i = 1; i < riverPoints.length; i++) {
          const pt = riverPoints[i];
          ctx.lineTo(pt.x - (35 + i * 14) * spreadFactor, pt.y);
        }

        const end = riverPoints[riverPoints.length - 1];
        ctx.lineTo(end.x + (35 + (riverPoints.length - 1) * 14) * spreadFactor, end.y);

        for (let i = riverPoints.length - 2; i >= 1; i--) {
          const pt = riverPoints[i];
          ctx.lineTo(pt.x + (35 + i * 14) * spreadFactor, pt.y);
        }

        ctx.closePath();
        ctx.fillStyle = fillColor;
        ctx.fill();

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
        if (dash.length > 0) ctx.setLineDash(dash);
        ctx.shadowColor = strokeColor;
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.restore();
      };

      // Green Safe Buffer Zone (Outer)
      drawZone('rgba(16, 185, 129, 0.06)', '#10b981', 2.8, [12, 8]);
      // Orange Moderate Risk Zone (Middle)
      drawZone('rgba(245, 158, 11, 0.10)', '#f59e0b', 1.8, [8, 6]);
      // Red Extreme Risk Zone (Inner main channel)
      drawZone('rgba(239, 68, 68, 0.16)', '#ef4444', 1.0);

      // 3. Glowing River (Cyan / Electric Blue Neon with flow effect)
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(riverPoints[0].x, riverPoints[0].y);
      for (let i = 1; i < riverPoints.length; i++) {
        const xc = (riverPoints[i - 1].x + riverPoints[i].x) / 2;
        const yc = (riverPoints[i - 1].y + riverPoints[i].y) / 2;
        ctx.quadraticCurveTo(riverPoints[i - 1].x, riverPoints[i - 1].y, xc, yc);
      }
      ctx.lineTo(riverPoints[riverPoints.length - 1].x, riverPoints[riverPoints.length - 1].y);
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 14;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 25;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Inner white-hot stream
      ctx.strokeStyle = '#e0f2fe';
      ctx.lineWidth = 4;
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.restore();

      // Flowing Pulse Wavefront
      if (isBreached && waveProgress > 0) {
        const damY = riverPoints[1].y;
        const currentFrontY = damY + waveProgress * (riverPoints[riverPoints.length - 1].y - damY);

        ctx.save();
        ctx.beginPath();
        ctx.arc(w * 0.5 + Math.sin(currentFrontY * 0.03) * 15, currentFrontY, 28, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 30;
        ctx.fill();

        // Expanding shockwave ring
        const shockRadius = 35 + (tick % 40);
        ctx.beginPath();
        ctx.arc(w * 0.5 + Math.sin(currentFrontY * 0.03) * 15, currentFrontY, shockRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(239, 68, 68, ${1.0 - (tick % 40) / 40})`;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
      }

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
      {/* Holographic Canvas */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      </div>

      {/* Prominent Holographic Counter: Total Affected Population */}
      <div style={{
        position: 'absolute',
        top: '76px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(9, 14, 28, 0.94)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(239, 68, 68, 0.45)',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.7), 0 0 30px rgba(239, 68, 68, 0.25)',
        borderRadius: '16px',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        zIndex: 25
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(239,68,68,0.3) 0%, rgba(220,38,38,0.5) 100%)',
            border: '1px solid #ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(239,68,68,0.4)'
          }}>
            <Users size={22} color="#fca5a5" />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Total Affected Population
            </div>
            <div style={{
              fontSize: '28px',
              fontWeight: 900,
              fontFamily: 'monospace',
              color: totalAffectedPop > 0 ? '#ef4444' : '#38bdf8',
              letterSpacing: '0.04em',
              textShadow: totalAffectedPop > 0 ? '0 0 12px rgba(239,68,68,0.6)' : '0 0 12px rgba(56,189,248,0.4)',
              transition: 'all 0.3s ease'
            }}>
              {totalAffectedPop.toLocaleString()}
              <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 500, marginLeft: '6px' }}>
                / {(scenario.totalPopulationExposed || 48900).toLocaleString()} exposed
              </span>
            </div>
          </div>
        </div>

        <div style={{ height: '36px', width: '1px', background: 'rgba(255,255,255,0.12)' }} />

        {/* Inundated Villages Count */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
            Inundated Settlements
          </span>
          <span style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc', fontFamily: 'monospace' }}>
            {activeSettlementCount} <span style={{ fontSize: '12px', color: '#64748b' }}>of {settlements.length}</span>
          </span>
          <span style={{ fontSize: '10px', color: '#f59e0b', fontWeight: 600 }}>
            {latestArrivalText}
          </span>
        </div>
      </div>

      {/* Floating Settlement Callouts: "Flood Arrival Time" & Risk Status */}
      {settlements.map((s, idx) => {
        const isReached = isBreached && simTime >= s.baseArrivalSec;
        const timeDiffSec = s.baseArrivalSec - simTime;
        const arrivalMin = Math.floor(s.baseArrivalSec / 60);

        const topOffsets = ['26%', '42%', '60%', '78%'];
        const leftOffsets = ['38%', '62%', '35%', '65%'];

        return (
          <div
            key={s.id}
            style={{
              position: 'absolute',
              top: topOffsets[idx % topOffsets.length],
              left: leftOffsets[idx % leftOffsets.length],
              background: 'rgba(9, 14, 28, 0.94)',
              backdropFilter: 'blur(16px)',
              border: `1.5px solid ${isReached ? '#ef4444' : '#06b6d4'}`,
              boxShadow: `0 10px 28px rgba(0,0,0,0.65), 0 0 20px ${isReached ? 'rgba(239,68,68,0.4)' : 'rgba(6,182,212,0.3)'}`,
              borderRadius: '12px',
              padding: '10px 14px',
              minWidth: '220px',
              zIndex: 14
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff' }}>{s.name}</span>
              <span style={{
                fontSize: '9px',
                fontWeight: 800,
                textTransform: 'uppercase',
                padding: '2px 6px',
                borderRadius: '4px',
                background: isReached ? 'rgba(239,68,68,0.25)' : 'rgba(6,182,212,0.2)',
                color: isReached ? '#fca5a5' : '#38bdf8',
                border: `1px solid ${isReached ? '#ef4444' : '#06b6d4'}`
              }}>
                {isReached ? 'CRITICAL INUNDATION' : 'HIGH RISK'}
              </span>
            </div>

            {/* Flood Arrival Time Callout */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.35)',
              borderRadius: '8px',
              padding: '6px 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '6px',
              border: '1px solid rgba(255,255,255,0.06)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#94a3b8' }}>
                <Clock size={12} color={isReached ? '#ef4444' : '#38bdf8'} />
                <span>Flood Arrival Time:</span>
              </div>
              <span style={{
                fontSize: '12px',
                fontWeight: 800,
                fontFamily: 'monospace',
                color: isReached ? '#ef4444' : '#38bdf8'
              }}>
                {isReached ? 'ARRIVED (00:00)' : `T + ${arrivalMin}m`}
              </span>
            </div>

            {/* Time remaining / Population exposure */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#cbd5e1' }}>
              <span>Pop: <strong style={{ color: '#ffffff' }}>{s.pop.toLocaleString()}</strong></span>
              <span>Dist: <strong style={{ color: '#38bdf8' }}>{s.distKm} km</strong></span>
            </div>

            {!isReached && isBreached && (
              <div style={{
                marginTop: '6px',
                fontSize: '10px',
                color: '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <AlertTriangle size={11} color="#f59e0b" />
                <span>
                  ETA: {Math.max(0, Math.floor(timeDiffSec / 60))}m {timeDiffSec % 60}s remaining
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

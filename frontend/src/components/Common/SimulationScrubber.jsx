import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  Clock, 
  Layers, 
  Waves, 
  Gauge, 
  Home
} from 'lucide-react';

export default function SimulationScrubber({
  scenario,
  currentHour,
  onChangeHour,
  maxHours = 24
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Playback timer effect
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        onChangeHour((prev) => {
          if (prev >= maxHours) {
            setIsPlaying(false);
            return maxHours;
          }
          return Math.min(maxHours, prev + 1);
        });
      }, 1400 / playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, maxHours, onChangeHour]);

  // Current step metrics
  const activeStep = scenario.timeSteps.reduce((prev, curr) => {
    return Math.abs(curr.hour - currentHour) < Math.abs(prev.hour - currentHour) ? curr : prev;
  }, scenario.timeSteps[0]);

  return (
    <div className="glass-panel" style={{
      position: 'absolute',
      bottom: '20px',
      left: '20px',
      right: '20px',
      padding: '14px 20px',
      zIndex: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }}>
      {/* Top Row: Playback Controls & Real-time Flood Telemetry */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Play / Step Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: isPlaying ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
              border: 'none',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: 'var(--glow-cyan)'
            }}
            title={isPlaying ? 'Pause Simulation' : 'Play Timeline'}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: '2px' }} />}
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              onChangeHour(0);
            }}
            className="btn-secondary"
            style={{ padding: '8px', borderRadius: '8px' }}
            title="Reset to T=0h"
          >
            <RotateCcw size={15} />
          </button>

          {/* Speed Multiplier */}
          <div style={{
            display: 'flex',
            background: 'rgba(0, 0, 0, 0.04)',
            borderRadius: '6px',
            border: '1px solid var(--border-subtle)',
            overflow: 'hidden'
          }}>
            {[1, 2, 5].map((speed) => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                style={{
                  padding: '4px 8px',
                  background: playbackSpeed === speed ? 'rgba(2, 132, 199, 0.15)' : 'transparent',
                  color: playbackSpeed === speed ? '#0284c7' : 'var(--text-muted)',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {speed}x
              </button>
            ))}
          </div>

          {/* Current Time Display */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginLeft: '8px',
            padding: '4px 10px',
            background: 'rgba(2, 132, 199, 0.08)',
            border: '1px solid rgba(2, 132, 199, 0.25)',
            borderRadius: '6px'
          }}>
            <Clock size={14} color="#0284c7" />
            <span className="mono" style={{ fontSize: '13px', fontWeight: '700', color: '#0284c7' }}>
              T + {currentHour < 10 ? `0${currentHour}` : currentHour}:00 hrs
            </span>
          </div>

          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {activeStep.label}
          </span>
        </div>

        {/* Dynamic Telemetry Badges at this time step */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Waves size={14} color="#0284c7" />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Flooded Area:</span>
            <span className="mono" style={{ fontSize: '12px', fontWeight: '700', color: '#0284c7' }}>
              {activeStep.activeAreaKm2} km²
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Gauge size={14} color="#e11d48" />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Max Depth:</span>
            <span className="mono" style={{ fontSize: '12px', fontWeight: '700', color: '#e11d48' }}>
              {activeStep.maxDepthM} m
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FastForward size={14} color="#d97706" />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Avg Velocity:</span>
            <span className="mono" style={{ fontSize: '12px', fontWeight: '700', color: '#d97706' }}>
              {activeStep.avgVelocityMs} m/s
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Home size={14} color="#7c3aed" />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Impacted Villages:</span>
            <span className="mono" style={{ fontSize: '12px', fontWeight: '700', color: '#7c3aed' }}>
              {activeStep.affectedVillagesCount}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Row: Scrubber Range Slider & Hour Ticks */}
      <div style={{ position: 'relative', width: '100%' }}>
        <input
          type="range"
          min="0"
          max={maxHours}
          step="1"
          value={currentHour}
          onChange={(e) => onChangeHour(parseInt(e.target.value, 10))}
          style={{ width: '100%', cursor: 'pointer' }}
        />

        {/* Milestone Tick Markers */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '6px',
          fontSize: '10px',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)'
        }}>
          <span>T+0h (Breach Start)</span>
          <span>T+3h</span>
          <span>T+6h (Peak Dikchu)</span>
          <span>T+12h (Singtam/Rangpo)</span>
          <span>T+18h</span>
          <span>T+24h (Max Extent)</span>
        </div>
      </div>
    </div>
  );
}

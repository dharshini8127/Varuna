import React from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipBack, 
  SkipForward, 
  Clock
} from 'lucide-react';
import { formatSecondsToHHMMSS } from '../utils/waterSimulation';

export default function TimelineBar({
  currentSec,
  onChangeTimeSec,
  isRunning,
  onTogglePlay,
  onReset,
  stepSizeMin,
  onChangeStepSize,
  maxSec = 43200 // 12 hours
}) {
  const quickJumpHours = [0, 1, 2, 4, 6, 8, 12];
  const stepOptions = [5, 15, 30];

  const handleStep = (direction) => {
    const delta = direction * stepSizeMin * 60;
    const newTime = Math.max(0, Math.min(maxSec, currentSec + delta));
    onChangeTimeSec(newTime);
  };

  return (
    <div className="sim3d-timeline-bar">
      <div className="sim3d-timeline-top">
        {/* Playback Controls & Clock */}
        <div className="sim3d-timeline-controls">
          <button
            onClick={onTogglePlay}
            className="sim3d-btn-primary"
            style={{ width: '34px', height: '34px', padding: 0 }}
            title={isRunning ? 'Pause Simulation' : 'Run Simulation'}
          >
            {isRunning ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: '2px' }} />}
          </button>

          <button
            onClick={() => handleStep(-1)}
            className="sim3d-btn-secondary"
            style={{ padding: '6px', borderRadius: '6px' }}
            title={`Step Back ${stepSizeMin}m`}
          >
            <SkipBack size={14} />
          </button>

          <button
            onClick={() => handleStep(1)}
            className="sim3d-btn-secondary"
            style={{ padding: '6px', borderRadius: '6px' }}
            title={`Step Forward ${stepSizeMin}m`}
          >
            <SkipForward size={14} />
          </button>

          <button
            onClick={onReset}
            className="sim3d-btn-secondary"
            style={{ padding: '6px', borderRadius: '6px' }}
            title="Reset to Breach Origin (T=00:00:00)"
          >
            <RotateCcw size={14} />
          </button>

          {/* Simulation Clock */}
          <div className="sim3d-clock-display">
            <Clock size={14} color="#0284c7" />
            <span className="sim3d-clock-text">
              T + {formatSecondsToHHMMSS(currentSec)}
            </span>
          </div>
        </div>

        {/* Timestep selector buttons (5 / 15 / 30 min) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '10px', color: '#64748b' }}>Step:</span>
          <div className="sim3d-step-buttons">
            {stepOptions.map((step) => (
              <button
                key={step}
                onClick={() => onChangeStepSize(step)}
                className={`sim3d-step-btn ${stepSizeMin === step ? 'sim3d-step-btn-active' : ''}`}
              >
                {step}m
              </button>
            ))}
          </div>
        </div>

        {/* Quick Jump Buttons (0h, 1h, 2h, 4h, 6h, 8h, 12h) */}
        <div className="sim3d-quick-jumps">
          <span style={{ fontSize: '10px', color: '#64748b', marginRight: '2px' }}>Jump:</span>
          {quickJumpHours.map((h) => {
            const hSec = h * 3600;
            const isNear = Math.abs(currentSec - hSec) < 900;
            return (
              <button
                key={h}
                onClick={() => onChangeTimeSec(hSec)}
                className={`sim3d-jump-btn ${isNear ? 'sim3d-jump-btn-active' : ''}`}
              >
                {h}h
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Timeline Range Scrubber */}
      <div style={{ width: '100%', position: 'relative' }}>
        <input
          type="range"
          min="0"
          max={maxSec}
          step="30"
          value={currentSec}
          onChange={(e) => onChangeTimeSec(parseInt(e.target.value, 10))}
          className="sim3d-slider"
          style={{ width: '100%' }}
        />
      </div>
    </div>
  );
}

import React from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';

export default function TimelineBar({
  simTime,
  maxTime = 14400,
  isPlaying,
  onTogglePlay,
  onStepBack,
  onStepForward,
  onReset,
  timeStepMin,
  onChangeTimeStep,
  onSeek,
  onJump
}) {
  // Format seconds to T + HH:MM:SS
  const formatTime = (totalSec) => {
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    const hh = String(hours).padStart(2, '0');
    const mm = String(mins).padStart(2, '0');
    const ss = String(secs).padStart(2, '0');
    return `T + ${hh}h ${mm}m ${ss}s`;
  };

  const jumpMilestones = [
    { label: 'T+0', sec: 0 },
    { label: 'T+30m', sec: 1800 },
    { label: 'T+1h', sec: 3600 },
    { label: 'T+2h', sec: 7200 },
    { label: 'T+4h', sec: 14400 },
    { label: 'Peak (T+2.5h)', sec: 9000 }
  ];

  return (
    <div className="dt-timeline-bar">
      {/* Playback Transport Controls */}
      <div className="dt-timeline-ctrls">
        {/* Reset */}
        <button
          className="dt-icon-btn"
          title="Reset Simulation (T+0)"
          onClick={onReset}
        >
          <RotateCcw size={16} />
        </button>

        {/* Step Back */}
        <button
          className="dt-icon-btn"
          title={`Step Back ${timeStepMin} min`}
          onClick={onStepBack}
        >
          <ChevronLeft size={18} />
        </button>

        {/* Run / Pause */}
        <button
          className="dt-icon-btn primary"
          title={isPlaying ? 'Pause Simulation' : 'Run Simulation'}
          onClick={onTogglePlay}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: '2px' }} />}
        </button>

        {/* Step Forward */}
        <button
          className="dt-icon-btn"
          title={`Step Forward ${timeStepMin} min`}
          onClick={onStepForward}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Clock Readout */}
      <div className="dt-clock-box">
        <span className="dt-clock-val">{formatTime(simTime)}</span>
        <span className="dt-clock-sub">Simulation Time</span>
      </div>

      {/* Scrubber Progress Slider */}
      <div className="dt-scrubber-track">
        <input
          type="range"
          className="dt-scrubber"
          min="0"
          max={maxTime}
          step="60"
          value={simTime}
          onChange={(e) => onSeek(parseInt(e.target.value, 10))}
        />
      </div>

      {/* Timestep Selector: 5 / 15 / 30 min */}
      <div className="dt-chip-group">
        <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, padding: '0 4px', textTransform: 'uppercase' }}>
          Step:
        </span>
        <button
          className={`dt-chip ${timeStepMin === 5 ? 'active' : ''}`}
          onClick={() => onChangeTimeStep(5)}
        >
          5m
        </button>
        <button
          className={`dt-chip ${timeStepMin === 15 ? 'active' : ''}`}
          onClick={() => onChangeTimeStep(15)}
        >
          15m
        </button>
        <button
          className={`dt-chip ${timeStepMin === 30 ? 'active' : ''}`}
          onClick={() => onChangeTimeStep(30)}
        >
          30m
        </button>
      </div>

      {/* Quick Jump Buttons */}
      <div className="dt-jumps-group">
        <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, padding: '0 4px', textTransform: 'uppercase' }}>
          Jump:
        </span>
        {jumpMilestones.map((j) => (
          <button
            key={j.label}
            className="dt-jump-btn"
            onClick={() => onJump(j.sec)}
          >
            {j.label}
          </button>
        ))}
      </div>
    </div>
  );
}

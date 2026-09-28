import React from 'react';
import { 
  Box, 
  Map, 
  Layers, 
  Sliders, 
  Activity, 
  Flame, 
  Compass,
  Zap,
  Info
} from 'lucide-react';
import { DT_SCENARIOS } from '../data/scenarios';

export default function DarkHudPanel({
  activeMode,
  onSelectMode,
  selectedScenario,
  onSelectScenario,
  params,
  onChangeParam,
  isBreached,
  onTriggerBreach,
  simTime,
  maxTime = 14400
}) {
  const waveProgress = Math.min(1.0, Math.max(0, simTime / maxTime));

  // Dynamic Telemetry Computations
  const liveDischarge = isBreached 
    ? Math.round(params.peakDischargeM3s * Math.sin(Math.min(Math.PI, waveProgress * Math.PI)))
    : Math.round(params.peakDischargeM3s * 0.08);

  const liveMaxDepth = isBreached
    ? (params.waterLevelM * 0.22 * Math.min(1.2, 0.4 + waveProgress * 0.8)).toFixed(1)
    : '1.2';

  const liveInundationKm2 = isBreached
    ? (selectedScenario.maxFloodExtentKm2 * waveProgress).toFixed(1)
    : '4.5';

  const liveReservoirDepletion = isBreached
    ? Math.min(100, Math.round(waveProgress * 85 + 5))
    : 0;

  // Arc Gauge Angle calculation
  const gaugePercent = Math.min(1.0, liveDischarge / 35000);
  const strokeDashoffset = 251.2 * (1 - gaugePercent * 0.75);

  return (
    <>
      {/* Top Header Mode Switcher Bar */}
      <div className="dt-top-bar">
        {/* Left Platform Identity */}
        <div className="dt-brand-badge">
          <div className="dt-brand-icon">
            <Zap size={18} />
          </div>
          <div>
            <div className="dt-brand-title">
              Digital Twin Simulation
              <span style={{ fontSize: '9px', padding: '2px 5px', borderRadius: '4px', background: 'rgba(2, 132, 199, 0.1)', border: '1px solid rgba(2, 132, 199, 0.3)', color: '#0284c7', fontWeight: 700 }}>
                HPC 3D ENGINE
              </span>
            </div>
            <div className="dt-brand-subtitle">Hydrodynamic Dam Breach & Inundation Twin</div>
          </div>
        </div>

        {/* Center Mode Switcher: Simulate | Impact | Risk Map */}
        <div className="dt-mode-switcher">
          <button
            className={`dt-mode-btn ${activeMode === 'simulate' ? 'active' : ''}`}
            onClick={() => onSelectMode('simulate')}
          >
            <Box size={16} />
            <span>Simulate (3D Diorama)</span>
          </button>

          <button
            className={`dt-mode-btn ${activeMode === 'impact' ? 'active' : ''}`}
            onClick={() => onSelectMode('impact')}
          >
            <Map size={16} />
            <span>Impact (Satellite Heatmap)</span>
          </button>

          <button
            className={`dt-mode-btn ${activeMode === 'risk' ? 'active' : ''}`}
            onClick={() => onSelectMode('risk')}
          >
            <Layers size={16} />
            <span>Risk Map (Holographic)</span>
          </button>
        </div>

        {/* Right Status Indicator */}
        <div className="dt-status-pill">
          <div className={`dt-status-dot ${isBreached ? 'active' : ''}`} />
          <span style={{ fontWeight: 700, color: isBreached ? '#dc2626' : '#059669' }}>
            {isBreached ? 'HYDRAULIC BREACH ACTIVE' : 'STEADY POOL STORAGE'}
          </span>
        </div>
      </div>

      {/* Left HUD Panel: Controls, Breach, Scenario, Parameters */}
      <aside className="dt-hud-left">
        <div className="dt-hud-scrollable">
          {/* Emergency Breach Trigger Button */}
          <button
            className={`dt-breach-btn ${isBreached ? 'breached' : ''}`}
            onClick={onTriggerBreach}
          >
            <div className="dt-breach-stripes" />
            <Flame size={18} color={isBreached ? '#fef08a' : '#ffffff'} />
            <span>{isBreached ? 'BREACH TRIGGERED (SURGING)' : 'BREACH DAM & SIMULATE'}</span>
          </button>

          {/* Scenario Selection */}
          <div className="dt-card">
            <div className="dt-card-header">
              <span className="dt-card-title">
                <Compass size={13} color="#0284c7" />
                Scenario Selection
              </span>
              <span style={{ fontSize: '10px', color: '#64748b', fontFamily: 'monospace' }}>
                {DT_SCENARIOS.length} MODELS
              </span>
            </div>

            <select
              className="dt-scenario-select"
              value={selectedScenario.id}
              onChange={(e) => {
                const s = DT_SCENARIOS.find((item) => item.id === e.target.value);
                if (s) onSelectScenario(s);
              }}
            >
              {DT_SCENARIOS.map((s) => (
                <option key={s.id} value={s.id} style={{ background: '#ffffff', color: '#0f172a' }}>
                  {s.name}
                </option>
              ))}
            </select>

            <div className="dt-scenario-desc">
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>{selectedScenario.river}</div>
              <div style={{ color: '#475569' }}>{selectedScenario.type} • {selectedScenario.location}</div>
            </div>
          </div>

          {/* Parameter Sliders */}
          <div className="dt-card">
            <div className="dt-card-header">
              <span className="dt-card-title">
                <Sliders size={13} color="#0284c7" />
                Breach Hydraulic Parameters
              </span>
              <span style={{ fontSize: '10px', color: '#0284c7', fontWeight: 700 }}>
                FROEHLICH (2008)
              </span>
            </div>

            <div className="dt-slider-group">
              {/* Breach Width Slider */}
              <div className="dt-slider-row">
                <div className="dt-slider-labels">
                  <span className="dt-slider-name">Breach Width (B_avg)</span>
                  <span className="dt-slider-val">{params.breachWidthM} m</span>
                </div>
                <input
                  type="range"
                  className="dt-range"
                  min="50"
                  max="400"
                  step="10"
                  value={params.breachWidthM}
                  onChange={(e) => onChangeParam('breachWidthM', parseFloat(e.target.value))}
                />
              </div>

              {/* Formation Time Slider */}
              <div className="dt-slider-row">
                <div className="dt-slider-labels">
                  <span className="dt-slider-name">Formation Time (t_f)</span>
                  <span className="dt-slider-val">{params.formationTimeMin} min</span>
                </div>
                <input
                  type="range"
                  className="dt-range"
                  min="10"
                  max="120"
                  step="5"
                  value={params.formationTimeMin}
                  onChange={(e) => onChangeParam('formationTimeMin', parseFloat(e.target.value))}
                />
              </div>

              {/* Initial Water Level Slider */}
              <div className="dt-slider-row">
                <div className="dt-slider-labels">
                  <span className="dt-slider-name">Initial Water Level (H_w)</span>
                  <span className="dt-slider-val">{params.waterLevelM} m</span>
                </div>
                <input
                  type="range"
                  className="dt-range"
                  min="20"
                  max="80"
                  step="2"
                  value={params.waterLevelM}
                  onChange={(e) => onChangeParam('waterLevelM', parseFloat(e.target.value))}
                />
              </div>

              {/* Peak Discharge Slider */}
              <div className="dt-slider-row">
                <div className="dt-slider-labels">
                  <span className="dt-slider-name">Peak Discharge (Q_p)</span>
                  <span className="dt-slider-val">{params.peakDischargeM3s.toLocaleString()} m³/s</span>
                </div>
                <input
                  type="range"
                  className="dt-range"
                  min="5000"
                  max="35000"
                  step="500"
                  value={params.peakDischargeM3s}
                  onChange={(e) => onChangeParam('peakDischargeM3s', parseFloat(e.target.value))}
                />
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Right HUD Panel: Gauges, Telemetry & Legend */}
      <aside className="dt-hud-right">
        <div className="dt-hud-scrollable">
          {/* Hydraulic Radial Discharge Gauge */}
          <div className="dt-card">
            <div className="dt-card-header">
              <span className="dt-card-title">
                <Activity size={13} color="#0284c7" />
                Live Breach Discharge
              </span>
              <span style={{ fontSize: '10px', color: isBreached ? '#dc2626' : '#059669', fontWeight: 700 }}>
                {isBreached ? 'SURGING' : 'BASEFLOW'}
              </span>
            </div>

            <div className="dt-gauge-container">
              <svg width="150" height="120" viewBox="0 0 100 80">
                {/* Background Track Arc */}
                <path
                  d="M 15 70 A 40 40 0 1 1 85 70"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                {/* Value Glow Arc */}
                <path
                  d="M 15 70 A 40 40 0 1 1 85 70"
                  fill="none"
                  stroke={liveDischarge > 15000 ? '#ef4444' : '#0284c7'}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="251.2"
                  strokeDashoffset={strokeDashoffset}
                  style={{ transition: 'stroke-dashoffset 0.3s ease, stroke 0.3s ease' }}
                />
              </svg>

              <div className="dt-gauge-center" style={{ bottom: '15px' }}>
                <span style={{ fontSize: '18px', fontWeight: 900, fontFamily: 'monospace', color: '#0f172a' }}>
                  {liveDischarge.toLocaleString()}
                </span>
                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>m³ / sec</span>
              </div>
            </div>
          </div>

          {/* Telemetry Grid */}
          <div className="dt-telemetry-grid">
            <div className="dt-telemetry-box">
              <span className="dt-telemetry-label">Peak Flood Depth</span>
              <div className="dt-telemetry-num">
                <span>{liveMaxDepth}</span>
                <span className="dt-telemetry-unit">meters</span>
              </div>
            </div>

            <div className="dt-telemetry-box">
              <span className="dt-telemetry-label">Flood Extent</span>
              <div className="dt-telemetry-num">
                <span>{liveInundationKm2}</span>
                <span className="dt-telemetry-unit">km²</span>
              </div>
            </div>

            <div className="dt-telemetry-box">
              <span className="dt-telemetry-label">Reservoir Outflow</span>
              <div className="dt-telemetry-num">
                <span>{liveReservoirDepletion}</span>
                <span className="dt-telemetry-unit">% loss</span>
              </div>
            </div>

            <div className="dt-telemetry-box">
              <span className="dt-telemetry-label">Wave Velocity</span>
              <div className="dt-telemetry-num">
                <span>{(selectedScenario.peakVelocityMs || 5.8).toFixed(1)}</span>
                <span className="dt-telemetry-unit">m / s</span>
              </div>
            </div>
          </div>

          {/* Visual Legend */}
          <div className="dt-card">
            <div className="dt-card-header">
              <span className="dt-card-title">
                <Info size={13} color="#0284c7" />
                Cartographic Legend
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginBottom: '4px' }}>
                  <span>Water Depth (m)</span>
                  <span>0m → 10m+</span>
                </div>
                <div className="dt-heatmap-gradient" />
                <div className="dt-heatmap-labels" style={{ marginTop: '2px' }}>
                  <span>0m</span>
                  <span>2m</span>
                  <span>4m</span>
                  <span>7m</span>
                  <span>10m+</span>
                </div>
              </div>

              <div className="dt-legend-row" style={{ marginTop: '4px' }}>
                <div className="dt-legend-dot" style={{ background: '#ef4444' }} />
                <span>Extreme Risk Zone (&gt;6m or torrent)</span>
              </div>

              <div className="dt-legend-row">
                <div className="dt-legend-dot" style={{ background: '#f59e0b' }} />
                <span>High / Moderate Risk (2m - 6m)</span>
              </div>

              <div className="dt-legend-row">
                <div className="dt-legend-dot" style={{ background: '#10b981' }} />
                <span>Safe High-Ground Evacuation Zones</span>
              </div>

              <div className="dt-legend-row">
                <div style={{ width: '12px', height: '2px', background: '#059669', borderTop: '2px dashed #10b981' }} />
                <span>Evacuation Route Polylines</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

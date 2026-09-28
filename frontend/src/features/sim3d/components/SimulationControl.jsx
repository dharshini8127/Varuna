import React from 'react';
import { 
  Sliders, 
  Play, 
  Pause, 
  RotateCcw, 
  Building2, 
  Home, 
  Activity, 
  ShieldCheck, 
  Waves,
  AlertTriangle,
  Layers
} from 'lucide-react';

export default function SimulationControl({
  scenarios,
  selectedScenario,
  onSelectScenario,
  params,
  onChangeParam,
  onResetParams,
  onRunSimulation,
  isRunning,
  infrastructureStatuses
}) {
  return (
    <div className="sim3d-panel sim3d-left-panel">
      {/* Header */}
      <div className="sim3d-panel-header">
        <h3 className="sim3d-panel-title">
          <Sliders size={16} color="#0284c7" />
          <span>Simulation Control</span>
        </h3>
        <button 
          onClick={onResetParams}
          className="sim3d-btn-secondary" 
          title="Reset to scenario baseline parameters"
          style={{ padding: '3px 7px', fontSize: '10px' }}
        >
          <RotateCcw size={11} />
          <span>Defaults</span>
        </button>
      </div>

      {/* Scenario Select */}
      <div>
        <label className="sim3d-section-title">
          <Layers size={12} color="#0284c7" />
          <span>Hydrodynamic Scenario</span>
        </label>
        <select
          value={selectedScenario.id}
          onChange={(e) => {
            const found = scenarios.find((s) => s.id === e.target.value);
            if (found) onSelectScenario(found);
          }}
          className="sim3d-select"
        >
          {scenarios.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Parametric Sliders */}
      <div className="sim3d-slider-group">
        <div className="sim3d-section-title">
          <span>Breach & Hydraulic Parameters</span>
        </div>

        {/* Breach Width */}
        <div className="sim3d-slider-row">
          <div className="sim3d-slider-label">
            <span>Breach Width:</span>
            <span className="sim3d-slider-val">{params.breachWidthM} m</span>
          </div>
          <input
            type="range"
            min="50"
            max="500"
            step="10"
            value={params.breachWidthM}
            onChange={(e) => onChangeParam('breachWidthM', parseFloat(e.target.value))}
            className="sim3d-slider"
          />
        </div>

        {/* Formation Time */}
        <div className="sim3d-slider-row">
          <div className="sim3d-slider-label">
            <span>Formation Time:</span>
            <span className="sim3d-slider-val">{params.formationTimeMin} min</span>
          </div>
          <input
            type="range"
            min="15"
            max="180"
            step="5"
            value={params.formationTimeMin}
            onChange={(e) => onChangeParam('formationTimeMin', parseFloat(e.target.value))}
            className="sim3d-slider"
          />
        </div>

        {/* Initial Water Level */}
        <div className="sim3d-slider-row">
          <div className="sim3d-slider-label">
            <span>Initial Water Level:</span>
            <span className="sim3d-slider-val">{params.waterLevelM} m</span>
          </div>
          <input
            type="range"
            min="10"
            max="80"
            step="1"
            value={params.waterLevelM}
            onChange={(e) => onChangeParam('waterLevelM', parseFloat(e.target.value))}
            className="sim3d-slider"
          />
        </div>

        {/* Peak Discharge Rate */}
        <div className="sim3d-slider-row">
          <div className="sim3d-slider-label">
            <span>Peak Discharge Rate:</span>
            <span className="sim3d-slider-val">{params.peakDischargeM3s.toLocaleString()} m³/s</span>
          </div>
          <input
            type="range"
            min="2000"
            max="45000"
            step="500"
            value={params.peakDischargeM3s}
            onChange={(e) => onChangeParam('peakDischargeM3s', parseFloat(e.target.value))}
            className="sim3d-slider"
          />
        </div>
      </div>

      {/* Run Simulation Button */}
      <button onClick={onRunSimulation} className="sim3d-btn-primary" style={{ width: '100%' }}>
        {isRunning ? <Pause size={14} /> : <Play size={14} />}
        <span>{isRunning ? 'Pause 3D Timeline' : 'Run Simulation'}</span>
      </button>

      {/* Critical Infrastructure List */}
      <div>
        <div className="sim3d-section-title" style={{ marginTop: '4px' }}>
          <Building2 size={12} color="#0284c7" />
          <span>Critical Infrastructure Status</span>
        </div>

        <div className="sim3d-infra-list">
          {infrastructureStatuses.map((item) => {
            let Icon = Home;
            if (item.type === 'bridge') Icon = Activity;
            if (item.type === 'shelter') Icon = ShieldCheck;

            const badgeClass =
              item.status === 'FLOODED'
                ? 'sim3d-badge-flooded'
                : item.status === 'AT RISK'
                ? 'sim3d-badge-risk'
                : 'sim3d-badge-safe';

            return (
              <div key={item.id} className="sim3d-infra-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon size={14} color={item.status === 'FLOODED' ? '#e11d48' : item.status === 'AT RISK' ? '#d97706' : '#059669'} />
                  <div>
                    <div className="sim3d-infra-name">{item.name}</div>
                    <div className="sim3d-infra-meta">
                      {item.displayLabel}
                    </div>
                  </div>
                </div>
                <span className={`sim3d-badge ${badgeClass}`}>
                  {item.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

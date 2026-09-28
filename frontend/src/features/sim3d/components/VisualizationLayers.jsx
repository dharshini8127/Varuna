import React from 'react';
import { 
  Eye, 
  Droplet, 
  Layers, 
  Gauge, 
  Clock, 
  Camera, 
  Compass, 
  Navigation, 
  ShieldAlert,
  Info
} from 'lucide-react';

export default function VisualizationLayers({
  layerMode,
  onChangeLayerMode,
  cameraMode,
  onSelectCamera,
  showEvacuationRoutes,
  onToggleEvacuationRoutes
}) {
  const layerOptions = [
    { id: 'realistic', label: 'Realistic Water', icon: Droplet },
    { id: 'depth', label: 'Water Depth', icon: Layers },
    { id: 'velocity', label: 'Flow Velocity', icon: Gauge },
    { id: 'arrival', label: 'Arrival Time', icon: Clock }
  ];

  const cameraOptions = [
    { id: 'perspective', label: 'Perspective', icon: Compass },
    { id: 'top', label: 'Top View', icon: Eye },
    { id: 'dam', label: 'Dam / Breach', icon: ShieldAlert },
    { id: 'follow', label: 'Follow Flood Front', icon: Navigation }
  ];

  return (
    <div className="sim3d-panel sim3d-right-panel">
      {/* Header */}
      <div className="sim3d-panel-header">
        <h3 className="sim3d-panel-title">
          <Eye size={16} color="#0284c7" />
          <span>Visualization Layers</span>
        </h3>
      </div>

      {/* Layer Modes */}
      <div>
        <div className="sim3d-section-title">
          <span>Simulation Layer Mode</span>
        </div>
        <div className="sim3d-layer-modes">
          {layerOptions.map((opt) => {
            const Icon = opt.icon;
            const isActive = layerMode === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => onChangeLayerMode(opt.id)}
                className={`sim3d-layer-btn ${isActive ? 'sim3d-layer-btn-active' : ''}`}
              >
                <Icon size={13} color={isActive ? '#0284c7' : '#64748b'} />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Water-Depth / Mode Legend */}
      <div className="sim3d-legend">
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: '600', color: '#475569' }}>
          <span>{layerMode === 'velocity' ? 'Velocity Colormap (m/s)' : layerMode === 'arrival' ? 'Isochrone Waves (Arrival)' : 'Inundation Depth Colormap'}</span>
          <span>{layerMode === 'velocity' ? '0 → 8 m/s' : layerMode === 'arrival' ? 'T+0 → T+12h' : '<1m → >5m'}</span>
        </div>

        {layerMode === 'velocity' ? (
          <div className="sim3d-legend-bar">
            <div className="sim3d-legend-item" style={{ background: '#06b6d4' }} />
            <div className="sim3d-legend-item" style={{ background: '#10b981' }} />
            <div className="sim3d-legend-item" style={{ background: '#f59e0b' }} />
            <div className="sim3d-legend-item" style={{ background: '#e11d48' }} />
          </div>
        ) : layerMode === 'arrival' ? (
          <div className="sim3d-legend-bar">
            <div className="sim3d-legend-item" style={{ background: '#7c3aed' }} />
            <div className="sim3d-legend-item" style={{ background: '#0284c7' }} />
            <div className="sim3d-legend-item" style={{ background: '#38bdf8' }} />
            <div className="sim3d-legend-item" style={{ background: '#f59e0b' }} />
          </div>
        ) : (
          <div className="sim3d-legend-bar">
            <div className="sim3d-legend-item" style={{ background: '#22d3ee' }} />
            <div className="sim3d-legend-item" style={{ background: '#3b82f6' }} />
            <div className="sim3d-legend-item" style={{ background: '#1d4ed8' }} />
            <div className="sim3d-legend-item" style={{ background: '#be123c' }} />
          </div>
        )}

        <div className="sim3d-legend-labels">
          {layerMode === 'velocity' ? (
            <>
              <span>Tranquil (&lt;1)</span>
              <span>1-2 m/s</span>
              <span>2-4 m/s</span>
              <span>Torrent (&gt;4)</span>
            </>
          ) : layerMode === 'arrival' ? (
            <>
              <span>T+0h Breach</span>
              <span>T+2h Wave</span>
              <span>T+6h Confluence</span>
              <span>T+12h Valley</span>
            </>
          ) : (
            <>
              <span>&lt; 1m (Shallow)</span>
              <span>1 - 3m</span>
              <span>3 - 5m</span>
              <span>&gt; 5m (Severe)</span>
            </>
          )}
        </div>
      </div>

      {/* Camera Navigation Presets */}
      <div>
        <div className="sim3d-section-title">
          <Camera size={12} color="#0284c7" />
          <span>Camera Presets</span>
        </div>
        <div className="sim3d-cam-grid">
          {cameraOptions.map((opt) => {
            const Icon = opt.icon;
            const isActive = cameraMode === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => onSelectCamera(opt.id)}
                className={`sim3d-btn-secondary ${isActive ? 'sim3d-layer-btn-active' : ''}`}
                style={{ padding: '6px 8px', fontSize: '10.5px' }}
              >
                <Icon size={12} color={isActive ? '#0284c7' : '#64748b'} />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Evacuation Routes Toggle */}
      <div>
        <button
          onClick={onToggleEvacuationRoutes}
          className={`sim3d-btn-secondary ${showEvacuationRoutes ? 'sim3d-layer-btn-active' : ''}`}
          style={{ width: '100%', justifyContent: 'space-between', padding: '8px 10px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: showEvacuationRoutes ? '#059669' : '#94a3b8'
            }} />
            <span style={{ fontWeight: '600', fontSize: '11px' }}>Show Evacuation Routes</span>
          </div>
          <span style={{ fontSize: '10px', color: showEvacuationRoutes ? '#059669' : '#64748b', fontWeight: 'bold' }}>
            {showEvacuationRoutes ? 'ON' : 'OFF'}
          </span>
        </button>
      </div>

      {/* Scientific Solver Info Box */}
      <div className="sim3d-info-box">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', marginBottom: '2px' }}>
          <Info size={13} />
          <span>Hybrid Hydrodynamic Pipeline</span>
        </div>
        <div>
          Near-field breach: <strong>SPH (particle solver)</strong>. Downstream river: <strong>Delft3D-FM (flexible mesh)</strong>.
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Waves, Gauge, Zap, Home, Users } from 'lucide-react';

export default function FooterStats({
  scenarioName,
  simState,
  villagesAffectedCount,
  populationAtRiskCount
}) {
  return (
    <footer className="sim3d-footer">
      <div className="sim3d-stats-group">
        <div className="sim3d-stat-item">
          <span style={{ color: '#64748b' }}>Scenario:</span>
          <span className="sim3d-stat-val" style={{ color: '#0284c7' }}>{scenarioName}</span>
        </div>

        <div className="sim3d-stat-item">
          <Waves size={12} color="#0284c7" />
          <span style={{ color: '#64748b' }}>Extent:</span>
          <span className="sim3d-stat-val">{simState.extentKm2} km²</span>
        </div>

        <div className="sim3d-stat-item">
          <Gauge size={12} color="#e11d48" />
          <span style={{ color: '#64748b' }}>Max Depth:</span>
          <span className="sim3d-stat-val" style={{ color: '#e11d48' }}>{simState.maxDepthM} m</span>
        </div>

        <div className="sim3d-stat-item">
          <Zap size={12} color="#d97706" />
          <span style={{ color: '#64748b' }}>Peak Velocity:</span>
          <span className="sim3d-stat-val" style={{ color: '#d97706' }}>{simState.peakVelocityMs} m/s</span>
        </div>

        <div className="sim3d-stat-item">
          <Home size={12} color="#7c3aed" />
          <span style={{ color: '#64748b' }}>Villages Affected:</span>
          <span className="sim3d-stat-val" style={{ color: '#7c3aed' }}>{villagesAffectedCount}</span>
        </div>

        <div className="sim3d-stat-item">
          <Users size={12} color="#f43f5e" />
          <span style={{ color: '#64748b' }}>Pop at Risk:</span>
          <span className="sim3d-stat-val" style={{ color: '#f43f5e' }}>{populationAtRiskCount.toLocaleString()}</span>
        </div>
      </div>

      {/* Permanent Academic Prototype Disclaimer */}
      <div className="sim3d-disclaimer">
        ⚠️ Academic prototype using precomputed/sample simulation outputs. Not an operational flood-warning system. All values are estimates.
      </div>
    </footer>
  );
}

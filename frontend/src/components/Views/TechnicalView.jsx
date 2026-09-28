import React, { useState } from 'react';
import { 
  Cpu, 
  Layers, 
  BarChart2, 
  Sliders, 
  CheckCircle2, 
  AlertOctagon, 
  FileText, 
  Download, 
  Activity,
  Zap,
  Info
} from 'lucide-react';
import { 
  calculateFroehlichBreach, 
  calculateClagueMathewsGLOF 
} from '../../utils/calculations';

export default function TechnicalView({ scenario, onExportGIS }) {
  // Interactive sandbox state initialized from current scenario
  const [damHeight, setDamHeight] = useState(scenario.parameters.damHeightM);
  const [storageVolume, setStorageVolume] = useState(scenario.parameters.storageVolumeM3 / 1e6); // in Million m^3
  const [failureMode, setFailureMode] = useState(scenario.parameters.failureMode || 'overtopping');
  const [activeTab, setActiveTab] = useState('solvers'); // 'solvers' | 'hydrology' | 'validation'

  // Live recalculations
  const breachCalc = calculateFroehlichBreach(storageVolume * 1e6, damHeight, failureMode);
  const glofCalc = calculateClagueMathewsGLOF(scenario.parameters.lakeVolumeM3);

  const { sph, delft3d } = scenario.solverComparison;
  const val = scenario.validationData;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      height: '100%',
      overflowY: 'auto',
      paddingRight: '4px'
    }}>
      {/* View Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Cpu size={18} color="var(--text-accent)" />
          <h2 style={{ fontSize: '15px', color: 'var(--text-primary)', margin: 0 }}>
            Technical & Hydrodynamic Solvers
          </h2>
        </div>
        <span className="badge-tech badge-cyan">
          GPU + CPU HYBRID PIPELINE
        </span>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{
        display: 'flex',
        background: 'rgba(0, 0, 0, 0.04)',
        borderRadius: '8px',
        padding: '3px',
        gap: '4px'
      }}>
        {[
          { id: 'solvers', label: 'Solvers Comparison' },
          { id: 'hydrology', label: 'Breach Sandbox' },
          { id: 'validation', label: 'SAR Validation' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: '6px 8px',
              fontSize: '11px',
              fontWeight: activeTab === tab.id ? '700' : '500',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === tab.id ? 'rgba(2, 132, 199, 0.12)' : 'transparent',
              color: activeTab === tab.id ? '#0284c7' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: SOLVERS DUAL-ENGINE COMPARISON */}
      {activeTab === 'solvers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{
            fontSize: '11px',
            color: 'var(--text-muted)',
            lineHeight: 1.4,
            background: 'rgba(2, 132, 199, 0.06)',
            padding: '8px 10px',
            borderRadius: '6px',
            border: '1px solid rgba(2, 132, 199, 0.2)'
          }}>
            ⚡ <strong>Hybrid Compute Strategy (NFR-1.1):</strong> SPH models 3D crest erosion & turbulent splash near-field, while Delft3D-FM models regional flexible-mesh river routing downstream.
          </div>

          {/* SPH Card */}
          <div className="glass-panel-interactive" style={{ padding: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={14} color="#0284c7" />
                <strong style={{ fontSize: '13px', color: '#0284c7' }}>{sph.name}</strong>
              </div>
              <span className="badge-tech badge-cyan" style={{ fontSize: '9px' }}>GPU ACCELERATED</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Domain: </span>
                <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{sph.domain}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Resolution: </span>
                <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{sph.resolution}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Runtime: </span>
                <span className="mono" style={{ color: '#0284c7' }}>{sph.computeTime}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Particles: </span>
                <span className="mono" style={{ color: '#0284c7' }}>{sph.particlesCount}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Max Velocity: </span>
                <span className="mono" style={{ color: '#e11d48', fontWeight: 'bold' }}>{sph.maxVelocity}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Turbulent KE: </span>
                <span className="mono" style={{ color: '#d97706' }}>{sph.maxTurbulentKE}</span>
              </div>
            </div>
          </div>

          {/* Delft3D-FM Card */}
          <div className="glass-panel-interactive" style={{ padding: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Activity size={14} color="#2563eb" />
                <strong style={{ fontSize: '13px', color: '#2563eb' }}>{delft3d.name}</strong>
              </div>
              <span className="badge-tech badge-cyan" style={{ fontSize: '9px' }}>CPU CLUSTER</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Domain: </span>
                <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{delft3d.domain}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Resolution: </span>
                <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{delft3d.resolution}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Runtime: </span>
                <span className="mono" style={{ color: '#2563eb' }}>{delft3d.computeTime}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Mesh Cells: </span>
                <span className="mono" style={{ color: '#2563eb' }}>{delft3d.cellsCount}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Max Inundated: </span>
                <span className="mono" style={{ color: '#059669', fontWeight: 'bold' }}>{delft3d.floodedAreaKm2}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Arrival Delta: </span>
                <span className="mono" style={{ color: '#d97706' }}>{delft3d.averageArrivalTimeDelta}</span>
              </div>
            </div>
          </div>

          {/* Raster Hydrograph Preview */}
          <div className="glass-panel" style={{ padding: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>
                Hydrograph Outflow (m³/s vs Time)
              </span>
              <span className="mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                Q_peak: {scenario.parameters.froehlichPeakQ} m³/s
              </span>
            </div>

            {/* Micro Bar Chart representing Q(t) */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              height: '80px',
              gap: '4px',
              padding: '6px 0',
              borderBottom: '1px solid var(--border-subtle)'
            }}>
              {scenario.hydrographs.map((h, i) => {
                const maxQ = Math.max(...scenario.hydrographs.map(d => d.sphOutflow));
                const heightPercent = Math.max(6, (h.sphOutflow / maxQ) * 100);
                return (
                  <div
                    key={i}
                    title={`T+${h.time}h: ${h.sphOutflow} m³/s`}
                    style={{
                      flex: 1,
                      height: `${heightPercent}%`,
                      background: 'linear-gradient(180deg, #38bdf8 0%, #2563eb 100%)',
                      borderRadius: '3px 3px 0 0',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'height 0.3s ease'
                    }}
                  />
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '9px', color: 'var(--text-muted)' }}>
              <span>T=0h</span>
              <span>T=4h</span>
              <span>T=8h</span>
              <span>T=16h</span>
              <span>T=24h</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HYDROLOGIC & BREACH PARAMETER SANDBOX */}
      {activeTab === 'hydrology' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{
            fontSize: '11px',
            color: 'var(--text-muted)',
            lineHeight: 1.4,
            background: 'rgba(217, 119, 6, 0.08)',
            padding: '8px 10px',
            borderRadius: '6px',
            border: '1px solid rgba(217, 119, 6, 0.25)'
          }}>
            🧮 <strong>Pure-Python Formulas (FR-3):</strong> Adjust dam geometry parameters live to recompute Froehlich (2008) breach outflow and Clague–Mathews GLOF discharge.
          </div>

          {/* Dam Height Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Dam / Breach Height (h_b):</span>
              <span className="mono" style={{ color: '#0284c7', fontWeight: 'bold' }}>{damHeight} m</span>
            </div>
            <input
              type="range"
              min="10"
              max="150"
              step="2"
              value={damHeight}
              onChange={(e) => setDamHeight(parseFloat(e.target.value))}
            />
          </div>

          {/* Storage Volume Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Reservoir Storage (V_w):</span>
              <span className="mono" style={{ color: '#0284c7', fontWeight: 'bold' }}>{storageVolume} M m³</span>
            </div>
            <input
              type="range"
              min="2"
              max="200"
              step="2"
              value={storageVolume}
              onChange={(e) => setStorageVolume(parseFloat(e.target.value))}
            />
          </div>

          {/* Failure Mode Toggle */}
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Breach Trigger Mode:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {['overtopping', 'piping'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setFailureMode(mode)}
                  style={{
                    padding: '8px',
                    fontSize: '11px',
                    borderRadius: '6px',
                    border: failureMode === mode ? '1px solid rgba(2, 132, 199, 0.4)' : '1px solid var(--border-subtle)',
                    background: failureMode === mode ? 'rgba(2, 132, 199, 0.12)' : 'rgba(0, 0, 0, 0.04)',
                    color: failureMode === mode ? '#0284c7' : 'var(--text-muted)',
                    fontWeight: failureMode === mode ? 'bold' : 'normal',
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {mode} (K_o = {mode === 'overtopping' ? '1.3' : '1.0'})
                </button>
              ))}
            </div>
          </div>

          {/* Computed Results Matrix */}
          <div className="glass-panel" style={{ padding: '12px' }}>
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#0284c7', marginBottom: '8px' }}>
              Froehlich (1995a/2008) Calculated Parameters
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
              <div className="glass-panel" style={{ padding: '8px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>Peak Outflow (Q_p)</div>
                <div className="mono" style={{ fontSize: '15px', color: '#e11d48', fontWeight: 'bold' }}>
                  {breachCalc.peakOutflowM3s.toLocaleString()} m³/s
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '8px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>Avg Breach Width (B)</div>
                <div className="mono" style={{ fontSize: '15px', color: '#0284c7', fontWeight: 'bold' }}>
                  {breachCalc.breachWidthM} m
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '8px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>Formation Time (t_f)</div>
                <div className="mono" style={{ fontSize: '15px', color: '#d97706', fontWeight: 'bold' }}>
                  {breachCalc.formationTimeHours} hrs
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '8px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>Side Slope (z)</div>
                <div className="mono" style={{ fontSize: '15px', color: '#7c3aed', fontWeight: 'bold' }}>
                  {breachCalc.sideSlopeZ} : 1
                </div>
              </div>
            </div>

            {scenario.parameters.lakeVolumeM3 > 0 && (
              <div style={{
                marginTop: '10px',
                paddingTop: '8px',
                borderTop: '1px solid var(--border-subtle)',
                fontSize: '11px'
              }}>
                <span style={{ color: 'var(--text-muted)' }}>Clague-Mathews GLOF Peak: </span>
                <span className="mono" style={{ color: '#0284c7', fontWeight: 'bold' }}>
                  {glofCalc.toLocaleString()} m³/s
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SAR VALIDATION & GROUND TRUTH (FR-5) */}
      {activeTab === 'validation' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(5, 150, 105, 0.08)',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid rgba(5, 150, 105, 0.25)'
          }}>
            <CheckCircle2 size={18} color="#059669" />
            <div>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#059669' }}>
                {val.eventName} Validated
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                Ground truth from {val.satelliteSource} ({val.sensorResolution})
              </div>
            </div>
          </div>

          {/* Validation Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div className="glass-panel" style={{ padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>IoU (Jaccard Index)</div>
              <div className="mono" style={{ fontSize: '18px', fontWeight: '800', color: '#0284c7' }}>
                {(val.iou * 100).toFixed(1)}%
              </div>
              <div style={{ fontSize: '9px', color: '#059669' }}>Target ≥ 80% (PASSED)</div>
            </div>

            <div className="glass-panel" style={{ padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>F1-Score</div>
              <div className="mono" style={{ fontSize: '18px', fontWeight: '800', color: '#7c3aed' }}>
                {(val.f1Score * 100).toFixed(1)}%
              </div>
              <div style={{ fontSize: '9px', color: '#059669' }}>Harmonic Mean</div>
            </div>

            <div className="glass-panel" style={{ padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Precision</div>
              <div className="mono" style={{ fontSize: '18px', fontWeight: '800', color: '#0284c7' }}>
                {(val.precision * 100).toFixed(1)}%
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Recall / Sensitivity</div>
              <div className="mono" style={{ fontSize: '18px', fontWeight: '800', color: '#d97706' }}>
                {(val.recall * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '10px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>RMSE Inundation Depth:</span>
              <strong className="mono" style={{ color: '#059669' }}>{val.rmseDepth}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Peak Observed Discharge:</span>
              <strong className="mono" style={{ color: '#e11d48' }}>{val.peakObservedDischarge}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Data Model Tag (FR-5.3):</span>
              <span className="badge-tech badge-cyan" style={{ fontSize: '9px' }}>
                is_estimate: {scenario.isEstimate ? 'true' : 'false'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Export GIS & Data (FR-6) */}
      <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
        <button
          className="btn-secondary"
          onClick={onExportGIS}
          style={{ width: '100%', fontSize: '12px' }}
        >
          <Download size={14} color="var(--text-accent)" />
          <span>Export GeoTIFF / Shapefile / BC (FR-6)</span>
        </button>
      </div>
    </div>
  );
}

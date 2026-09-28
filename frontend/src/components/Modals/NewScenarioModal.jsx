import React, { useState } from 'react';
import { 
  X, 
  Cpu, 
  Play, 
  Layers, 
  AlertCircle, 
  CheckCircle,
  Database,
  Radio
} from 'lucide-react';
import { calculateFroehlichBreach } from '../../utils/calculations';

export default function NewScenarioModal({
  isOpen,
  onClose,
  onRunScenario
}) {
  const [scenarioName, setScenarioName] = useState('Teesta-V Low-Level Breach');
  const [riverName, setRiverName] = useState('Teesta River (Lower Reach)');
  const [damHeight, setDamHeight] = useState(48);
  const [storageVolume, setStorageVolume] = useState(25); // Million m3
  const [failureMode, setFailureMode] = useState('overtopping');
  const [selectedEngine, setSelectedEngine] = useState('hybrid'); // 'sph' | 'delft3d' | 'hybrid'
  const [meshResolution, setMeshResolution] = useState('20m Flexible Mesh');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simProgress, setSimProgress] = useState(0);

  if (!isOpen) return null;

  const breachCalc = calculateFroehlichBreach(storageVolume * 1e6, damHeight, failureMode);

  const handleStartSimulation = () => {
    setIsSimulating(true);
    setSimProgress(10);

    const interval = setInterval(() => {
      setSimProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsSimulating(false);
            onRunScenario({
              name: scenarioName,
              river: riverName,
              damHeight,
              storageVolume,
              failureMode,
              peakQ: breachCalc.peakOutflowM3s,
              engine: selectedEngine
            });
            onClose();
          }, 600);
          return 100;
        }
        return prev + 18;
      });
    }, 400);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(15, 23, 42, 0.45)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="glass-panel" style={{
        width: '560px',
        maxWidth: '92vw',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: '0 20px 50px rgba(15, 23, 42, 0.15)'
      }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={20} color="var(--text-accent)" />
            <h3 style={{ fontSize: '17px', color: 'var(--text-primary)', margin: 0 }}>
              Configure Simulation Job (FR-2 / NFR-1.1)
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isSimulating}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
              Scenario Title
            </label>
            <input
              type="text"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(0, 0, 0, 0.03)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '8px 10px',
                color: 'var(--text-primary)',
                fontSize: '12px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Dam Height (m)
              </label>
              <input
                type="number"
                value={damHeight}
                onChange={(e) => setDamHeight(parseFloat(e.target.value))}
                style={{
                  width: '100%',
                  background: 'rgba(0, 0, 0, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '8px 10px',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Reservoir Volume (Million m³)
              </label>
              <input
                type="number"
                value={storageVolume}
                onChange={(e) => setStorageVolume(parseFloat(e.target.value))}
                style={{
                  width: '100%',
                  background: 'rgba(0, 0, 0, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '8px 10px',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Engine Selection */}
          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Hydrodynamic Simulation Engine
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {[
                { id: 'hybrid', label: 'Hybrid (DualSPH + Delft3D)', desc: 'Recommended (Best fidelity)' },
                { id: 'sph', label: 'DualSPHysics', desc: 'GPU Particle Near-Field' },
                { id: 'delft3d', label: 'Delft3D-FM', desc: 'CPU Reach Flexible Mesh' }
              ].map((eng) => (
                <button
                  key={eng.id}
                  onClick={() => setSelectedEngine(eng.id)}
                  style={{
                    padding: '8px',
                    borderRadius: '6px',
                    border: selectedEngine === eng.id ? '1px solid #0284c7' : '1px solid var(--border-subtle)',
                    background: selectedEngine === eng.id ? 'rgba(2, 132, 199, 0.1)' : 'rgba(0, 0, 0, 0.02)',
                    color: selectedEngine === eng.id ? '#0284c7' : 'var(--text-primary)',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 'bold' }}>{eng.label}</div>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>{eng.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Real-time Froehlich Preview */}
          <div style={{
            background: 'rgba(2, 132, 199, 0.06)',
            border: '1px solid rgba(2, 132, 199, 0.2)',
            borderRadius: '6px',
            padding: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '11px'
          }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Estimated Peak Outflow: </span>
              <strong className="mono" style={{ color: '#e11d48', fontSize: '13px' }}>
                {breachCalc.peakOutflowM3s.toLocaleString()} m³/s
              </strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Breach Width: </span>
              <strong className="mono" style={{ color: '#0284c7' }}>
                {breachCalc.breachWidthM} m
              </strong>
            </div>
          </div>

          {/* Progress Bar when running */}
          {isSimulating && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#0284c7' }}>
                <span>Executing Celery worker job...</span>
                <span>{simProgress}%</span>
              </div>
              <div style={{ height: '6px', background: 'rgba(0, 0, 0, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${simProgress}%`, background: 'linear-gradient(90deg, #0284c7 0%, #2563eb 100%)', transition: 'width 0.3s ease' }} />
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
          <button
            onClick={onClose}
            disabled={isSimulating}
            className="btn-secondary"
            style={{ fontSize: '12px' }}
          >
            Cancel
          </button>

          <button
            onClick={handleStartSimulation}
            disabled={isSimulating}
            className="btn-primary"
            style={{ fontSize: '12px' }}
          >
            <Play size={14} />
            <span>{isSimulating ? 'Simulating Hydrodynamics...' : 'Launch Simulation Run'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

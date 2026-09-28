import React from 'react';
import { 
  Layers, 
  Cpu, 
  Shield, 
  Building2, 
  Users, 
  Download, 
  PlusCircle, 
  Radio, 
  Droplet,
  ChevronDown,
  Box,
  Activity
} from 'lucide-react';

export default function Header({
  scenarios,
  selectedScenario,
  onSelectScenario,
  activeRole,
  onSelectRole,
  onOpenNewScenario,
  onOpenExportModal
}) {
  const roles = [
    { id: 'technical', label: 'Technical & Modeling', icon: Cpu, badge: 'DualSPHysics / Delft3D' },
    { id: 'field', label: 'Field Operations', icon: Shield, badge: 'NDRF / SDRF' },
    { id: 'local', label: 'Local Admin (SDMA)', icon: Building2, badge: 'District HQ' },
    { id: 'public', label: 'Public / Citizen', icon: Users, badge: 'Safety & SOS' },
    { id: 'sim3d', label: '3D Simulation', icon: Box, badge: 'Three.js / Digital Twin' },
    { id: 'digital_twin', label: 'Digital Twin Simulation', icon: Activity, badge: 'Diorama & Risk Map' }
  ];

  return (
    <header style={{
      height: '68px',
      background: 'rgba(255, 255, 255, 0.88)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      zIndex: 50,
      backdropFilter: 'blur(16px)',
      boxShadow: '0 2px 10px rgba(15, 23, 42, 0.05)'
    }}>
      {/* Brand & Platform Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer'
        }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--glow-cyan)'
          }}>
            <Droplet size={22} color="#ffffff" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '20px',
                fontWeight: '900',
                letterSpacing: '0.08em',
                background: 'linear-gradient(90deg, #0f172a 0%, #0284c7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                VARUNA
              </span>
              <span className="badge-tech badge-cyan" style={{ fontSize: '9px', padding: '2px 6px' }}>
                SIH DEMO · AEVORA 007
              </span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '-2px' }}>
              Dam Break & Flood Inundation Digital Twin
            </div>
          </div>
        </div>

        {/* Scenario Selector Dropdown */}
        <div style={{
          marginLeft: '12px',
          background: 'rgba(0, 0, 0, 0.03)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '6px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Radio size={14} color="var(--text-accent)" className="animate-glow" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              ACTIVE SCENARIO
            </span>
            <select
              value={selectedScenario.id}
              onChange={(e) => {
                const found = scenarios.find((s) => s.id === e.target.value);
                if (found) onSelectScenario(found);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-heading)',
                fontSize: '13px',
                fontWeight: '600',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {scenarios.map((s) => (
                <option key={s.id} value={s.id} style={{ background: '#ffffff', color: '#0f172a' }}>
                  {s.name} ({s.region})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 4 Role-Based View Switcher (FR-8) */}
      <div style={{
        display: 'flex',
        background: 'rgba(0, 0, 0, 0.04)',
        padding: '4px',
        borderRadius: '10px',
        border: '1px solid var(--border-subtle)',
        gap: '4px'
      }}>
        {roles.map((r) => {
          const Icon = r.icon;
          const isActive = activeRole === r.id;
          return (
            <button
              key={r.id}
              onClick={() => onSelectRole(r.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '7px',
                border: 'none',
                background: isActive ? 'rgba(2, 132, 199, 0.12)' : 'transparent',
                boxShadow: isActive ? '0 1px 4px rgba(2, 132, 199, 0.15), inset 0 0 0 1px rgba(2, 132, 199, 0.4)' : 'none',
                color: isActive ? '#0284c7' : 'var(--text-secondary)',
                fontWeight: isActive ? '700' : '500',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={15} color={isActive ? '#0284c7' : '#64748b'} />
              <span>{r.label}</span>
            </button>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          className="btn-secondary"
          onClick={onOpenExportModal}
          title="Export GeoTIFF, Shapefiles & PDF"
          style={{ padding: '7px 12px', fontSize: '12px' }}
        >
          <Download size={14} color="var(--text-accent)" />
          <span>Export GIS (FR-6)</span>
        </button>

        <button
          className="btn-primary"
          onClick={onOpenNewScenario}
          style={{ padding: '7px 14px', fontSize: '12px' }}
        >
          <PlusCircle size={14} />
          <span>Run Simulation (FR-2)</span>
        </button>
      </div>
    </header>
  );
}

import React from 'react';
import { 
  Layers, 
  Waves, 
  Home, 
  Activity, 
  ShieldCheck, 
  LifeBuoy 
} from 'lucide-react';

export default function MapControls({
  activeLayers,
  onToggleLayer
}) {
  const layerDefs = [
    { key: 'inundation', label: 'Flood Inundation Polygon', icon: Waves, color: '#0284c7' },
    { key: 'villages', label: 'Villages & Census Risk', icon: Home, color: '#0284c7' },
    { key: 'infrastructure', label: 'Critical Infrastructure', icon: Activity, color: '#d97706' },
    { key: 'shelters', label: 'Safe Shelters', icon: ShieldCheck, color: '#059669' },
    { key: 'rescue', label: 'Rescue SOS Beacons', icon: LifeBuoy, color: '#e11d48' }
  ];

  return (
    <div className="glass-panel" style={{
      position: 'absolute',
      top: '16px',
      right: '16px',
      padding: '10px 14px',
      zIndex: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '11px',
        fontWeight: 'bold',
        color: 'var(--text-primary)',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '6px'
      }}>
        <Layers size={13} color="var(--text-accent)" />
        <span>GIS MAP LAYERS</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {layerDefs.map((def) => {
          const Icon = def.icon;
          const isActive = activeLayers[def.key];
          return (
            <button
              key={def.key}
              onClick={() => onToggleLayer(def.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '4px 8px',
                borderRadius: '6px',
                border: 'none',
                background: isActive ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                fontSize: '11px',
                cursor: 'pointer',
                transition: 'all 0.1s ease',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Icon size={12} color={isActive ? def.color : '#94a3b8'} />
                <span>{def.label}</span>
              </div>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: isActive ? def.color : '#cbd5e1',
                boxShadow: isActive ? `0 0 6px ${def.color}` : 'none'
              }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

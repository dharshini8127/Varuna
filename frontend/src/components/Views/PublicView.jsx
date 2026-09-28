import React, { useState } from 'react';
import { 
  Users, 
  MapPin, 
  ShieldAlert, 
  LifeBuoy, 
  PhoneCall, 
  Compass, 
  CheckCircle2, 
  AlertTriangle, 
  Navigation,
  ExternalLink
} from 'lucide-react';

export default function PublicView({
  scenario,
  userLocation,
  onSetSimulatedLocation,
  onOpenSOSModal
}) {
  const [selectedPin, setSelectedPin] = useState(null);

  // Check if simulated user location is inside danger zone
  // Point: [lng, lat]
  const isInsideDangerZone = (coords) => {
    if (!coords) return false;
    const [lng, lat] = coords;
    // Simple spatial proximity to scenario river corridor
    const riverCenter = scenario.center;
    const dist = Math.sqrt(Math.pow(lng - riverCenter[0], 2) + Math.pow(lat - riverCenter[1], 2));
    return dist < 0.28; // within danger zone buffer
  };

  const inDanger = userLocation ? isInsideDangerZone(userLocation) : false;
  const nearestShelter = scenario.shelters[0];

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
          <Users size={18} color="var(--text-accent)" />
          <h2 style={{ fontSize: '15px', color: 'var(--text-primary)', margin: 0 }}>
            Public & Citizen Safety Portal
          </h2>
        </div>
        <span className="badge-tech badge-cyan">
          CITIZEN EMERGENCY
        </span>
      </div>

      {/* 1-Click Urgent Distress SOS Button (FR-10) */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(225, 29, 72, 0.08) 0%, rgba(244, 63, 94, 0.12) 100%)',
        border: '1px solid rgba(225, 29, 72, 0.25)',
        borderRadius: '10px',
        padding: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        boxShadow: 'var(--glow-danger)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={20} color="#e11d48" className="animate-glow" />
          <div>
            <strong style={{ fontSize: '13px', color: '#be123c' }}>
              Are you trapped or in immediate danger?
            </strong>
            <div style={{ fontSize: '11px', color: '#9f1239' }}>
              Send SOS with your live coordinates directly to NDRF rescue teams.
            </div>
          </div>
        </div>

        <button
          onClick={onOpenSOSModal}
          className="btn-danger"
          style={{ width: '100%', padding: '10px', fontSize: '13px', fontWeight: 'bold' }}
        >
          <LifeBuoy size={16} />
          <span>TRANSMIT EMERGENCY SOS BEACON</span>
        </button>
      </div>

      {/* "Am I in Danger?" Geo-Checker */}
      <div className="glass-panel" style={{ padding: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <Compass size={16} color="var(--text-accent)" />
          <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
            Location Flood Hazard Check
          </strong>
        </div>

        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '10px' }}>
          Click anywhere on the map or tap the button below to test your position against the dynamic flood inundation polygon.
        </p>

        <button
          onClick={onSetSimulatedLocation}
          className="btn-secondary"
          style={{ width: '100%', fontSize: '11px', padding: '8px', marginBottom: '10px' }}
        >
          <Navigation size={13} color="var(--text-accent)" />
          <span>Use My GPS Location (Simulate Position)</span>
        </button>

        {userLocation && (
          <div style={{
            background: inDanger ? 'rgba(225, 29, 72, 0.1)' : 'rgba(5, 150, 105, 0.1)',
            border: `1px solid ${inDanger ? 'rgba(225, 29, 72, 0.35)' : 'rgba(5, 150, 105, 0.35)'}`,
            borderRadius: '8px',
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px'
          }}>
            {inDanger ? (
              <AlertTriangle size={18} color="#e11d48" style={{ flexShrink: 0, marginTop: '2px' }} />
            ) : (
              <CheckCircle2 size={18} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
            )}
            <div style={{ fontSize: '11px' }}>
              <strong style={{ color: inDanger ? '#be123c' : '#047857', fontSize: '12px' }}>
                {inDanger ? '⚠️ YOU ARE IN THE FLOOD INUNDATION PATH' : '✅ YOU ARE OUTSIDE THE DIRECT FLOOD ZONE'}
              </strong>
              <div style={{ color: inDanger ? '#881337' : '#065f46', marginTop: '4px', lineHeight: 1.4 }}>
                {inDanger ? (
                  <>
                    Water surge expected within <strong>45-90 minutes</strong>. Move east toward high ground immediately.
                  </>
                ) : (
                  <>
                    Your elevation is currently above the peak modeled backwater level. Stay alert for official advisories.
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Nearest Relief Shelter Recommendation */}
      <div className="glass-panel" style={{ padding: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <strong style={{ fontSize: '12px', color: '#059669' }}>
            Nearest Designated Safe Haven
          </strong>
          <span className="badge-tech badge-success" style={{ fontSize: '9px' }}>HIGH GROUND</span>
        </div>

        <div style={{ background: 'rgba(0, 0, 0, 0.02)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
          <strong style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{nearestShelter.name}</strong>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div>▲ Elevation: <strong>{nearestShelter.elevationM} meters</strong> (Above Floodline)</div>
            <div>👥 Space Available: <strong>{nearestShelter.capacity - nearestShelter.currentOccupancy} persons</strong></div>
            <div>🥗 Supplies: <strong>{nearestShelter.foodWaterDays} Days of Emergency Rations</strong></div>
          </div>
        </div>
      </div>

      {/* Emergency Helpline Directory */}
      <div className="glass-panel" style={{ padding: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <PhoneCall size={14} color="var(--text-accent)" />
          <strong style={{ fontSize: '12px', color: 'var(--text-primary)' }}>
            Official Disaster Helplines
          </strong>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '11px' }}>
          <a
            href="tel:112"
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '8px',
              background: 'rgba(0, 0, 0, 0.02)',
              borderRadius: '6px',
              textDecoration: 'none',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>National Emergency</span>
            <strong className="mono" style={{ color: '#0284c7', fontSize: '14px' }}>112</strong>
          </a>

          <a
            href="tel:1078"
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '8px',
              background: 'rgba(0, 0, 0, 0.02)',
              borderRadius: '6px',
              textDecoration: 'none',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>NDRF Control Room</span>
            <strong className="mono" style={{ color: '#e11d48', fontSize: '14px' }}>1078</strong>
          </a>

          <a
            href="tel:1070"
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '8px',
              background: 'rgba(0, 0, 0, 0.02)',
              borderRadius: '6px',
              textDecoration: 'none',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>State Flood Control</span>
            <strong className="mono" style={{ color: '#d97706', fontSize: '14px' }}>1070</strong>
          </a>

          <a
            href="tel:108"
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '8px',
              background: 'rgba(0, 0, 0, 0.02)',
              borderRadius: '6px',
              textDecoration: 'none',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>Ambulance Dispatch</span>
            <strong className="mono" style={{ color: '#059669', fontSize: '14px' }}>108</strong>
          </a>
        </div>
      </div>
    </div>
  );
}

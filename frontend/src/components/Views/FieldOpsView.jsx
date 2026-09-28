import React, { useState } from 'react';
import { 
  Shield, 
  LifeBuoy, 
  MapPin, 
  Phone, 
  AlertTriangle, 
  CheckCircle, 
  Send, 
  Truck, 
  Users, 
  Radio, 
  Navigation,
  Compass
} from 'lucide-react';

export default function FieldOpsView({
  scenario,
  rescueRequests,
  onUpdateRescueStatus,
  onSelectSOSLocation
}) {
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'PENDING' | 'DISPATCHED' | 'RESCUED'
  const [assignedUnitInput, setAssignedUnitInput] = useState('');
  const [selectedSOSId, setSelectedSOSId] = useState(null);

  const filteredRequests = rescueRequests.filter((req) => {
    if (filterStatus === 'ALL') return true;
    return req.status === filterStatus;
  });

  const pendingCount = rescueRequests.filter((r) => r.status === 'PENDING').length;
  const dispatchedCount = rescueRequests.filter((r) => r.status === 'DISPATCHED' || r.status === 'EN ROUTE').length;
  const rescuedCount = rescueRequests.filter((r) => r.status === 'RESCUED').length;

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
          <Shield size={18} color="#e11d48" />
          <h2 style={{ fontSize: '15px', color: 'var(--text-primary)', margin: 0 }}>
            Field Operations Command (NDRF/SDRF)
          </h2>
        </div>
        <span className="badge-tech badge-danger">
          INCIDENT MANAGEMENT
        </span>
      </div>

      {/* Operational Triage Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        <div className="glass-panel" style={{ padding: '8px 10px', textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Pending Triage</div>
          <div className="mono" style={{ fontSize: '18px', fontWeight: 'bold', color: '#e11d48' }}>
            {pendingCount}
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '8px 10px', textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Teams En Route</div>
          <div className="mono" style={{ fontSize: '18px', fontWeight: 'bold', color: '#d97706' }}>
            {dispatchedCount}
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '8px 10px', textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Safely Evacuated</div>
          <div className="mono" style={{ fontSize: '18px', fontWeight: 'bold', color: '#059669' }}>
            {rescuedCount}
          </div>
        </div>
      </div>

      {/* Infrastructure Lifeline & Evacuation Corridor Status */}
      <div className="glass-panel" style={{ padding: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <Compass size={14} color="var(--text-accent)" />
          <strong style={{ fontSize: '12px', color: 'var(--text-primary)' }}>
            Critical Access Corridors & Lifelines
          </strong>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {scenario.infrastructure.map((inf) => {
            const isCritical = inf.criticality.includes('CRITICAL') || inf.criticality.includes('DESTROYED');
            return (
              <div
                key={inf.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 8px',
                  background: 'rgba(0, 0, 0, 0.02)',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '11px'
                }}
              >
                <div>
                  <div style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{inf.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{inf.type}</div>
                </div>
                <span className={`badge-tech ${isCritical ? 'badge-danger' : 'badge-success'}`} style={{ fontSize: '9px' }}>
                  {inf.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Citizen SOS Requests Triage Queue (FR-10) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Radio size={14} color="#e11d48" className="animate-glow" />
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>
              Live Distress Calls (ST_Contains Verified)
            </span>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '3px', background: 'rgba(0, 0, 0, 0.04)', borderRadius: '6px', padding: '2px' }}>
            {['ALL', 'PENDING', 'DISPATCHED', 'RESCUED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                style={{
                  padding: '2px 6px',
                  fontSize: '9px',
                  borderRadius: '4px',
                  border: 'none',
                  background: filterStatus === st ? 'rgba(2, 132, 199, 0.12)' : 'transparent',
                  color: filterStatus === st ? '#0284c7' : 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* SOS List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredRequests.map((sos) => {
            const isSelected = selectedSOSId === sos.id;
            return (
              <div
                key={sos.id}
                onClick={() => {
                  setSelectedSOSId(sos.id);
                  if (onSelectSOSLocation) onSelectSOSLocation(sos.coordinates);
                }}
                className="glass-panel-interactive"
                style={{
                  padding: '10px 12px',
                  borderLeft: `3px solid ${sos.status === 'RESCUED' ? '#059669' : sos.status === 'DISPATCHED' ? '#d97706' : '#e11d48'}`,
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="mono" style={{ fontSize: '12px', fontWeight: 'bold', color: '#0284c7' }}>
                      {sos.id}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-primary)' }}>· {sos.senderName}</span>
                  </div>
                  <span className={`badge-tech ${sos.status === 'RESCUED' ? 'badge-success' : sos.status === 'DISPATCHED' ? 'badge-warning' : 'badge-danger'}`} style={{ fontSize: '9px' }}>
                    {sos.status}
                  </span>
                </div>

                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '4px 0', lineHeight: 1.4 }}>
                  "{sos.details}"
                </p>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '10px',
                  color: 'var(--text-muted)',
                  marginTop: '6px',
                  paddingTop: '6px',
                  borderTop: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>👥 <strong>{sos.headcount} Trapped</strong></span>
                    <span>📞 {sos.phone}</span>
                  </div>
                  <span>{sos.timestamp}</span>
                </div>

                {/* Tactical Dispatch Action Toolbar */}
                <div style={{
                  display: 'flex',
                  gap: '6px',
                  marginTop: '8px',
                  paddingTop: '6px'
                }}>
                  {sos.status !== 'DISPATCHED' && sos.status !== 'RESCUED' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateRescueStatus(sos.id, 'DISPATCHED', 'NDRF Quick Response Team 4');
                      }}
                      className="btn-primary"
                      style={{ padding: '4px 8px', fontSize: '10px' }}
                    >
                      <Truck size={12} />
                      <span>Dispatch Team</span>
                    </button>
                  )}

                  {sos.status !== 'RESCUED' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateRescueStatus(sos.id, 'RESCUED', 'Evacuated to High Ground');
                      }}
                      className="btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '10px', color: '#059669', borderColor: 'rgba(5, 150, 105, 0.3)' }}
                    >
                      <CheckCircle size={12} />
                      <span>Mark Evacuated</span>
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSelectSOSLocation) onSelectSOSLocation(sos.coordinates);
                    }}
                    className="btn-secondary"
                    style={{ padding: '4px 8px', fontSize: '10px' }}
                  >
                    <Navigation size={12} color="var(--text-accent)" />
                    <span>Zoom Coords</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

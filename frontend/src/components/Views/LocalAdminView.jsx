import React, { useState } from 'react';
import { 
  Building2, 
  AlertCircle, 
  Users, 
  Clock, 
  Radio, 
  Send, 
  Home, 
  CheckCircle, 
  TrendingUp,
  MapPin,
  ChevronRight
} from 'lucide-react';

export default function LocalAdminView({
  scenario,
  selectedVillage,
  onSelectVillage
}) {
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [alertMessage, setAlertMessage] = useState(
    `[CRITICAL EVACUATION ADVISORY] Flash flood surge from ${scenario.damName} approaching downstream basin. All residents in ${scenario.river} floodplains must evacuate to designated relief camps immediately.`
  );

  const totalAtRiskPop = scenario.villages.reduce((sum, v) => sum + v.population, 0);
  const totalVulnerablePop = scenario.villages.reduce((sum, v) => sum + v.elderlyAndChildren, 0);
  const totalShelterCapacity = scenario.shelters.reduce((sum, s) => sum + s.capacity, 0);
  const totalCurrentSheltered = scenario.shelters.reduce((sum, s) => sum + s.currentOccupancy, 0);

  const handleBroadcastAlert = () => {
    setBroadcastSent(true);
    setTimeout(() => {
      setBroadcastSent(false);
    }, 4000);
  };

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
          <Building2 size={18} color="#d97706" />
          <h2 style={{ fontSize: '15px', color: 'var(--text-primary)', margin: 0 }}>
            District Disaster Management Authority (SDMA)
          </h2>
        </div>
        <span className="badge-tech badge-warning">
          CIVIL GOVERNANCE
        </span>
      </div>

      {/* Aggregate Population & Shelter Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div className="glass-panel" style={{ padding: '10px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '10px' }}>
            <Users size={12} color="#e11d48" />
            <span>TOTAL AT-RISK POPULATION</span>
          </div>
          <div className="mono" style={{ fontSize: '20px', fontWeight: 'bold', color: '#e11d48', marginTop: '4px' }}>
            {totalAtRiskPop.toLocaleString()}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Includes <strong>{totalVulnerablePop.toLocaleString()}</strong> elderly & infants
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '10px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '10px' }}>
            <Home size={12} color="#059669" />
            <span>RELIEF SHELTER OCCUPANCY</span>
          </div>
          <div className="mono" style={{ fontSize: '20px', fontWeight: 'bold', color: '#059669', marginTop: '4px' }}>
            {totalCurrentSheltered.toLocaleString()} / {totalShelterCapacity.toLocaleString()}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            <strong>{Math.round((totalCurrentSheltered / totalShelterCapacity) * 100)}%</strong> total capacity filled
          </div>
        </div>
      </div>

      {/* Common Alerting Protocol (CAP) Broadcast Section */}
      <div className="glass-panel" style={{ padding: '12px', border: '1px solid rgba(217, 119, 6, 0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Radio size={15} color="#d97706" className="animate-glow" />
            <strong style={{ fontSize: '12px', color: '#b45309' }}>
              CAP Cell-Tower Broadcast (NDMA Protocol)
            </strong>
          </div>
          <span className="badge-tech badge-warning" style={{ fontSize: '9px' }}>GEO-TARGETED</span>
        </div>

        <textarea
          value={alertMessage}
          onChange={(e) => setAlertMessage(e.target.value)}
          rows={3}
          style={{
            width: '100%',
            background: 'rgba(0, 0, 0, 0.03)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            padding: '8px',
            resize: 'none',
            outline: 'none'
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            📡 Broadcast to 18 cell towers along {scenario.river} corridor
          </span>

          <button
            onClick={handleBroadcastAlert}
            className="btn-danger"
            style={{ padding: '6px 12px', fontSize: '11px' }}
          >
            {broadcastSent ? <CheckCircle size={14} /> : <Send size={14} />}
            <span>{broadcastSent ? 'Alert Dispatched!' : 'Broadcast Warning'}</span>
          </button>
        </div>
      </div>

      {/* Village Risk Ranking Table (FR-7) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <TrendingUp size={14} color="var(--text-accent)" />
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>
              Village Risk Ranking (Depth × Velocity × Density)
            </span>
          </div>
          <span className="mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            Formula: FR-7 Score
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {scenario.villages.map((village, idx) => {
            const isHighRisk = village.riskScore >= 80;
            const isMedium = village.riskScore >= 60 && village.riskScore < 80;
            return (
              <div
                key={village.id}
                onClick={() => onSelectVillage(village)}
                className="glass-panel-interactive"
                style={{
                  padding: '10px 12px',
                  cursor: 'pointer',
                  borderLeft: `3px solid ${isHighRisk ? '#e11d48' : isMedium ? '#d97706' : '#0284c7'}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                      #{idx + 1}
                    </span>
                    <strong style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{village.name}</strong>
                  </div>
                  <span className={`badge-tech ${isHighRisk ? 'badge-danger' : isMedium ? 'badge-warning' : 'badge-cyan'}`} style={{ fontSize: '9px' }}>
                    Score: {village.riskScore}
                  </span>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 1fr 1fr',
                  gap: '6px',
                  fontSize: '10px',
                  color: 'var(--text-secondary)',
                  marginTop: '6px'
                }}>
                  <div>
                    <Clock size={10} style={{ display: 'inline', marginRight: '3px' }} />
                    ETA: <strong style={{ color: '#d97706' }}>{village.estimatedArrivalTime}</strong>
                  </div>
                  <div>
                    👥 Pop: <strong>{village.population.toLocaleString()}</strong>
                  </div>
                  <div>
                    🌊 Depth: <strong>{village.predictedDepthM} m</strong>
                  </div>
                </div>

                {/* Evacuation Progress Meter */}
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-muted)', marginBottom: '3px' }}>
                    <span>Evacuation Progress</span>
                    <span style={{ color: '#059669', fontWeight: 'bold' }}>{village.evacuationStatus}</span>
                  </div>
                  <div style={{ height: '4px', background: 'rgba(0, 0, 0, 0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: village.evacuationStatus.split('%')[0] + '%',
                      background: 'linear-gradient(90deg, #3b82f6 0%, #059669 100%)',
                      borderRadius: '2px'
                    }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Designated Evacuation Shelters Status */}
      <div className="glass-panel" style={{ padding: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <Home size={14} color="#059669" />
          <strong style={{ fontSize: '12px', color: 'var(--text-primary)' }}>
            Designated High-Ground Relief Camps
          </strong>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {scenario.shelters.map((shelter) => (
            <div
              key={shelter.id}
              style={{
                padding: '8px',
                background: 'rgba(0, 0, 0, 0.02)',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
                fontSize: '11px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong style={{ color: '#059669' }}>{shelter.name}</strong>
                <span className="mono" style={{ color: 'var(--text-muted)' }}>▲ {shelter.elevationM} m</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', color: 'var(--text-secondary)' }}>
                <span>Occupancy: {shelter.currentOccupancy} / {shelter.capacity}</span>
                <span style={{ color: '#0284c7' }}>🥗 {shelter.foodWaterDays} Days Food/Water</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

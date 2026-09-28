import React, { useState } from 'react';
import { 
  X, 
  LifeBuoy, 
  MapPin, 
  Phone, 
  Users, 
  Send, 
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export default function SOSModal({
  isOpen,
  onClose,
  defaultCoords,
  onSubmitSOS
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [headcount, setHeadcount] = useState(3);
  const [details, setDetails] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !phone) return;

    const newSOS = {
      id: `SOS-${Math.floor(1000 + Math.random() * 9000)}`,
      senderName: name,
      phone,
      coordinates: defaultCoords || [88.528, 27.424],
      timestamp: 'Just now',
      headcount: parseInt(headcount, 10),
      details: details || 'Water entered building, urgent evacuation requested.',
      insideDangerPolygon: true,
      status: 'PENDING',
      assignedUnit: 'Triage in Progress',
      priority: 'CRITICAL'
    };

    setIsSubmitted(true);
    setTimeout(() => {
      onSubmitSOS(newSOS);
      setIsSubmitted(false);
      onClose();
    }, 1200);
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
        width: '480px',
        maxWidth: '92vw',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: '0 20px 50px rgba(15, 23, 42, 0.15)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LifeBuoy size={22} color="#e11d48" className="animate-glow" />
            <h3 style={{ fontSize: '17px', color: 'var(--text-primary)', margin: 0 }}>
              Emergency Rescue Distress Beacon (SOS)
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {isSubmitted ? (
          <div style={{
            padding: '30px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}>
            <CheckCircle size={48} color="#059669" />
            <h4 style={{ color: '#059669', fontSize: '16px', margin: 0 }}>
              Distress Signal Broadcasted!
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '12px', lineHeight: 1.5 }}>
              Your GPS coordinates and contact info have been pinned to the NDRF Field Operations queue. Keep phone lines open.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Your Name / Contact Person *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Tshering Lepcha"
                value={name}
                onChange={(e) => setName(e.target.value)}
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

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98XXX-XXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
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
                  Persons Trapped
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={headcount}
                  onChange={(e) => setHeadcount(e.target.value)}
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

            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Situation & Landmark Details
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Trapped on 2nd floor, water rising rapidly, 1 elderly family member..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(0, 0, 0, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '8px 10px',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  outline: 'none',
                  resize: 'none'
                }}
              />
            </div>

            {/* GPS coordinates attached badge */}
            <div style={{
              background: 'rgba(5, 150, 105, 0.08)',
              border: '1px solid rgba(5, 150, 105, 0.25)',
              borderRadius: '6px',
              padding: '8px 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '11px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669' }}>
                <MapPin size={14} />
                <span>GPS Location Attached</span>
              </div>
              <span className="mono" style={{ color: 'var(--text-muted)' }}>
                {defaultCoords ? `${defaultCoords[1].toFixed(4)}°N, ${defaultCoords[0].toFixed(4)}°E` : 'Auto-detected'}
              </span>
            </div>

            {/* Submit */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                style={{ fontSize: '12px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-danger"
                style={{ fontSize: '12px' }}
              >
                <Send size={14} />
                <span>Transmit SOS Beacon</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

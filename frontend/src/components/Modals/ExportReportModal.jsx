import React, { useState } from 'react';
import { 
  X, 
  Download, 
  FileText, 
  Layers, 
  Map, 
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';

export default function ExportReportModal({
  isOpen,
  onClose,
  scenario
}) {
  const [downloadingFormat, setDownloadingFormat] = useState(null);

  if (!isOpen) return null;

  const exportFormats = [
    {
      id: 'geotiff',
      name: 'GeoTIFF Inundation Raster (.tif)',
      desc: 'High-resolution multi-band raster (Band 1: Max Depth, Band 2: Velocity, Band 3: Arrival Time)',
      size: '42.8 MB',
      icon: Layers,
      color: '#0284c7'
    },
    {
      id: 'shapefile',
      name: 'ESRI Shapefile Archive (.shp / .zip)',
      desc: 'Vector polygons of flood extent contours at 1m, 3m, 5m, and 10m graduated depth classes',
      size: '14.2 MB',
      icon: Map,
      color: '#2563eb'
    },
    {
      id: 'kml',
      name: 'Google Earth KML / KMZ (.kmz)',
      desc: '3D georeferenced flood overlay with village risk placemarks and evacuation routes',
      size: '6.5 MB',
      icon: FileSpreadsheet,
      color: '#d97706'
    },
    {
      id: 'pdf',
      name: 'NDMA Technical Summary PDF',
      desc: 'Official dam failure inundation report with hydrographs, SAR validation metrics, and village vulnerability ranking',
      size: '4.8 MB',
      icon: FileText,
      color: '#e11d48'
    }
  ];

  const handleExport = (formatId, formatName) => {
    setDownloadingFormat(formatId);
    setTimeout(() => {
      // Create mock file download trigger
      const dummyContent = `VARUNA DISASTER SIMULATION PLATFORM - EXPORT\nScenario: ${scenario.name}\nRiver: ${scenario.river}\nDate: ${new Date().toISOString()}\nValidation F1: ${scenario.validationData.f1Score}\nPeak Q: ${scenario.parameters.froehlichPeakQ} m3/s\n\n--- Geo-Package Placeholder ---`;
      const blob = new Blob([dummyContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `varuna_${scenario.id}_${formatId}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloadingFormat(null);
    }, 1000);
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
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={20} color="var(--text-accent)" />
            <h3 style={{ fontSize: '17px', color: 'var(--text-primary)', margin: 0 }}>
              Export GIS Packages & Reports (FR-6)
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
          Export open standard geospatial datasets compatible with QGIS, ArcGIS, Google Earth, and NDMA operational command tools (NFR-7.1).
        </p>

        {/* Format Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {exportFormats.map((fmt) => {
            const Icon = fmt.icon;
            const isDownloading = downloadingFormat === fmt.id;
            return (
              <div
                key={fmt.id}
                className="glass-panel-interactive"
                style={{
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: 'rgba(0, 0, 0, 0.03)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    <Icon size={18} color={fmt.color} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{fmt.name}</strong>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.3 }}>
                      {fmt.desc}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    {fmt.size}
                  </span>
                  <button
                    onClick={() => handleExport(fmt.id, fmt.name)}
                    disabled={isDownloading}
                    className="btn-primary"
                    style={{ padding: '6px 12px', fontSize: '11px' }}
                  >
                    {isDownloading ? 'Generating...' : 'Download'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
          <button
            onClick={onClose}
            className="btn-secondary"
            style={{ fontSize: '12px' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

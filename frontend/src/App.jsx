import React, { useState } from 'react';
import Header from './components/Common/Header';
import FloodMap from './components/Map/FloodMap';
import MapControls from './components/Map/MapControls';
import SimulationScrubber from './components/Common/SimulationScrubber';
import TechnicalView from './components/Views/TechnicalView';
import FieldOpsView from './components/Views/FieldOpsView';
import LocalAdminView from './components/Views/LocalAdminView';
import PublicView from './components/Views/PublicView';
import NewScenarioModal from './components/Modals/NewScenarioModal';
import SOSModal from './components/Modals/SOSModal';
import ExportReportModal from './components/Modals/ExportReportModal';
import { SCENARIOS } from './data/scenarios';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

const Sim3DView = React.lazy(() => import('./features/sim3d/components/Sim3DView'));
const DigitalTwinView = React.lazy(() => import('./features/digitalTwin'));

export default function App() {
  const [scenariosList, setScenariosList] = useState(SCENARIOS);
  const [selectedScenario, setSelectedScenario] = useState(SCENARIOS[0]);
  const [activeRole, setActiveRole] = useState('technical'); // 'technical' | 'field' | 'local' | 'public' | 'sim3d'
  const [currentHour, setCurrentHour] = useState(1);
  const [selectedVillage, setSelectedVillage] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Active Map Layers
  const [activeLayers, setActiveLayers] = useState({
    inundation: true,
    villages: true,
    infrastructure: true,
    shelters: true,
    rescue: true
  });

  // Rescue Requests State
  const [rescueRequests, setRescueRequests] = useState(selectedScenario.rescueRequests || []);

  // Modals
  const [isNewScenarioOpen, setIsNewScenarioOpen] = useState(false);
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Handle Scenario Change
  const handleSelectScenario = (scenario) => {
    setSelectedScenario(scenario);
    setCurrentHour(0);
    setSelectedVillage(null);
    setUserLocation(null);
    setRescueRequests(scenario.rescueRequests || []);
  };

  // Toggle Map Layer
  const handleToggleLayer = (layerKey) => {
    setActiveLayers((prev) => ({
      ...prev,
      [layerKey]: !prev[layerKey]
    }));
  };

  // Update Rescue Status (Field Ops)
  const handleUpdateRescueStatus = (id, newStatus, unitName) => {
    setRescueRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: newStatus, assignedUnit: unitName || r.assignedUnit } : r
      )
    );
  };

  // Add new citizen SOS beacon
  const handleAddSOS = (newSOS) => {
    setRescueRequests((prev) => [newSOS, ...prev]);
    setUserLocation(newSOS.coordinates);
  };

  // Map Click (e.g. for Citizen danger check)
  const handleMapClick = (coords) => {
    if (activeRole === 'public') {
      setUserLocation(coords);
    }
  };

  // Simulate user GPS location near the river
  const handleSetSimulatedGPS = () => {
    // Offset slightly from scenario center
    const simCoords = [
      selectedScenario.center[0] - 0.04,
      selectedScenario.center[1] - 0.02
    ];
    setUserLocation(simCoords);
  };

  // Run Custom Scenario
  const handleRunNewScenario = (newParams) => {
    const customScenario = {
      ...selectedScenario,
      id: `custom-${Date.now()}`,
      name: newParams.name,
      river: newParams.river,
      isEstimate: true,
      parameters: {
        ...selectedScenario.parameters,
        damHeightM: newParams.damHeight,
        storageVolumeM3: newParams.storageVolume * 1e6,
        failureMode: newParams.failureMode,
        froehlichPeakQ: newParams.peakQ
      }
    };
    setScenariosList((prev) => [customScenario, ...prev]);
    setSelectedScenario(customScenario);
    setCurrentHour(1);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Top Mission Control Header */}
      <Header
        scenarios={scenariosList}
        selectedScenario={selectedScenario}
        onSelectScenario={handleSelectScenario}
        activeRole={activeRole}
        onSelectRole={setActiveRole}
        onOpenNewScenario={() => setIsNewScenarioOpen(true)}
        onOpenExportModal={() => setIsExportOpen(true)}
      />

      {/* 3D Simulation / Digital Twin Simulation View or Main 2D/3D Map Workspace */}
      {activeRole === 'digital_twin' ? (
        <React.Suspense fallback={
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060913', color: '#f1f5f9' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', border: '3px solid rgba(56, 189, 248, 0.2)', borderTopColor: '#06b6d4', borderRadius: '50%', animation: 'sim3d-spin 0.8s linear infinite' }} />
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#38bdf8' }}>Loading Digital Twin Simulation Engine...</span>
            </div>
          </div>
        }>
          <DigitalTwinView />
        </React.Suspense>
      ) : activeRole === 'sim3d' ? (
        <React.Suspense fallback={
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', color: '#0f172a' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: '#0284c7', borderRadius: '50%', animation: 'sim3d-spin 0.8s linear infinite' }} />
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Loading 3D Scientific Simulation Engine...</span>
            </div>
          </div>
        }>
          <Sim3DView />
        </React.Suspense>
      ) : (
        /* Main Workspace (Map + Role View Drawer) */
        <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
          {/* Left Area: Map Canvas */}
          <div style={{ flex: 1, position: 'relative', height: '100%' }}>
            <FloodMap
              scenario={selectedScenario}
              currentHour={currentHour}
              activeLayers={activeLayers}
              selectedVillage={selectedVillage}
              onSelectVillage={setSelectedVillage}
              userLocation={userLocation}
              onMapClick={handleMapClick}
              activeRole={activeRole}
              onChangeHour={setCurrentHour}
            />

            {/* Layer Visibility Toggle Widget */}
            <MapControls
              activeLayers={activeLayers}
              onToggleLayer={handleToggleLayer}
            />

            {/* Bottom Interactive Simulation Scrubber */}
            <SimulationScrubber
              scenario={selectedScenario}
              currentHour={currentHour}
              onChangeHour={setCurrentHour}
              maxHours={24}
            />
          </div>

          {/* Sidebar Toggle Handle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              position: 'absolute',
              top: '20px',
              right: sidebarOpen ? '440px' : '0px',
              zIndex: 35,
              width: '24px',
              height: '42px',
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid var(--border-subtle)',
              borderRight: 'none',
              borderRadius: '6px 0 0 6px',
              color: 'var(--text-accent)',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'right 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            title={sidebarOpen ? 'Collapse Side Panel' : 'Expand Side Panel'}
          >
            {sidebarOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          {/* Right Drawer: Role-Based Intelligence Panel */}
          <div
            className="glass-panel"
            style={{
              width: sidebarOpen ? '440px' : '0px',
              height: '100%',
              overflow: 'hidden',
              transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              borderLeft: sidebarOpen ? '1px solid var(--border-subtle)' : 'none',
              borderRadius: 0,
              zIndex: 30,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {sidebarOpen && (
              <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
                {activeRole === 'technical' && (
                  <TechnicalView
                    scenario={selectedScenario}
                    onExportGIS={() => setIsExportOpen(true)}
                  />
                )}

                {activeRole === 'field' && (
                  <FieldOpsView
                    scenario={selectedScenario}
                    rescueRequests={rescueRequests}
                    onUpdateRescueStatus={handleUpdateRescueStatus}
                    onSelectSOSLocation={(coords) => setUserLocation(coords)}
                  />
                )}

                {activeRole === 'local' && (
                  <LocalAdminView
                    scenario={selectedScenario}
                    selectedVillage={selectedVillage}
                    onSelectVillage={setSelectedVillage}
                  />
                )}

                {activeRole === 'public' && (
                  <PublicView
                    scenario={selectedScenario}
                    userLocation={userLocation}
                    onSetSimulatedLocation={handleSetSimulatedGPS}
                    onOpenSOSModal={() => setIsSOSOpen(true)}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <NewScenarioModal
        isOpen={isNewScenarioOpen}
        onClose={() => setIsNewScenarioOpen(false)}
        onRunScenario={handleRunNewScenario}
      />

      <SOSModal
        isOpen={isSOSOpen}
        onClose={() => setIsSOSOpen(false)}
        defaultCoords={userLocation || selectedScenario.center}
        onSubmitSOS={handleAddSOS}
      />

      <ExportReportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        scenario={selectedScenario}
      />
    </div>
  );
}

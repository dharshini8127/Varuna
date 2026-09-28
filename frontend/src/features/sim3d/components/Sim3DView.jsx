import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { SCENARIOS_3D } from '../data/scenarios3d';
import { INFRASTRUCTURE_3D } from '../data/infrastructure3d';
import { 
  getInterpolatedSimulationState, 
  computeInfrastructureStatuses 
} from '../utils/waterSimulation';
import SimulationControl from './SimulationControl';
import VisualizationLayers from './VisualizationLayers';
import TimelineBar from './TimelineBar';
import FooterStats from './FooterStats';
import ThreeCanvas from './ThreeCanvas';
import '../styles/sim3d.css';

export default function Sim3DView() {
  // Local state isolated completely to sim3d feature
  const [selectedScenario, setSelectedScenario] = useState(SCENARIOS_3D[0]);
  const [params, setParams] = useState(SCENARIOS_3D[0].defaultParams);
  const [currentSec, setCurrentSec] = useState(0); // 0 to 43200s (12 hours)
  const [isRunning, setIsRunning] = useState(false);
  const [layerMode, setLayerMode] = useState('realistic'); // 'realistic' | 'depth' | 'velocity' | 'arrival'
  const [cameraMode, setCameraMode] = useState('perspective'); // 'perspective' | 'top' | 'dam' | 'follow'
  const [showEvacuationRoutes, setShowEvacuationRoutes] = useState(false);
  const [stepSizeMin, setStepSizeMin] = useState(15);

  // When scenario changes, update default parameters and reset clock
  const handleSelectScenario = useCallback((scenario) => {
    setSelectedScenario(scenario);
    setParams(scenario.defaultParams);
    setCurrentSec(0);
    setIsRunning(false);
  }, []);

  const handleChangeParam = useCallback((key, value) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleResetParams = useCallback(() => {
    setParams(selectedScenario.defaultParams);
  }, [selectedScenario]);

  // Simulation playback clock timer
  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setCurrentSec((prev) => {
          if (prev >= 43200) {
            setIsRunning(false);
            return 43200;
          }
          // Advance 90 simulated seconds per 100ms real tick (15 simulated minutes every 10 real seconds)
          return Math.min(43200, prev + 90);
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // Derived current physical simulation state
  const simState = useMemo(() => {
    return getInterpolatedSimulationState(selectedScenario, currentSec, params);
  }, [selectedScenario, currentSec, params]);

  // Derived infrastructure statuses (Safe / At Risk / Flooded)
  const infrastructureStatuses = useMemo(() => {
    return computeInfrastructureStatuses(INFRASTRUCTURE_3D, simState, currentSec);
  }, [simState, currentSec]);

  // Derived summary counts
  const villagesAffectedCount = useMemo(() => {
    return infrastructureStatuses.filter(
      (item) => item.type === 'village' && (item.status === 'FLOODED' || item.status === 'AT RISK')
    ).length;
  }, [infrastructureStatuses]);

  const populationAtRiskCount = useMemo(() => {
    return infrastructureStatuses
      .filter((item) => item.type === 'village' && (item.status === 'FLOODED' || item.status === 'AT RISK'))
      .reduce((sum, item) => sum + (item.population || 0), 0);
  }, [infrastructureStatuses]);

  return (
    <div className="sim3d-container">
      {/* 3D Viewport Workspace */}
      <div className="sim3d-viewport-wrapper">
        {/* Core Three.js WebGL Canvas */}
        <ThreeCanvas
          simState={simState}
          layerMode={layerMode}
          cameraMode={cameraMode}
          showEvacuationRoutes={showEvacuationRoutes}
          infrastructureList={infrastructureStatuses}
          isRunning={isRunning}
        />

        {/* Left Panel: Simulation Control & Infrastructure Status */}
        <SimulationControl
          scenarios={SCENARIOS_3D}
          selectedScenario={selectedScenario}
          onSelectScenario={handleSelectScenario}
          params={params}
          onChangeParam={handleChangeParam}
          onResetParams={handleResetParams}
          onRunSimulation={() => setIsRunning(!isRunning)}
          isRunning={isRunning}
          infrastructureStatuses={infrastructureStatuses}
        />

        {/* Right Panel: Visualization Layers & Camera Controls */}
        <VisualizationLayers
          layerMode={layerMode}
          onChangeLayerMode={setLayerMode}
          cameraMode={cameraMode}
          onSelectCamera={setCameraMode}
          showEvacuationRoutes={showEvacuationRoutes}
          onToggleEvacuationRoutes={() => setShowEvacuationRoutes(!showEvacuationRoutes)}
        />

        {/* Bottom Interactive Simulation Timeline Scrubber */}
        <TimelineBar
          currentSec={currentSec}
          onChangeTimeSec={setCurrentSec}
          isRunning={isRunning}
          onTogglePlay={() => setIsRunning(!isRunning)}
          onReset={() => {
            setIsRunning(false);
            setCurrentSec(0);
          }}
          stepSizeMin={stepSizeMin}
          onChangeStepSize={setStepSizeMin}
          maxSec={43200}
        />
      </div>

      {/* Footer Simulation Metrics */}
      <FooterStats
        scenarioName={selectedScenario.name}
        simState={simState}
        villagesAffectedCount={villagesAffectedCount}
        populationAtRiskCount={populationAtRiskCount}
      />
    </div>
  );
}

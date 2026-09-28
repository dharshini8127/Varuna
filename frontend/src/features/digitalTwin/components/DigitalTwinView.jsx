import React, { useState, useEffect, useCallback } from 'react';
import { DT_SCENARIOS } from '../data/scenarios';
import DioramaCanvas from './DioramaCanvas';
import ImpactMapView from './ImpactMapView';
import RiskMapView from './RiskMapView';
import DarkHudPanel from './DarkHudPanel';
import TimelineBar from './TimelineBar';
import '../styles/digitalTwin.css';

export default function DigitalTwinView() {
  // Active Visualization Switcher: 'simulate' | 'impact' | 'risk'
  const [activeMode, setActiveMode] = useState('simulate');

  // Scenario & Hydraulic Parameters
  const [selectedScenario, setSelectedScenario] = useState(DT_SCENARIOS[0]);
  const [params, setParams] = useState(DT_SCENARIOS[0].defaultParams);

  // Time & Simulation State
  const maxTime = 14400; // 4 Hours total flood propagation window
  const [simTime, setSimTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeStepMin, setTimeStepMin] = useState(15);
  const [isBreached, setIsBreached] = useState(false);

  // Handle Scenario Switch
  const handleSelectScenario = useCallback((scenario) => {
    setSelectedScenario(scenario);
    setParams(scenario.defaultParams);
    setSimTime(0);
    setIsPlaying(false);
    setIsBreached(false);
  }, []);

  // Handle Parameter Adjustments
  const handleChangeParam = useCallback((key, value) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Handle Emergency Breach Button
  const handleTriggerBreach = useCallback(() => {
    setIsBreached(true);
    setIsPlaying(true);
    if (simTime === 0) {
      setSimTime(300); // Kickstart first 5 minutes
    }
  }, [simTime]);

  // Handle Play/Pause
  const handleTogglePlay = useCallback(() => {
    if (!isPlaying && !isBreached) {
      setIsBreached(true);
    }
    setIsPlaying((prev) => !prev);
  }, [isPlaying, isBreached]);

  // Handle Timeline Controls
  const handleStepBack = useCallback(() => {
    setSimTime((prev) => Math.max(0, prev - timeStepMin * 60));
  }, [timeStepMin]);

  const handleStepForward = useCallback(() => {
    if (!isBreached) setIsBreached(true);
    setSimTime((prev) => Math.min(maxTime, prev + timeStepMin * 60));
  }, [isBreached, maxTime, timeStepMin]);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setIsBreached(false);
    setSimTime(0);
  }, []);

  const handleSeek = useCallback((sec) => {
    if (sec > 0 && !isBreached) setIsBreached(true);
    setSimTime(sec);
  }, [isBreached]);

  const handleJump = useCallback((sec) => {
    if (sec > 0 && !isBreached) setIsBreached(true);
    setSimTime(sec);
  }, [isBreached]);

  // Simulation Clock Tick Effect
  useEffect(() => {
    let timer = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setSimTime((prev) => {
          // Increment simulation time by 60 seconds every 100ms real time (600x speed)
          const next = prev + 60;
          if (next >= maxTime) {
            setIsPlaying(false);
            return maxTime;
          }
          return next;
        });
      }, 100);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, maxTime]);

  return (
    <div className="dt-container">
      {/* Background Cyber Grid */}
      <div className="dt-grid-backdrop" />

      {/* Main Viewport Content based on active mode */}
      <div className="dt-viewport">
        {activeMode === 'simulate' && (
          <DioramaCanvas
            scenario={selectedScenario}
            params={params}
            simTime={simTime}
            maxTime={maxTime}
            isBreached={isBreached}
            onTriggerBreach={handleTriggerBreach}
            settlements={selectedScenario.settlements}
          />
        )}

        {activeMode === 'impact' && (
          <ImpactMapView
            scenario={selectedScenario}
            params={params}
            simTime={simTime}
            maxTime={maxTime}
            isBreached={isBreached}
          />
        )}

        {activeMode === 'risk' && (
          <RiskMapView
            scenario={selectedScenario}
            params={params}
            simTime={simTime}
            maxTime={maxTime}
            isBreached={isBreached}
          />
        )}
      </div>

      {/* Dark HUD Floating Panels (Top Bar, Left Controls, Right Gauges) */}
      <DarkHudPanel
        activeMode={activeMode}
        onSelectMode={setActiveMode}
        selectedScenario={selectedScenario}
        onSelectScenario={handleSelectScenario}
        params={params}
        onChangeParam={handleChangeParam}
        isBreached={isBreached}
        onTriggerBreach={handleTriggerBreach}
        simTime={simTime}
        maxTime={maxTime}
      />

      {/* Bottom Timeline Floating Bar */}
      <TimelineBar
        simTime={simTime}
        maxTime={maxTime}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onStepBack={handleStepBack}
        onStepForward={handleStepForward}
        onReset={handleReset}
        timeStepMin={timeStepMin}
        onChangeTimeStep={setTimeStepMin}
        onSeek={handleSeek}
        onJump={handleJump}
      />
    </div>
  );
}

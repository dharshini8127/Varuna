/**
 * VARUNA - Client-side Hydrology & Hydrodynamic Utilities (FR-3, FR-7)
 * Implements Froehlich (dam-break), Clague-Mathews (GLOF), and Risk Formulation
 */

export function calculateFroehlichBreach(storageVolumeM3, breachHeightM, failureMode = "overtopping") {
  const ko = failureMode.toLowerCase() === "overtopping" ? 1.3 : 1.0;
  const sideSlopeZ = failureMode.toLowerCase() === "overtopping" ? 1.0 : 0.7;

  // Froehlich (2008) average breach width: B_bar = 0.27 * Ko * (V_w)^0.32 * (h_b)^0.04
  const bBar = 0.27 * ko * Math.pow(storageVolumeM3, 0.32) * Math.pow(breachHeightM, 0.04);

  // Formation time: t_f (sec) = 63.2 * (V_w / (g * h_b^2))^0.5
  const g = 9.81;
  const tfSec = 63.2 * Math.sqrt(storageVolumeM3 / (g * Math.pow(breachHeightM, 2)));

  // Peak outflow: Q_p = 0.607 * (V_w)^0.295 * (h_w)^1.24
  const qp = 0.607 * Math.pow(storageVolumeM3, 0.295) * Math.pow(breachHeightM, 1.24);

  return {
    breachWidthM: Math.round(bBar * 10) / 10,
    sideSlopeZ,
    formationTimeSec: Math.round(tfSec),
    formationTimeHours: Math.round((tfSec / 3600) * 100) / 100,
    peakOutflowM3s: Math.round(qp)
  };
}

export function calculateClagueMathewsGLOF(lakeVolumeM3) {
  if (lakeVolumeM3 <= 0) return 0;
  // Q_p = 75 * (V_max / 10^6)^0.67
  const volMillion = lakeVolumeM3 / 1e6;
  const qp = 75.0 * Math.pow(volMillion, 0.67);
  return Math.round(qp * 10) / 10;
}

export function computeRiskScore(depthM, velocityMs, population) {
  // Risk Score = Depth (m) * Velocity (m/s) * log10(Population)
  // Normalized to 0-100 scale
  const hydrodynamicIntensity = depthM * velocityMs;
  const popFactor = Math.log10(Math.max(population, 10));
  const rawScore = hydrodynamicIntensity * popFactor * 0.85;
  return Math.min(100, Math.max(5, Math.round(rawScore * 10) / 10));
}

export function generateSyntheticHydrograph(peakDischarge, durationHours = 24, timeToPeak = 2.0) {
  const steps = [];
  const baseflow = 50;
  const dt = 1.0;

  for (let t = 0; t <= durationHours; t += dt) {
    let q = baseflow;
    if (t <= timeToPeak) {
      const ratio = t / Math.max(timeToPeak, 0.1);
      q = baseflow + (peakDischarge - baseflow) * Math.pow(ratio, 2);
    } else {
      const rec = t - timeToPeak;
      const decay = 3.5 / Math.max(durationHours - timeToPeak, 1);
      q = baseflow + (peakDischarge - baseflow) * Math.exp(-decay * rec);
    }
    steps.push({
      time: t,
      inflow: Math.round(q * 0.95),
      sphOutflow: Math.round(q),
      delftOutflow: Math.round(q * 0.97)
    });
  }
  return steps;
}

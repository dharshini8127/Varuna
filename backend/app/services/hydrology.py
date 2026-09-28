"""
VARUNA - Hydrologic & Breach Outflow Modelling Engine (FR-3)
Implements:
1. Froehlich (1995a, 2008) Dam Breach peak outflow and geometric breach parameters
2. Clague-Mathews (1973) Glacial Lake Outburst Flood (GLOF) peak outflow
3. Synthetic Breach Hydrograph Generation (time-series Q(t) in m^3/s)
"""

import math
from typing import Dict, List, Any


def froehlich_breach_parameters(
    storage_volume_m3: float,
    breach_height_m: float,
    failure_mode: str = "overtopping"
) -> Dict[str, float]:
    """
    Computes Froehlich (2008) empirical dam breach geometry and formation time.
    
    Parameters:
    - storage_volume_m3: Volume of water above breach invert at failure (V_w in m^3)
    - breach_height_m: Height of breach (h_b in meters)
    - failure_mode: 'overtopping' (Ko=1.3) or 'piping' (Ko=1.0)
    
    Returns:
    - average_breach_width_m: B_bar (m)
    - side_slope_z: 1.0 (overtopping) or 0.7 (piping)
    - failure_time_sec: t_f (seconds)
    - failure_time_hours: t_f (hours)
    """
    k_o = 1.3 if failure_mode.lower() == "overtopping" else 1.0
    side_slope_z = 1.0 if failure_mode.lower() == "overtopping" else 0.7
    
    # Froehlich (2008) average breach width: B_bar = 0.27 * Ko * (V_w)^0.32 * (h_b)^0.04
    b_bar = 0.27 * k_o * (storage_volume_m3 ** 0.32) * (breach_height_m ** 0.04)
    
    # Froehlich (2008) breach formation time: t_f (hrs) = 63.2 * (V_w / (g * h_b^2))^0.5 / 3600
    g = 9.81
    t_f_sec = 63.2 * math.sqrt(storage_volume_m3 / (g * (breach_height_m ** 2)))
    
    return {
        "average_breach_width_m": round(b_bar, 2),
        "side_slope_z": side_slope_z,
        "failure_time_sec": round(t_f_sec, 1),
        "failure_time_hours": round(t_f_sec / 3600.0, 3)
    }


def froehlich_peak_outflow(storage_volume_m3: float, water_depth_m: float) -> float:
    """
    Froehlich (1995a) empirical peak discharge formula for dam breach:
    Q_p = 0.607 * (V_w)^0.295 * (h_w)^1.24
    
    Units:
    - storage_volume_m3: V_w in m^3
    - water_depth_m: h_w in meters (depth above breach invert)
    
    Returns:
    - peak_outflow_m3s: Q_p in m^3/s
    """
    if storage_volume_m3 <= 0 or water_depth_m <= 0:
        return 0.0
    q_p = 0.607 * (storage_volume_m3 ** 0.295) * (water_depth_m ** 1.24)
    return round(q_p, 2)


def clague_mathews_glof_peak(lake_volume_m3: float) -> float:
    """
    Clague and Mathews (1973) empirical GLOF peak discharge relationship:
    Q_p = 75 * (V / 10^6)^0.67
    
    Units:
    - lake_volume_m3: Total draining volume in m^3
    
    Returns:
    - peak_outflow_m3s: Q_p in m^3/s
    """
    if lake_volume_m3 <= 0:
        return 0.0
    vol_million_m3 = lake_volume_m3 / 1.0e6
    q_p = 75.0 * (vol_million_m3 ** 0.67)
    return round(q_p, 2)


def generate_breach_hydrograph(
    peak_discharge_m3s: float,
    time_to_peak_hours: float,
    total_duration_hours: float,
    baseflow_m3s: float = 25.0,
    time_step_hours: float = 0.5
) -> List[Dict[str, float]]:
    """
    Synthesizes an outflow hydrograph Q(t) using a smooth asymmetric parametric formulation.
    
    Returns a list of records: [{'time_hours': t, 'discharge_m3s': Q}]
    """
    hydrograph = []
    current_time = 0.0
    
    while current_time <= total_duration_hours + 1e-5:
        t = round(current_time, 2)
        if t <= time_to_peak_hours:
            # Rising limb: quadratic or sinusoidal rise
            ratio = t / max(time_to_peak_hours, 0.01)
            q = baseflow_m3s + (peak_discharge_m3s - baseflow_m3s) * (ratio ** 2)
        else:
            # Recession limb: exponential decay
            recession_time = t - time_to_peak_hours
            decay_k = 3.0 / max(total_duration_hours - time_to_peak_hours, 0.1)
            q = baseflow_m3s + (peak_discharge_m3s - baseflow_m3s) * math.exp(-decay_k * recession_time)
            
        hydrograph.append({
            "time_hours": t,
            "discharge_m3s": round(max(q, baseflow_m3s), 2)
        })
        current_time += time_step_hours
        
    return hydrograph

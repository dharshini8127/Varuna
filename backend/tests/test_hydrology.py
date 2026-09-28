"""
Unit tests for Froehlich and Clague-Mathews hydrology algorithms
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from backend.app.services.hydrology import (
    froehlich_breach_parameters,
    froehlich_peak_outflow,
    clague_mathews_glof_peak,
    generate_breach_hydrograph,
)


def test_froehlich_breach_parameters():
    # 20 million m^3 reservoir, 40m dam height, overtopping
    res = froehlich_breach_parameters(
        storage_volume_m3=20_000_000,
        breach_height_m=40.0,
        failure_mode="overtopping"
    )
    assert res["average_breach_width_m"] > 0
    assert res["failure_time_sec"] > 0
    assert res["side_slope_z"] == 1.0


def test_froehlich_peak_outflow():
    # 25 million m^3 storage, 35m water depth
    q_p = froehlich_peak_outflow(storage_volume_m3=25_000_000, water_depth_m=35.0)
    assert q_p > 1000  # realistic peak discharge in m^3/s


def test_clague_mathews_glof_peak():
    # South Lhonak lake outburst ~ 65 million m^3
    q_p = clague_mathews_glof_peak(lake_volume_m3=65_000_000)
    assert q_p > 1000
    assert round(q_p) == 1229  # 75 * (65)^0.67 approx 1229.4 m^3/s


def test_generate_breach_hydrograph():
    hg = generate_breach_hydrograph(
        peak_discharge_m3s=5000.0,
        time_to_peak_hours=2.0,
        total_duration_hours=12.0,
        baseflow_m3s=50.0,
        time_step_hours=1.0
    )
    assert len(hg) == 13
    assert hg[0]["time_hours"] == 0.0
    assert hg[2]["time_hours"] == 2.0
    assert hg[2]["discharge_m3s"] == 5000.0


if __name__ == "__main__":
    test_froehlich_breach_parameters()
    test_froehlich_peak_outflow()
    test_clague_mathews_glof_peak()
    test_generate_breach_hydrograph()
    print("ALL HYDROLOGY UNIT TESTS PASSED!")

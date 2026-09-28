# VARUNA — Dam Break & Flood Inundation Simulation Platform

### Team AEVORA 007 — Smart India Hackathon (SIH) Implementation

VARUNA is an open-source, modular, horizontally-scalable digital twin platform for simulating dam breach flood waves, Glacial Lake Outburst Floods (GLOF), and multi-reach inundation propagation. It bridges advanced hydrodynamic modeling with real-time civil disaster operations.

---

## 🌟 Key Capabilities

1. **Dual Hydrodynamic Modeling Paradigm (NFR-1.1)**
   - **Near-field Turbulence:** High-resolution GPU Smoothed Particle Hydrodynamics (**DualSPHysics**) capturing 3D splash, spillway cavitation, and dam-crest erosion.
   - **Regional Floodplain Routing:** Flexible-mesh 2D shallow water solver (**Delft3D-FM**) routing discharge down to 100+ km river reaches.

2. **Empirical Hydrologic Outflow Formulations (FR-3)**
   - **Froehlich (1995a, 2008):** Average breach width $\bar{B}$, failure formation time $t_f$, and peak discharge $Q_p$.
   - **Clague–Mathews (1973):** Empirical peak discharge relationships for Glacial Lake Outburst Floods (GLOF).
   - **Parametric Breach Hydrographs:** Dynamic $Q(t)$ time-series hydrograph synthesis.

3. **4 Role-Based Interactive Views (FR-8)**
   - 🔬 **Technical & Modeling:** DualSPHysics vs Delft3D-FM solver comparison, interactive parameter sandbox, SAR ground-truth validation metrics (IoU 88.4%, F1 88.9%), GIS exports.
   - 🦺 **Field Operations (NDRF/SDRF):** Live citizen SOS distress triage queue, spatial containment verification (`ST_Contains`), route accessibility, responder dispatch.
   - 🏛️ **Local Administration (SDMA / District Collector):** Village-level risk score ranking ($Risk = Depth \times Velocity \times Population\,Density$), relief shelter occupancy, Common Alerting Protocol (CAP) cell-broadcast trigger.
   - 📢 **Public / Citizen Safety:** "Am I in Danger?" geolocation check, nearest high-ground relief shelters, 1-click SOS distress beacon with auto GPS coordinate lock, emergency helplines.

4. **Multi-Disaster Preset Scenarios**
   - **South Lhonak GLOF & Chungthang Dam Breach (Sikkim 2023)** (Validated against Sentinel-1 SAR).
   - **Kosi River Mega-Avulsion & Embankment Breach (Bihar)**.
   - **Mullaperiyar Spillway Emergency Discharge (Kerala)**.

---

## 🏗️ Architecture & Technology Stack

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                 │
│  React 18 + MapLibre GL JS — 4 Role-Based Views                      │
│  Offline Cache, Dynamic Scrubber, Glassmorphic Tactical UI          │
└───────────────────────────┬───────────────────────────────────────────┘
                             │ REST + WebSocket
┌───────────────────────────▼───────────────────────────────────────────┐
│                        API GATEWAY (FastAPI)                          │
│  Auth · Ingestion · Hydrology Engine · Rescue Triage · Exports        │
└──────┬─────────────┬─────────────┬─────────────┬──────────────────────┘
       │             │             │             │
┌──────▼─────┐ ┌─────▼──────┐ ┌────▼───────┐ ┌───▼────────────┐
│ Ingestion   │ │ Scenario &  │ │ Rescue-    │ │ Real-time      │
│ Service     │ │ Job Mgmt    │ │ Request    │ │ Validation     │
└──────┬──────┘ └─────┬───────┘ └─────┬──────┘ └───────┬────────┘
       │              │               │                │
       └──────────────┴───────┬───────┴────────────────┘
                               │
                    ┌──────────▼───────────┐
                    │  Message Queue        │
                    │  (Redis + Celery)     │
                    └──────────┬───────────┘
                               │
       ┌───────────────────────┼────────────────────────┐
┌──────▼───────┐     ┌─────────▼─────────┐     ┌─────────▼─────────┐
│ Hydro Worker  │     │ Simulation Workers │     │ Validation Worker  │
│ (Froehlich)   │     │ (SPH + Delft3D-FM)│     │ (Sentinel-1 SAR)   │
└──────────────┘     └───────────────────┘     └───────────────────┘
```

- **Frontend:** React, Vite, MapLibre GL JS, Lucide Icons, Custom Glassmorphic Tactical CSS.
- **Backend:** FastAPI, Pydantic, Python 3.12.
- **Geospatial & Storage:** PostGIS, MinIO (S3-compatible), TimescaleDB, Redis.

---

## 🚀 Quickstart Guide

### Option 1: Standalone Local Development (Out-of-the-Box)

No Docker or external database required — runs with embedded fallbacks!

1. **Launch Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Open **http://localhost:5174/** in your browser.

2. **Launch Backend API:**
   ```bash
   # From project root
   pip install -r backend/requirements.txt
   python -m uvicorn backend.app.main:app --reload --port 8000
   ```
   Interactive Swagger documentation available at **http://localhost:8000/docs**.

3. **Run Hydrology Unit Tests:**
   ```bash
   python backend/tests/test_hydrology.py
   ```

### Option 2: Docker Compose (Full Stack with PostGIS & MinIO)

```bash
docker compose up --build
```
- Frontend: `http://localhost:5174`
- Backend API: `http://localhost:8000`
- MinIO Object Storage Console: `http://localhost:9001` (User: `minioadmin`, Pass: `minioadmin`)

"""
VARUNA - OpenTopography Global DEM Ingestion Pipeline (FR-1.1)
Fetches Copernicus 30m (COP30) Global DEM GeoTIFF for Teesta River / Sikkim AOI
Endpoint: https://portal.opentopography.org/API/globaldem
"""
import os
import urllib.request

API_KEY = "0b3d7b9284169c23dc87df92321593dc"

# Teesta River / Sikkim Area of Interest (AOI)
AOI = {
    "south": 27.0,
    "north": 28.2,
    "west": 88.0,
    "east": 88.9
}

def fetch_cop30_dem(output_path="backend/data/cop30_dem_teesta.tif"):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    url = (
        f"https://portal.opentopography.org/API/globaldem?"
        f"demtype=COP30"
        f"&south={AOI['south']}"
        f"&north={AOI['north']}"
        f"&west={AOI['west']}"
        f"&east={AOI['east']}"
        f"&outputFormat=GTiff"
        f"&API_Key={API_KEY}"
    )
    
    print(f"Requesting Copernicus 30m DEM from OpenTopography API...")
    req = urllib.request.Request(url, headers={"User-Agent": "VARUNA-Disaster-Twin/1.0"})
    
    with urllib.request.urlopen(req, timeout=180) as resp:
        if resp.status != 200:
            raise RuntimeError(f"OpenTopography returned HTTP {resp.status}")
        
        content = resp.read()
        with open(output_path, "wb") as f:
            f.write(content)
            
        print(f"Saved COP30 DEM to {output_path} ({len(content)} bytes)")
        return output_path

if __name__ == "__main__":
    fetch_cop30_dem()

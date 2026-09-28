"""
Generate Terrain-RGB tile pyramid from Copernicus 30m (COP30) Global DEM GeoTIFF
Ingested from OpenTopography API.
Using GDAL / rasterio and rio-rgbify encoding.
Tiles are saved to frontend/public/terrain/{z}/{x}/{y}.png
"""
import os
import time
import numpy as np
from PIL import Image
import mercantile
import rasterio
from rasterio.warp import reproject, Resampling
from rio_rgbify.encoders import data_to_rgb

def main():
    start_time = time.time()
    dem_path = 'backend/data/cop30_dem_teesta.tif'
    out_base_dir = 'frontend/public/terrain'
    
    if not os.path.exists(dem_path):
        raise FileNotFoundError(f"COP30 DEM not found at {dem_path}")
        
    print(f"Opening Copernicus 30m DEM (OpenTopography): {dem_path}")
    with rasterio.open(dem_path) as src:
        src_crs = src.crs
        src_transform = src.transform
        print(f"Source CRS: {src_crs}, Bounds: {src.bounds}, Shape: {src.shape}")
        
        # Area of Interest for South Lhonak / Chungthang Dam / Teesta River valley
        # Clamped to COP30 DEM coverage
        aoi_bounds = (88.001, 27.001, 88.899, 28.199)
        
        total_tiles = 0
        zooms = list(range(5, 13)) # Zooms 5 through 12
        
        for z in zooms:
            tiles = list(mercantile.tiles(*aoi_bounds, z))
            total_tiles += len(tiles)
            print(f"Zoom {z}: {len(tiles)} tiles to generate...")
            
            for t in tiles:
                tile_dir = os.path.join(out_base_dir, str(t.z), str(t.x))
                os.makedirs(tile_dir, exist_ok=True)
                tile_path = os.path.join(tile_dir, f"{t.y}.png")
                
                # Get tile bounding box in EPSG:3857
                xy_bounds = mercantile.xy_bounds(t)
                dst_transform = rasterio.transform.from_bounds(*xy_bounds, 256, 256)
                
                tile_data = np.full((256, 256), fill_value=0.0, dtype=np.float32)
                
                reproject(
                    source=rasterio.band(src, 1),
                    destination=tile_data,
                    src_transform=src_transform,
                    src_crs=src_crs,
                    dst_transform=dst_transform,
                    dst_crs='EPSG:3857',
                    resampling=Resampling.bilinear,
                    dst_nodata=0.0
                )
                
                # Clean invalid / nodata values
                tile_data[tile_data < 0] = 0.0
                tile_data[tile_data > 9000] = 9000.0
                
                # Encode into Terrain-RGB using rio-rgbify
                rgb = data_to_rgb(tile_data, baseval=-10000, interval=0.1)
                
                # Save as 256x256 PNG
                img = Image.fromarray(np.transpose(rgb, (1, 2, 0)), mode='RGB')
                img.save(tile_path, format='PNG', optimize=True)
                
    elapsed = time.time() - start_time
    print(f"Successfully generated {total_tiles} Copernicus 30m Terrain-RGB tiles in {elapsed:.2f}s!")
    print(f"Tile pyramid hosted at: {out_base_dir}/{{z}}/{{x}}/{{y}}.png")

if __name__ == '__main__':
    main()

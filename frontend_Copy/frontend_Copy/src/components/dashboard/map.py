# Plotting the provided GeoJSON boundary and the 7 sites, then saving as PNG.
import json, os
import matplotlib.pyplot as plt
from matplotlib.patches import Polygon
from matplotlib.collections import PatchCollection

geojson_path = "/mnt/data/delhi-ac.geojson"
sites = {
    1:(28.69536,77.18168),
    2:(28.5718,77.07125),
    3:(28.58278,77.23441),
    4:(28.82286,77.10197),
    5:(28.53077,77.27123),
    6:(28.72954,77.09601),
    7:(28.71052,77.24951),
}

# Load GeoJSON
with open(geojson_path, 'r', encoding='utf-8') as f:
    gj = json.load(f)

# Extract polygon coordinates (handle FeatureCollection or single Feature)
polygons = []
def extract_coords(obj):
    geom = obj.get('geometry', obj)  # if top-level is geometry
    gtype = geom.get('type')
    coords = geom.get('coordinates')
    if gtype == 'Polygon':
        for ring in coords:
            polygons.append(ring)
    elif gtype == 'MultiPolygon':
        for poly in coords:
            for ring in poly:
                polygons.append(ring)

if gj.get('type') == 'FeatureCollection':
    for feat in gj.get('features', []):
        extract_coords(feat)
else:
    extract_coords(gj)

# Convert to matplotlib-friendly polygons (lon, lat) -> (x, y)
patches = []
for ring in polygons:
    # ring is list of [lon, lat] pairs possibly nested; take as is
    pts = [(pt[0], pt[1]) for pt in ring]
    patches.append(Polygon(pts, closed=True))

# Plot
fig, ax = plt.subplots(figsize=(8,10))
collection = PatchCollection(patches, linewidths=1.0, alpha=0.4)
ax.add_collection(collection)

# Plot sites (lon, lat)
for i,(lat,lon) in sites.items():
    ax.scatter(lon, lat, zorder=5)
    ax.text(lon+0.002, lat+0.002, f"Site {i}", fontsize=9)

# Set limits to slightly larger than polygon bounds or sites bounds
all_lons = []
all_lats = []
for ring in polygons:
    for lon, lat in ring:
        all_lons.append(lon)
        all_lats.append(lat)
for lat, lon in sites.values():
    all_lons.append(lon)
    all_lats.append(lat)

margin_x = (max(all_lons) - min(all_lons)) * 0.05
margin_y = (max(all_lats) - min(all_lats)) * 0.05
ax.set_xlim(min(all_lons)-margin_x, max(all_lons)+margin_x)
ax.set_ylim(min(all_lats)-margin_y, max(all_lats)+margin_y)

ax.set_xlabel("Longitude")
ax.set_ylabel("Latitude")
ax.set_title("Delhi boundary (from uploaded GeoJSON) with 7 Sites")
ax.grid(True)

out_path = "/mnt/data/delhi_boundary_sites.png"
plt.savefig(out_path, dpi=300, bbox_inches='tight')
out_path

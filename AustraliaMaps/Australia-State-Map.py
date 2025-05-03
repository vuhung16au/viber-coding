# Documentation 
# https://apidocs.geoapify.com/docs/boundaries/
# get an API key from https://myprojects.geoapify.com/projects
# OpenStreetMap via Overpass API doesn't require API key

# End-point-API 

"""
part-of endpoint
Returns the list of boundaries the specified location belongs to.

https://api.geoapify.com/v1/boundaries/part-of?lon=12.789931425885811&lat=51.16772168907602&geometry=geometry_1000&apiKey=YOUR_API_KEY

lon, lat - location coordinates
geometry - geometry type with specified accuracy
apiKey - your Geoapify key
get an API key from https://myprojects.geoapify.com/projects


"""

import requests
import os
import geopandas as gpd
import matplotlib.pyplot as plt
from shapely.geometry import shape
import json
from dotenv import load_dotenv
import argparse
import overpy  # For OpenStreetMap data via Overpass API

# Load API key from .env file (only needed for Geoapify)
load_dotenv()
API_KEY = os.getenv("GEOAPIFY_API_KEY")

def fetch_boundary_data_geoapify(url):
    """Fetch boundary data from Geoapify API"""
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Failed to fetch data from {url}. HTTP status code: {response.status_code}")
        return None

def fetch_boundary_data_osm(state_name, state_code):
    """Fetch Australian state boundary data using Overpass API"""
    api = overpy.Overpass()
    
    # Use shorter timeouts to prevent hanging
    api.timeout = 180
    
    # Special case for Tasmania to get cleaner boundaries
    if state_name == "Tasmania":
        query = """
        [out:json][timeout:180];
        // Get Tasmania with admin_level=4 (state level)
        relation["name"="Tasmania"]["admin_level"="4"]["boundary"="administrative"];
        out geom;
        """
    # Query for Australia as a whole
    elif state_name == "AU":
        query = """
        [out:json][timeout:180];
        relation["admin_level"="2"]["ISO3166-1"="AU"];
        out geom;
        """
    else:
        # Query for states within Australia
        query = f"""
        [out:json][timeout:180];
        area["ISO3166-1"="AU"][admin_level=2]->.australia;
        relation["name"="{state_name}"][boundary=administrative](area.australia);
        out geom;
        """
    
    try:
        print(f"Fetching boundary data for {state_name} from OpenStreetMap...")
        result = api.query(query)
        
        if not result.relations:
            # Try alternative query if no results
            alt_query = f"""
            [out:json][timeout:180];
            relation["name"="{state_name}"][boundary=administrative]["admin_level"~"4|5"];
            out geom;
            """
            print(f"No data found for {state_name}, trying alternative query...")
            result = api.query(alt_query)
            
            if not result.relations:
                print(f"Still no data found for {state_name}")
                return None
        
        # Process relation geometries to GeoJSON format
        features = []
        for relation in result.relations:
            # Extract outer and inner ways for proper polygon representation
            outer_ways = {}
            inner_ways = {}
            
            # Group points by way ID to form the polygons
            for member in relation.members:
                if member.role == "outer" and hasattr(member, "geometry"):
                    nodes = [[float(node.lon), float(node.lat)] for node in member.geometry]
                    way_id = getattr(member, 'ref', f'outer_{len(outer_ways)}')
                    outer_ways[way_id] = nodes
                elif member.role == "inner" and hasattr(member, "geometry"):
                    nodes = [[float(node.lon), float(node.lat)] for node in member.geometry]
                    way_id = getattr(member, 'ref', f'inner_{len(inner_ways)}')
                    inner_ways[way_id] = nodes
            
            # If we have outer ways, form a polygon or multipolygon
            if outer_ways:
                # For a simple case, just use all outer rings as a multipolygon
                multi_polygon = []
                for way_id, nodes in outer_ways.items():
                    # Make sure the ring is closed
                    if nodes[0] != nodes[-1] and len(nodes) > 1:
                        nodes.append(nodes[0])
                    # Only include valid rings
                    if len(nodes) >= 4:
                        multi_polygon.append([nodes])
                
                # Create the appropriate geometry type based on number of polygons
                if len(multi_polygon) == 1:
                    geometry = {
                        "type": "Polygon",
                        "coordinates": multi_polygon[0]
                    }
                else:
                    geometry = {
                        "type": "MultiPolygon", 
                        "coordinates": multi_polygon
                    }
                
                # Create the feature
                features.append({
                    "type": "Feature",
                    "properties": {
                        "name": state_name,
                        "osm_id": relation.id,
                        "admin_level": relation.tags.get("admin_level", "unknown")
                    },
                    "geometry": geometry
                })
        
        if features:
            return {"type": "FeatureCollection", "features": features}
        else:
            print(f"Failed to extract geometry for {state_name}")
            return None
            
    except Exception as e:
        print(f"Error fetching OSM data for {state_name}: {str(e)}")
        return None

def draw_australia_with_boundaries(map_source="openstreetmap", load_from_local=False, show_legends=False, filename=None, display_map=True):
    all_geometries = []
    fetched_data = {}
    
    # Set default filename with map source suffix if not provided
    if filename is None:
        filename = f"AustraliaMap-{map_source}.png"
    
    # Ensure both the boundaries and output directories exist
    os.makedirs("./boundaries", exist_ok=True)
    os.makedirs("./output", exist_ok=True)
    
    # Prepend output directory to filename if it doesn't already include a path
    if os.path.dirname(filename) == '':
        filename = os.path.join("./output", filename)
        
    # Define the local cache file based on the map source
    local_cache_file = f"./boundaries/fetched_map_data_{map_source}.json"

    if load_from_local:
        # Load data from local storage
        try:
            with open(local_cache_file, "r") as json_file:
                fetched_data = json.load(json_file)
                for state, data in fetched_data.items():
                    if data and 'features' in data:
                        # For Tasmania, only use the first feature to avoid overlapping boundaries
                        if state == "Tasmania" and len(data['features']) > 0:
                            feature = data['features'][0]
                            geometry = shape(feature['geometry'])
                            all_geometries.append({
                                'state': state,
                                'geometry': geometry
                            })
                        else:
                            for feature in data['features']:
                                geometry = shape(feature['geometry'])
                                all_geometries.append({
                                    'state': state,
                                    'geometry': geometry
                                })
        except FileNotFoundError:
            print(f"Local map data not found at {local_cache_file}. Please fetch data first.")
            return
    else:
        # Fetch and process data based on the selected map source
        if map_source.lower() == "geoapify":
            # Fetch from Geoapify API
            for state, url in urls.items():
                data = fetch_boundary_data_geoapify(url)
                if data and 'features' in data:
                    fetched_data[state] = data
                    
                    if state == "Tasmania" and len(data['features']) > 0:
                        feature = data['features'][0]
                        geometry = shape(feature['geometry'])
                        all_geometries.append({
                            'state': state,
                            'geometry': geometry
                        })
                    else:
                        for feature in data['features']:
                            geometry = shape(feature['geometry'])
                            all_geometries.append({
                                'state': state,
                                'geometry': geometry
                            })
        else:  # openstreetmap
            # Fetch from OpenStreetMap using Overpass API
            for state, full_name in state_mapping.items():
                # Skip Australia if it's not in the list (check against keys in urls)
                if state == "Australia" and state not in urls:
                    continue
                
                data = fetch_boundary_data_osm(full_name, state)
                if data and 'features' in data:
                    fetched_data[state] = data
                    
                    if state == "Tasmania":
                        # For Tasmania, only use the largest feature to avoid overlapping boundaries
                        largest_area = 0
                        largest_feature = None
                        
                        for feature in data['features']:
                            geom = shape(feature['geometry'])
                            try:
                                area = geom.area
                                if area > largest_area:
                                    largest_area = area
                                    largest_feature = feature
                            except Exception as e:
                                print(f"Could not process geometry for {state}: {e}")
                        
                        if largest_feature:
                            all_geometries.append({
                                'state': state,
                                'geometry': shape(largest_feature['geometry'])
                            })
                    else:
                        # Process other states normally
                        for feature in data['features']:
                            geometry = shape(feature['geometry'])
                            all_geometries.append({
                                'state': state,
                                'geometry': geometry
                            })

        # Save fetched data to local storage in JSON format
        with open(local_cache_file, "w") as json_file:
            json.dump(fetched_data, json_file)

    if not all_geometries:
        print("No geometries to plot. Check if data was fetched correctly.")
        return
            
    # Create GeoDataFrame
    gdf = gpd.GeoDataFrame(all_geometries)

    # Transform data to WGS84 (EPSG:4326) for plotting in latitude and longitude
    gdf = gdf.set_crs(epsg=4326)
    
    # Define a distinct color map for Australian states
    # Use a more distinct color palette than tab10
    state_colors = {
        'NSW': '#FF6B6B',  # Red
        'Victoria': '#4ECDC4',  # Teal
        'Queensland': '#FFD166',  # Yellow
        'South Australia': '#6A0572',  # Purple
        'Western Australia': '#1A535C',  # Dark Teal
        'Tasmania': '#FF9F1C',  # Orange
        'Northern Territory': '#2EC4B6',  # Turquoise
        'ACT': '#E63946',  # Red
        'Australia': '#CCCCCC',  # Light Gray
    }
    
    # Create a categorical color map
    from matplotlib.colors import ListedColormap
    import pandas as pd  # Add pandas import for concat
    states = list(state_mapping.keys())
    colors = [state_colors.get(state, '#CCCCCC') for state in states]
    custom_cmap = ListedColormap(colors)
    
    # Plot the map with state boundaries
    fig, ax = plt.subplots(1, 1, figsize=(12, 10))
    
    # Update Tasmania plotting approach
    tasmania_gdf = gdf[gdf['state'] == 'Tasmania']
    main_gdf = gdf[gdf['state'] != 'Tasmania']
    
    # Plot main continent
    main_plot = main_gdf.plot(column='state', ax=ax, categorical=True, legend=show_legends, 
                      edgecolor='black', linewidth=0.5, cmap=custom_cmap)
    
    # Plot Tasmania with thicker edges and solid fill
    if not tasmania_gdf.empty:
        tasmania_gdf.plot(ax=ax, color=state_colors['Tasmania'], 
                       edgecolor='black', linewidth=1.5)
    
    plt.title(f"Australia Map with State Boundaries ({map_source.capitalize()} data)")
    plt.xlabel("Longitude")
    plt.ylabel("Latitude")
    
    # Add state labels for clarity
    for state in states:
        state_gdf = gdf[gdf['state'] == state]
        if not state_gdf.empty:
            try:
                # Try to get a representative point safely
                for idx, row in state_gdf.iterrows():
                    geom = row.geometry
                    if geom and not geom.is_empty:
                        try:
                            # Use representative_point() which is safer than centroid
                            point = geom.representative_point()
                            ax.text(point.x, point.y, state, fontsize=8, ha='center', va='center')
                            # Only label once per state
                            break
                        except:
                            # If that fails, try centroid
                            try:
                                point = geom.centroid
                                ax.text(point.x, point.y, state, fontsize=8, ha='center', va='center')
                                break
                            except:
                                continue
            except Exception as e:
                print(f"Could not place label for {state}: {e}")

    # Save the map as a PNG file with higher resolution
    plt.savefig(filename, dpi=300, bbox_inches='tight')
    
    # Only show the map if display_map is True
    if display_map:
        plt.show()
    else:
        plt.close()

def gen_all_maps(map_source="openstreetmap", load_from_local=False):
    """Generate all variants of Australia maps and save them to disk"""
    print(f"Generating all map variants using {map_source} data...")
    
    # Generate map with no islands, no legends
    print("Generating map without islands, without legends...")
    global urls
    
    # Save the original URLs
    original_urls = urls.copy()
    
    # Without islands (exclude Australia)
    if "Australia" in urls:
        urls.pop("Australia", None)
    draw_australia_with_boundaries(map_source=map_source, load_from_local=load_from_local, show_legends=False, 
                                  filename=f"./output/AustraliaMap-no-Islands-no-Legends-{map_source}.png", display_map=False)
    
    # Without islands, with legends
    print("Generating map without islands, with legends...")
    draw_australia_with_boundaries(map_source=map_source, load_from_local=load_from_local, show_legends=True, 
                                  filename=f"./output/AustraliaMap-no-Islands-with-Legends-{map_source}.png", display_map=False)
    
    # Restore original URLs
    urls = original_urls.copy()
    
    # With islands, no legends
    print("Generating map with islands, without legends...")
    draw_australia_with_boundaries(map_source=map_source, load_from_local=load_from_local, show_legends=False, 
                                  filename=f"./output/AustraliaMap-with-Islands-no-Legends-{map_source}.png", display_map=False)
    
    # With islands, with legends
    print("Generating map with islands, with legends...")
    draw_australia_with_boundaries(map_source=map_source, load_from_local=load_from_local, show_legends=True, 
                                  filename=f"./output/AustraliaMap-with-Islands-with-Legends-{map_source}.png", display_map=False)
    
    print(f"All map variants using {map_source} data have been generated and saved to disk.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Draw Australia map with state boundaries.",
        formatter_class=argparse.RawTextHelpFormatter,
        epilog="""
Examples:
  python Australia-State-Map.py                                 # Default: Use OpenStreetMap, exclude Australia mainland
  python Australia-State-Map.py --map-source=geoapify           # Use Geoapify API instead of OpenStreetMap
  python Australia-State-Map.py --no-island=n                   # Include Australia mainland
  python Australia-State-Map.py --add-map-legends=y            # Show legends on the map
  python Australia-State-Map.py --load-local                   # Load cached data from local storage
  python Australia-State-Map.py --gen-all                      # Generate all map variants and save to disk
"""
    )
    
    parser.add_argument("--map-source",
                      type=str, 
                      choices=['geoapify', 'openstreetmap'], 
                      default='openstreetmap',
                      help="Choose the map data source:\n"
                           "geoapify: Use Geoapify API (requires API key)\n"
                           "openstreetmap: Use OpenStreetMap via Overpass API (default)")
    
    parser.add_argument("--load-local", 
                      action="store_true", 
                      help="Load map data from local storage instead of fetching from API.")
                      
    parser.add_argument("--no-island", 
                      type=str, 
                      choices=['y', 'Y', 'Yes', 'n', 'N', 'No'], 
                      default='y', 
                      help="Control whether to exclude Australia mainland data:\n"
                           "y/Y/Yes: exclude Australia mainland (default)\n"
                           "n/N/No: include Australia mainland")
                           
    parser.add_argument("--add-map-legends", 
                      type=str, 
                      choices=['y', 'Y', 'Yes', 'n', 'N', 'No'], 
                      default='n', 
                      help="Control whether to show map legends:\n"
                           "y/Y/Yes: show legends\n"
                           "n/N/No: hide legends (default)")

    parser.add_argument("--gen-all", 
                      action="store_true", 
                      help="Generate all map variants (with/without islands, with/without legends) and save to disk.")

    # Parse arguments
    args = parser.parse_args()

    # Get map data source
    map_source = args.map_source.lower()
    
    # Determine whether to include Australia data
    include_australia = args.no_island.lower() in ['n', 'no']
    
    # Determine whether to display map legends
    show_legends = args.add_map_legends.lower() in ['y', 'yes']

    # Define URLs for Australia and its states (for Geoapify)
    urls = {
        "Australia": f"https://api.geoapify.com/v1/boundaries/consists-of?id=51176098d366ab60405902e9a0cc06b73ac0f00101f901743a010000000000c0020b9203094175737472616c6961&geometry=geometry_5000&apiKey={API_KEY}",
        "NSW": f"https://api.geoapify.com/v1/boundaries/consists-of?id=51e99499555f52624059f2cb54feeb6a40c0f00101f901315923000000000092030f4e657720536f7574682057616c6573&geometry=geometry_5000&apiKey={API_KEY}",
        "Victoria": f"https://api.geoapify.com/v1/boundaries/consists-of?id=51f0deebf5c1126240594479736c984b42c0f00101f901c559230000000000920308566963746f726961&geometry=geometry_5000&apiKey={API_KEY}",
        "Queensland": f"https://api.geoapify.com/v1/boundaries/consists-of?id=51f15c2cf5bbd8614059085d56072f7033c0f00101f901335923000000000092030a517565656e736c616e64&geometry=geometry_5000&apiKey={API_KEY}",
        "South Australia": f"https://api.geoapify.com/v1/boundaries/consists-of?id=51787ed8a0e911614059132c299cee0640c0f00101f901345923000000000092030f536f757468204175737472616c6961&geometry=geometry_5000&apiKey={API_KEY}",
        "Western Australia": f"https://api.geoapify.com/v1/boundaries/consists-of?id=5142b2fa1f224b5e4059678d1dc2f86138c0f00101f90136592300000000009203115765726e204175737472616c6961&geometry=geometry_5000&apiKey={API_KEY}",
        "Tasmania": f"https://api.geoapify.com/v1/boundaries/consists-of?id=51910a5391fc58624059624c72f14b0745c0f00101f90174282400000000009203085461736d616e6961&geometry=geometry_5000&apiKey={API_KEY}",
        "Northern Territory": f"https://api.geoapify.com/v1/boundaries/consists-of?id=51fa3403b9f4af6040598c068afc447634c0f00101f90132592300000000009203124e6f72746865726e205465727269746f7279&geometry=geometry_5000&apiKey={API_KEY}",
        "ACT": f"https://api.geoapify.com/v1/boundaries/consists-of?id=515036b8599a9e624059f3bd32b9e2c241c0f00101f90115ec23000000000092031c4175737472616c69616e204361706974616c205465727269746f7279&geometry=geometry_5000&apiKey={API_KEY}"
    }
    
    # Define Australian states and their codes (for OpenStreetMap)
    state_mapping = {
        "Australia": "AU",
        "NSW": "New South Wales",
        "Victoria": "Victoria",
        "Queensland": "Queensland",
        "South Australia": "South Australia",
        "Western Australia": "Western Australia",
        "Tasmania": "Tasmania",
        "Northern Territory": "Northern Territory",
        "ACT": "Australian Capital Territory"
    }

    

    # Check if --gen-all option is specified
    if args.gen_all:
        # Generate all map variants
        gen_all_maps(map_source=map_source, load_from_local=args.load_local)
    else:
        # Modify URLs based on the --no-island option
        if not include_australia:
            urls.pop("Australia", None)

        # Generate the single requested map
        draw_australia_with_boundaries(map_source=map_source, load_from_local=args.load_local, show_legends=show_legends)

# Australia Maps Project

This project provides Python scripts to generate and manipulate maps of Australia, including state boundaries and island configurations.

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd AustraliaMaps
   ```

2. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Create a `.env` file in the root directory with your Geoapify API key:
   ```
   GEOAPIFY_API_KEY=your_api_key_here
   ```
   You can obtain an API key from [Geoapify](https://myprojects.geoapify.com/projects).

## How to Run

Run the main script to generate maps:
```bash
python Australia-State-Map.py
```

## Command Line Options

The script supports the following command-line options:

### `--map-source=<value>`
Choose the map data source.

Options:
- `openstreetmap`: Use OpenStreetMap via Overpass API (default)
- `geoapify`: Use Geoapify API (requires API key)

```bash
python Australia-State-Map.py --map-source=openstreetmap  # Use OpenStreetMap data (default)
python Australia-State-Map.py --map-source=geoapify       # Use Geoapify API data
```

### `--load-local`
Load map data from local storage instead of fetching from the API.

```bash
python Australia-State-Map.py --load-local
```

### `--no-island=<value>`
Control whether to include or exclude Australia mainland data.

Options:
- `y`, `Y`, `Yes`: Exclude Australia mainland (default)
- `n`, `N`, `No`: Include Australia mainland

```bash
python Australia-State-Map.py --no-island=n  # Include Australia mainland
python Australia-State-Map.py --no-island=y  # Exclude Australia mainland (default)
```

### `--add-map-legends=<value>`
Control whether to show map legends.

Options:
- `y`, `Y`, `Yes`: Show legends
- `n`, `N`, `No`: Hide legends (default)

```bash
python Australia-State-Map.py --add-map-legends=y  # Show map legends
python Australia-State-Map.py --add-map-legends=n  # Hide map legends (default)
```

### `--gen-all`
Generate all map variants and save them to disk. This will create the following maps:
- Australia without islands, without legends
- Australia without islands, with legends
- Australia with islands, without legends
- Australia with islands, with legends

```bash
python Australia-State-Map.py --gen-all
```

You can combine this with `--load-local` to generate all variants using cached data:
```bash
python Australia-State-Map.py --gen-all --load-local
```

## Data Sources: Geoapify API vs OpenStreetMap API

This project supports two main sources for Australia state boundary data:

### Geoapify API
- Provides high-quality, ready-to-use administrative boundary data.
- Requires a free API key from [Geoapify](https://myprojects.geoapify.com/projects).
- Data is fetched via HTTP requests to the Geoapify Boundaries API.
- Recommended for users who want reliable, up-to-date boundaries with minimal setup.
- See: [Geoapify Boundaries API Documentation](https://apidocs.geoapify.com/docs/boundaries/)

### OpenStreetMap (Overpass API)
- Uses open data from OpenStreetMap, accessed via the Overpass API.
- Does NOT require an API key.
- Boundaries are constructed from OSM relations and may require more processing.
- Good for fully open-source workflows or when avoiding API key requirements.
- See: [OpenStreetMap Overpass API](https://wiki.openstreetmap.org/wiki/Overpass_API)

You can choose the data source using the `--map-source` argument:
- `--map-source=geoapify` (requires API key)
- `--map-source=openstreetmap` (default, no API key required)

## Examples

Here are some example commands:

```bash
# Default: Exclude Australia mainland, no legends, fetch data from API
python Australia-State-Map.py

# Include Australia mainland
python Australia-State-Map.py --no-island=n

# Show legends on the map
python Australia-State-Map.py --add-map-legends=y

# Load cached data from local storage
python Australia-State-Map.py --load-local

# Generate all map variants and save to disk
python Australia-State-Map.py --gen-all

# Generate all map variants using cached data
python Australia-State-Map.py --gen-all --load-local
```

## Maps Created

When running with default options, the script creates:
- **AustraliaMap.png**: Default map based on specified options.

When using the `--gen-all` option, the script generates:
- **AustraliaMap-no-Islands-no-Legends.png**: A map of Australia excluding islands, without legends.
- **AustraliaMap-no-Islands-with-Legends.png**: A map of Australia excluding islands, with legends.
- **AustraliaMap-with-Islands-no-Legends.png**: A map of Australia including islands, without legends.
- **AustraliaMap-with-Islands-with-Legends.png**: A map of Australia including islands, with legends.

All maps include state boundaries and are generated in the project directory.

## Australia Map Data

- https://wiki.openstreetmap.org/wiki/Overpass_API
- https://www.abs.gov.au/statistics/standards/australian-statistical-geography-standard-asgs-edition-3/jul2021-jun2026
- https://download.geofabrik.de/australia-oceania.html
- https://www.geoapify.com/
- https://asgs.linked.fsdf.org.au/datasets

## Known Bugs

- See [[issues]]


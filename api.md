# api verification

this document tracks the status and structure of external api endpoints used for real-time geopolitical intelligence.

## satellites
- **endpoint**: `https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=json`
- **status**: online
- **structure**:
  ```json
  [
    {
      "OBJECT_NAME": "ISS (ZARYA)",
      "OBJECT_ID": "1998-067A",
      "EPOCH": "2024-03-31T...",
      "TLE_LINE1": "1 25544U 98067A ...",
      "TLE_LINE2": "2 25544  51.6400 ..."
    }
  ]
  ```

## aircraft
- **endpoint**: `https://opensky-network.org/api/states/all`
- **status**: online (heavy payload)
- **structure**:
  ```json
  {
    "time": 1774973319,
    "states": [
      ["39de4f", "TVF3527 ", "France", 1774973319, 1774973319, 8.0948, 45.9707, 11582.4, false, 223.72, 298.27, 0.33, null, 11559.54, "1000", false, 0]
    ]
  }
  ```

## ports and chokepoints
- **endpoint**: `https://overpass-api.de/api/interpreter`
- **status**: online
- **structure**:
  ```json
  {
    "elements": [
      {
        "type": "node",
        "id": 26949033,
        "lat": 51.95,
        "lon": 4.12,
        "tags": { "man_made": "port", "name": "port of rotterdam" }
      }
    ]
  }
  ```

## conflict events
- **endpoint**: `https://api.gdeltproject.org/api/v2/geo/geo?query=mil_conflict&format=geojson`
- **status**: online (gdelt)
- **structure**:
  ```json
  {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "properties": { "url": "...", "name": "conflict node", "html": "..." },
        "geometry": { "type": "Point", "coordinates": [32.3, 48.4] }
      }
    ]
  }
  ```

## news
- **endpoint**: `https://newsdata.io/api/1/news`
- **status**: auth error (demo key expired)
- **structure**:
  ```json
  {
    "status": "error",
    "results": { "message": "invalid api key", "code": "unauthorized" }
  }
  ```

## eez boundaries
- **endpoint**: `https://geo.vliz.be/geoserver/MarineRegions/ows`
- **status**: online (marine regions)
- **structure**:
  ```json
  {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "geometry": { "type": "MultiPolygon", "coordinates": [...] }
      }
    ]
  }
  ```

## military bases
- **endpoint**: `https://query.wikidata.org/sparql`
- **status**: online (wikidata)
- **structure**:
  ```json
  {
    "results": {
      "bindings": [
        { "item": { "type": "uri", "value": "http://www.wikidata.org/entity/Q516" } }
      ]
    }
  }
  ```

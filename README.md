# ATOM - Geopolitics Analysis Tool

ATOM (Advanced Tactical Observation & Mapping) is a real-time geopolitics analysis platform inspired by Palantir, designed for intelligence gathering and strategic visualization.

## Features

### Current Features

- **3D Interactive Globe** - Full-featured 3D map powered by CesiumJS/Resium with high-resolution satellite imagery
- **Satellite Tracking** - Real-time tracking of orbital satellites using Celestrak TLE data and satellite.js
- **Aircraft Tracking** - Live aircraft position monitoring via OpenSky Network API
- **Place Information** - Click anywhere on the map to retrieve location details via Nominatim geocoding
- **News Intelligence** - Location-based news aggregation from NewsData.io API
- **Dark Theme UI** - Professional dark interface optimized for extended use

### Planned Features

- **Ship/Vessel Tracking** - Maritime vessel tracking using AIS data
- **Pattern-of-Life Analysis** - Behavioral pattern detection and visualization
- **Timeline Analysis** - Historical data playback and temporal analysis
- **Unified Dashboard** - Centralized intelligence dashboard with customizable widgets
- **Real-time INTEL Feed** - Consolidated news and intelligence gathering system

## Tech Stack

- **Framework**: Next.js 16 (React 19)
- **3D Mapping**: CesiumJS + Resium
- **Styling**: Tailwind CSS 4
- **Satellite Data**: satellite.js + Celestrak TLE
- **APIs**: OpenSky Network, NewsData.io, Nominatim

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd atom
```

2. Install dependencies:
```bash
npm install
```

3. Copy the environment configuration:
```bash
cp .env.example .env.local
```

4. Configure API keys in `.env.local` (see API Configuration below)

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## API Configuration

Create a `.env.local` file with the following variables:

```bash
# Cesium (required)
NEXT_PUBLIC_CESIUM_BASE_URL=/cesium

# NewsData.io - Get free key at https://newsdata.io/
# Free tier: 200 credits/day
NEWSDATA_API_KEY=your_newsdata_api_key_here

# OpenSky Network - Get free account at https://opensky-network.org/
# Note: Requires OAuth2 authentication
OPENSKY_USERNAME=your_opensky_username
OPENSKY_PASSWORD=your_opensky_password

# World News API (optional) - https://worldnewsapi.com/
WORLD_NEWS_API_KEY=your_worldnews_api_key_here
```

### API Rate Limits

- **NewsData.io**: 200 requests/day (free tier)
- **OpenSky Network**: Rate limited based on account tier
- **Nominatim**: 1 request/second (OpenStreetMap)

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── map/               # Map page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── CesiumMap.tsx      # 3D globe component
│   ├── Aircraft.tsx       # Aircraft tracking
│   ├── Satalite.tsx       # Satellite tracking
│   ├── PlaceInfo.tsx      # Location info panel
│   └── SearchOverlay.tsx  # Search UI
```

## Build

```bash
npm run build
```

## License

MIT

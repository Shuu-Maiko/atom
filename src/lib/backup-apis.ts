export const AIRCRAFT_APIS = [
  {
    name: 'OpenSky Network',
    url: 'https://opensky-network.org/api/states/all',
    type: 'ADS-B',
    rateLimit: '~1 request/10sec for public',
    auth: false,
    notes: 'Best free option, good coverage',
  },
  {
    name: 'ADS-B.lol',
    url: 'https://api.adsb.lol/v2/feed/[icao24]',
    type: 'ADS-B',
    rateLimit: 'Free tier available',
    auth: 'Free API key required',
    notes: 'Good alternative, needs key',
  },
  {
    name: 'ADSBExchange',
    url: 'https://adsbexchange.com/api/aircraft/json/',
    type: 'ADS-B',
    rateLimit: 'No strict limit but ask nicely',
    auth: false,
    notes: 'Community driven, good coverage',
  },
  {
    name: 'FlightRadar24 (Premium)',
    url: 'https://api.flightradar24.com/',
    type: 'Mixed',
    rateLimit: 'Paid only',
    auth: 'API key required',
    notes: 'Best data but expensive',
  },
  {
    name: 'RadarBox',
    url: 'https://www.radarbox.com/api/sharing-server/v1/aircraft.json',
    type: 'ADS-B',
    rateLimit: 'Free tier available',
    auth: 'Free API key',
    notes: 'Good coverage, needs key',
  },
];

export const PLACE_APIS = [
  {
    name: 'Nominatim (OpenStreetMap)',
    url: 'https://nominatim.openstreetmap.org/',
    type: 'Geocoding',
    rateLimit: '1 request/sec',
    auth: false,
    notes: 'Free but strict rate limit - use User-Agent rotation',
  },
  {
    name: 'Geocode.maps.co',
    url: 'https://geocode.maps.co/search',
    type: 'Geocoding',
    rateLimit: 'Less strict than Nominatim',
    auth: false,
    notes: 'Good alternative to Nominatim',
  },
  {
    name: 'LocationIQ',
    url: 'https://us1.locationiq.com/v1/search.php',
    type: 'Geocoding',
    rateLimit: 'Free tier: 5000/day',
    auth: 'Free API key needed',
    notes: 'Reliable, needs key',
  },
];

export const SATELLITE_TLE_APIS = [
  {
    name: 'Celestrak',
    url: 'https://celestrak.org/NORAD/elements/gp.php',
    type: 'TLE',
    rateLimit: '1 request/2hr for GROUP=active',
    auth: false,
    notes: 'Best for satellite TLE data',
  },
  {
    name: 'Space-Track',
    url: 'https://www.space-track.org/',
    type: 'TLE',
    rateLimit: 'Requires free account',
    auth: 'Free account needed',
    notes: 'Official US data, needs login',
  },
];

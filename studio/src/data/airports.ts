// Illustrative set of long-runway airports used as diversion points. [lon, lat]
export type Airport = { code: string; name: string; at: [number, number] };

export const airports: Airport[] = [
  // North Atlantic
  { code: 'BOS', name: 'Boston', at: [-71.0, 42.36] },
  { code: 'JFK', name: 'New York', at: [-73.78, 40.64] },
  { code: 'YYT', name: "St. John's", at: [-52.75, 47.62] },
  { code: 'YQX', name: 'Gander', at: [-54.57, 48.94] },
  { code: 'BGSF', name: 'Kangerlussuaq', at: [-50.71, 67.01] },
  { code: 'KEF', name: 'Keflavík', at: [-22.6, 63.98] },
  { code: 'SNN', name: 'Shannon', at: [-8.92, 52.7] },
  { code: 'LHR', name: 'London', at: [-0.45, 51.47] },
  { code: 'CDG', name: 'Paris', at: [2.55, 49.0] },
  { code: 'LIS', name: 'Lisbon', at: [-9.13, 38.77] },
  { code: 'TER', name: 'Lajes (Azores)', at: [-27.09, 38.76] },
  { code: 'BDA', name: 'Bermuda', at: [-64.68, 32.36] },
  { code: 'YYZ', name: 'Toronto', at: [-79.63, 43.68] },
  // Pacific
  { code: 'SFO', name: 'San Francisco', at: [-122.38, 37.62] },
  { code: 'LAX', name: 'Los Angeles', at: [-118.41, 33.94] },
  { code: 'ANC', name: 'Anchorage', at: [-149.99, 61.17] },
  { code: 'CDB', name: 'Cold Bay', at: [-162.72, 55.21] },
  { code: 'HNL', name: 'Honolulu', at: [-157.92, 21.32] },
  { code: 'MDY', name: 'Midway Atoll', at: [-177.38, 28.2] },
  { code: 'AWK', name: 'Wake Island', at: [166.64, 19.28] },
  { code: 'GUM', name: 'Guam', at: [144.8, 13.48] },
  { code: 'NRT', name: 'Tokyo', at: [140.39, 35.77] },
  { code: 'MAJ', name: 'Majuro', at: [171.27, 7.06] },
  { code: 'NAN', name: 'Nadi (Fiji)', at: [177.44, -17.76] },
  { code: 'PPT', name: 'Tahiti', at: [-149.61, -17.55] },
  { code: 'AKL', name: 'Auckland', at: [174.79, -37.01] },
  { code: 'SYD', name: 'Sydney', at: [151.18, -33.94] },
  { code: 'IPC', name: 'Easter Island', at: [-109.42, -27.16] },
  { code: 'SCL', name: 'Santiago', at: [-70.79, -33.39] },
];

export const byCode = (code: string) => {
  const a = airports.find((x) => x.code === code);
  if (!a) throw new Error(`Unknown airport ${code}`);
  return a;
};

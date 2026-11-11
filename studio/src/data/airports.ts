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

// Extra major airports worldwide (approximate positions, for the "every airport" dot field)
const extra: [string, number, number][] = [
  ['ATL', -84.43, 33.64], ['ORD', -87.9, 41.98], ['DFW', -97.04, 32.9], ['DEN', -104.67, 39.86], ['SEA', -122.31, 47.45],
  ['MIA', -80.29, 25.79], ['YVR', -123.18, 49.19], ['MEX', -99.07, 19.44], ['GRU', -46.47, -23.43], ['EZE', -58.54, -34.82],
  ['BOG', -74.15, 4.7], ['LIM', -77.11, -12.02], ['PTY', -79.38, 9.07], ['MAD', -3.57, 40.47], ['FRA', 8.57, 50.03],
  ['AMS', 4.76, 52.31], ['FCO', 12.25, 41.8], ['IST', 28.75, 41.26], ['CAI', 31.4, 30.12], ['DXB', 55.36, 25.25],
  ['DOH', 51.61, 25.27], ['JNB', 28.24, -26.14], ['CPT', 18.6, -33.97], ['NBO', 36.93, -1.32], ['LOS', 3.32, 6.58],
  ['ADD', 38.8, 8.98], ['DEL', 77.1, 28.56], ['BOM', 72.87, 19.09], ['BKK', 100.75, 13.69], ['SIN', 103.99, 1.36],
  ['HKG', 113.92, 22.31], ['PEK', 116.6, 40.08], ['PVG', 121.8, 31.14], ['ICN', 126.45, 37.46], ['KUL', 101.71, 2.75],
  ['CGK', 106.65, -6.13], ['MNL', 121.02, 14.51], ['PER', 115.97, -31.94], ['MEL', 144.84, -37.67], ['SVO', 37.41, 55.97],
  ['MLE', 73.53, 4.19], ['MRU', 57.68, -20.43], ['NOU', 166.21, -22.01], ['DKR', -17.49, 14.74], ['CMN', -7.59, 33.37],
  ['ALG', 3.22, 36.69], ['ATH', 23.94, 37.94], ['ARN', 17.92, 59.65], ['HEL', 24.96, 60.32], ['RUH', 46.7, 24.96],
  ['KHI', 67.16, 24.91], ['CMB', 79.88, 7.18], ['DAC', 90.4, 23.84], ['CAN', 113.3, 23.39], ['TPE', 121.23, 25.08],
  ['KIX', 135.24, 34.43], ['CTS', 141.69, 42.78], ['DRW', 130.88, -12.41], ['BNE', 153.12, -27.38], ['CHC', 172.53, -43.49],
  ['POM', 147.22, -9.44], ['PDX', -122.6, 45.59], ['PHX', -112.01, 33.43], ['IAH', -95.34, 29.98], ['YUL', -73.74, 45.47],
  ['HAV', -82.41, 22.99], ['SJU', -66.0, 18.44], ['CCS', -66.99, 10.6], ['GIG', -43.25, -22.81], ['REC', -34.92, -8.13],
  ['SCL2', -70.79, -33.39], ['PUQ', -70.85, -53.0], ['USH', -68.3, -54.84], ['FAI', -147.86, 64.82], ['YEG', -113.58, 53.31],
  ['NAS', -77.47, 25.04], ['GOH', -51.68, 64.19], ['TOS', 18.92, 69.68], ['ACC', -0.17, 5.61], ['LAD', 13.23, -8.86],
  ['TNR', 47.48, -18.8], ['DAR', 39.2, -6.88], ['KHV', 135.19, 48.53], ['PKC', 158.45, 53.17], ['NSI', 11.55, 3.72],
];
export const worldAirports: Airport[] = [...airports, ...extra.map(([code, lon, lat]) => ({ code, name: code, at: [lon, lat] as [number, number] }))];

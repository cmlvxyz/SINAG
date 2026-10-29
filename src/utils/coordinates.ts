/**
 * Coordinate validation helpers.
 *
 * The backend sometimes sends zeros or nulls before a GPS fix is available.
 * Treating those as real coordinates would center the map on "Null Island"
 * (0°N, 0°E) in the Atlantic, so every consumer must validate first.
 */
export function isValidCoordinate(lat: unknown, lng: unknown): lat is number {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    !(lat === 0 && lng === 0) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

/** Safe center used when no valid GPS fix is available (center of the Philippines). */
export const SAFE_CENTER = { lat: 12.8797, lng: 121.774 };
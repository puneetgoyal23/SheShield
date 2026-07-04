/**
 * Calculates the geodesic distance between two points in meters using the Haversine formula.
 */
export const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
      
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // in meters
};

/**
 * Calculates the shortest distance in meters from a point to a polyline path.
 * A polyline is represented as an array of [latitude, longitude] pairs.
 */
export const getMinDistanceToPolyline = (point, polyline) => {
  if (!polyline || polyline.length === 0) return Infinity;
  if (polyline.length === 1) {
    return getDistance(point[0], point[1], polyline[0][0], polyline[0][1]);
  }

  const [py, px] = point; // [latitude, longitude]
  let minDistance = Infinity;

  for (let i = 0; i < polyline.length - 1; i++) {
    const [ay, ax] = polyline[i];
    const [by, bx] = polyline[i + 1];

    // Scale longitude coordinates by cosine of average latitude to project onto flat plane
    const latMid = ((ay + by) / 2 * Math.PI) / 180;
    const cosLat = Math.cos(latMid);

    // Flat plane projections relative to point A
    const vx = (bx - ax) * cosLat;
    const vy = by - ay;
    const wx = (px - ax) * cosLat;
    const wy = py - ay;

    const vLenSq = vx * vx + vy * vy;
    let t = 0;

    if (vLenSq > 0) {
      t = (wx * vx + wy * vy) / vLenSq;
      t = Math.max(0, Math.min(1, t)); // Clamp to segment
    }

    // Determine the coordinates of the closest point on the segment
    const closestLat = ay + t * (by - ay);
    const closestLng = ax + t * (bx - ax);

    const dist = getDistance(py, px, closestLat, closestLng);
    if (dist < minDistance) {
      minDistance = dist;
    }
  }

  return minDistance;
};

import { getTimeSlot } from './timeOfDay';

/**
 * Deterministic mock safety score calculation for Phase 2.
 * Based on distance, time of day, route index, and simple coordinate hashing.
 */
export const calculateSafetyScore = (distance, index, geometry) => {
  const timeSlot = getTimeSlot();
  
  // Base score 0-100
  let score = 85;

  // 1. Time of day impact
  if (timeSlot.id === 'night') score -= 20;
  if (timeSlot.id === 'dusk') score -= 10;
  if (timeSlot.id === 'dawn') score -= 5;

  // 2. Distance impact (longer routes are slightly riskier)
  score -= Math.min(10, Math.floor(distance / 2000));

  // 3. Coordinate hashing (to make the score feel dynamic but deterministic)
  const midPoint = geometry[Math.floor(geometry.length / 2)];
  const hash = Math.floor(midPoint[0] * 10000 + midPoint[1] * 10000) % 15;
  
  // Apply hash adjustment (-7 to +7)
  score += (hash - 7);
  
  // 4. Index differentiation (route 0 is always best, route 1 is worse, etc.)
  if (index === 0) {
    score = Math.max(score, 75); // Route 0 (Safest) should always look relatively good
  } else if (index === 1) {
    score -= 15; // Route 1 (Fastest) is usually less safe
  } else {
    score -= 10;
  }
  
  // Clamp between 0 and 100
  score = Math.max(0, Math.min(100, score));
  
  // Generate warnings based on score and time
  const warnings = [];
  if (score < 60) warnings.push('Isolated stretch detected');
  if (timeSlot.id === 'night' && score < 80) warnings.push('Passes through low-lit area');
  if (index === 1) warnings.push('Higher traffic speed area');

  return { score, warnings };
};

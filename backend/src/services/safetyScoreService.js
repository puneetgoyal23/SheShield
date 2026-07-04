import HistoricalIncident from "../models/HistoricalIncident.js";
import Incident from "../models/Incident.js";
import SafePoint from "../models/SafePoint.js";
import { getMinDistanceToPolyline, getDistance } from "../utils/distanceCalculator.js";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

// How far from the route path (meters) we consider an indicator relevant
const INCIDENT_BUFFER_METERS   = 150;
const SAFEPOINT_BUFFER_METERS  = 350;

// Max score contribution caps to prevent any one factor from dominating
const MAX_HISTORICAL_DEDUCTION = 50;
const MAX_COMMUNITY_DEDUCTION  = 30;
const MAX_SAFEPOINT_BOOST      = 30;

// ─────────────────────────────────────────────────────────────────────────────
// TIME-OF-DAY ENGINE
// Returns { multiplier, label, basePenalty }
// ─────────────────────────────────────────────────────────────────────────────
const getTimeOfDayFactor = (hour) => {
  if (hour >= 22 || hour < 5) {
    // Late night / very early morning — highest risk
    return { multiplier: 1.6, label: "Late Night (10 PM – 5 AM)", basePenalty: 8 };
  }
  if (hour >= 5 && hour < 7) {
    // Early morning — reduced visibility
    return { multiplier: 1.2, label: "Early Morning (5 AM – 7 AM)", basePenalty: 3 };
  }
  if (hour >= 7 && hour < 20) {
    // Daytime — safest
    return { multiplier: 1.0, label: "Daytime (7 AM – 8 PM)", basePenalty: 0 };
  }
  // Evening — moderate risk
  return { multiplier: 1.25, label: "Evening (8 PM – 10 PM)", basePenalty: 4 };
};

// ─────────────────────────────────────────────────────────────────────────────
// COMMUNITY REPORT TIME-DECAY ENGINE
// More recent reports carry far more weight
// ─────────────────────────────────────────────────────────────────────────────
const getReportRecencyWeight = (createdAt) => {
  const ageMinutes = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60);

  if (ageMinutes <= 60)         return 1.0;   // < 1 hour: full weight
  if (ageMinutes <= 360)        return 0.85;  // 1–6 hours
  if (ageMinutes <= 1440)       return 0.65;  // 6–24 hours
  if (ageMinutes <= 10080)      return 0.40;  // 1–7 days
  if (ageMinutes <= 43200)      return 0.20;  // 7–30 days
  return 0.08;                                // > 30 days: very low weight
};

// ─────────────────────────────────────────────────────────────────────────────
// SAFE POINT DISTANCE WEIGHT
// Closer safe points score higher
// ─────────────────────────────────────────────────────────────────────────────
const getSafePointDistanceWeight = (distanceMeters) => {
  if (distanceMeters <= 50)  return 1.0;
  if (distanceMeters <= 100) return 0.85;
  if (distanceMeters <= 200) return 0.65;
  if (distanceMeters <= 350) return 0.40;
  return 0; // beyond buffer
};

// ─────────────────────────────────────────────────────────────────────────────
// BOUNDING BOX for MongoDB pre-filter
// Padding ~0.008 degrees ≈ 800 meters on each side
// ─────────────────────────────────────────────────────────────────────────────
const getBoundingBoxQuery = (coordinates, padding = 0.008) => {
  if (!coordinates || !coordinates.length) return null;

  let minLat = Infinity, maxLat = -Infinity;
  let minLng = Infinity, maxLng = -Infinity;

  for (const [lat, lng] of coordinates) {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  }

  return {
    location: {
      $geoWithin: {
        $box: [
          [minLng - padding, minLat - padding],
          [maxLng + padding, maxLat + padding]
        ]
      }
    }
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN: calculateSafetyScore
// ─────────────────────────────────────────────────────────────────────────────
export const calculateSafetyScore = async (coordinates) => {
  if (!coordinates || coordinates.length === 0) {
    return { score: 0, riskLevel: "High", reasons: ["Invalid route coordinates."] };
  }

  let score = 100;
  const reasons  = [];  // positive factors
  const warnings = [];  // negative factors

  // ── 1. TIME OF DAY ─────────────────────────────────────────────────────────
  const currentHour = new Date().getHours();
  const timeFactor  = getTimeOfDayFactor(currentHour);

  // Apply base time penalty (flat deduction just for time-of-day)
  score -= timeFactor.basePenalty;

  if (timeFactor.basePenalty > 0) {
    warnings.push(`${timeFactor.label}: Elevated general risk during this time.`);
  }

  // ── 2. PRE-FILTER from MongoDB using bounding box ──────────────────────────
  const bboxQuery = getBoundingBoxQuery(coordinates);
  if (!bboxQuery) {
    return { score: 100, riskLevel: "Low", reasons: ["No risk data available for this route."] };
  }

  const [historicalCrimes, communityReports, localSafePoints] = await Promise.all([
    HistoricalIncident.find(bboxQuery),
    Incident.find(bboxQuery).sort({ createdAt: -1 }), // newest first
    SafePoint.find(bboxQuery)
  ]);

  // ── 3. FILTER by exact perpendicular distance to the route polyline ─────────
  const nearCrimes     = historicalCrimes.filter(c =>
    getMinDistanceToPolyline([c.latitude, c.longitude], coordinates) <= INCIDENT_BUFFER_METERS
  );

  const nearReports    = communityReports.filter(r =>
    getMinDistanceToPolyline([r.latitude, r.longitude], coordinates) <= INCIDENT_BUFFER_METERS
  );

  const nearSafePoints = localSafePoints
    .map(sp => ({
      ...sp.toObject(),
      distToRoute: getMinDistanceToPolyline([sp.latitude, sp.longitude], coordinates)
    }))
    .filter(sp => sp.distToRoute <= SAFEPOINT_BUFFER_METERS);

  // ── 4. HISTORICAL INCIDENTS (Highest Weightage) ────────────────────────────
  let historicalDeduction = 0;

  nearCrimes.forEach(crime => {
    let base = 0;
    if (crime.severity === "High")   base = 18;
    else if (crime.severity === "Medium") base = 11;
    else                             base = 5;

    historicalDeduction += base * timeFactor.multiplier;
  });

  historicalDeduction = Math.min(historicalDeduction, MAX_HISTORICAL_DEDUCTION);
  score -= historicalDeduction;

  if (nearCrimes.length === 0) {
    reasons.push("No historical crime records along this route.");
  } else if (nearCrimes.length <= 2) {
    warnings.push(`Low historical crime activity (${nearCrimes.length} records).`);
  } else {
    warnings.push(`Elevated historical crime activity (${nearCrimes.length} records in this area).`);
  }

  // ── 5. COMMUNITY REPORTS (Time-Decay + Verification Weighted) ─────────────
  let communityDeduction = 0;
  let activePatrols      = 0;
  let poorLightingCount  = 0;
  let unsafeCrowdCount   = 0;
  let harassmentCount    = 0;

  nearReports.forEach(report => {
    const recencyWeight  = getReportRecencyWeight(report.createdAt);
    // Verified reports (3+ verifications) carry 50% more weight
    const verifyWeight   = report.verificationCount >= 3 ? 1.5
                         : report.verificationCount >= 1 ? 1.2
                         : 1.0;

    if (report.type === "Police Patrol") {
      // Police patrol is a positive safety signal
      activePatrols++;
      return;
    }

    // Type-specific base deduction
    let base = 8;
    if (report.type === "Harassment" || report.type === "Suspicious Activity") {
      base = 10;
      harassmentCount++;
    } else if (report.type === "Poor Lighting") {
      base = 9;  // Extra weight — directly affects visibility safety
      poorLightingCount++;
    } else if (report.type === "Unsafe Crowd") {
      base = 9;
      unsafeCrowdCount++;
    }

    communityDeduction += base * recencyWeight * verifyWeight * timeFactor.multiplier;
  });

  communityDeduction = Math.min(communityDeduction, MAX_COMMUNITY_DEDUCTION);
  score -= communityDeduction;

  // Patrol bonus (capped at +15)
  if (activePatrols > 0) {
    const patrolBoost = Math.min(activePatrols * 7, 15);
    score += patrolBoost;
    reasons.push(`Active police patrols recently reported (${activePatrols} report${activePatrols > 1 ? "s" : ""}).`);
  }

  // Community warning messages
  if (poorLightingCount > 0) {
    warnings.push(`${poorLightingCount} recent report${poorLightingCount > 1 ? "s" : ""} of poor street lighting on this route.`);
  }
  if (harassmentCount > 0) {
    warnings.push(`${harassmentCount} recent harassment/suspicious activity report${harassmentCount > 1 ? "s" : ""}.`);
  }
  if (unsafeCrowdCount > 0) {
    warnings.push(`${unsafeCrowdCount} unsafe crowd report${unsafeCrowdCount > 1 ? "s" : ""}.`);
  }
  if (nearReports.length === 0) {
    reasons.push("No recent community safety reports on this route.");
  }

  // ── 6. SAFE POINTS (Distance-Weighted + Average Distance Factor) ───────────
  let safePointBoost     = 0;
  let hasPoliceStation   = false;
  let hasHospital        = false;
  let totalDistances     = 0;
  let validSafePointCount = 0;

  nearSafePoints.forEach(sp => {
    const distWeight = getSafePointDistanceWeight(sp.distToRoute);
    if (distWeight === 0) return;

    let categoryBase = 5;
    if (sp.category === "Police Station") {
      categoryBase = 12;
      hasPoliceStation = true;
    } else if (sp.category === "Hospital") {
      categoryBase = 9;
      hasHospital = true;
    } else if (sp.category === "Petrol Pump" || sp.category === "Hotel") {
      categoryBase = 7;
    } else if (sp.category === "Metro Station" || sp.category === "Railway Station") {
      categoryBase = 6;
    }

    safePointBoost += categoryBase * distWeight;
    totalDistances += sp.distToRoute;
    validSafePointCount++;
  });

  // Average distance bonus — routes with consistently close safe points score higher
  if (validSafePointCount > 0) {
    const avgDistance = totalDistances / validSafePointCount;
    if (avgDistance <= 100) {
      safePointBoost += 5;  // Bonus: very close safe points throughout route
      reasons.push(`Safe points are very close to this route (avg ${Math.round(avgDistance)}m away).`);
    } else if (avgDistance <= 200) {
      safePointBoost += 2;
      reasons.push(`Safe points are reasonably close (avg ${Math.round(avgDistance)}m away).`);
    } else {
      warnings.push(`Safe points are relatively far from this route (avg ${Math.round(avgDistance)}m away).`);
    }
  }

  safePointBoost = Math.min(safePointBoost, MAX_SAFEPOINT_BOOST);
  score += safePointBoost;

  // Safe point reason messages
  if (hasPoliceStation) {
    reasons.push("Police station within reach of this route.");
  }
  if (hasHospital) {
    reasons.push("Hospital accessible from this route.");
  }
  if (validSafePointCount === 0) {
    warnings.push("No safe points (hospitals, police stations, etc.) found near this route.");
  } else if (validSafePointCount >= 4) {
    reasons.push(`High density of safe points along route (${validSafePointCount} found).`);
  }

  // ── 7. FINAL SCORE & RISK LEVEL ────────────────────────────────────────────
  score = Math.round(Math.max(0, Math.min(100, score)));

  let riskLevel = "Low";
  if (score < 50)      riskLevel = "High";
  else if (score < 80) riskLevel = "Medium";

  // ── 8. BUILD EXPLANATION ARRAY ─────────────────────────────────────────────
  // Always put positive reasons first, then warnings
  const allReasons = [...reasons, ...warnings];
  if (allReasons.length === 0) {
    allReasons.push("Standard risk profile detected.");
  }

  return { score, riskLevel, reasons: allReasons };
};

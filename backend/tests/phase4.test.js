/**
 * SheShield Backend - Phase 4 API Tests
 * Tests: Journey Lifecycle, Route Deviation Detection, SOS, Notifications
 */
import axios from "axios";

const BASE_URL = "http://localhost:5000/api";
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const check = (label, condition, detail = "") => {
  if (condition) {
    console.log(`  ✅ PASS: ${label}`);
  } else {
    console.log(`  ❌ FAIL: ${label}${detail ? " → " + detail : ""}`);
  }
};

async function runPhase4Tests(token) {
  console.log("\n========================================");
  console.log("  PHASE 4: Journey, SOS & Notifications ");
  console.log("========================================");

  await sleep(500);

  const auth = { headers: { Authorization: `Bearer ${token}` } };

  // Fetch a real route first to get polyline & coordinates
  let selectedRoute = null;
  try {
    const routeRes = await axios.post(`${BASE_URL}/routes/analyze`, {
      origin: { latitude: 28.6139, longitude: 77.2090 },
      destination: { latitude: 28.6300, longitude: 77.2185 }
    }, auth);
    const topRoute = routeRes.data.data.routes[0];
    selectedRoute = {
      distance: topRoute.distance,
      duration: topRoute.duration,
      polyline: topRoute.polyline,
      safetyScore: topRoute.safetyScore,
      riskLevel: topRoute.riskLevel,
      // Provide the start/end coords as the stored path
      coordinates: [
        [28.6139, 77.2090],
        [28.6300, 77.2185]
      ]
    };
  } catch (e) {
    console.log("  ⚠️  Could not fetch route for journey test:", e.message);
    // Use manual fallback coordinates
    selectedRoute = {
      distance: 2500,
      duration: "600s",
      polyline: "mock_polyline",
      safetyScore: 100,
      riskLevel: "Low",
      coordinates: [
        [28.6139, 77.2090],
        [28.6300, 77.2185]
      ]
    };
  }

  let journeyId = "";

  // --- Start Journey ---
  console.log("\n[1] Start Journey");
  try {
    const res = await axios.post(`${BASE_URL}/journey/start`, {
      origin: "Connaught Place",
      destination: "RML Hospital",
      selectedRoute
    }, auth);
    check("Status 201 created", res.status === 201);
    check("Journey status is active", res.data.data.journey.status === "active");
    check("Journey has origin", !!res.data.data.journey.origin);
    journeyId = res.data.data.journey._id;
    console.log(`     Journey ID: ${journeyId}`);
  } catch (e) {
    check("Start journey call succeeded", false, e.response?.data?.message || e.message);
  }

  // --- Update Location (ON-ROUTE, no deviation) ---
  console.log("\n[2] Update Location - On-Route (No Deviation)");
  try {
    const res = await axios.post(`${BASE_URL}/journey/location`, {
      latitude: 28.6150,  // Close to the route path
      longitude: 77.2095
    }, auth);
    check("Status 200 OK", res.status === 200);
    check("No deviation alert for on-route position", res.data.data.deviationAlert === null);
  } catch (e) {
    check("On-route update call succeeded", false, e.response?.data?.message || e.message);
  }

  // --- Update Location (OFF-ROUTE, triggers deviation) ---
  console.log("\n[3] Update Location - Off-Route (Deviation Expected)");
  try {
    const res = await axios.post(`${BASE_URL}/journey/location`, {
      latitude: 28.5800,  // Far from the route (deviation > 100m)
      longitude: 77.1500
    }, auth);
    check("Status 200 OK", res.status === 200);
    check("Deviation alert is returned", res.data.data.deviationAlert !== null);
    if (res.data.data.deviationAlert) {
      check("Deviation message included", !!res.data.data.deviationAlert.message);
      check("Distance included in alert", typeof res.data.data.deviationAlert.distance === "number");
      console.log(`     Deviation distance: ${Math.round(res.data.data.deviationAlert.distance)}m`);
    }
  } catch (e) {
    check("Off-route deviation call succeeded", false, e.response?.data?.message || e.message);
  }

  // --- Get Journey History ---
  console.log("\n[4] Journey History");
  try {
    const res = await axios.get(`${BASE_URL}/journey/history`, auth);
    check("Status 200 OK", res.status === 200);
    check("History is an array", Array.isArray(res.data.data.history));
    check("At least 1 journey in history", res.data.data.history.length >= 1);
  } catch (e) {
    check("Journey history call succeeded", false, e.response?.data?.message || e.message);
  }

  // --- End Journey ---
  console.log("\n[5] End Journey");
  try {
    const res = await axios.post(`${BASE_URL}/journey/end`, {}, auth);
    check("Status 200 OK", res.status === 200);
    check("Journey status is completed", res.data.data.journey.status === "completed");
  } catch (e) {
    check("End journey call succeeded", false, e.response?.data?.message || e.message);
  }

  // --- End Journey again (no active journey) ---
  console.log("\n[6] End Journey - No Active Journey");
  try {
    await axios.post(`${BASE_URL}/journey/end`, {}, auth);
    check("Should return 404 for no active journey", false, "Expected error");
  } catch (e) {
    check("Returns 404 when no active journey", e.response?.status === 404);
  }

  // --- SOS Trigger ---
  let sosId = "";
  console.log("\n[7] Trigger SOS");
  try {
    const res = await axios.post(`${BASE_URL}/sos`, {
      latitude: 28.6139,
      longitude: 77.2090
    }, auth);
    check("Status 201 created", res.status === 201);
    check("SOS log returned", !!res.data.data.sosLog._id);
    check("SOS status is active", res.data.data.sosLog.status === "active");
    check("Nearest safe points returned", Array.isArray(res.data.data.nearestSafePoints));
    check("Trusted contacts returned", Array.isArray(res.data.data.trustedContacts));
    sosId = res.data.data.sosLog._id;
    console.log(`     SOS ID: ${sosId}`);
    console.log(`     Nearest safe points found: ${res.data.data.nearestSafePoints.length}`);
  } catch (e) {
    check("SOS trigger call succeeded", false, e.response?.data?.message || e.message);
  }

  // --- Resolve SOS ---
  console.log("\n[8] Resolve SOS");
  try {
    const res = await axios.patch(`${BASE_URL}/sos/${sosId}/resolve`, {}, auth);
    check("Status 200 OK", res.status === 200);
    check("SOS status is resolved", res.data.data.sosLog.status === "resolved");
  } catch (e) {
    check("Resolve SOS call succeeded", false, e.response?.data?.message || e.message);
  }
}

export default runPhase4Tests;

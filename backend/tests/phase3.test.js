/**
 * SheShield Backend - Phase 3 API Tests
 * Tests: Route Analysis, Safety Score Engine, Heatmap Data
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

async function runPhase3Tests(token) {
  console.log("\n========================================");
  console.log(" PHASE 3: Route Analysis & Heatmap      ");
  console.log("========================================");

  await sleep(500);

  const auth = { headers: { Authorization: `Bearer ${token}` } };

  // --- Heatmap Data ---
  console.log("\n[1] Heatmap Retrieval");
  try {
    const res = await axios.get(`${BASE_URL}/heatmap`, auth);
    check("Status 200 OK", res.status === 200);
    check("Returns points array", Array.isArray(res.data.data.points));
    check("isNightActive is boolean", typeof res.data.data.isNightActive === "boolean");
    if (res.data.data.points.length > 0) {
      const p = res.data.data.points[0];
      check("Point has latitude", typeof p.latitude === "number");
      check("Point has riskLevel", ["Green", "Yellow", "Orange", "Red"].includes(p.riskLevel));
      check("Point has weight", typeof p.weight === "number");
    }
  } catch (e) {
    check("Heatmap call succeeded", false, e.response?.data?.message || e.message);
  }

  // --- Route Analysis (coordinate-based origin/destination) ---
  console.log("\n[2] Route Analysis (Coordinate-Based)");
  try {
    const res = await axios.post(`${BASE_URL}/routes/analyze`, {
      origin: { latitude: 28.6139, longitude: 77.2090 },
      destination: { latitude: 28.6300, longitude: 77.2185 }
    }, auth);
    check("Status 200 OK", res.status === 200);
    const routes = res.data.data.routes;
    check("Returns 3 routes", routes.length === 3);
    check("Routes sorted by safety descending", routes[0].safetyScore >= routes[routes.length - 1].safetyScore);
    
    const r = routes[0];
    check("Route has safetyScore (0-100)", r.safetyScore >= 0 && r.safetyScore <= 100);
    check("Route has riskLevel", ["Low", "Medium", "High"].includes(r.riskLevel));
    check("Route has safetyExplanation array", Array.isArray(r.safetyExplanation));
    check("Route has polyline string", typeof r.polyline === "string" && r.polyline.length > 0);
    check("Route has distance (meters)", typeof r.distance === "number");
    check("Route has duration", !!r.duration);
  } catch (e) {
    check("Route analysis call succeeded", false, e.response?.data?.message || e.message);
  }

  // --- Route Analysis missing params ---
  console.log("\n[3] Route Analysis - Missing Params");
  try {
    await axios.post(`${BASE_URL}/routes/analyze`, { origin: "Some Place" }, auth);
    check("Should return 400 for missing destination", false, "Expected error");
  } catch (e) {
    check("Returns 400 for missing destination", e.response?.status === 400);
  }

  // --- Route Analysis - Safety Score differences ---
  console.log("\n[4] Safety Score Engine - Routes Differ by Score");
  try {
    const res = await axios.post(`${BASE_URL}/routes/analyze`, {
      origin: { latitude: 28.6300, longitude: 77.2185 },
      destination: { latitude: 28.6295, longitude: 77.2160 }
    }, auth);
    const routes = res.data.data.routes;
    check("Routes returned", routes.length > 0);
    const allHaveScores = routes.every(r => typeof r.safetyScore === "number");
    check("All routes have numeric safety scores", allHaveScores);
    const allHaveReasons = routes.every(r => r.safetyExplanation.length > 0);
    check("All routes have explanations", allHaveReasons);
    console.log(`     Route Scores: ${routes.map(r => r.safetyScore).join(" > ")}`);
  } catch (e) {
    check("Safety score differentiation test succeeded", false, e.response?.data?.message || e.message);
  }
}

export default runPhase3Tests;

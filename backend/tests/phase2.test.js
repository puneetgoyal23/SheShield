/**
 * SheShield Backend - Phase 2 API Tests
 * Tests: Community Incident Reporting, Proximity Queries, Verification, Safe Points
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

async function runPhase2Tests(token) {
  console.log("\n========================================");
  console.log("  PHASE 2: Incidents & Safe Points      ");
  console.log("========================================");

  await sleep(500);

  let incidentId = "";
  let safePointId = "";
  const auth = { headers: { Authorization: `Bearer ${token}` } };

  // --- Report Incident ---
  console.log("\n[1] Report Incident");
  try {
    const res = await axios.post(`${BASE_URL}/incidents`, {
      type: "Poor Lighting",
      description: "The street lights are off on the main route.",
      latitude: 28.6139,
      longitude: 77.2090
    }, auth);
    check("Status 201 created", res.status === 201);
    check("Incident type matches", res.data.data.incident.type === "Poor Lighting");
    check("Verification count starts at 0", res.data.data.incident.verificationCount === 0);
    incidentId = res.data.data.incident._id;
  } catch (e) {
    check("Report incident call succeeded", false, e.response?.data?.message || e.message);
  }

  // --- Invalid incident type rejection ---
  console.log("\n[2] Invalid Incident Type (Validation)");
  try {
    await axios.post(`${BASE_URL}/incidents`, {
      type: "Invalid Type",
      description: "Test",
      latitude: 28.6139,
      longitude: 77.2090
    }, auth);
    check("Should return 400 for invalid type", false, "Expected validation error");
  } catch (e) {
    check("Returns 400 for invalid type", e.response?.status === 400);
  }

  // --- Proximity Search ---
  console.log("\n[3] Proximity Incident Search (within 1000m)");
  try {
    const res = await axios.get(`${BASE_URL}/incidents?latitude=28.6140&longitude=77.2085&radius=1000`, auth);
    check("Status 200 OK", res.status === 200);
    check("Returns array of incidents", Array.isArray(res.data.data.incidents));
    check("At least 1 nearby incident found", res.data.data.incidents.length >= 1);
  } catch (e) {
    check("Proximity search call succeeded", false, e.response?.data?.message || e.message);
  }

  // --- Verify Incident ---
  console.log("\n[4] Verify Incident");
  try {
    const res = await axios.patch(`${BASE_URL}/incidents/${incidentId}/verify`, {}, auth);
    check("Status 200 OK", res.status === 200);
    check("Verification count incremented to 1", res.data.data.incident.verificationCount === 1);
  } catch (e) {
    check("Verify incident call succeeded", false, e.response?.data?.message || e.message);
  }

  // --- Cannot verify twice ---
  console.log("\n[5] Double-Verification Prevention");
  try {
    await axios.patch(`${BASE_URL}/incidents/${incidentId}/verify`, {}, auth);
    check("Should prevent double verification", false, "Expected 400 error");
  } catch (e) {
    check("Prevents double verification (400)", e.response?.status === 400);
  }

  // --- Create Safe Point ---
  console.log("\n[6] Create Safe Point");
  try {
    const res = await axios.post(`${BASE_URL}/safe-points`, {
      name: "Central Delhi Police Station",
      latitude: 28.6200,
      longitude: 77.2100,
      category: "Police Station",
      openStatus: "Open 24/7"
    }, auth);
    check("Status 201 created", res.status === 201);
    check("Category matches", res.data.data.safePoint.category === "Police Station");
    safePointId = res.data.data.safePoint._id;
  } catch (e) {
    check("Create safe point call succeeded", false, e.response?.data?.message || e.message);
  }

  // --- Proximity Safe Points ---
  console.log("\n[7] Proximity Safe Points Search");
  try {
    const res = await axios.get(`${BASE_URL}/safe-points?latitude=28.6210&longitude=77.2090&radius=2000`, auth);
    check("Status 200 OK", res.status === 200);
    check("At least 1 safe point found", res.data.data.safePoints.length >= 1);
    const hasPolice = res.data.data.safePoints.some(s => s.category === "Police Station");
    check("Police Station is in results", hasPolice);
  } catch (e) {
    check("Proximity safe points call succeeded", false, e.response?.data?.message || e.message);
  }

  // --- Get all incidents (no location param) ---
  console.log("\n[8] Get Recent Incidents (No Location Param)");
  try {
    const res = await axios.get(`${BASE_URL}/incidents`, auth);
    check("Status 200 OK", res.status === 200);
    check("Returns incidents array", Array.isArray(res.data.data.incidents));
  } catch (e) {
    check("Get all incidents call succeeded", false, e.response?.data?.message || e.message);
  }
}

export default runPhase2Tests;

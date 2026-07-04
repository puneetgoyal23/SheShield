/**
 * SheShield Backend - Phase 5 API Tests
 * Tests: Profile Updates, Contact Constraints, Notifications, Historical Incidents
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

async function runPhase5Tests(token) {
  console.log("\n========================================");
  console.log("  PHASE 5: Profile, Contacts & Admin    ");
  console.log("========================================");

  await sleep(500);
  const auth = { headers: { Authorization: `Bearer ${token}` } };

  // --- Profile Updates ---
  console.log("\n[1] Profile Updates");
  try {
    const res = await axios.patch(`${BASE_URL}/auth/profile`, {
      name: "Updated Name"
    }, auth);
    check("Status 200 OK", res.status === 200);
    check("Name updated successfully", res.data.data.user.name === "Updated Name");
  } catch (e) {
    check("Profile update call succeeded", false, e.response?.data?.message || e.message);
  }

  // --- Contact Constraints (Primary & SOS) ---
  console.log("\n[2] Contact Constraints (Roles)");
  try {
    // Add primary contact
    await axios.post(`${BASE_URL}/contacts`, {
      name: "Primary Contact",
      phone: `911111${Math.floor(1000 + Math.random() * 9000)}`,
      relationship: "Father",
      isPrimaryContact: true,
      isSOSContact: true
    }, auth);

    // Add more SOS contacts
    for(let i=0; i<2; i++) {
      await axios.post(`${BASE_URL}/contacts`, {
        name: `SOS Contact ${i}`,
        phone: `922222${i}${Math.floor(100 + Math.random() * 900)}`,
        relationship: "Friend",
        isPrimaryContact: false,
        isSOSContact: true
      }, auth);
    }
    
    // Attempt 4th SOS contact should fail
    try {
      await axios.post(`${BASE_URL}/contacts`, {
        name: "SOS Contact 4",
        phone: `933333${Math.floor(1000 + Math.random() * 9000)}`,
        relationship: "Sibling",
        isPrimaryContact: false,
        isSOSContact: true
      }, auth);
      check("Should reject 4th SOS contact", false, "Expected 400 error");
    } catch(err) {
      check("Properly rejects 4th SOS contact (Max 3)", err.response?.status === 400);
    }
  } catch (e) {
    const errorDetail = e.response?.data?.errors ? JSON.stringify(e.response.data.errors) : (e.response?.data?.message || e.message);
    check("Contact setup call succeeded", false, errorDetail);
  }

  // --- Notifications ---
  console.log("\n[3] Notifications");
  try {
    // Fetch notifications (should have some from earlier Journey/SOS tests if using same user)
    const res = await axios.get(`${BASE_URL}/notifications`, auth);
    check("Status 200 OK", res.status === 200);
    check("Returns notifications array", Array.isArray(res.data.data.notifications));
    
    if (res.data.data.notifications.length > 0) {
      const notifId = res.data.data.notifications[0]._id;
      // Mark read
      const readRes = await axios.patch(`${BASE_URL}/notifications/${notifId}/read`, {}, auth);
      check("Marked as read successfully", readRes.data.data.notification.isRead === true);
    } else {
      console.log("  ⚠️  Skipping mark read test (no notifications found)");
    }
  } catch (e) {
    check("Notifications call succeeded", false, e.response?.data?.message || e.message);
  }

  // --- Historical Incidents (Admin) ---
  console.log("\n[4] Historical Incidents");
  try {
    const res = await axios.post(`${BASE_URL}/historical-incidents`, {
      latitude: 28.6139,
      longitude: 77.2090,
      category: "Theft",
      severity: "High",
      year: 2023,
      source: "NCRB"
    }, auth);
    check("Status 201 created", res.status === 201);
    check("Historical incident added", !!res.data.data.incident._id);
    
    const getRes = await axios.get(`${BASE_URL}/historical-incidents`, auth);
    check("Can fetch historical incidents", getRes.data.data.incidents.length > 0);
  } catch (e) {
    check("Historical incidents call succeeded", false, e.response?.data?.message || e.message);
  }
}

export default runPhase5Tests;

/**
 * SheShield Backend - Phase 1 API Tests
 * Tests: User Registration, Login, Profile Retrieval, Trusted Contacts CRUD
 */
import axios from "axios";

const BASE_URL = "http://localhost:5000/api";
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
let passed = 0, failed = 0;

const check = (label, condition, detail = "") => {
  if (condition) {
    console.log(`  ✅ PASS: ${label}`);
    passed++;
  } else {
    console.log(`  ❌ FAIL: ${label}${detail ? " → " + detail : ""}`);
    failed++;
  }
};

async function runPhase1Tests() {
  console.log("\n========================================");
  console.log("   PHASE 1: Auth & Trusted Contacts     ");
  console.log("========================================");

  await sleep(1000);

  const testUser = {
    name: "SheShield Tester",
    email: `test_p1_${Date.now()}@example.com`,
    phone: `98765${Math.floor(10000 + Math.random() * 90000)}`,
    password: "password123"
  };
  let token = "";
  let contactId = "";

  // --- Register ---
  console.log("\n[1] Registration");
  try {
    const res = await axios.post(`${BASE_URL}/auth/register`, testUser);
    check("Status 201 created", res.status === 201);
    check("success=true", res.data.success === true);
    check("User object returned", !!res.data.data.user._id);
    check("Password not returned", !res.data.data.user.password);
  } catch (e) {
    check("Registration call succeeded", false, e.response?.data?.message || e.message);
  }

  // --- Login ---
  console.log("\n[2] Login");
  try {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    check("Status 200 OK", res.status === 200);
    check("success=true", res.data.success === true);
    check("JWT token returned", !!res.data.data.token);
    token = res.data.data.token;
  } catch (e) {
    check("Login call succeeded", false, e.response?.data?.message || e.message);
  }

  const auth = { headers: { Authorization: `Bearer ${token}` } };

  // --- Profile ---
  console.log("\n[3] Get Profile");
  try {
    const res = await axios.get(`${BASE_URL}/auth/profile`, auth);
    check("Status 200 OK", res.status === 200);
    check("User name matches", res.data.data.user.name === testUser.name);
    check("Email matches", res.data.data.user.email === testUser.email);
  } catch (e) {
    check("Profile call succeeded", false, e.response?.data?.message || e.message);
  }

  // --- Wrong credentials ---
  console.log("\n[4] Login with wrong password");
  try {
    await axios.post(`${BASE_URL}/auth/login`, { email: testUser.email, password: "wrongpass" });
    check("Should have returned 400", false, "Expected error but got success");
  } catch (e) {
    check("Returns 400 for wrong credentials", e.response?.status === 400);
  }

  // --- Add Contact ---
  console.log("\n[5] Add Trusted Contact");
  try {
    const res = await axios.post(`${BASE_URL}/contacts`, {
      name: "Guardian Angel",
      phone: "9876543210",
      relationship: "Mother"
    }, auth);
    check("Status 201 created", res.status === 201);
    check("Contact name matches", res.data.data.contact.name === "Guardian Angel");
    contactId = res.data.data.contact._id;
  } catch (e) {
    check("Add contact call succeeded", false, e.response?.data?.message || e.message);
  }

  // --- Get Contacts ---
  console.log("\n[6] Get All Contacts");
  try {
    const res = await axios.get(`${BASE_URL}/contacts`, auth);
    check("Status 200 OK", res.status === 200);
    check("At least 1 contact", res.data.data.contacts.length >= 1);
  } catch (e) {
    check("Get contacts call succeeded", false, e.response?.data?.message || e.message);
  }

  // --- Delete Contact ---
  console.log("\n[7] Delete Contact");
  try {
    const res = await axios.delete(`${BASE_URL}/contacts/${contactId}`, auth);
    check("Status 200 OK", res.status === 200);
    check("Deleted contact name returned", res.data.data.contact.name === "Guardian Angel");
  } catch (e) {
    check("Delete contact call succeeded", false, e.response?.data?.message || e.message);
  }

  // --- Contact count is 0 after deletion ---
  console.log("\n[8] Verify Contact Deletion");
  try {
    const res = await axios.get(`${BASE_URL}/contacts`, auth);
    check("Contact count is now 0", res.data.data.contacts.length === 0);
  } catch (e) {
    check("Verify deletion call succeeded", false, e.message);
  }

  return { passed, failed, token };
}

export default runPhase1Tests;

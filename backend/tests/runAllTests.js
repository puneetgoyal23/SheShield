/**
 * SheShield Backend - Master Test Runner
 * Runs all 4 test phases sequentially and prints a complete summary.
 *
 * Usage: node tests/runAllTests.js
 */
import axios from "axios";
import runPhase1Tests from "./phase1.test.js";
import runPhase2Tests from "./phase2.test.js";
import runPhase3Tests from "./phase3.test.js";
import runPhase4Tests from "./phase4.test.js";
import runPhase5Tests from "./phase5.test.js";

const BASE_URL = "http://localhost:5000/api";
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Counters
let totalPassed = 0;
let totalFailed = 0;

// Monkey-patch console.log to count ✅/❌
const origLog = console.log;
console.log = (...args) => {
  const msg = args.join(" ");
  if (msg.includes("✅ PASS")) totalPassed++;
  if (msg.includes("❌ FAIL")) totalFailed++;
  origLog(...args);
};

async function main() {
  console.log("\n╔══════════════════════════════════════════╗");
  console.log("║   SheShield Backend - Full API Test Suite ║");
  console.log("╚══════════════════════════════════════════╝\n");

  // Step 0: Quick health check
  try {
    const health = await axios.get("http://localhost:5000/health");
    origLog(`\nServer Health: ${health.data.message}`);
    origLog(`Waiting 1s before running tests...\n`);
    await sleep(1000);
  } catch (e) {
    origLog("\n❌ Server is not reachable at http://localhost:5000");
    origLog("   Make sure to run: npm run dev\n");
    process.exit(1);
  }

  // Quick login to get shared token for later phases
  let sharedToken = "";
  try {
    const email = `master_runner_${Date.now()}@test.com`;
    const phone = `7000${Math.floor(100000 + Math.random() * 900000)}`;
    await axios.post(`${BASE_URL}/auth/register`, {
      name: "Master Runner",
      email,
      phone,
      password: "password123"
    });
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email,
      password: "password123"
    });
    sharedToken = loginRes.data.data.token;
  } catch (e) {
    origLog("⚠️  Could not create shared test user, using Phase 1 token.");
  }

  // Run all phases
  const p1Result = await runPhase1Tests();
  // Use Phase 1 token if shared not available
  const tokenToUse = sharedToken || p1Result?.token || "";

  await runPhase2Tests(tokenToUse);
  await runPhase3Tests(tokenToUse);
  await runPhase4Tests(tokenToUse);
  await runPhase5Tests(tokenToUse);

  // Final Summary
  const total = totalPassed + totalFailed;
  const pct = total > 0 ? Math.round((totalPassed / total) * 100) : 0;

  origLog("\n╔══════════════════════════════════════════╗");
  origLog("║              TEST SUMMARY                ║");
  origLog("╠══════════════════════════════════════════╣");
  origLog(`║  Total Tests   : ${String(total).padEnd(23)}║`);
  origLog(`║  Passed  ✅    : ${String(totalPassed).padEnd(23)}║`);
  origLog(`║  Failed  ❌    : ${String(totalFailed).padEnd(23)}║`);
  origLog(`║  Pass Rate     : ${String(pct + "%").padEnd(23)}║`);
  origLog("╚══════════════════════════════════════════╝\n");

  if (totalFailed > 0) process.exit(1);
}

main();

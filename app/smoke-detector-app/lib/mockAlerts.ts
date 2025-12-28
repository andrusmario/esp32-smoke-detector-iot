import { ref, push, set } from "firebase/database";
import { db } from "../firebase";

/**
 * TEMPORARY: Simulates an ESP32 smoke alert
 * Delete later when ESP32 device is available
 */
export async function mockESP32SmokeAlert() {
  const alertRef = push(ref(db, "alerts"));

  await set(alertRef, {
    deviceId: "device1",
    type: "SMOKE",
    message: "Smoke detected (simulated)",
    active: true,
    timestamp: Math.floor(Date.now() / 1000),
  });
}

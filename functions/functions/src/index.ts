import { setGlobalOptions } from "firebase-functions/v2";
import { onValueUpdated } from "firebase-functions/v2/database";
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";

setGlobalOptions({ region: "europe-west1" });

admin.initializeApp();

/* ================= SMOKE ALERT ================= */
export const sendSmokeAlert = onValueUpdated(
  "/devices/{deviceId}",
  async (event) => {
    const before = event.data.before.val();
    const after = event.data.after.val();

    if (!before || !after) return;

    const smokeTriggered =
      before.smoke === false &&
      after.smoke === true &&
      after.online === true;

    if (!smokeTriggered) return;

    await admin.database().ref("alerts").push({
      deviceId: event.params.deviceId,
      type: "SMOKE",
      message: "Smoke detected",
      active: true,
      timestamp: Math.floor(Date.now() / 1000),
    });

    const pushToken = after.pushToken;
    if (!pushToken) return;

    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: pushToken,
        sound: "default",
        title: "🚨 Smoke Detected",
        body: "Smoke detected by your ESP32 device",
      }),
    });
  }
);

/* ================= OFFLINE DETECTION ================= */
export const checkDeviceOffline = onSchedule(
  {
    schedule: "every 1 minutes",
    region: "europe-west1",
  },
  async () => {
    const now = Math.floor(Date.now() / 1000);
    const TIMEOUT_SECONDS = 15;

    const devicesSnap = await admin.database().ref("devices").once("value");
    const devices = devicesSnap.val();

    if (!devices) return;

    const updates: Record<string, any> = {};

    for (const deviceId of Object.keys(devices)) {
      const device = devices[deviceId];

      if (!device.lastUpdated) continue;

      const isOffline = now - device.lastUpdated > TIMEOUT_SECONDS;

      if (isOffline && device.online === true) {
        updates[`/devices/${deviceId}/online`] = false;
        console.log(`⚠️ Device ${deviceId} marked OFFLINE`);
      }
    }

    if (Object.keys(updates).length > 0) {
      await admin.database().ref().update(updates);
    }
  }
);

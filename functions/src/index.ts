import { setGlobalOptions } from "firebase-functions/v2";
import { onValueUpdated } from "firebase-functions/v2/database";
import * as admin from "firebase-admin";
import { onSchedule } from "firebase-functions/v2/scheduler";

setGlobalOptions({ region: "europe-west1" });

admin.initializeApp();

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

    // 🔥 WRITE ALERT
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
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: pushToken,
        sound: "default",
        title: "🚨 Smoke Detected",
        body: "Smoke detected by your ESP32 device",
      }),
    });

    console.log(`🚨 Smoke alert sent for ${event.params.deviceId}`);
  }
);
export const checkDeviceOffline = onSchedule(
  {
    schedule: "every 1 minutes",
    region: "europe-west1",
  },
  async () => {
    const now = Math.floor(Date.now() / 1000);

    const snapshot = await admin.database().ref("devices").once("value");

    snapshot.forEach((child) => {
      const device = child.val();
      const lastUpdated = device?.lastUpdated ?? 0;

      // Mark offline if no heartbeat for 60s
      if (now - lastUpdated > 60 && device.online === true) {
        console.log(`🔌 Device ${child.key} offline`);
        admin.database().ref(`devices/${child.key}/online`).set(false);
      }
    });
  }
);

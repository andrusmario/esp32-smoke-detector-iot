import { setGlobalOptions } from "firebase-functions/v2";
import { onValueUpdated } from "firebase-functions/v2/database";
import * as admin from "firebase-admin";
import fetch from "node-fetch";

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

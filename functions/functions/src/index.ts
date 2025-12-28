import { onValueUpdated } from "firebase-functions/v2/database";
import * as admin from "firebase-admin";

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

    const pushToken = after.pushToken;
    if (!pushToken) {
      console.log("No push token found");
      return;
    }

    const message = {
      to: pushToken,
      sound: "default",
      title: "🚨 Smoke Detected",
      body: "Smoke detected by your ESP32 device",
    };

    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    console.log(
      `🚨 Smoke alert sent for device ${event.params.deviceId}`
    );
  }
);

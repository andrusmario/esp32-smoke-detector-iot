import { Stack } from "expo-router";
import { useEffect } from "react";
import { registerForPushNotifications } from "../lib/notifications";
import * as Notifications from "expo-notifications";
import { getAuth, signInAnonymously } from "firebase/auth";
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});


export default function RootLayout() {
  useEffect(() => {
  const auth = getAuth();

  signInAnonymously(auth)
    .then(() => {
      console.log("✅ Firebase anonymous auth success");
      registerForPushNotifications();
    })
    .catch((err) => {
      console.error("❌ Firebase auth failed", err);
    });
}, []);


  return (
    <Stack>
      <Stack.Screen
        name="(tabs)"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}

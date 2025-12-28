import { Stack } from "expo-router";
import { useEffect } from "react";
import { registerForPushNotifications } from "../lib/notifications";

export default function RootLayout() {
  useEffect(() => {
    registerForPushNotifications();
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

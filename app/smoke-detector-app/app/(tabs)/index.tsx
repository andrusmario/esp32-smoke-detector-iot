import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { ref, onValue, update } from "firebase/database";
import { db } from "../../firebase";
import { registerForPushNotifications } from "../../lib/notifications";

export default function HomeScreen() {
 
  const [smoke, setSmoke] = useState<boolean | null>(null);
  const [online, setOnline] = useState<boolean | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  useEffect(() => {
    const deviceRef = ref(db, "devices/device1");

    const unsubscribe = onValue(deviceRef, (snapshot) => {
      const data = snapshot.val();

      if (!data) return;

      setSmoke(data.smoke);
      setOnline(data.online);
      setLastUpdated(data.lastUpdated);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
  registerForPushNotifications().then(async (token) => {
    if (!token) return;

    console.log("Expo Push Token:", token);

    const deviceRef = ref(db, "devices/device1");

    await update(deviceRef, {
      pushToken: token,
      lastUpdated: Math.floor(Date.now() / 1000),
    });
  });
}, []);



  const isSmoke = smoke === true;
  const isOnline = online === true;

  let statusText = "Loading...";
  let statusColor = "#999";

  if (smoke !== null) {
    if (isSmoke && isOnline) {
      statusText = "🚨 ALERT";
      statusColor = "#c0392b";
    } else if (isSmoke && !isOnline) {
      statusText = "⚠️ SMOKE (DEVICE OFFLINE)";
      statusColor = "#f39c12";
    } else {
      statusText = "SAFE";
      statusColor = "#2ecc71";
    }
  }



  return (
    <View style={styles.container}>
      <Text style={styles.header}>Smoke Detector</Text>

      <View style={styles.card}>
        <Text style={[styles.status, { color: statusColor }]}>
          {statusText}
        </Text>

        <Text style={styles.subText}>
          Device: {online ? "Online" : "Offline"}
        </Text>

        {lastUpdated && (
          <Text style={styles.timestamp}>
            Last updated:{" "}
            {new Date(lastUpdated * 1000).toLocaleTimeString()}
          </Text>
        )}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: "600",
    marginBottom: 20,
  },
  card: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  status: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subText: {
    fontSize: 16,
    color: "#555",
    marginBottom: 6,
  },
  timestamp: {
    fontSize: 14,
    color: "#777",
    marginTop: 10,
  },
});

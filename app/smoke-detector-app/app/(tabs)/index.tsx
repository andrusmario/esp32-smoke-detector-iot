import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { ref, onValue } from "firebase/database";
import { db } from "../../firebase";

export default function HomeScreen() {
  const [smoke, setSmoke] = useState<boolean | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  useEffect(() => {
    const deviceRef = ref(db, "devices/device1");

    const unsubscribe = onValue(deviceRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      setSmoke(data.smoke);
      setLastUpdated(data.lastUpdated);
    });

    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Smoke Detector</Text>

      {smoke === null ? (
        <Text style={styles.loading}>Loading…</Text>
      ) : (
        <Text
          style={[
            styles.status,
            { color: smoke ? "#e74c3c" : "#2ecc71" },
          ]}
        >
          {smoke ? "SMOKE DETECTED" : "SAFE"}
        </Text>
      )}

      {lastUpdated && (
        <Text style={styles.timestamp}>
          Last update: {new Date(lastUpdated * 1000).toLocaleTimeString()}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
  },
  status: {
    fontSize: 26,
    fontWeight: "bold",
  },
  loading: {
    fontSize: 18,
    color: "#999",
  },
  timestamp: {
    marginTop: 12,
    color: "#555",
  },
});

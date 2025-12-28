import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { ref, onValue } from "firebase/database";
import { db } from "../../firebase";

type AlertItem = {
  id: string;
  deviceId: string;
  type: string;
  message: string;
  timestamp: number;
  active?: boolean;
};

export default function HistoryScreen() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const alertsRef = ref(db, "alerts");

    return onValue(alertsRef, (snapshot) => {
      const data = snapshot.val();

      if (!data) {
        setAlerts([]);
        setLoading(false);
        return;
      }

      const parsed: AlertItem[] = Object.entries(data)
        .map(([id, value]: any) => ({
          id,
          ...value,
        }))
        .sort((a, b) => b.timestamp - a.timestamp);

      setAlerts(parsed);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (alerts.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>No alerts recorded yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Alert History</Text>

      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.type}>
              🚨 {item.type}
            </Text>

            <Text style={styles.message}>
              {item.message}
            </Text>

            <Text style={styles.time}>
              {new Date(item.timestamp * 1000).toLocaleString()}
            </Text>
          </View>
        )}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    paddingHorizontal: 16,
    paddingTop: 76,
  },
  header: {
    fontSize: 26,
    fontWeight: "600",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  type: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  message: {
    fontSize: 15,
    color: "#333",
  },
  time: {
    fontSize: 13,
    color: "#777",
    marginTop: 8,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  empty: {
    fontSize: 16,
    color: "#666",
  },
});

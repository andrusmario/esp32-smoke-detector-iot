#include <Arduino.h>
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <time.h>

#include "secrets.h"

// ================= CONFIG =================
#define MQ2_PIN 34
#define SMOKE_THRESHOLD 900
#define DEVICE_ID "device1"

// ================= FIREBASE =================
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// ================= STATE =================
bool lastSmokeState = false;

// ================= SETUP =================
void setup() {
  Serial.begin(115200);

  analogReadResolution(12);
  analogSetPinAttenuation(MQ2_PIN, ADC_11db);

  // WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");

  // Time (for timestamps)
  configTime(0, 0, "pool.ntp.org");

// Firebase
config.api_key = API_KEY;
config.database_url = DATABASE_URL;

if (!Firebase.signUp(&config, &auth, "", "")) {
  Serial.print("❌ signUp failed: ");
  Serial.println(config.signer.signupError.message.c_str());
  return;
}

Serial.println("✅ signUp OK");

Firebase.begin(&config, &auth);
Firebase.reconnectWiFi(true);

// Wait for token
Serial.print("Getting token");
while (auth.token.uid == "") {
  Serial.print(".");
  delay(300);
}
Serial.println("\n✅ Token ready");

}

void loop() {
  int sensorValue = analogRead(MQ2_PIN);
  bool smokeDetected = sensorValue > SMOKE_THRESHOLD;

  Serial.print("MQ2: ");
  Serial.print(sensorValue);
  Serial.print(" | Smoke: ");
  Serial.println(smokeDetected);

  // ---- Device heartbeat ----
  Firebase.RTDB.setBool(
    &fbdo,
    "/devices/" DEVICE_ID "/online",
    true
  );

  Firebase.RTDB.setBool(
    &fbdo,
    "/devices/" DEVICE_ID "/smoke",
    smokeDetected
  );

  Firebase.RTDB.setInt(
    &fbdo,
    "/devices/" DEVICE_ID "/value",
    sensorValue
  );

  Firebase.RTDB.setInt(
    &fbdo,
    "/devices/" DEVICE_ID "/lastUpdated",
    time(nullptr)
  );

  lastSmokeState = smokeDetected;
  delay(1000);
}

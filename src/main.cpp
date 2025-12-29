#include <Arduino.h>
#define BUZZER_PIN 25
#define MQ2_PIN 34
#define SMOKE_THRESHOLD 900

#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <time.h>

#include "secrets.h"

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

bool lastSmokeState = false;

void buzzerOff() { digitalWrite(BUZZER_PIN, HIGH); }
void buzzerOn() { digitalWrite(BUZZER_PIN, LOW); }

void setup() {
    Serial.begin(115200);

    pinMode(BUZZER_PIN, OUTPUT);
    digitalWrite(BUZZER_PIN, LOW);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    Serial.print("Connecting to Wi-Fi");

    while(WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nWiFi connected");

    config.api_key = API_KEY;
    config.database_url = DATABASE_URL;

    Firebase.begin(&config, &auth);
    Firebase.reconnectWiFi(true);

    Serial.println("Firebase connected");
}

void loop() {
    int sensorValue = analogRead(MQ2_PIN);
    bool smokeDetected = sensorValue > SMOKE_THRESHOLD;

    Serial.println(sensorValue);
    digitalWrite(BUZZER_PIN, smokeDetected ? HIGH : LOW);

    Firebase.RTDB.setBool(&fbdo, "/devices/device1/smoke", smokeDetected);
    Firebase.RTDB.setInt(&fbdo, "/devices/device1/value", sensorValue);
    Firebase.RTDB.setString(&fbdo, "/devices/device1/lastUpdated", time(nullptr));

    if(smokeDetected && !lastSmokeState) {
        FirebaseJson alert;
        alert.set("deviceId", "device1");
        alert.set("type", "SMOKE");
        alert.set("message", "Smoke detected");
        alert.set("active", true);
        alert.set("timestamp", time(nullptr));
        Firebase.RTDB.pushJSON(&fbdo, "/alerts", &alert);
    }
    lastSmokeState = smokeDetected;
    delay(1000);
}
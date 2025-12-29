#define MQ2_PIN 34
#define BUZZER_PIN 25
#include <Arduino.h>


void setup() {
    pinMode(MQ2_PIN, INPUT);
    pinMode(BUZZER_PIN, OUTPUT);
}

void loop() {
    int sensorValue = analogRead(MQ2_PIN);

    if(sensorValue > 500) {
        digitalWrite(BUZZER_PIN, HIGH);
    } else {
        digitalWrite(BUZZER_PIN, LOW);
    }

    delay(100);
    
}
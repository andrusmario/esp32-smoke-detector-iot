"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSmokeAlert = void 0;
const v2_1 = require("firebase-functions/v2");
const database_1 = require("firebase-functions/v2/database");
const admin = __importStar(require("firebase-admin"));
(0, v2_1.setGlobalOptions)({
    region: "europe-west1",
});
admin.initializeApp();
exports.sendSmokeAlert = (0, database_1.onValueUpdated)("/devices/{deviceId}", async (event) => {
    const before = event.data.before.val();
    const after = event.data.after.val();
    if (!before || !after)
        return;
    const smokeTriggered = before.smoke === false &&
        after.smoke === true &&
        after.online === true;
    if (!smokeTriggered)
        return;
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
    console.log(`🚨 Smoke alert sent for ${event.params.deviceId}`);
});

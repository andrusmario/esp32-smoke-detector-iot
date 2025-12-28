import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBdRopegrXjftEoLxe32Lvwc_-6duYtBPM",
  authDomain: "esp32-smoke-detector.firebaseapp.com",
  databaseURL:
    "https://esp32-smoke-detector-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "esp32-smoke-detector",
  storageBucket: "esp32-smoke-detector.appspot.com",
  messagingSenderId: "625660646664",
  appId: "1:625660646664:web:ac08babc31cfe9860f08bd",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

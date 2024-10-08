import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage"; // Імпорт для сховища

// TODO: Replace with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyA8Qqv9S22rdYGfHiONlZ6Ss2El4EC95hw",
  authDomain: "guildchat-5d8c1.firebaseapp.com",
  databaseURL:
    "https://guildchat-5d8c1-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "guildchat-5d8c1",
  storageBucket: "guildchat-5d8c1.appspot.com",
  messagingSenderId: "220187331504",
  appId: "1:220187331504:web:74d825c9652d2977946475",
};

// Ініціалізація Firebase
const app = initializeApp(firebaseConfig);

// Експорт бази даних і сховища
const database = getDatabase(app);
const storage = getStorage(app);

export { database, storage };
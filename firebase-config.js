// firebase-config.js
const firebaseConfig = {
  apiKey: "AIzaSyBf5K3WcnK7ETfnpwt_OjR14PrTElzg82c",
  authDomain: "habit-tracker-76114.firebaseapp.com",
  projectId: "habit-tracker-76114",
  storageBucket: "habit-tracker-76114.firebasestorage.app",
  messagingSenderId: "1048914443296",
  appId: "1:1048914443296:web:8c8fa02e9ebafd9d069045"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

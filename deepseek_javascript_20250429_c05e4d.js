// Firebase configuration and initialization
const firebaseConfig = {
  apiKey: "AIzaSyDnX17qdA2jHUhGuV1lwXDNd9qIlQkC7gg",
  authDomain: "vidya-3a7b0.firebaseapp.com",
  databaseURL: "https://vidya-3a7b0-default-rtdb.firebaseio.com",
  projectId: "vidya-3a7b0",
  storageBucket: "vidya-3a7b0.firebasestorage.app",
  messagingSenderId: "259975629672",
  appId: "1:259975629672:web:37f9ca31c7c70a971724dd"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Make available to other scripts
window.firebaseApp = app;
window.firebaseDatabase = database;

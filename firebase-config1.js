const firebaseConfig = {
  apiKey: "AIzaSyBQ2aQZdBhMk6-0hL1JOq05sJfVKtYfmhU",
  authDomain: "group-chat-b2a3c.firebaseapp.com",
  databaseURL: "https://group-chat-b2a3c-default-rtdb.firebaseio.com",
  projectId: "group-chat-b2a3c",
  storageBucket: "group-chat-b2a3c.firebasestorage.app",
  messagingSenderId: "652138733251",
  appId: "1:652138733251:web:c482f131b177a8b5f78c76"
};


// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

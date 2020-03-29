// Firebase App (the core Firebase SDK) is always required and
// must be listed before other Firebase SDKs
var firebase = require("firebase/app");

// Add the Firebase products
require("firebase/auth");
require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyArwJ2aFBL430sEobFMvM58q9QdoEnTQ6k",
  authDomain: "test-db-88088.firebaseapp.com",
  databaseURL: "https://test-db-88088.firebaseio.com",
  projectId: "test-db-88088",
  storageBucket: "test-db-88088.appspot.com",
  messagingSenderId: "370716807223",
  appId: "1:370716807223:web:3e94fca51af0d9fe756fb2"
};
  
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

let db = firebase.firestore();
/*
// ADD CHARACTER
let characterRef = db.collection('characters').doc('alegod');

let setAda = docRef.set({
  name: character1.name;
  className: character1.className;
});

let aTuringRef = db.collection('users').doc('aturing');

let setAlan = aTuringRef.set({
  'first': 'Alan',
  'middle': 'Mathison',
  'last': 'Turing',
  'born': 1912
});
*/

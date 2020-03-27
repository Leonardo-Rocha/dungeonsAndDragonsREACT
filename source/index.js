// Firebase App (the core Firebase SDK) is always required and
// must be listed before other Firebase SDKs
var firebase = require("firebase/app");

// Add the Firebase products
require("firebase/auth");
require("firebase/firestore");

const firebaseConfig = {
    apiKey: "AIzaSyDQM3f3eT0H_-JPfwovLMEfW5Y4aI9Rgek",
    authDomain: "dungeonsanddragons-420d3.firebaseapp.com",
    databaseURL: "https://dungeonsanddragons-420d3.firebaseio.com",
    projectId: "dungeonsanddragons-420d3",
    storageBucket: "dungeonsanddragons-420d3.appspot.com",
    messagingSenderId: "147775965249",
    appId: "1:147775965249:web:4bc1760352808188bf5ec0",
    measurementId: "G-82H6GF09PR"
};
  
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const admin = require('firebase-admin');
const functions = require('firebase-functions');

admin.initializeApp(functions.config().firebase);

let db = admin.firestore();

let docRef = db.collection('users').doc('alovelace');

let setAda = docRef.set({
  first: 'Ada',
  last: 'Lovelace',
  born: 1815
});

let aTuringRef = db.collection('users').doc('aturing');

let setAlan = aTuringRef.set({
  'first': 'Alan',
  'middle': 'Mathison',
  'last': 'Turing',
  'born': 1912
});
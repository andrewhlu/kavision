var firebase = require("firebase/app");

// Add additional services that you want to use
require("firebase/auth");
require("firebase/database");
require("firebase/firestore");
require("firebase/messaging");
require("firebase/functions");

// Comment out (or don't require) services that you don't want to use
// require("firebase/storage");

var config = {
    apiKey: "AIzaSyAZY8hHdqJA8XXtKjRjnxCb7ZiC3-rxMt0",
    authDomain: "scavision-hunt.firebaseapp.com",
    databaseURL: "https://scavision-hunt.firebaseio.com",
    projectId: "scavision-hunt",
    storageBucket: "scavision-hunt.appspot.com",
    messagingSenderId: "506559382735"
  };

firebase.initializeApp(config);

firebase.database();

firebase.functions();
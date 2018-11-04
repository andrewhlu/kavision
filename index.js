function onStartup() {
  //Firebase Code
  window.FirebaseAuth = new FirebaseAuth();

	//Check if this device is supported
	const supported = 'mediaDevices' in navigator;
	console.log(supported);

	const player = document.getElementById('player');
  const canvas = document.getElementById('canvas');
  const context = canvas.getContext('2d');
  const captureButton = document.getElementById('capture');

  const constraints = {
    video: true,
  };

  // captureButton.addEventListener('click', () => {
  //   // Draw the video frame to the canvas.
  //   context.drawImage(player, 0, 0, canvas.width, canvas.height);

  //   //Upload the image to the server
  // });

  navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
    player.srcObject = stream;

    setTimeout(function() {
      canvas.height = player.videoHeight;
      canvas.width = player.videoWidth;

      console.log("Player: " + player.videoHeight + ", " + player.videoWidth);
      console.log("Canvas: " + canvas.height + ", " + canvas.width);
    }, 2000);
  });
}

//Firebase API
function FirebaseAuth() {
  this.checkSetup();

  //Shortcuts to sign in DOM elements
  this.captureButton = document.getElementById('capture');
  this.loginButton = document.getElementById('loginButton');
  this.nameButton = document.getElementById('nameButton');

  // Add listeners for buttons.
  this.loginButton.addEventListener('click', this.googleSignIn.bind(this));
  this.captureButton.addEventListener('click', this.captureImage.bind(this));
  
  this.initFirebase();
}

// Checks that the Firebase SDK has been correctly setup and configured.
FirebaseAuth.prototype.checkSetup = function() {
  if (!window.firebase || !(firebase.app instanceof Function) || !firebase.app().options) {
    window.alert('You have not configured and imported the Firebase SDK. ' +
        'Make sure you go through the codelab setup instructions and make ' +
        'sure you are running the codelab using `firebase serve`');
  }
};

FirebaseAuth.prototype.initFirebase = function() {
  //Shortcuts to Firebase SDK features
  this.auth = firebase.auth();
  this.database = firebase.database();
  this.storage = firebase.storage();
  //Initiates Firebase auth and listen to auth state changes.
  this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
};

FirebaseAuth.prototype.googleSignIn = function() {
  var provider = new firebase.auth.GoogleAuthProvider();
  this.auth.signInWithPopup(provider);
};

FirebaseAuth.prototype.signOut = function() {
  this.auth.signOut();
};

FirebaseAuth.prototype.onAuthStateChanged = function(user) {
  if(user) { 
    //this.nameButton.innerHTML = user.displayName;
    this.nameButton.removeAttribute("hidden");
    this.loginButton.setAttribute("hidden", true);


    // $('#nameButton').html(user.displayName);
    // $('#loginButton').attr("hidden", true);
    // $('#nameButton').removeAttr("hidden");
  } 
  else { 
    this.loginButton.removeAttribute("hidden");
    this.nameButton.setAttribute("hidden", true);
  }
};

FirebaseAuth.prototype.captureImage = function() {
  console.log("Hello");
};
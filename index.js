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

  navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
    player.srcObject = stream;

    setTimeout(function() {
      canvas.height = player.videoHeight;
      canvas.width = player.videoWidth;

      console.log("Player: " + player.videoHeight + ", " + player.videoWidth);
      console.log("Canvas: " + canvas.height + ", " + canvas.width);
    }, 2000);
  });

  // Set the date we're counting down to
    var seconds = 60*1000
    var mins = 0*1000*60
    var hours = 0*1000*60*60
    var days = 0*1000*60*60*24
    var countDownDate = ((new Date().getTime())+mins+hours+days+seconds);
    // Update the count down every 1 second
    var x = setInterval(function() {
  
    // Get todays date and time
    var now = new Date().getTime();
    
    // Find the distance between now and the count down date
    var distance = countDownDate - now;
    
    // Time calculations for days, hours, minutes and seconds
    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    // Output the result in an element with id="demo"
    if (days > 0){
    document.getElementById("demo").innerHTML = days + "d " + hours + "h "
    + minutes + "m " + seconds + "s ";
    } else if (minutes > 0){
      document.getElementById("demo").innerHTML = hours + "h "
    + minutes + "m " + seconds + "s ";
    } else {
      document.getElementById("demo").innerHTML = minutes + "m " + seconds + "s ";
    }
    
    // If the count down is over, write some text 
    if (distance < 0) {
      clearInterval(x);
      document.getElementById("demo").innerHTML = "Time's Up!";
      $('#myModal').modal('show'); 
    }
  }, 1000);
}

//Firebase API
function FirebaseAuth() {
  this.checkSetup();

  //Shortcuts to sign in DOM elements
  this.captureButton = document.getElementById('capture');
  this.loginButton = document.getElementById('loginButton');
  this.nameButton = document.getElementById('nameButton');

  this.player = document.getElementById('player');
  this.canvas = document.getElementById('canvas');
  this.context = canvas.getContext('2d');

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
  $('#modal-loading').removeAttr("hidden");
  $('#modal-result-success').attr("hidden", true);
  $('#modal-result-failure').attr("hidden", true);

  $('#myModal').modal('show');

  this.context.drawImage(this.player, 0, 0, this.canvas.width, this.canvas.height);

  this.image = this.canvas.toDataURL();
  this.imgName = randomString(10, "ABCDEFGHIJKLMNOPQRSTUVWXYZ");

  // Data URL string
  this.storage.ref().child('/images/' + this.imgName + '.png').putString(this.image, 'data_url').then(function(snapshot) {
    console.log('Uploaded a data_url string!');

    //Get the URL of the newly uploaded object
    this.storage.ref().child('/images/' + this.imgName + '.png').getDownloadURL().then(function(url) {
      console.log(url);

      //Call the Image Recognition API
      var urlstring = "https://us-central1-scavision-hunt.cloudfunctions.net/processImage?url=" + encodeURIComponent(url) + "&game=ABCD";

      var settings = {
        "async": true,
        "crossDomain": true,
        "url": urlstring,
        "method": "GET"
      }

      $.ajax(settings).done(function (response) {
        console.log(response);
        $('#myModal').modal('show');
        
        if(response.success == true) { //valid
          console.log(response.found);

          $('#image-success').attr("src", url);

          $('#modal-loading').attr("hidden", true);
          $('#modal-result-success').removeAttr("hidden");
          $('#modal-result-failure').attr("hidden", true);
        }
        else {
          console.log(response.error);

          $('#image-failed').attr("src", url);

          $('#modal-loading').attr("hidden", true);
          $('#modal-result-failure').removeAttr("hidden");
          $('#modal-result-success').attr("hidden", true);
        }
      });
    }.bind(this)).catch(function(error) {
      console.log(error);
    });
  }.bind(this));
};

//Generate random string function
function randomString(length, chars) {
  var result = '';
  for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
  return result;
}
//Membership button function to open new account modal
function openNewAccountModal() {
  $('#newAccountModal').modal({backdrop: 'static'});
}

//Initialize FirebaseAuth function on startup
window.onload = function() {
  window.FirebaseAuth = new FirebaseAuth();
};

//Firebase Initialization
function FirebaseAuth() {
  this.checkSetup();

  //Shortcuts to sign in DOM elements
  this.googleSignInButton = document.getElementById('google-sign-in');
  this.githubSignInButton = document.getElementById('github-sign-in');
  this.signOutButton = document.getElementById('sign-out');
  this.newAccountSignOut = document.getElementById('newaccount-signout');
  this.newAccountSubmit = document.getElementById('newaccount-submit');

  // Add listeners for sign in buttons.
  this.googleSignInButton.addEventListener('click', this.googleSignIn.bind(this));
  this.githubSignInButton.addEventListener('click', this.githubSignIn.bind(this));
  this.signOutButton.addEventListener('click', this.signOut.bind(this));
  this.newAccountSignOut.addEventListener('click', this.signOut.bind(this));
  this.newAccountSubmit.addEventListener('click', this.createAccount.bind(this));
  
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
  //Set account type to Google
  this.accountType = "google";

  var provider = new firebase.auth.GoogleAuthProvider();
  this.auth.signInWithPopup(provider);
};

FirebaseAuth.prototype.githubSignIn = function() {
  //Set account type to GitHub
  this.accountType = "github";

  var provider = new firebase.auth.GithubAuthProvider();
  provider.addScope('read:org');
  provider.addScope('user');
  this.auth.signInWithPopup(provider);
  //other stuff
};

FirebaseAuth.prototype.signOut = function() {
  this.auth.signOut();
};

FirebaseAuth.prototype.onAuthStateChanged = function(user) {
  if(user) { 
    //User is signed in! Show loading div
    $('#login-signin').attr("hidden", true);
    $('#login-wait').removeAttr("hidden");
    $('#login-success').attr("hidden", true);

    //Get user ID and store
    var uid = firebase.auth().currentUser.uid;
    this.uid = uid;
    
    //Get perm from user ID
    this.database.ref('/accounts/' + uid + '/user').once('value').then(function(snapshot) {
      var perm = snapshot.val();

      if(perm) {
        //Account is set up, store perm
        this.perm = perm;

        //Set the user's name
        this.database.ref('/members/' + perm).once('value').then(function(snapshot) {
          var name = snapshot.val().fname + " " + snapshot.val().lname;
          $('#login-name').html(name);

          if(name.length > 10) {
            $('#userDropdown').html(snapshot.val().fname + " " + snapshot.val().lname.substr(0,1) + ".");
          }
          else {
             $('#userDropdown').html(name);
          }
        }.bind(this));

        //Check membership using perm
        this.checkMembership(perm);
      }
      else {
        //Run account setup, passing the user object
        console.log("Redirect to new account");
        this.setupAccount(user);
      }

      //Hide sign-in button.
      $('#sign-in-li').attr("hidden", true);

      // Show user's profile and sign-out button.
      $('#user-li').removeAttr("hidden");
      $('#sign-out').removeAttr("hidden");

      //Show success div
      $('#login-wait').attr("hidden", true);
      $('#login-success').removeAttr("hidden");

      //Close login modal after one second
      setTimeout(function() {
        $('#loginModal').modal('hide');
      }, 1000);
    }.bind(this));
  } 
  else { 
    //User is signed out!
    //Hide user's profile and sign-out button.
    $('#user-li').attr("hidden", true);
    $('#sign-out').attr("hidden", true);

    //Show sign-in button.
    $('#sign-in-li').removeAttr("hidden");

    //Show signin div
    $('#login-signin').removeAttr("hidden");
    $('#login-wait').attr("hidden", true);
    $('#login-success').attr("hidden", true);

    //Close new account modal, if open
    $('#newAccountModal').modal('hide');
  }
};

FirebaseAuth.prototype.checkMembership = function(perm) {
  //Look up membership level in perm branch
  this.database.ref('/perm/' + perm + '/status').once('value').then(function(snapshot) {
    var level = snapshot.val();
    console.log("Membership level: " + level);

    //Change page accordingly
    var memTitleArray = [["Set Up Account", "javascript:void(0);"],["Member", "/membership"],["Lab Member","/labmember"]];

    $('#membershipLevel').html(memTitleArray[level][0]);
    $('#membershipLevel').attr("href", memTitleArray[level][1]);

    if(level == 0) {
      $('#membershipLevel').attr("onclick", "openNewAccountModal();");
    }
    else {
      //Remove onclick attribute
      $('#membershipLevel').prop("onclick", null);
    }
  }.bind(this));
};

FirebaseAuth.prototype.setupAccount = function(user) {
  //Get user's name
  var fullName = user.displayName;

  //Set the user's name on page
  $('#userDropdown').html(fullName);
  $('#login-name').html(fullName);

  //Set text field values for new account modal
  $('#newaccount-fname').val(fullName.substr(0, fullName.indexOf(" ")));
  $('#newaccount-lname').val(fullName.substr(fullName.indexOf(" ") + 1, fullName.length - 1));
  $('#newaccount-email').val(user.email);

  //Set membership level to new account
  $('#membershipLevel').html("Set Up Account");
  $('#membershipLevel').attr("href", "javascript:void(0);");
  $('#membershipLevel').attr("onclick", "openNewAccountModal();");

  //Open new account modal after 1.5 seconds
  setTimeout(function() {
    $('#newAccountModal').modal({backdrop: 'static'});
  }, 1500);
};

FirebaseAuth.prototype.createAccount = function() {
  //First, check to see if all text fields have a valid value
  if(($('#newaccount-fname').val().match(/([A-Z])\w+/g) != null) && ($('#newaccount-lname').val().match(/([A-Z])\w+/g) != null) && ($('#newaccount-email').val().match(/.+\@.+\..+/g) != null)) {
    //Values entered are valid, show wait div
    $('#newaccount-new').attr("hidden", true);
    $('#newaccount-wait').removeAttr("hidden");

    //Get and set new temp perm
    var tempPerm = "T" + randomString(8, '0123456789');
    this.perm = tempPerm;

    //Check to see if this temp perm is empty
    this.database.ref('/perm/' + tempPerm).once('value').then(function(snapshot) {
      if(snapshot.val() == null) {
        //First, create account under perm branch
        this.database.ref('/perm/' + this.perm).set({
          activated: false,
          status: 1
        });

        //Then, create account under accounts branch
        this.database.ref('/accounts/' + this.uid).set({
          user: this.perm,
          type: this.accountType
        });

        //Lastly, create account under members branch
        this.database.ref('/members/' + this.perm).set({
          fname: $('#newaccount-fname').val(),
          lname: $('#newaccount-lname').val(),
          email: $('#newaccount-email').val()
        });

        //Finished! Show success div
        $('#newaccount-wait').attr("hidden", true);
        $('#newaccount-success').removeAttr("hidden");

        //Refresh page after 1.5 seconds
        setTimeout(function() {
          window.location.reload(true);
        }, 1500);
      }
    }.bind(this)).catch(function(error) {
      $('#newaccount-wait').attr("hidden", true);
      $('#newaccount-error').html(error);
      $('#newaccount-failed').removeAttr("hidden");
    }.bind(this));
  }
  else {
    //Values entered are invalid, display warning div
    $('#newaccount-warning').removeAttr("hidden");
  }
};
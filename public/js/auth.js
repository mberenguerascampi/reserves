// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());

var uiConfig = {
  callbacks: {
    signInSuccess: function(currentUser, credential, redirectUrl) {
      // User successfully signed in.
      // Return type determines whether we continue the redirect automatically
      // or whether we leave that to developer to handle.
      return true;
    },
    uiShown: function() {
      // The widget is rendered.
      // Hide the loader.
      $("#loader").html("haha")
      $("#loader").hide();
    }
  },
  // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
  signInFlow: 'popup',
  signInSuccessUrl: './reserves.html',
  signInOptions: [
    // Leave the lines as is for the providers you want to offer your users.
   /* firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    firebase.auth.TwitterAuthProvider.PROVIDER_ID,
    firebase.auth.GithubAuthProvider.PROVIDER_ID,*/
    {
	    provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
	    // Required to enable this provider in One-Tap Sign-up.
	    authMethod: 'https://accounts.google.com',
	    // Required to enable ID token credentials for this provider.
	    clientId: "1080277297588-03i4q9hjf47epmoes1i0m03nuujtpt6l.apps.googleusercontent.com"
	},
	{
        provider: firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        scopes :[
          'public_profile',
          'email',
          'user_likes',
          'user_friends'
        ]
     },
    /*{
      provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
      // Whether the display name should be displayed in Sign Up page.
      requireDisplayName: true
    }*/
  ],
  // Terms of service url.
  tosUrl: '<your-tos-url>',
  credentialHelper: firebaseui.auth.CredentialHelper.NONE
};

//credentialHelper
//firebaseui.auth.CredentialHelper.GOOGLE_YOLO
//firebaseui.auth.CredentialHelper.ACCOUNT_CHOOSER_COM

// The start method will wait until the DOM is loaded.
//ui.start('#firebaseui-auth-container', uiConfig);

addEvents = function() {
	$('#sign-in').click(function() { 
		/*$(".popover-body").html('<div><h6>Iniciar sessió</h6></div><div id="firebaseui-auth-container"></div><div id="loader">Loading...</div>');
		ui.start('#firebaseui-auth-container', uiConfig);*/
    ui.start('#firebaseui-auth-container-popup', uiConfig);
    $('#loginPopup').modal('show');
	});
  	
	$('#sign-out').click(function() {
  	firebase.auth().signOut();
	});

  $("#reservationBtn").click(function() {
    ui.start('#firebaseui-auth-container-popup', uiConfig);

    var user = firebase.auth().currentUser;

    if (user) {
      // User is signed in.
      var url = window.location.origin + "/reserves.html";
      window.location = url;
    } else {
      // No user is signed in.
      $('#loginPopup').modal('show')
    }
  });
}

initApp = function() {
	/*$('#sign-in').popover({
    	container: 'body'
  	});*/

  ui.start('#firebaseui-auth-container-popup', uiConfig);

	addEvents();

    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        // User is signed in.
        var displayName = user.displayName;
        var email = user.email;
        var emailVerified = user.emailVerified;
        var photoURL = user.photoURL;
        var uid = user.uid;
        var phoneNumber = user.phoneNumber;
        var providerData = user.providerData;
        user.getIdToken().then(function(accessToken) {
          $('#sign-in').hide();
          $('#sign-out').show();
          /*document.getElementById('account-details').textContent = JSON.stringify({
            displayName: displayName,
            email: email,
            emailVerified: emailVerified,
            phoneNumber: phoneNumber,
            photoURL: photoURL,
            uid: uid,
            accessToken: accessToken,
            providerData: providerData
          }, null, '  ');*/
        });
      } else {
        // User is signed out.
        $('#sign-out').hide();
        $('#sign-in').show();
      }
    }, function(error) {
      console.log(error);
    });
};

window.addEventListener('load', function() {
initApp()
});
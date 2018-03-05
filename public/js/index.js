var Login = new Vue ({
	el: "#loginPopup",
	data: {
		email: "",
		password: "",
		passwordRepeat: "",
		name: "",
		phone: "",
		errorMsg: "",
		signUpErrorMsg: "",
		displayEmailForm: true,
		displaySignUpForm: false
	},
	methods: {
		signIn: function () {
			this.errorMsg = "";
			var self = this;
		  	firebase.auth().signInWithEmailAndPassword(this.email, this.password).then(function() {
		      var url = window.location.origin + "/reserves.html";
      		  window.location = url;
		    })
		    .catch(function(error) {
			  // Handle Errors here.
			  var errorCode = error.code;
			  self.errorMsg = error.message;
			  // ...
			});
	    },
	    passwordRecovery: function () {
			this.displayEmailForm = false;
	    },
	    cancelPasswordRecovery: function () {
			this.displayEmailForm = true;
	    },
	    sendPasswordRecovery: function () {
			firebase.auth().sendPasswordResetEmail(this.email).then(function() {
		      // Password reset email sent.
		    })
		    .catch(function(error) {
		      // Error occurred. Inspect error.code.
		    });
	    },
	    showSignUpForm: function () {
			this.displaySignUpForm = true;
	    },
	    signUp: function () {
	    	if(this.password !== this.passwordRepeat){
	    		this.signUpErrorMsg = "Els passwords no coincideixen";
	    		return;
	    	}

	    	var self = this;
			firebase.auth().createUserWithEmailAndPassword(this.email, this.password).catch(function(error) {
			  // Handle Errors here.
			  var errorCode = error.code;
			  self.signUpErrorMsg = error.message;
			  // ...
			});
	    },
	    cancelSignUp: function () {
			this.displaySignUpForm = false;
	    },
	    errorLabelDisplay: function(){
			return (this.errorMsg != "");
		},
	}
});


var updateInstrSize = function(){
	var intrWidth = parseInt($(".img-instructions").css("width").replace("px",""));
	console.log(intrWidth);
    $(".img-instructions").css("height", Math.round(intrWidth*0.5625));
}

$(window).on('resize', function(){
    updateInstrSize();
});

$(document).ready(function() {
	updateInstrSize();
});
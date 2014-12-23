//Define the global URLs for this app
/*
// local dev
window.serverLocation = 'http://localhost:8080';
window.clientBaseURL = 'http://localhost:9000/';
window.restPath = '/MasterMindStaging/rest/';
window.fixUrl = false;
window.useAdoptedServices = false;
*/

//local nodejs based development
//window.serverLocation = 'http://localhost:3000/';
//window.restPath = '';
//window.clientBaseURL = 'http://localhost:9000/';
//window.fixUrl = true;
//window.useAdoptedServices = true;

//prod 
//window.serverLocation = 'https://mastermind.pointsource.com';
//window.restPath = '/MMNodeServer/';
//window.clientBaseURL = 'https://mastermind.pointsource.com/';
//window.fixUrl = true;
//window.useAdoptedServices = true;

//stage 
//window.serverLocation = 'https://stage.mastermind.pointsource.com';
//window.restPath = '/MMNodeStaging/';
//window.clientBaseURL = 'https://stage.mastermind.pointsource.com/';
//window.fixUrl = true;
//window.useAdoptedServices = true;

//demo
//window.serverLocation = 'https://demo.mastermind.pointsource.com';
//window.restPath = '/MMNodeDemo/';
//window.clientBaseURL = 'https://demo.mastermind.pointsource.com/';
//window.fixUrl = true;
//window.useAdoptedServices = true;

var helper = (function () {
  var authResult = undefined;

  return {
    /**
     * Hides the sign-in button and connects the server-side app after the
     * user successfully signs in.
     *
     * @param {Object}
     *            authResult An Object which contains the access token and
     *            other authentication information.
     */
    onSignInCallback: function (authResult) {
      if (authResult['access_token']) {
        // Save the auth result
        this.authResult = authResult;
        var token = authResult['access_token'];
        var existingToken = localStorage['access_token'];
        //Save the access token
        localStorage["access_token"] = authResult['access_token'];

        window.location = window.clientBaseURL+"index.html";
      

      } else if (authResult['error']) {
        // There was an error, which means the user is not signed in.
        // As an example, you can troubleshoot by writing to the
        // console:
        console.log('There was an error: ' + authResult['error']);

        //Delete the auth token

        //$('#authResult').append('Logged out');
        //$('#authOps').hide('slow');
        //$('#gConnect').show();
      }
      //console.log('authResult', authResult);
    },

    disconnectUser: function (access_token, disconnectEntryPoint) {
    	if (!disconnectEntryPoint) {
    		disconnectEntryPoint = function(cb){ if (cb) cb()};
    	}
    	
      if (access_token) {
        var revokeUrl = 'https://accounts.google.com/o/oauth2/revoke?token=' +
          access_token;

        // Perform an asynchronous GET request.
        $.ajax({
          type: 'GET',
          url: revokeUrl,
          async: false,
          contentType: "application/json",
          dataType: 'jsonp',
          success: function (nullResponse) {
            // Do something now that user is disconnected
            // The response is always undefined.
        	 
        	  disconnectEntryPoint(function() {
        		//remove the token
                  delete window.localStorage['access_token'];
                  window.location = window.clientBaseURL+"login.html";
        	  });
            

            //              //Show the home page
            //              $('#welcomeContent').show();
            //              $('#appContent').hide();
          },
          error: function (e) {
            // Handle the error
            console.log(e);
         
            disconnectEntryPoint(function() {
        		//remove the token
                  delete window.localStorage['access_token'];
                  window.location = window.clientBaseURL+"login.html";
        	});
          }
        });
      }else{
    	  disconnectEntryPoint(function() {
    		  window.location = window.clientBaseURL+"login.html";
    	  });
      }
    }
  };
})();
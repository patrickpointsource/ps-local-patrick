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
window.serverLocation = 'http://localhost:3000/';
window.restPath = '';
window.clientBaseURL = 'http://localhost:9000/';
window.fixUrl = true;
window.useAdoptedServices = true;

//new prod nodejs 
//window.serverLocation = 'https://mastermind.pointsource.com';
//window.restPath = '/MMNodeServer/';
//window.clientBaseURL = 'https://mastermind.pointsource.com/';
//window.fixUrl = true;
//window.useAdoptedServices = true;

//new stage nodejs 
//window.serverLocation = 'https://stage.mastermind.pointsource.com';
//window.restPath = '/MMNodeStaging/';
//window.clientBaseURL = 'https://stage.mastermind.pointsource.com/';
//window.fixUrl = true;
//window.useAdoptedServices = true;

//new demo nodejs 
//window.serverLocation = 'https://demo.mastermind.pointsource.com';
//window.restPath = '/MMNodeDemo/';
//window.clientBaseURL = 'https://demo.mastermind.pointsource.com/';
//window.fixUrl = true;
//window.useAdoptedServices = true;

//old stage nodejs 
//window.serverLocation = 'https://dmz.mastermind.pointsource.us';
//window.restPath = '/MMNodeServer/';
//window.clientBaseURL = 'https://mastermind.pointsource.us/nodestage/';
//window.fixUrl = true;
//window.useAdoptedServices = false;

//stage only
//window.restPath = '/MasterMindStaging/rest/';
//window.clientBaseURL = 'https://mastermind.pointsource.us/stage/';
//window.serverLocation = 'https://dmz.mastermind.pointsource.us';
//window.fixUrl = false;
//window.useAdoptedServices = false;

//prod (dmz)
//window.serverLocation = 'https://dmz.mastermind.pointsource.us';
//window.restPath = '/MasterMindServer/rest/';
//window.clientBaseURL = 'https://mastermind.pointsource.us/web/';
//window.fixUrl = false;
//window.useAdoptedServices = false;

//demo
//window.serverLocation = 'https://dmz.mastermind.pointsource.us';
//window.restPath = '/MasterMindDemo/rest/';
//window.clientBaseURL = 'https://mastermind.pointsource.us/demo/';
//window.fixUrl = false;
//window.useAdoptedServices = false;


var helper = (function () {

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
        localStorage["client_id"] = authResult.client_id;
        localStorage["scope"] = authResult.scope;
        localStorage["expires_in"] = authResult.expires_in;
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
    	
    	if (this.authTimer)
	    {
    	    clearTimeout(this.authTimer);

	        this.authTimer = null;
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
    },

    authorize: function (self, Resources)
    {
        self = self || this;

        gapi.auth.authorize({ client_id: localStorage.client_id, immediate: true, scope: localStorage.scope },
            function (authResult)
            {
                if (authResult.access_token) {
                    localStorage.access_token = authResult.access_token;
                    localStorage.expires_in = authResult.expires_in;

                    Resources.updateAuthToken();

                    self.authTimer = setTimeout(function() { self.authorize(self, Resources); }, localStorage.expires_in * 1000);
                }
                else if (authResult.error)
                    console.log("Login error:", authResult.error);
            });
    }
  };
})();
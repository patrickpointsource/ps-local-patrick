//Define the global URLs for this app

// local dev
//window.serverLocation = 'http://mastermind.pointsource.us:8080';
//window.clientBaseURL = 'http://mastermind.pointsource.us:9000/';
window.serverLocation = 'http://localhost:8080';
window.clientBaseURL = 'http://localhost:9000/';
window.restPath = '/MasterMindStaging/rest/';

//stage only
//window.restPath = '/MasterMindStaging/rest/';
//window.clientBaseURL = 'https://mastermind.pointsource.us/stage/';
//window.serverLocation = 'https://dmz.mastermind.pointsource.us';

//prod (dmz)
//window.serverLocation = 'https://dmz.mastermind.pointsource.us';
//window.restPath = '/MasterMindServer/rest/';
//window.clientBaseURL = 'https://mastermind.pointsource.us/web/';

//demo
//window.serverLocation = 'https://dmz.mastermind.pointsource.us';
//window.restPath = '/MasterMindDemo/rest/';
//window.clientBaseURL = 'https://mastermind.pointsource.us/demo/';

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
    

    disconnectUser: function (access_token) {
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

            //remove the token
            delete window.localStorage['access_token'];
            window.location = window.clientBaseURL+"login.html";

            //		    	//Show the home page
            //				$('#welcomeContent').show();
            //				$('#appContent').hide();
          },
          error: function (e) {
            // Handle the error
            console.log(e);
            // You could point users to manually disconnect if unsuccessful
            // https://plus.google.com/apps
            delete window.localStorage['access_token'];
            window.location = window.clientBaseURL+"login.html";
          }
        });
      }else{
      	window.location = window.clientBaseURL+"login.html";
      }
    }
  };
})();
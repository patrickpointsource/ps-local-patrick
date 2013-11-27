var helper = (function() {
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
		onSignInCallback : function(authResult) {
			$('#authResult').html('Auth Result:<br/>');
			for ( var field in authResult) {
				$('#authResult').append(
						' ' + field + ': ' + authResult[field] + '<br/>');
			}
			if (authResult['access_token']) {
				// Save the auth result
				this.authResult = authResult;
				var token = authResult['access_token'];
				var existingToken = localStorage['access_token'];
				//Save the access token
	    	    localStorage["access_token"] = authResult['access_token'];
				
				if(!existingToken){
		    	    //Reload the App
		    	    window.location.reload();
				}
				
				else{
				 	// Update the app to reflect a signed in user
					
					// After we load the Google+ API, render the profile data from
					// Google+.
					gapi.client.load('plus', 'v1', this.renderProfile);
					
					//Show the home page
					$('#welcomeContent').hide();
					$('#appContent').show();
				}
				
			} else if (authResult['error']) {
				// There was an error, which means the user is not signed in.
				// As an example, you can troubleshoot by writing to the
				// console:
				console.log('There was an error: ' + authResult['error']);
				
				//Delete the auth token
				
				$('#authResult').append('Logged out');
				$('#authOps').hide('slow');
				$('#gConnect').show();
			}
			console.log('authResult', authResult);
		},
		/**
		 * Retrieves and renders the authenticated user's Google+ profile.
		 */
		renderProfile : function() {
			var request = gapi.client.plus.people.get({
				'userId' : 'me'
			});
			request.execute(function(profile) {
				$('#profile-photo').empty();
				if (profile.error) {
					$('#profile-photo').append(profile.error);
					return;
				}
				$('#profile-photo').append(
						$('<img src=\"' + profile.image.url + '\">'));
				
				$('#profileWelcomeItem').text('Welcome ' + profile.name.givenName);
			
			});
			$('#authOps').show('slow');
			$('#gConnect').hide();
		},
		
		disconnectUser : function(access_token) {
		  if(access_token){	
			  var revokeUrl = 'https://accounts.google.com/o/oauth2/revoke?token=' +
			      access_token;
	
			  // Perform an asynchronous GET request.
			  $.ajax({
			    type: 'GET',
			    url: revokeUrl,
			    async: false,
			    contentType: "application/json",
			    dataType: 'jsonp',
			    success: function(nullResponse) {
			      // Do something now that user is disconnected
			      // The response is always undefined.
			    	
			    	//remove the token
			    	delete window.localStorage['access_token'];
				    location.reload();
			    	
	//		    	//Show the home page
	//				$('#welcomeContent').show();
	//				$('#appContent').hide();
			    },
			    error: function(e) {
			      // Handle the error
			      console.log(e);
			      // You could point users to manually disconnect if unsuccessful
			      // https://plus.google.com/apps
			      delete window.localStorage['access_token'];
			      location.reload();
			    }
			  });
		  }
		},
		/**
		 * Calls the server endpoint to get the list of people visible to this
		 * app.
		 */
		people : function() {
			$.ajax({
				type : 'GET',
				url : window.location.href + 'people',
				contentType : 'application/octet-stream; charset=utf-8',
				success : function(result) {
					helper.appendCircled(result);
				},
				processData : false
			});
		},
		/**
		 * Displays visible People retrieved from server.
		 * 
		 * @param {Object}
		 *            people A list of Google+ Person resources.
		 */
		appendCircled : function(people) {
			$('#visiblePeople').empty();

			$('#visiblePeople').append(
					'Number of people visible to this app: '
							+ people.totalItems + '<br/>');
			for ( var personIndex in people.items) {
				person = people.items[personIndex];
				$('#visiblePeople').append(
						'<img src="' + person.image.url + '">');
			}
		},
	};
})();
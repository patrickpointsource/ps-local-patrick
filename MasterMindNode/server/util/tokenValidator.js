'use strict';

var googleapis = require( 'googleapis' );
var config = require( '../config/config.js' );

var validateGoogleToken = function( token, done ) {
	googleapis.discover( 'oauth2', 'v1' ).execute( function( err, client ) {
		client.oauth2.tokeninfo( {
			access_token: token
		} ).execute( function( err, result ) {
			if( err ) {
				console.log( 'Error occurred: ', err );
				return done( err, null );
			} else {
				if( result.audience === config.google.clientID && result.user_id ) {
					return done( '', result.user_id );
				} else {
					return done( 'validation failed', null );
				}
			}
		} );
	} );
};

module.exports.validateGoogleToken = validateGoogleToken;

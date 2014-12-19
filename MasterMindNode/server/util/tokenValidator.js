'use strict';

var googleapis = require( 'googleapis' );
var config = require( '../config/config.js' );
var _ = require( 'underscore' );

var validateGoogleToken = function( token, done ) {
	googleapis.discover( 'oauth2', 'v1' ).execute( function( err, client ) {
		client.oauth2.tokeninfo( {
			access_token: token
		} ).execute( function( err, result ) {
			if( err ) {
				console.log( 'Error occurred: ', err );
				return done( err, null );
			} else {
				// compare list of associated client ids with returned
				if( _.contains(config.google.clientIDList, result.audience) && result.user_id ) {
					return done( '', result.user_id );
				} else {
					return done( 'validation failed', null );
				}
			}
		} );
	} );
};

module.exports.validateGoogleToken = validateGoogleToken;

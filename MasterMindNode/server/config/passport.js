'use strict';

var passport = require( 'passport' );
var GoogleStrategy = require( 'passport-google-oauth' ).OAuth2Strategy;
var BearerStrategy = require( 'passport-http-bearer' ).Strategy;
var ensureLoggedIn = require( 'connect-ensure-login' ).ensureLoggedIn;
var googleapis = require( 'googleapis' );

var config = require( './config.js' );
var context = require( '../util/context.js' );

var validateGoogleToken = function( token, done ) {
	// Verify the token we were passed is valid and issued to our app
	//https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=ACCESS_TOKEN
	googleapis.discover( 'oauth2', 'v1' ).execute( function( err, client ) {
		client.oauth2.tokeninfo( {
			access_token: token
		} ).execute( function( err, result ) {
			if( err ) {
				//console.log('Error occurred: ', err);
				return done( err, null );
			} else {
				// Verify this was issued to our app
				// Verify this user exists in our DB
				if( result.audience === config.google.clientID && result.user_id) {
					context.authorization = token;
					return done( '', result.user_id );
				} else {
					return done( 'validation failed', null );
				}
			}
		} );
	} );
};

module.exports = function( passport, params ) {

	passport.serializeUser( function( user, done ) {
		done( null, user );
	} );

	passport.deserializeUser( function( obj, done ) {
		done( null, obj );
	} );

	// Bearer stragety for supporting multiple clients
	// Clients are responsible for getting the token to authenticate with
	passport.use( new BearerStrategy( {
	}, validateGoogleToken ) );

    var callbackUrl  = config.google.callbackHost + config.google.callbackURL;
    
    if (params.appName)
        callbackUrl = 'https://' + params.hostName + ':' + params.httpsPort + config.google.callbackURL;
        
	// Google strategy automatically redirects to collect the token
	passport.use( new GoogleStrategy( {
		clientID: config.google.clientID,
		clientSecret: config.google.clientSecret,
		callbackURL: callbackUrl
	}, function( accessToken, refreshToken, profile, done ) {
		validateGoogleToken( accessToken, done );
	} ) );
};

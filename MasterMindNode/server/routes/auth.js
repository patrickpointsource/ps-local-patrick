'use strict';

var config = require( '../config/config.js' );
var hoursByPerson = require( '../controllers/hoursByPerson' );
var hoursByPersonDate = require( '../controllers/hoursByPersonDate' );

var util = require( '../util/auth' ).isAuthenticated;

module.exports = function( app, passport ) {
	// Oauth authentication routes
	// Redirect the user to Google for authentication.  When complete, Google
	// will redirect the user back to the application at /auth/google/return
	app.get( '/auth/google', passport.authenticate( 'google', {
		scope: config.google.scope
	} ) );

	// Google will redirect the user to this URL after authentication.  Finish
	// the process by verifying the assertion.  If valid, the user will be
	// logged in.  Otherwise, authentication has failed.
	app.get( '/oauth2callback', passport.authenticate( 'google', {
		successReturnToOrRedirect: '/',
		failureRedirect: '/login'
	} ) );

	app.get( '/login/google',
	// Authenticate using HTTP Bearer credentials.  This is intended to be called to
	// login and begin a session
	passport.authenticate( 'bearer' ), function( req, res ) {
		res.render( 'index' );
	} );

	app.get( '/login', function( req, res ) {
		res.render( 'login' );
	} );

	app.get( '/logout', function( req, res ) {
		req.logout( );
		res.redirect( '/' );
	} );
}; 
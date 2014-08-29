'use strict';

var userRoles = require( '../controllers/userRoles' );
var express = require( 'express' );
var util = require( '../util/auth' );

var router = express.Router( );

router.get( '/', util.isAuthenticated, function( req, res ) {
	var query = req.query[ "query" ] ? JSON.parse( req.query[ "query" ] ) : {};
	userRoles.listUserRoles( query, function( err, result ) {
		if( err ) {
			res.json( 500, err );
		} else {
			res.json( result );
		}
	} );
} );

router.post( '/', util.isAuthenticated, function( req, res ) {
	userRoles.insertUserRoles( req.body, function( err, result ) {
		if( err ) {
			res.json( 500, err );
		} else {
			res.json( result );
		}
	} );
} );

router.delete( '/', util.isAuthenticated, function( req, res ) {
	userRoles.deleteUserRoles( req.body, function( err, result ) {
		if( err ) {
			res.json( 500, err );
		} else {
			res.json( result );
		}
	} );
} );

module.exports = router;

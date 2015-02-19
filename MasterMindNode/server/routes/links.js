'use strict';

var links = require( '../controllers/links' );
var express = require( 'express' );
var util = require( '../util/auth' );

var router = express.Router( );

router.get( '/', util.isAuthenticated, function( req, res ) {
	// Call to projects service
	links.listLinks(function( err, result ) {
		if( err ) {
			res.json( 500, err );
		} else {
			res.json( result );
		}
	} );
} );

router.post( '/', util.isAuthenticated, function( req, res ) {
	links.insertLink( req.body, function( err, result ) {
		if( err ) {
			res.json( 500, err );
		} else {
			res.json( result );
		}
	} );
} );

router.
delete ( '/', util.isAuthenticated,
function( req, res ) {
	links.deleteLink( req.body, function( err, result ) {
		if( err ) {
			res.json( 500, err );
		} else {
			res.json( result );
		}
	} );
} );

router.get( '/:id', util.isAuthenticated, function( req, res ) {
	var id = req.params.id;
	links.getLink( id, function( err, result ) {
		if( err ) {
			res.json( 500, err );
		} else {
			res.json( result );
		}
	} );
} );

module.exports = router;

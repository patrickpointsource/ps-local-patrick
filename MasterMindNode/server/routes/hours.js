'use strict';

var hours = require( '../controllers/hours' );
var express = require( 'express' );
var util = require( '../util/auth' );

var security = require( '../util/security' );
var securityResources = require( '../util/securityResources' );

var router = express.Router( );

router.get( '/', util.isAuthenticated, function( req, res ) {

	security.isAllowed( req.user, res, securityResources.hours.resourceName, securityResources.hours.permissions.viewHours, function( allowed ) {
		if( allowed ) {

			var query = req.query[ "query" ] ? JSON.parse( req.query[ "query" ] ) : {};

			console.log( '\r\nget:hours:query:' + JSON.stringify( query ) + '\r\n' );

			hours.listHours( query, function( err, result ) {
				if( err ) {
					res.json( 500, err );
				} else {
					res.json( result );
				}
			} );
		}
	} );

} );

router.post( '/', util.isAuthenticated, function( req, res ) {

	security.isAllowed( req.user, res, securityResources.hours.resourceName, securityResources.hours.permissions.editMyHours, function( allowed ) {
		console.log( '\r\npost:hours:\r\n' );

		if( allowed ) {

			hours.insertHours( req.body, function( err, result ) {
				if( err ) {
					res.json( 500, err );
				} else {
					res.json( result );
				}
			} );
		}
	} );

} );

router.put( '/:id', util.isAuthenticated, function( req, res ) {

	security.isAllowed( req.user, res, securityResources.hours.resourceName, securityResources.hours.permissions.editMyHours, function( allowed ) {
		console.log( '\r\nput:hours:\r\n' );

		if( allowed ) {
			var id = req.params.id;

			hours.updateHours( id, req.body, function( err, result ) {
				if( err ) {
					res.json( 500, err );
				} else {
					res.json( result );
				}
			} );
		}
	} );

} );

router.delete( '/:id', util.isAuthenticated, function( req, res ) {

	security.isAllowed( req.user, res, securityResources.hours.resourceName, securityResources.hours.permissions.deleteMyHours, function( allowed ) {
		console.log( '\r\ndelete:hours:\r\n' );

		if( allowed ) {
			var id = req.params.id;

			hours.deleteHours( id, req.query, function( err, result ) {
				if( err ) {
					res.json( 500, err );
				} else {
					res.json( result );
				}
			} );
		}
	} );

} );

module.exports = router;

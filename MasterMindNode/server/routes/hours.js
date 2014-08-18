'use strict';

var projects = require( '../controllers/roles' );
var express = require( 'express' );
var util = require( '../util/auth' );

var security = require( '../util/security' );
var securityResources = require( '../util/securityResources' );

var router = express.Router( );

router.get( '/', util.isAuthenticated, function( req, res ) {

	security.isAllowed( req.user, res, securityResources.hours.resourceName, securityResources.hours.permissions.viewHours, function( allowed ) {
		if( allowed ) {
			
			var query = req.query[ "query" ] ? JSON.parse( req.query[ "query" ] ) : {};

			console.log( '\r\nget:hours:query:' + JSON.stringify( query ) + '\r\n'); 

			
			res.json( {
				count: 0,
				about: "hours",
				members: [ ]
			} );
		}
	} );

} );

router.post( '/', function( req, res ) {

	security.isAllowed( req.user, res, securityResources.hours.resourceName, securityResources.hours.permissions.editMyHours, function( allowed ) {
		console.log('\r\npost:hours:\r\n');
		
		if( allowed ) {
		      
		      
			tasks.insertTask( req.body, function( err, result ) {
				if( err ) {
					res.json( 500, err );
				} else {
					res.json( result );
				}
			} );
		}
	} );

} );

router.delete( '/', function( req, res ) {

    security.isAllowed( req.user, res, securityResources.hours.resourceName, securityResources.hours.permissions.deleteMyHours, function( allowed ) {
        console.log('\r\ndelete:hours:\r\n');
        
        if( allowed ) {
              
              
            tasks.insertTask( req.body, function( err, result ) {
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

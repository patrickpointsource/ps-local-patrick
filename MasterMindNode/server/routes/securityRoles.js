'use strict';

var securityRoles = require( '../controllers/securityRoles' );
var express = require( 'express' );
var util = require( '../util/auth' );

var router = express.Router( );

var security = require( '../util/security' );
var securityResources = require( '../util/securityResources' );

router.get( '/', util.isAuthenticated, function( req, res ) {
	security.isAllowed( req.user, res, securityResources.securityRoles.resourceName, securityResources.securityRoles.permissions.viewSecurityRoles, function( allowed ) {
		if( allowed ) {
			securityRoles.listSecurityRoles( function( err, result ) {
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
	security.isAllowed( req.user, res, securityResources.securityRoles.resourceName, securityResources.securityRoles.permissions.editSecurityRoles, function( allowed ) {
		if( allowed ) {
			securityRoles.insertSecurityRole( req.body, function( err, result ) {
				if( err ) {
					res.json( 500, err );
				} else {
				  security.initialize( true );
				  res.json( result );
				}
			} );
		}
	} );
} );

router.put( '/:id', util.isAuthenticated, function( req, res ) {
	security.isAllowed( req.user, res, securityResources.securityRoles.resourceName, securityResources.securityRoles.permissions.editSecurityRoles, function( allowed ) {
		if( allowed ) {
			var id = req.params.id;
			if( id ) {
				req.body._id = id;
			}

			securityRoles.insertSecurityRole( req.body, function( err, result ) {
				if( err ) {
					res.json( 500, err );
				} else {
				  security.initialize( true );
			      res.json( result );
				}
			} );
		}
	} );
} );

router.delete( '/:id', util.isAuthenticated, function( req, res ) {
	security.isAllowed( req.user, res, securityResources.securityRoles.resourceName, securityResources.securityRoles.permissions.editSecurityRoles, function( allowed ) {
		if( allowed ) {
		    var id = req.params.id;
            if( id ) {
                req.body._id = id;
            }
			securityRoles.deleteSecurityRole( req.body, function( err, result ) {
				if( err ) {
					res.json( 500, err );
				} else {
				  security.initialize( true );
				  res.json( result );
				}
			} );
		}
	} );
} );

module.exports = router;

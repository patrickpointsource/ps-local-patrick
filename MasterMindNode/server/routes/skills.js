'use strict';

var skills = require( '../controllers/skills' );
var express = require( 'express' );
var util = require( '../util/auth' );

var security = require( '../util/security' );
var securityResources = require( '../util/securityResources' );

var router = express.Router( );

router.get( '/', util.isAuthenticated, function( req, res ) {

	security.isAllowed( req.user, res, securityResources.skills.resourceName, securityResources.skills.permissions.viewSkills, function( allowed ) {
		if( allowed ) {
			var query = req.query[ "query" ] ? JSON.parse( req.query[ "query" ] ) : {};

			// Call to skills service
			skills.listSkills( query, function( err, result ) {
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

	security.isAllowed( req.user, res, securityResources.skills.resourceName, securityResources.skills.permissions.editSkills, function( allowed ) {
		if( allowed ) {
			skills.insertSkill( req.body, function( err, result ) {
				if( err ) {
					res.json( 500, err );
				} else {
					res.json( result );
				}
			} );
		}
	} );

} );

router.delete ( '/:id', util.isAuthenticated, function( req, res ) {

	security.isAllowed( req.user, res, securityResources.skills.resourceName, securityResources.skills.permissions.editSkills, function( allowed ) {
		if( allowed ) {
			var id = req.params.id;
			skills.deleteSkill( id, function( err, result ) {
				if( err ) {
					res.json( 500, err );
				} else {
					res.json( result );
				}
			} );
		}
	} );

} );

router.get( '/:id', util.isAuthenticated, function( req, res ) {

	security.isAllowed( req.user, res, securityResources.skills.resourceName, securityResources.skills.permissions.viewSkills, function( allowed ) {
		if( allowed ) {
			var id = req.params.id;
			skills.getSkill( id, function( err, result ) {
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

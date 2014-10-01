'use strict';

var assignments = require( '../controllers/assignments' );

var express = require( 'express' );
var auth = require( '../util/auth' );
var security = require( '../util/security' );
var securityResources = require( '../util/securityResources' );

var router = express.Router( );

router.get( '/', auth.isAuthenticated, function( req, res ) {

	security.isAllowed( req.user, res, securityResources.assignments.resourceName, securityResources.assignments.permissions.viewAssignments, function( allowed ) {
		if( allowed ) {
			var query = req.query[ "query" ] ? JSON.parse( req.query[ "query" ] ) : {};
			// Call to assignments service
			assignments.listAssignments( query, function( err, result ) {
				if( err ) {
					res.json( 500, err );
				} else {
					res.json( result );
				}
			} );
		}
	} );

} );

router.get( '/:id', auth.isAuthenticated, function( req, res ) {
	security.isAllowed( req.user, res, securityResources.assignments.resourceName, securityResources.assignments.permissions.viewAssignments, function( allowed ) {
		if( allowed ) {
			var id = req.params.id;
			assignments.getAssignment( id, function( err, result ) {
				if( err ) {
					res.json( 500, err );
				} else {
					res.json( result );
				}
			} );
		}
	} );

} );

router.get( '/bytypes/:type', auth.isAuthenticated, function( req, res ) {

	security.isAllowed( req.user, res, securityResources.assignments.resourceName, securityResources.assignments.permissions.viewAssignments, function( allowed ) {
		if( allowed ) {
			var type = req.params.type;
			if ( type && type == "currentAssignments" ) {
				assignments.listCurrentAssigmentsByPeople( function( err, assignments ) {
					if( err ) {
						res.json( 500, err );
					} else {
						res.json( assignments );
					}
				} );

			}
			else if ( type && type == "assignmentsByProject" ) {
				var projectResource = req.query.projectResource;
				assignments.listAssignmentsByProjectResourcesAndTimePeriod( projectResource, "all", function( err, assignments ) {
					if( err ) {
						res.json( 500, err );
					} else {
						res.json( assignments );
					}
				} );

			}
			else if ( type && type == "assignmentsByProjectsAndTimePeriod" ) {
				var projectResources = req.query.projectResource;
				var timePeriod = req.query.timePeriod;
				assignments.listAssignmentsByProjectResourcesAndTimePeriod( projectResources, timePeriod, function( err, assignments ) {
					if( err ) {
						res.json( 500, err );
					} else {
						res.json( assignments );
					}
				} );

			}
			else if ( type && type == "assignmentsByPerson" ) {
				var personResource = req.query.personResource;
				var startDate = req.query.startDate;
				var endDate = req.query.endDate;
				assignments.listAssignmentsByPersonResource( personResource, startDate, endDate, function( err, assignments ) {
					if( err ) {
						res.json( 500, err );
					} else {
						res.json( assignments );
					}
				} );

			}
			else {
				res.json( 500, 'No required type' );
			}
		}
	} );

} );

module.exports = router;

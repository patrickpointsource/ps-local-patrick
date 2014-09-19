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

router.get( '/persondates', util.isAuthenticated, function( req, res ) {

    security.isAllowed( req.user, res, securityResources.hours.resourceName, securityResources.hours.permissions.viewHours, function( allowed ) {
        if( allowed ) {
            var person = req.query[ "person" ] ? req.query[ "person" ] : "";
            var startDate = req.query[ "startDate" ] ? req.query[ "startDate" ] : "";
            var endDate = req.query[ "endDate" ] ? req.query[ "endDate" ] : "";
             
            console.log( '\r\nget:persondates:\r\n' );

            if (person && startDate && endDate)
                hours.listHoursByPersonAndDates( person, startDate, endDate, function( err, result ) {
                    if( err ) {
                        res.json( 500, err );
                    } else {
                        res.json( result );
                    }
                } );
            else 
                 res.json( 500, "missed params" );
        }
    } );

} );

router.get( '/projectdates', util.isAuthenticated, function( req, res ) {

    security.isAllowed( req.user, res, securityResources.hours.resourceName, securityResources.hours.permissions.viewHours, function( allowed ) {
        if( allowed ) {
            var project = req.query[ "project" ] ? req.query[ "project" ] : "";
            var startDate = req.query[ "startDate" ] ? req.query[ "startDate" ] : "";
            var endDate = req.query[ "endDate" ] ? req.query[ "endDate" ] : "";
             
            console.log( '\r\nget:projectdates:\r\n' );

            if (project && startDate && endDate)
                hours.listHoursByProjectAndDates( project, startDate, endDate, function( err, result ) {
                    if( err ) {
                        res.json( 500, err );
                    } else {
                        res.json( result );
                    }
                } );
            else 
                 res.json( 500, "missed params" );
        }
    } );

} );

router.get( '/person', util.isAuthenticated, function( req, res ) {

    security.isAllowed( req.user, res, securityResources.hours.resourceName, securityResources.hours.permissions.viewHours, function( allowed ) {
        if( allowed ) {
            var person = req.query[ "person" ] ? req.query[ "person" ] : "";
            
             
            console.log( '\r\nget:person:\r\n' );

            if (person)
                hours.listHoursByPerson( person, function( err, result ) {
                    if( err ) {
                        res.json( 500, err );
                    } else {
                        res.json( result );
                    }
                } );
            else 
                 res.json( 500, "missed params" );
        }
    } );

} );

router.get( '/projects', util.isAuthenticated, function( req, res ) {

    security.isAllowed( req.user, res, securityResources.hours.resourceName, securityResources.hours.permissions.viewHours, function( allowed ) {
        if( allowed ) {
            var projects = req.query[ "projects" ] ? req.query[ "projects" ] : "";

            console.log( '\r\nget:projects:\r\n' );

            if (projects)
                hours.listHoursByProjects( projects, function( err, result ) {
                    if( err ) {
                        res.json( 500, err );
                    } else {
                        res.json( result );
                    }
                } );
            else 
                 res.json( 500, "missed params" );
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

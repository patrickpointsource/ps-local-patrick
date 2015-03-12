'use strict';

var jobTitlesCtrl = require( '../controllers/jobTitles' );
var express = require( 'express' );
var util = require( '../util/auth' );

var security = require( '../util/security' );
var securityResources = require( '../util/securityResources' );

var router = express.Router( );

router.get( '/', util.isAuthenticated, function( req, res ) {
	security.isAllowed( req.user, res, securityResources.hours.resourceName, securityResources.hours.permissions.viewHours, function( allowed ) {
		if( allowed ) {
            jobTitlesCtrl.listJobTitles( function( err, result ) {
				if( err ) {
					res.json( 500, err );
				} else {
					res.json( result );
				}
			} );
		}
	});
} );

router.post( '/', util.isAuthenticated, function( req, res ) {
	security.isAllowed( req.user, res, securityResources.hours.resourceName, securityResources.hours.permissions.viewHours, function( allowed ) {
		if( allowed ) {
            jobTitlesCtrl.insertJobTitle( req.body, function( err, result ) {
				if( err ) {
					res.json( 500, err );
				} else {
					res.json( result );
				}
			} );
		}
	});
} );

router.put( '/:id', util.isAuthenticated, function( req, res ) {
	security.isAllowed( req.user, res, securityResources.hours.resourceName, securityResources.hours.permissions.viewHours, function( allowed ) {
		if( allowed ) {
			var id = req.params.id;
            jobTitlesCtrl.udpateJobTitle(id, req.body, function( err, result ) {
				if( err ) {
					res.json( 500, err );
				} else {
					res.json( result );
				}
			} );
		}
	});
} );

router.delete ( '/:id', util.isAuthenticated, function( req, res ) {
	security.isAllowed( req.user, res, securityResources.hours.resourceName, securityResources.hours.permissions.viewHours, function( allowed ) {
		if( allowed ) {
			var id = req.params.id;
            jobTitlesCtrl.deleteJobTitle(id, req.body, function( err, result ) {
				if( err ) {
					res.json( 500, err );
				} else {
					res.json( result );
				}
			} );
		}
	});
} );

router.get( '/:id', util.isAuthenticated, function( req, res ) {
	security.isAllowed( req.user, res, securityResources.hours.resourceName, securityResources.hours.permissions.viewHours, function( allowed ) {
		if( allowed ) {
			var id = req.params.id;
            jobTitlesCtrl.getJobTitle( id, function( err, result ) {
				if( err ) {
					res.json( 500, err );
				} else {
					res.json( result );
				}
			} );
		}
	});
} );

module.exports = router;

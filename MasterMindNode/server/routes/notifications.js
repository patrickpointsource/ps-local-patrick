'use strict';

var notifications = require( '../controllers/notifications' );
var express = require( 'express' );
var util = require( '../util/auth' );

var router = express.Router( );

var security = require( '../util/security' );
var securityResources = require( '../util/securityResources' );

router.get( '/', util.isAuthenticated, function( req, res ) {
	security.isAllowed( req.user, res, securityResources.notifications.resourceName, securityResources.notifications.permissions.viewNotifications, function( allowed ) {
		if( allowed ) {
			// Call to notifications service
			notifications.listNotifications( function( err, result ) {
				if( err ) {
					res.json( 500, err );
				} else {
					res.json( result );
				}
			} );
		}
	} );
} );

router.get('/bytypes/:type', util.isAuthenticated, function(req, res){
	security.isAllowed(req.user, res, securityResources.notifications.resourceName, securityResources.notifications.permissions.viewNotifications, function(allowed){
		if (allowed) 
		{
			var type = req.params.type;
        	var fields = req.query.fields;
			if (type && type == "byPerson") {
				var person = req.query.person;
			    notifications.listNotificationsByPerson(person, fields, function(err, result){
			        if(err){
			            res.json(500, err);
			        } else {
			            res.json(result);
			        }            
			    });
			}
			else {
	            res.json(500, 'No required type attribute');
			}
		}
	});
}); 


router.post( '/', util.isAuthenticated, function( req, res ) {
	security.isAllowed( req.user, res, securityResources.notifications.resourceName, securityResources.notifications.permissions.editNotifications, function( allowed ) {
		if( allowed ) {
			notifications.insertNotification( req.body, function( err, result ) {
				if( err ) {
					res.json( 500, err );
				} else {
					res.json( result );
				}
			} );
		}
	} );
} );

router.
delete ( '/:id', util.isAuthenticated,
function( req, res ) {
	security.isAllowed( req.user, res, securityResources.notifications.resourceName, securityResources.notifications.permissions.editNotifications, function( allowed ) {
		if( allowed ) {
			req.body._id = req.params.id;
			notifications.deleteNotification( req.body, function( err, result ) {
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
	security.isAllowed( req.user, res, securityResources.notifications.resourceName, securityResources.notifications.permissions.viewNotifications, function( allowed ) {
		if( allowed ) {
			var id = req.params.id;
			notifications.getNotification( id, function( err, result ) {
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
	security.isAllowed( req.user, res, securityResources.notifications.resourceName, securityResources.notifications.permissions.editNotifications, function( allowed ) {
		if( allowed ) {
			var id = req.params.id;
			req.body._id = id;
			notifications.insertNotification( req.body, function( err, result ) {
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

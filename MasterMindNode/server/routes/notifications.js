'use strict';

//var notifications = require('../controllers/notifications');
var express = require( 'express' );
var util = require( '../util/auth' );

var router = express.Router( );

router.get( '/', util.isAuthenticated, function( req, res ) {
	var query = req.query[ "query" ] ? JSON.parse( req.query[ "query" ] ) : {};
	/*
	 // Call to notifications service
	 notifications.listNotifications(query, function(err, result){
	 if(err){
	 res.json(500, err);
	 } else {
	 res.json(result);
	 }
	 });
	 */
	res.json( 501, {
		msg: "Notifications not implemented yet"
	} );
} );

module.exports = router;

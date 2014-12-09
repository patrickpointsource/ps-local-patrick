'use strict';

var userRoles = require( '../controllers/userRoles' );
var express = require( 'express' );
var util = require( '../util/auth' );

var security = require( '../util/security' );
var securityResources = require( '../util/securityResources' );

var router = express.Router( );

router.get( '/', util.isAuthenticated, function( req, res ) {
  security.isAllowed( req.user, res, securityResources.securityRoles.resourceName, securityResources.securityRoles.permissions.viewSecurityRoles, function( allowed ) {
    if( allowed ) {
	  var query = req.query[ "query" ] ? JSON.parse( req.query[ "query" ] ) : {};
	  var fields = req.query.fields;
	  userRoles.listUserRoles( query, fields, function( err, result ) {
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
	  userRoles.insertUserRoles( req.body, function( err, result ) {
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
      userRoles.insertUserRoles( req.body, function( err, result ) {
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

router.delete( '/', util.isAuthenticated, function( req, res ) {
  security.isAllowed( req.user, res, securityResources.securityRoles.resourceName, securityResources.securityRoles.permissions.editSecurityRoles, function( allowed ) {
    if( allowed ) {
	  userRoles.deleteUserRoles( req.body, function( err, result ) {
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

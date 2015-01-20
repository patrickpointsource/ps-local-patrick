'use strict';

var reports = require( '../controllers/reports' );
var people = require( '../controllers/people' );
var express = require( 'express' );
var util = require( '../util/auth' );

var security = require( '../util/security' );
var securityResources = require( '../util/securityResources' );

var router = express.Router( );

router.get( '/:type/status', util.isAuthenticated, function( req, res ) {
	security.isAllowed( req.user, res, securityResources.reports.resourceName, securityResources.reports.permissions.viewReports, function( allowed ) {
		if( allowed ) {
			people.getPersonByGoogleId(req.user, function(err, person){
				  if(err){
			        res.json(500, err);
			      } else {
			    	  var type = req.params.type;
			    	  var status = reports.getStatus(person._id, type);
			    	  res.json( status );
			      }
			});
		}
	});	
} );

router.get( '/:type/generate', util.isAuthenticated, function( req, res ) {
	security.isAllowed( req.user, res, securityResources.reports.resourceName, securityResources.reports.permissions.viewReports, function( allowed ) {
		if( allowed ) {
			  people.getPersonByGoogleId(req.user, function(err, person){
				    if(err){
				      res.json(500, err);
				    } else {        
				      var type = req.params.type;
				      var queryParams = req.query;
				      // Call to reports service
				      reports.generateReport(person, type, queryParams, req.session, function(err, result) {
				        if(err) {
				          res.json( 500, err );
				        } else {
				          res.json( result );
				        }
				      });
				    }
				  });
		}
	});
} );

router.get( '/:type/cancel', util.isAuthenticated, function( req, res ) {
	security.isAllowed( req.user, res, securityResources.reports.resourceName, securityResources.reports.permissions.viewReports, function( allowed ) {
		if( allowed ) {
			people.getPersonByGoogleId(req.user, function(err, person){
			      if(err){
			        res.json(500, err);
			      } else {
			    	  var type = req.params.type;
			    	  var result = reports.cancelReport(person._id, type);
			    	  res.json( result );
			      }
			    });
		}
	});
	
} );

router.get( '/:type/get', util.isAuthenticated, function( req, res ) {
	security.isAllowed( req.user, res, securityResources.reports.resourceName, securityResources.reports.permissions.viewReports, function( allowed ) {
		if( allowed ) {
			people.getPersonByGoogleId(req.user, function(err, person){
			    if(err){
			      res.json(500, err);
			    } else {
			      var type = req.params.type;
				  reports.getReport(person._id, type, function(err, result) {
			        if(err) {
			          res.json( 500, err );
			        } else {
			          res.json( { data: result } );
			        }
			      });
			    }
			  });
		}
	});
} );
	

router.get( '/favorites', util.isAuthenticated, function( req, res ) {
	security.isAllowed( req.user, res, securityResources.reports.resourceName, securityResources.reports.permissions.viewReports, function( allowed ) {
		if( allowed ) {
			reports.listFavorites( function( err, result ) {
				if( err ) {
					res.json( 500, err );
				} else {
					res.json( result );
				}
			} );
		}
	});
} );

router.get( '/favorites/byPerson/:googleId', util.isAuthenticated, function( req, res ) {
    security.isAllowed( req.user, res, securityResources.reports.resourceName, securityResources.reports.permissions.viewReports, function( allowed ) {
        if( allowed ) {
            people.getPersonByGoogleId(req.params.googleId, function(err, person){
                if(err){
                  res.json(500, err);
                } else {
                  reports.listFavoritesByPerson( person, function( err, result ) {
                    if( err ) {
                      res.json( 500, err );
                    } else {
                      res.json( result );
                    }
                  } );
                }
              });
        }
    });
} );

router.get( '/favorites/:id', util.isAuthenticated, function( req, res ) {
	security.isAllowed( req.user, res, securityResources.reports.resourceName, securityResources.reports.permissions.viewReports, function( allowed ) {
		if( allowed ) {
			var id = req.params.id;
			reports.getFavorite( id, function( err, result ) {
				if( err ) {
					res.json( 500, err );
				} else {
					res.json( result );
				}
			} );
		}
	});
} );

router.post( '/favorites', util.isAuthenticated, function( req, res ) {
	security.isAllowed( req.user, res, securityResources.reports.resourceName, securityResources.reports.permissions.viewReports, function( allowed ) {
		if( allowed ) {
			var favorite = req.body;
			favorite.form = 'ReportFavorites';
			reports.insertFavorite( favorite, function( err, result ) {
				if( err ) {
					res.json( 500, err );
				} else {
					res.json( result );
				}
			} );
		}
	});
} );

router.put( '/favorites/:id', util.isAuthenticated, function( req, res ) {
	security.isAllowed( req.user, res, securityResources.reports.resourceName, securityResources.reports.permissions.viewReports, function( allowed ) {
		if( allowed ) {
			var id = req.params.id;
			reports.updateFavorite(id, req.body, function( err, result ) {
				if( err ) {
					res.json( 500, err );
				} else {
					res.json( result );
				}
			} );
		}
	});
} );

router.delete ( '/favorites/:id', util.isAuthenticated, function( req, res ) {
	security.isAllowed( req.user, res, securityResources.reports.resourceName, securityResources.reports.permissions.viewReports, function( allowed ) {
		if( allowed ) {
			var id = req.params.id;
			roles.deleteFavorite(id, req.body, function( err, result ) {
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

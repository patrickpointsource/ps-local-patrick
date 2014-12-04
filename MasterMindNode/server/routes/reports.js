'use strict';

var reports = require( '../controllers/reports' );
var people = require( '../controllers/people' );
var express = require( 'express' );
var util = require( '../util/auth' );

var security = require( '../util/security' );
var securityResources = require( '../util/securityResources' );

var router = express.Router( );

router.get( '/status', util.isAuthenticated, function( req, res ) {
	/*security.isAllowed( req.user, res, securityResources.reports.resourceName, securityResources.reports.permissions.viewReports, function( allowed ) {
		if( allowed ) {
			people.getPersonByGoogleId(req.user, function(err, person){
		        if(err){
		            res.json(500, err);
		        } else {        
					var type = req.params.type;
					// Call to reports service
					reports.getStatusByPersonIdAndType( person._id, type, function( err, result ) {
						if( err ) {
							res.json( 500, err );
						} else {
							res.json( result );
						}
					} );
		        }
			});
		}
	});*/
	
	security.isAllowed( req.user, res, securityResources.reports.resourceName, securityResources.reports.permissions.viewReports, function( allowed ) {
		if( allowed ) {
			people.getPersonByGoogleId(req.user, function(err, person){
				  if(err){
			        res.json(500, err);
			      } else {
			        var status = reports.getStatus(person._id);
			        res.json( status );
			      }
			});
		}
	});	
} );

router.get( '/:type/generate', util.isAuthenticated, function( req, res ) {
	/*security.isAllowed( req.user, res, securityResources.reports.resourceName, securityResources.reports.permissions.viewReports, function( allowed ) {
		if( allowed ) {
				
			people.getPersonByGoogleId(req.user, function(err, person){
		        if(err){
		           res.json(500, err);
		        } else {        
					var type = req.params.type;
					var queryParams = req.query;
					// Call to reports service
					reports.generateReportByPersonIdAndType( person._id, type, queryParams, function( err, result ) {
						if( err ) {
							res.json( 500, err );
						} else {
							res.json( result );
						}
					} );
			    }
			});
			
		}
	});*/
	
	security.isAllowed( req.user, res, securityResources.reports.resourceName, securityResources.reports.permissions.viewReports, function( allowed ) {
		if( allowed ) {
			  people.getPersonByGoogleId(req.user, function(err, person){
				    if(err){
				      res.json(500, err);
				    } else {        
				      var type = req.params.type;
				      var queryParams = req.query;
				      // Call to reports service
				      reports.generateReport(person._id, type, queryParams, req.session, function(err, result) {
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

router.get( '/cancel', util.isAuthenticated, function( req, res ) {
	/*security.isAllowed( req.user, res, securityResources.reports.resourceName, securityResources.reports.permissions.viewReports, function( allowed ) {
		if( allowed ) {
					
			people.getPersonByGoogleId(req.user, function(err, person){
		        if(err){
		        	res.json(500, err);
			    } else {        
					var type = req.params.type;
					// Call to reports service
					reports.cancelReportByPersonIdAndType( person._id, type, function( err, result ) {
						if( err ) {
							res.json( 500, err );
						} else {
							res.json( result );
						}
					} );
			    }
			});
			
		}
	});*/
	security.isAllowed( req.user, res, securityResources.reports.resourceName, securityResources.reports.permissions.viewReports, function( allowed ) {
		if( allowed ) {
			people.getPersonByGoogleId(req.user, function(err, person){
			      if(err){
			        res.json(500, err);
			      } else {
			        var result = reports.cancelReport(person._id);
			        res.json( result );
			      }
			    });
		}
	});
	
} );

router.get( '/get', util.isAuthenticated, function( req, res ) {
	/*security.isAllowed( req.user, res, securityResources.reports.resourceName, securityResources.reports.permissions.viewReports, function( allowed ) {
		if( allowed ) {
					
			people.getPersonByGoogleId(req.user, function(err, person){
		        if(err){
		           res.json(500, err);
		        } else {        
					var type = req.params.type;
					// Call to reports service
					reports.getReportByPersonIdAndType( person._id, type, function( err, result ) {
						if( err ) {
							res.json( 500, err );
						} else {
							res.json( result );
						}
					} );
			    }
			});
		}
	});*/
	security.isAllowed( req.user, res, securityResources.reports.resourceName, securityResources.reports.permissions.viewReports, function( allowed ) {
		if( allowed ) {
			people.getPersonByGoogleId(req.user, function(err, person){
			    if(err){
			      res.json(500, err);
			    } else {
			      var type = req.params.type;
				  reports.getReport(person._id, function(err, result) {
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
	
module.exports = router;

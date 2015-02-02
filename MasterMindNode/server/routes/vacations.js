'use strict';

var vacations = require( '../controllers/vacations' );
var express = require( 'express' );
var util = require( '../util/util' );
var auth = require( '../util/auth' );
var people = require('../controllers/people');

var router = express.Router( );

var security = require( '../util/security' );
var securityResources = require( '../util/securityResources' );

router.get( '/', auth.isAuthenticated, function( req, res ) {
	security.isAllowed( req.user, res, securityResources.vacations.resourceName, securityResources.vacations.permissions.viewMyVacations, function( allowed ) {
		if( allowed ) {
			// Call to vacations service
			vacations.listVacations( function( err, result ) {
				if( err ) {
					res.json( 500, err );
				} else {
					res.json( result );
				}
			} );
		}
	} );
} );

router.get( '/byperson/:person', auth.isAuthenticated, function( req, res ) {
  var person = req.params.person;
  if (person) {
	var personResource = util.getFullID(person, "people");	
	people.getPersonByResource(personResource, function(err, person) {
	  if(!err) {
		if(person.googleId == req.user) {
		  security.isAllowed( req.user, res, securityResources.vacations.resourceName, securityResources.vacations.permissions.viewMyVacations, function( allowed ) {
            if( allowed ) {
              getPersonsVacations(req, res, personResource);
            }
          });
		} else {
		  security.isAllowed( req.user, res, securityResources.vacations.resourceName, securityResources.vacations.permissions.viewVacations, function( allowed ) {
            if( allowed ) {
              getPersonsVacations(req, res, personResource);
            }
          });
		}
	  } else {
		var errMsg = "Can't get person from vacation entry.";
        console.log(errMsg);
        res.json( 500, errMsg );
	  }	
	});
  } else {
    var errMsg = "Missing person id attribute.";
    console.log(errMsg);
    res.json( 500, errMsg );
  }
} );

var getPersonsVacations = function(req, res, personResource) {
    vacations.listVacationsByPerson( personResource, function( err, result ) {
      if( err ) {
        res.json( 500, err );
      } else {
        res.json( result );
      }
    } );
};

router.get('/bytypes/:type', auth.isAuthenticated, function(req, res){
	security.isAllowed(req.user, res, securityResources.vacations.resourceName, securityResources.vacations.permissions.viewVacations, function(allowed){
		if (allowed) 
		{
			var type = req.params.type;
			if (type && type == "getRequests") {
				
				var manager = req.query.manager;
				var statuses = req.query.status;
				var startDate = req.query.startDate;
				var endDate = req.query.endDate;
				
			    vacations.listRequests(manager, statuses, startDate, endDate, function(err, result){
			        if(err){
			            res.json(500, err);
			        } else {
			            res.json(result);
			        }            
			    });
			    
			} else if (type && type == "byPeriod") {
				
				var people = req.query.person;
				var startDate = req.query.startDate;
				var endDate = req.query.endDate;
				
			    vacations.listVacationsByPeriod(people, startDate, endDate, function(err, result){
			        if(err){
			            res.json(500, err);
			        } else {
			            res.json(result);
			        }            
			    });
			    
			}
			else {
	            res.json(500, "No required type attribute");
			}
		}
	});
}); 


router.post( '/', auth.isAuthenticated, function( req, res ) {
    var personResource = req.body.person ? req.body.person.resource : undefined;
    people.getPersonByResource(personResource, function(err, person) {
      if(!err) {
        if(person.googleId == req.user) {
          security.isAllowed( req.user, res, securityResources.vacations.resourceName, securityResources.vacations.permissions.editMyVacations, function( allowed ) {
            if( allowed ) {
              addVacation(req, res);
            }
          } );
        } else {
          security.isAllowed( req.user, res, securityResources.vacations.resourceName, securityResources.vacations.permissions.editVacations, function( allowed ) {
            if( allowed ) {
              addVacation(req, res);
            }
          } );
        }
      } else {
        var errMsg = "Can't get person from vacation entry.";
        console.log(errMsg);
        res.json( 500, errMsg );
      }
    });
} );

var addVacation = function(req, res) {
  
      vacations.insertVacation( req.body, function( err, result ) {
        if( err ) {
          res.json( 500, err );
        } else {
          res.json( result );
        }
      } );

};

router.delete ( '/:id', auth.isAuthenticated, function( req, res ) {
	security.isAllowed( req.user, res, securityResources.vacations.resourceName, securityResources.vacations.permissions.editMyVacations, function( allowed ) {
		if( allowed ) {
			req.body._id = req.params.id;
			vacations.deleteVacation( req.body, function( err, result ) {
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
	security.isAllowed( req.user, res, securityResources.vacations.resourceName, securityResources.vacations.permissions.viewVacations, function( allowed ) {
		if( allowed ) {
			var id = req.params.id;
			vacations.getVacation( id, function( err, result ) {
				if( err ) {
					res.json( 500, err );
				} else {
					res.json( result );
				}
			} );
		}
	} );
} );

router.put( '/:id', auth.isAuthenticated, function( req, res ) {
    var vacationPersonResource = req.body.person.resource;
    people.getPersonByResource(vacationPersonResource, function(err, person) {
      if(!err) {
        if(person.googleId == req.user) {
          security.isAllowed( req.user, res, securityResources.vacations.resourceName, securityResources.vacations.permissions.editMyVacations, function( allowed ) {
            if( allowed ) {
              updateVacation(req, res);
            }
          } );
        } else {
          security.isAllowed( req.user, res, securityResources.vacations.resourceName, securityResources.vacations.permissions.editVacations, function( allowed ) {
            if( allowed ) {
              updateVacation(req, res);
            }
          } );
        }
      } else {
        var errMsg = "Can't get person from vacation entry.";
        console.log(errMsg);
        res.json( 500, errMsg );
      }
    });
	
} );

var updateVacation = function(req, res) {
  var id = req.params.id;
  req.body._id = id;
  vacations.insertVacation( req.body, function( err, result ) {
    if( err ) {
      res.json( 500, err );
    } else {
      res.json( result );
    }
  } );
};

module.exports = router;

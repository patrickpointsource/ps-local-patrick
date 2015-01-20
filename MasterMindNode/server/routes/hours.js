'use strict';

var hours = require( '../controllers/hours' );
var people = require('../controllers/people');
var express = require( 'express' );
var auth = require( '../util/auth' );

var security = require( '../util/security' );
var securityResources = require( '../util/securityResources' );
var _ = require( 'underscore' );

var router = express.Router( );

var getExecTime = function(dt){
	return ((new Date().getTime() - dt.getTime()) / 1000).toFixed(1);
}

router.get( '/', auth.isAuthenticated, function( req, res ) {

	security.isAllowed( req.user, res, securityResources.hours.resourceName, securityResources.hours.permissions.viewHours, function( allowed ) {
		if( allowed ) {

			var query = req.query[ "query" ] ? JSON.parse( req.query[ "query" ] ) : {};
			var now = new Date();
			 
			console.log( '\r\nget:hours:start:query:' + JSON.stringify( query ) + '\r\n' );

			hours.listHours( query, function( err, result ) {
				if( err ) {
					res.json( 500, err );
				} else {
					res.json( result );
				}
				
				console.log( '\r\nget:hours:end:query:' + JSON.stringify( query ) + ':' + getExecTime(now) + '\r\n' );
			} );
		}
	} );

} );

router.get( '/persondates', auth.isAuthenticated, function( req, res ) {

    security.isAllowed( req.user, res, securityResources.hours.resourceName, securityResources.hours.permissions.viewHours, function( allowed ) {
        if( allowed ) {
            var person = req.query[ "person" ] ? req.query[ "person" ] : "";
            var startDate = req.query[ "startDate" ] ? req.query[ "startDate" ] : "";
            var endDate = req.query[ "endDate" ] ? req.query[ "endDate" ] : "";
            
			var now = new Date();
            
            console.log( '\r\nget:hours:start:persondates:' + JSON.stringify(person) + ':' + startDate + ':' + endDate+ '\r\n' );

            if (person && startDate && endDate)
                hours.listHoursByPersonAndDates( person, startDate, endDate, function( err, result ) {
                    if( err ) {
                        res.json( 500, err );
                    } else {
                        res.json( result );
                    }
					
					console.log( '\r\nget:hours:end:persondates:' + JSON.stringify(person) + ':' + startDate + ':' + endDate + ':' + getExecTime(now) + '\r\n' );
					
                } );
            else 
                 res.json( 500, "missed params" );
        }
    } );

} );

router.get( '/projectdates', auth.isAuthenticated, function( req, res ) {

    security.isAllowed( req.user, res, securityResources.hours.resourceName, securityResources.hours.permissions.viewHours, function( allowed ) {
        if( allowed ) {
            var projects = req.query[ "project" ] ? req.query[ "project" ] : "";
            var startDate = req.query[ "startDate" ] ? req.query[ "startDate" ] : "";
            var endDate = req.query[ "endDate" ] ? req.query[ "endDate" ] : "";
            var fields = req.query[ "field" ];
             
    		if (!_.isArray(projects)) {
    			projects = [projects];
    		}
    		
            var now = new Date();
            console.log( '\r\nget:hours:projectdates:start:' + JSON.stringify(projects) + ':' + startDate + ':' + endDate + '\r\n' );

            if (projects && startDate && endDate)
                hours.listHoursByProjectsAndDates( projects, startDate, endDate, fields, function( err, result ) {
                    if( err ) {
                        res.json( 500, err );
                    } else {
                        res.json( result );
                    }
					
					console.log( '\r\nget:hours:projectdates:end:' + JSON.stringify(projects) + ':' + startDate + ':' + endDate + ':' + getExecTime(now) + '\r\n' );
                } );
            else 
                 res.json( 500, "missed params" );
        }
    } );

} );

router.get( '/person', auth.isAuthenticated, function( req, res ) {

    security.isAllowed( req.user, res, securityResources.hours.resourceName, securityResources.hours.permissions.viewHours, function( allowed ) {
        if( allowed ) {
            var person = req.query[ "person" ] ? req.query[ "person" ] : "";
            
             
            var now = new Date();
            
            console.log( '\r\nget:hours:start:person:' + JSON.stringify(person) + '\r\n' );

            if (person)
                hours.listHoursByPerson( person, function( err, result ) {
                    if( err ) {
                        res.json( 500, err );
                    } else {
                        res.json( result );
                    }
					
					console.log( '\r\nget:hours:end:person:' + JSON.stringify(person) + ':' + getExecTime(now) + '\r\n');
					
                } );
            else 
                 res.json( 500, "missed params" );
        }
    } );

} );

router.get( '/projects', auth.isAuthenticated, function( req, res ) {

    security.isAllowed( req.user, res, securityResources.hours.resourceName, securityResources.hours.permissions.viewHours, function( allowed ) {
        if( allowed ) {
            var projects = req.query[ "projects" ] ? req.query[ "projects" ] : "";

            if (_.isString(projects))
            	projects = [projects];
            
            var now = new Date();
            
            console.log( '\r\nget:hours:start:projects:'  + JSON.stringify(projects) + '\r\n' );

            if (projects) {
            	var fields = req.query.fields;
            	hours.listHoursByProjects( projects, fields, function( err, result ) {
                    if( err ) {
                        res.json( 500, err );
                    } else {
                        res.json( result );
                    }
					
					console.log( '\r\nget:hours:end:projects:' + JSON.stringify(projects) + ':' + getExecTime(now) );
					
                } );
            }
            else 
                 res.json( 500, "missed params" );
        }
    } );

} );

router.post( '/', auth.isAuthenticated, function( req, res ) {

    var personResource = req.body.person ? req.body.person.resource : undefined;
          
          if(personResource) {
            people.getPersonByResource(personResource, function(err, person) {
              if(!err) {
                if(person.googleId == req.user) {
                  security.isAllowed( req.user, res, securityResources.hours.resourceName, securityResources.hours.permissions.editMyHours, function( allowed ) {
                    console.log( '\r\npost:hours:\r\n' );
                    if( allowed ) {
                      insertHours(req.body, res);
                    }
                  });
                } else {
                  security.isAllowed( req.user, res, securityResources.hours.resourceName, securityResources.hours.permissions.editHours, function( allowed ) {
                    console.log( '\r\npost:hours:\r\n' );
                    if(allowed) {
                      insertHours(req.body, res);
                    }
                  });
                }
              } else {
                var errMsg = "Can't get person by resource from hours entry.";
                console.log(errMsg);
                res.json( 500, errMsg );
              }
            });
          } else {
            var errMsg = "Can't get person resource from hours entry.";
            console.log(errMsg);
            res.json( 500, errMsg );
          }
} );

var insertHours = function(body, res) {
  hours.insertHours( body, function( err, result ) {
    if( err ) {
      res.json( 500, err );
    } else {
      res.json( result );
    }
  } );
};

router.put( '/:id', auth.isAuthenticated, function( req, res ) {

    var personResource = req.body.person ? req.body.person.resource : undefined;
    
        if(personResource) {
            people.getPersonByResource(personResource, function(err, person) {
              if(!err) {
                if(person.googleId == req.user) {
                  security.isAllowed( req.user, res, securityResources.hours.resourceName, securityResources.hours.permissions.editMyHours, function( allowed ) {
                    console.log( '\r\npost:hours:\r\n' );
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
                  });
                } else {
                  security.isAllowed( req.user, res, securityResources.hours.resourceName, securityResources.hours.permissions.editHours, function( allowed ) {
                    console.log( '\r\npost:hours:\r\n' );
                    if(allowed) {
                      var id = req.params.id;

                      hours.updateHours( id, req.body, function( err, result ) {
                        if( err ) {
                            res.json( 500, err );
                        } else {
                            res.json( result );
                        }
                      } );
                    }
                  });
                }
              } else {
                var errMsg = "Can't get person by resource from hours entry.";
                console.log(errMsg);
                res.json( 500, errMsg );
              }
            });
          } else {
            var errMsg = "Can't get person resource from hours entry.";
            console.log(errMsg);
            res.json( 500, errMsg );
          }

} );

router.delete( '/:id', auth.isAuthenticated, function( req, res ) {

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

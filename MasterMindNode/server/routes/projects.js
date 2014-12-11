'use strict';

var projects = require( '../controllers/projects' );
var people = require( '../controllers/people' );

var express = require( 'express' );
var auth = require( '../util/auth' );
var util = require( '../util/util' );

var security = require( '../util/security' );
var securityResources = require( '../util/securityResources' );
var attribute = require( '../util/attribute' );

var router = express.Router( );

router.get( '/', auth.isAuthenticated, function( req, res ) {

	security.isAllowed( req.user, res, securityResources.projects.resourceName, securityResources.projects.permissions.viewProjects, function( allowed ) {
		if( allowed ) {
			var query = req.query[ "query" ] ? JSON.parse( req.query[ "query" ] ) : {};
			var fields = req.query.fields;
			projects.listProjects( query, fields, function( err, result ) {
				if( err ) {
					res.json( 500, err );
				} else {
					res.json( result );
				}
			} );
		}
	} );

} );

router.get( '/executiveSponsor/:executiveSponsor', auth.isAuthenticated, function( req, res ) {

	security.isAllowed( req.user, res, securityResources.projects.resourceName, securityResources.projects.permissions.viewProjects, function( allowed ) {
		if( allowed ) {
			var executiveSponsor = req.params.executiveSponsor;
			var fields = req.query.fields;
			if( executiveSponsor ) {
				projects.listProjectsByExecutiveSponsor( util.getFullID( executiveSponsor, 'people' ), fields, function( err, result ) {
					if( err ) {
						res.json( 500, err );
					} else {
						res.json( result );
					}
				} );
			} else {
				res.json( 500, 'No required id' );
			}
		}
	} );

} );

router.get( '/:id/executiveSponsor', auth.isAuthenticated, function( req, res ) {
	security.isAllowed( req.user, res, securityResources.projects.resourceName, securityResources.projects.permissions.viewProjects, function( allowed ) {
		if( allowed ) {
			var id = req.params.id;
			var fields = req.query.fields;
			projects.listProjectsByExecutiveSponsor( util.getFullID( id, 'people' ), fields, function( err, projects ) {
				if( err ) {
					res.json( 500, err );
				} else {
					res.json( projects );
				}
			} );

		}
	});
});

router.get( '/:id/current', auth.isAuthenticated, function( req, res ) {
	security.isAllowed( req.user, res, securityResources.projects.resourceName, securityResources.projects.permissions.viewProjects, function( allowed ) {
		if( allowed ) {
			var id = req.params.id;
			var fields = req.query.fields;
			projects.listCurrentProjectsByPerson( util.getFullID( id, 'people' ), fields, function( err, projects ) {
				if( err ) {
					res.json( 500, err );
				} else {
					res.json( projects );
				}
			} );

		}
	});
});


router.get( '/byperson/:id/:type', auth.isAuthenticated, function( req, res ) {

	security.isAllowed( req.user, res, securityResources.projects.resourceName, securityResources.projects.permissions.viewProjects, function( allowed ) {
		if( allowed ) {
			var type = req.params.type;
			var id = req.params.id;
			if( id && type ) {
				var fields = req.query.fields;
				// returns current projects for required user
				if( type && type == "current" ) {
					projects.listCurrentProjectsByPerson( util.getFullID( id, 'people' ), fields, function( err, projects ) {
						if( err ) {
							res.json( 500, err );
						} else {
							res.json( projects );
						}
					} );
				}
				
			} else {
				res.json( 500, 'No required type' );
			}
		}
	} );

} );


router.get('/bytypes/:type', auth.isAuthenticated, function(req, res){
	security.isAllowed( req.user, res, securityResources.projects.resourceName, securityResources.projects.permissions.viewProjects, function( allowed ) {
		if (allowed) 
		{
			var type = req.params.type;
			var fields = req.query.fields;
			if (type && type == "projectsByResources") {
				var resource = req.query.resource;
				projects.listProjectsByResources(resource, fields, function( err, result ) {
			        if(err){
			            res.json(500, err);
			        } else {
			            res.json(result);
			        }            
			    });
			}
			else if (type && type == "projectsByStatuses") {
				var status = req.query.status;
				projects.listProjectsByStatuses( status, fields, function( err, result ) {
			        if(err){
			            res.json(500, err);
			        } else {
			            res.json(result);
			        }            
			    });
			}
			else if (type && type == "projectsBetweenDatesByTypesAndSponsors") {
				var startDate = req.query.startDate;
				var endDate = req.query.endDate;
				var types = req.query.type;
				var isCommited = req.query.isCommited;
				var roleResources = req.query.roleResource;
				projects.listProjectsBetweenDatesByTypesAndSponsors( startDate, endDate, types, isCommited, roleResources, fields, function( err, result ) {
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


router.get( '/filter/', auth.isAuthenticated, function( req, res ) {

	security.isAllowed( req.user, res, securityResources.projects.resourceName, securityResources.projects.permissions.viewProjects, function( allowed ) {
		if( allowed ) {

			var startDate = req.query.startDate;
			var endDate = req.query.endDate;
			var types = req.query.type;
			var isCommited = req.query.isCommited;
			var roleResources = req.query.roleResource;
			var status = req.query.status;
			var resource = req.query.resource;
			if (resource) {

				projects.listProjectsByResources(resource, function( err, result ) {
					if( err ) {
						res.json( 500, err );
					} else {
						res.json( result );
					}
				} );
				
			}
			else if( status ) {
				
				projects.listProjectsByStatuses( status, function( err, result ) {
					if( err ) {
						res.json( 500, err );
					} else {
						res.json( result );
					}
				} );
			
			} else {
			
				projects.listProjectsBetweenDatesByTypesAndSponsors( startDate, endDate, types, isCommited, roleResources, function( err, result ) {
					if( err ) {
						res.json( 500, err );
					} else {
						res.json( result );
					}
				} );
			
			}
		}
	} );

} );

router.get( '/bystatus/:status', auth.isAuthenticated, function( req, res ) {

	security.isAllowed( req.user, res, securityResources.projects.resourceName, securityResources.projects.permissions.viewProjects, function( allowed ) {
		if( allowed ) {
			var statusString = req.params.status;
			var fields = req.query.fields;
			if( statusString ) {
				var statuses = statusString.split( ',' );
				projects.listProjectsByStatuses( statuses, fields, function( err, result ) {
					if( err ) {
						res.json( 500, err );
					} else {
						res.json( result );
					}
				} );
			} else {
				res.json( 500, 'No required status attribute' );
			}

		}
	} );

} );

router.get( '/:id', auth.isAuthenticated, function( req, res ) {

	security.isAllowed( req.user, res, securityResources.projects.resourceName, securityResources.projects.permissions.viewProjects, function( allowed ) {
		if( allowed ) {
			var id = req.params.id;
			projects.getProject( id, function( err, result ) {
				if( err ) {
					res.json( 500, err );
				} else {
					res.json( result );
				}
			} );
		}
	} );

} );

router.post( '/:id/links', auth.isAuthenticated, function( req, res ) {

	security.isAllowed( req.user, res, securityResources.projects.resourceName, securityResources.projects.permissions.editProjectLinks, function( allowed ) {
		if( allowed ) {
			var id = req.params.id;
			projects.addProjectLink( id, req.body, function( err, result ) {
				if( err ) {
					res.json( 500, err );
				} else {
					res.json( result );
				}
			} );
		}
	} );

} );

router.get( '/:id/links', auth.isAuthenticated, function( req, res ) {

	security.isAllowed( req.user, res, securityResources.projects.resourceName, securityResources.projects.permissions.viewProjectLinks, function( allowed ) {
		if( allowed ) {
			var id = req.params.id;
			var query = req.query[ "query" ] ? JSON.parse( req.query[ "query" ] ) : {};
			projects.listLinksByProject( id, function( err, result ) {
				if( err ) {
					res.json( 500, err );
				} else {
					res.json( result );
				}
			} );
		}
	} );

} );

router.get( '/:id/assignments', auth.isAuthenticated, function( req, res ) {

	security.isAllowed( req.user, res, securityResources.assignments.resourceName, securityResources.assignments.permissions.viewProjects, function( allowed ) {
		if( allowed ) {
			var id = req.params.id;
			var query = req.query[ "query" ] ? JSON.parse( req.query[ "query" ] ) : {};
			projects.listAssignments( id, query, function( err, result ) {
				if( err ) {
					res.json( 500, err );
				} else {
					res.json( result );
				}
			} );
		}
	} );

} );

router.get( '/:id/roles', auth.isAuthenticated, function( req, res ) {

	security.isAllowed( req.user, res, securityResources.projects.resourceName, securityResources.projects.permissions.viewRoles, function( allowed ) {
		if( allowed ) {
			var id = req.params.id;
			projects.listRoles( id, function( err, result ) {
				if( err ) {
					res.json( 500, err );
				} else {
					res.json( result );
				}
			} );
		}
	} );

} );

router.get( '/:id/roles/:roleId', auth.isAuthenticated, function( req, res ) {

	security.isAllowed( req.user, res, securityResources.projects.resourceName, securityResources.projects.permissions.viewRoles, function( allowed ) {
		if( allowed ) {
			var id = req.params.id;
			var roleId = req.params.roleId;
			projects.getRole( id, roleId, function( err, result ) {
				if( err ) {
					res.json( 500, err );
				} else {
					res.json( result );
				}
			} );
		}
	} );

} );

router.put( '/:id/assignments', auth.isAuthenticated, function( req, res ) {
	security.isAllowed( req.user, res, securityResources.assignments.resourceName, securityResources.assignments.permissions.editAssignments, function( allowed ) {
		if( allowed ) {
			var id = req.params.id;
			projects.insertAssignment( id, req.body, function( err, result ) {
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
delete ( '/:id', auth.isAuthenticated,
function( req, res ) {

	security.isAllowed( req.user, res, securityResources.projects.resourceName, securityResources.projects.permissions.editProjects, function( allowed ) {
		if( allowed ) {
			var id = req.params.id;
			req.body._id = id;
			projects.deleteProject( req.body, function( err, result ) {
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
delete ( '/:id/links/:linkIndex', auth.isAuthenticated,
function( req, res ) {

	security.isAllowed( req.user, res, securityResources.projects.resourceName, securityResources.projects.permissions.editProjectLinks, function( allowed ) {
		if( allowed ) {
			var id = req.params.id;
			var linkIndex = req.params.linkIndex;
			projects.deleteProjectLink( id, linkIndex, function( err, result ) {
				if( err ) {
					res.json( 500, err );
				} else {
					res.json( result );
				}
			} );
		}
	} );

} );

router.post( '/', auth.isAuthenticated, function( req, res ) {

	security.isAllowed( req.user, res, securityResources.projects.resourceName, securityResources.projects.permissions.editProjects, function( allowed ) {
		if( allowed ) {
			var project = req.body;
			project.form = 'Projects';
			projects.insertProject( project, function( err, result ) {
				if( err ) {
					res.json( 500, err );
				} else {
					res.json( result );
				}
			} );
		}
	} );

} );

router.put( '/:id/links/:linkIndex', auth.isAuthenticated, function( req, res ) {

	security.isAllowed( req.user, res, securityResources.projects.resourceName, securityResources.projects.permissions.editProjectLinks, function( allowed ) {
		if( allowed ) {
			var id = req.params.id;
			var linkIndex = req.params.linkIndex;
			projects.insertProjectLink( id, linkIndex, req.body, function( err, result ) {
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

	security.isAllowed( req.user, res, securityResources.projects.resourceName, securityResources.projects.permissions.editProjects, function( allowed ) {
		if( allowed ) {
			var id = req.params.id;
			var project = req.body;

			project._id = id;
			project.form = 'Projects';

			projects.insertProject( project, function( err, result ) {
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

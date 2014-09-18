'use strict';

var projects = require( '../controllers/projects' );
var express = require( 'express' );
var auth = require( '../util/auth' );
var util = require( '../util/util' );

var security = require( '../util/security' );
var securityResources = require( '../util/securityResources' );
var attribute = require('../util/attribute');

var router = express.Router( );

router.get( '/', auth.isAuthenticated, function( req, res ) {

	security.isAllowed( req.user, res, securityResources.projects.resourceName, securityResources.projects.permissions.viewProjects, function( allowed ) {
		if( allowed ) {
			var query = req.query[ "query" ] ? JSON.parse( req.query[ "query" ] ) : {};
			projects.listProjects( query, function( err, result ) {
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
			if (executiveSponsor) {
				projects.listProjectsByExecutiveSponsor( util.getFullID(executiveSponsor,'people'), function( err, result ) {
					if( err ) {
						res.json( 500, err );
					} else {
						res.json( result );
					}
				} );
			}
			else {
				res.json( 500, 'No required id' );
			}
		}
	} );

} );

router.get( '/filter/', auth.isAuthenticated, function( req, res ) {

	security.isAllowed( req.user, res, securityResources.projects.resourceName, securityResources.projects.permissions.viewProjects, function( allowed ) {
		if( allowed ) {

			var startDate = req.query.startDate;
			var endDate = req.query.startDate;
			var types = req.query.types;
			var isCommited = req.query.isCommited;
			var roleResources = req.query.roleResources;
			
			console.log("startDate=" + startDate);
			console.log("endDate=" + endDate);
			console.log("types=" + types);
			console.log("isCommited=" + isCommited);
			console.log("roleResources=" + roleResources);
			
			
			projects.listProjectsBetweenDatesByTypesAndSponsors( startDate, endDate, types, isCommited, roleResources, function( err, result ) {
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
			projects.listLinks( id, query, function( err, result ) {
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
delete ( '/', auth.isAuthenticated,
function( req, res ) {

	security.isAllowed( req.user, res, securityResources.projects.resourceName, securityResources.projects.permissions.editProjects, function( allowed ) {
		if( allowed ) {
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
delete ( '/:id/links/:linkId', auth.isAuthenticated,
function( req, res ) {

	security.isAllowed( req.user, res, securityResources.projects.resourceName, securityResources.projects.permissions.editProjectLinks, function( allowed ) {
		if( allowed ) {
			var id = req.params.id;
			var linkId = req.params.linkId;
			projects.deleteProjectLink( id, linkId, function( err, result ) {
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

router.put( '/:id/links/:linkId', auth.isAuthenticated, function( req, res ) {

	security.isAllowed( req.user, res, securityResources.projects.resourceName, securityResources.projects.permissions.editProjectLinks, function( allowed ) {
		if( allowed ) {
			var id = req.params.id;
			var linkId = req.params.linkId;
			projects.insertProjectLink( id, linkId, req.body, function( err, result ) {
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

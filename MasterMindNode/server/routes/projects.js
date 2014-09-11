'use strict';

var projects = require( '../controllers/projects' );
var express = require( 'express' );
var util = require( '../util/auth' );

var security = require( '../util/security' );
var securityResources = require( '../util/securityResources' );

var router = express.Router( );

router.get( '/', util.isAuthenticated, function( req, res ) {

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

router.get( '/:id', util.isAuthenticated, function( req, res ) {

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

router.post( '/:id/links', util.isAuthenticated, function( req, res ) {

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

router.get( '/:id/links', util.isAuthenticated, function( req, res ) {

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

router.get( '/:id/assignments', util.isAuthenticated, function( req, res ) {

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

router.get( '/:id/roles', util.isAuthenticated, function( req, res ) {

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

router.get( '/:id/roles/:roleId', util.isAuthenticated, function( req, res ) {

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

router.put( '/:id/assignments', util.isAuthenticated, function( req, res ) {
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
delete ( '/', util.isAuthenticated,
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
delete ( '/:id/links/:linkId', util.isAuthenticated,
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

router.post( '/', util.isAuthenticated, function( req, res ) {

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

router.put( '/:id/links/:linkId', util.isAuthenticated, function( req, res ) {

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

router.put( '/:id', util.isAuthenticated, function( req, res ) {

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

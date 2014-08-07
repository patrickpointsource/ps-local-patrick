var dbAccess = require( '../data/dbAccess.js' );
var memoryCache = require( '../data/memoryCache.js' );
var _ = require( 'underscore' );
var sift = require('sift');
var config = require( '../config/config.js' );

var PROJECTS_KEY = 'Projects';
var PEOPLE_KEY = 'People';
var ASSIGNMENTS_KEY = 'Assignments';
var TASKS_KEY = 'Tasks';
var ROLES_KEY = 'Roles';
var SECURITY_ROLES_KEY = 'SecurityRoles';
var CONFIGURATION_KEY = 'Configuration';
var VACATIONS_KEY = 'Vacations';
var SKILLS_KEY = 'Skills';
var LINKS_KEY = 'Links';

//TODO: fix $oid to _id
var alignQuery = function( q, qP, pProp, pInd) {

	if( _.isArray( q ) )
		for( var j = 0; j < q.length; q++ )
			alignQuery( q[ j ], q, null, j );
	else if( _.isObject( q ) )
		for( var prop in q ) {
			if( prop == "$oid" ) {
				//q[ "_id" ] = q[ prop ];
				//delete q[ "$oid" ];
				
				if (pInd == undefined)
				    qP[pRop] = q[ prop ];
				else
				    qP[pProp][pInd] = q[ prop ];
			} else if( _.isArray( q[ prop ] ) )
				for( var j = 0; j < q[prop].length; j ++ )
					alignQuery( q[prop][ j ], q, prop, j );
			else if( _.isObject( q[ prop ] ) )
				alignQuery( q[ prop ], q, prop );
		};
	//return q;
};

var queryRecords = function( data, q, propName, resourcePrefix) {
	var res = {
		about: data.about
	};
    if (!q)
        q = {};
        
    alignQuery( q );
    
    if (!propName) {
	   //res.data = _.query( data.data,  q);
	   res.data = addResourceProperty(sift(q, data.data), resourcePrefix);

	   res.count = res.data.length;
	} else {
	    //res[propName] = _.query( data.data,  q);
	    res[propName] = addResourceProperty(sift(q, data.data), resourcePrefix);
    

       res.count =  res[propName].length;
	}

	return res;
};

var addResourceProperty = function(collection, resourcePrefix) {
    var tmpId;
    
    for (var i = 0; i < collection.length; i ++) {
        if (_.isObject(collection[i]._id))
            tmpId = collection[i]._id["$oid"].toString();
        else
            tmpId = collection[i]._id.toString();
            
        collection[i].resource = resourcePrefix + tmpId;
    }
    return collection;
};


var listProjects = function( q, callback ) {

	var result = memoryCache.getObject( PROJECTS_KEY );
	var data = null;

	if( result ) {
		console.log( "read " + PROJECTS_KEY + " from memory cache" );

		callback( null, queryRecords( result, q, null, "project/" ) );
	} else {
		dbAccess.listProjects( function( err, body ) {
			if( !err ) {
				console.log( "save " + PROJECTS_KEY + " to memory cache" );
				memoryCache.putObject( PROJECTS_KEY, body );
			}

			callback( err, queryRecords( body, q, null, "project/" ) );
		} );
	}

};

var getProfileByGoogleId = function(id, callback){
    var query = {googleId: id};
	listPeople(query, function (err, list) {
		if (!err) {
	    	callback(null, list["members"][0]);
		}
		else {
			callback(err, null);
		}
	});
};


var listPeople = function( q, callback ) {

	var result = memoryCache.getObject( PEOPLE_KEY );
	if( result ) {
		console.log( "read " + PEOPLE_KEY + " from memory cache" );
		callback( null, queryRecords( result, q , "members", "people/") );
	} else {
		dbAccess.listPeople( function( err, body) {
			if( !err ) {
				console.log( "save " + PEOPLE_KEY + " to memory cache" );
				memoryCache.putObject( PEOPLE_KEY, body );
			}
			callback( err, queryRecords( body, q, "members", "people/" ) );
		} );
	}

};

var listAssignments = function( q, callback ) {

	var result = memoryCache.getObject( ASSIGNMENTS_KEY );
	if( result ) {
		console.log( "read " + ASSIGNMENTS_KEY + " from memory cache" );
		callback( null, queryRecords( result, q, null, "assignments/" )  );
	} else {
		dbAccess.listAssignments( function( err, body ) {
			if( !err ) {
				console.log( "save " + ASSIGNMENTS_KEY + " to memory cache" );
				memoryCache.putObject( ASSIGNMENTS_KEY, body );
			}
			callback( err, queryRecords( body, q, null, "assignments/" )  );
		} );
	}

};

var listTasks = function( q, callback ) {

	var result = memoryCache.getObject( TASKS_KEY );
	if( result ) {
		console.log( "read " + TASKS_KEY + " from memory cache" );
		callback( null, queryRecords( result, q , "members", "tasks/")  );
	} else {
		dbAccess.listTasks( function( err, body ) {
			if( !err ) {
				console.log( "save " + TASKS_KEY + " to memory cache" );
				memoryCache.putObject( TASKS_KEY, body );
			}
			callback( err, queryRecords( body, q , "members", "tasks/")  );
		} );
	}

};

var listRoles = function( q, callback ) {

	var result = memoryCache.getObject( ROLES_KEY );
	if( result ) {
		console.log( "read " + ROLES_KEY + " from memory cache" );
		callback( null, queryRecords( result, q , "members", "roles/") );
	} else {
		dbAccess.listRoles( function( err, body) {
			if( !err ) {
				console.log( "save " + ROLES_KEY + " to memory cache" );
				memoryCache.putObject( ROLES_KEY, body );
			}
			callback( err, queryRecords( body, q, "members", "roles/" ) );
		} );
	}

};


var listLinks = function( q, callback ) {

	var result = memoryCache.getObject( LINKS_KEY );
	if( result ) {
		console.log( "read " + LINKS_KEY + " from memory cache" );
		callback( null, queryRecords( result, q , "members", "links/") );
	} else {
		dbAccess.listLinks( function( err, body) {
			if( !err ) {
				console.log( "save " + LINKS_KEY + " to memory cache" );
				memoryCache.putObject( LINKS_KEY, body );
			}
			callback( err, queryRecords( body, q, "members", "links/" ) );
		} );
	}

};

var listConfiguration = function( q, callback ) {

	var result = memoryCache.getObject( CONFIGURATION_KEY );
	if( result ) {
		console.log( "read " + CONFIGURATION_KEY + " from memory cache" );
		callback( null, queryRecords( result, q , "members", "configuration/") );
	} else {
		dbAccess.listConfiguration( function( err, body) {
			if( !err ) {
				console.log( "save " + CONFIGURATION_KEY + " to memory cache" );
				memoryCache.putObject( CONFIGURATION_KEY, body );
			}
			callback( err, queryRecords( body, q, "members", "configuration/" ) );
		} );
	}

};

var listSkills = function( q, callback ) {

	var result = memoryCache.getObject( SKILLS_KEY );
	if( result ) {
		console.log( "read " + SKILLS_KEY + " from memory cache" );
		callback( null, queryRecords( result, q , "members", "skills/") );
	} else {
		dbAccess.listSkills( function( err, body) {
			if( !err ) {
				console.log( "save " + SKILLS_KEY + " to memory cache" );
				memoryCache.putObject( SKILLS_KEY, body );
			}
			callback( err, queryRecords( body, q, "members", "skills/" ) );
		} );
	}

};

var listVacations = function( q, callback ) {

	var result = memoryCache.getObject( VACATIONS_KEY );
	if( result ) {
		console.log( "read " + VACATIONS_KEY + " from memory cache" );
		callback( null, queryRecords( result, q , "members", "vacations/") );
	} else {
		dbAccess.listVacations( function( err, body) {
			if( !err ) {
				console.log( "save " + VACATIONS_KEY + " to memory cache" );
				memoryCache.putObject( VACATIONS_KEY, body );
			}
			callback( err, queryRecords( body, q, "members", "vacations/" ) );
		} );
	}

};

var listSecurityRoles = function( q, callback ) {
	var result = memoryCache.getObject( SECURITY_ROLES_KEY );
	if( result ) {
		console.log( "read " + SECURITY_ROLES_KEY + " from memory cache" );
		callback( null, queryRecords( result, q , "members", "securityroles/") );
	} else {
		dbAccess.listSecurityRoles( function( err, body) {
			if( !err ) {
				console.log( "save " + SECURITY_ROLES_KEY + " to memory cache" );
				memoryCache.putObject( SECURITY_ROLES_KEY, body );
			}
			callback( err, queryRecords( body, q, "members", "securityroles/" ) );
		} );
	}

};


var insertItem = function( id, obj, type, callback ) {
	dbAccess.insertItem( id, obj, function( err, body ) {
		if( !err ) {
			console.log( "Object with id " + id + " created in db" );
			memoryCache.deleteObject( type );
		}
		callback( err, body );
	} );
}
var deleteItem = function( id, rev, type, callback ) {
	dbAccess.deleteItem( id, rev, function( err, body ) {
		if( !err ) {
			console.log( "Object with id " + id + " deleted from db" );
			memoryCache.deleteObject( type );
		}
		callback( err, body );
	} );
}
var getItem = function( id, callback ) {
	dbAccess.getItem( id, function( err, body ) {
		if( !err ) {
			console.log( "Read object with id " + id + " from db" );
		}
		callback( err, body );
	} );
}

module.exports.listProjects = listProjects;
module.exports.listPeople = listPeople;
module.exports.listAssignments = listAssignments;
module.exports.listTasks = listTasks;
module.exports.listRoles = listRoles;
module.exports.listLinks = listLinks;
module.exports.listSkills = listSkills;
module.exports.listConfiguration = listConfiguration;
module.exports.listVacations = listVacations;
module.exports.listSecurityRoles = listSecurityRoles;
module.exports.getProfileByGoogleId = getProfileByGoogleId;

module.exports.insertItem = insertItem;
module.exports.deleteItem = deleteItem;
module.exports.getItem = getItem;

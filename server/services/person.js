var _ = require('underscore'),
    google = require('googleapis'),
    path = require('path');

module.exports.init = function(){
    
};

module.exports.getPersonByGoogleID = function(googleId, callback){
    var access = services.get('dbAccess');
    access.db.view('People', 'AllPeopleByGoogleId', { keys: [googleId] }, function(err, docs){
        if(err){
            return callback(err);
        }
        if(docs.rows.length === 0){
            return callback('The indicated user doesn\'t exist.');
        }
        callback(null, docs.rows[0]);
    });
};

module.exports.getPersonAccessRights = function(id, callback){
    var access = services.get('dbAccess');
    access.db.get(id, function(err, doc){
        if(err){
            return callback(err);
        }
        var googleID = doc.googleId;

        var accessRights = {
            hasFinanceRights: false,
            hasAdminRights: false,
            hasManagementRights: false,
            hasProjectManagementRights: false,
            hasExecutiveRights: false,
        };
        var access = services.get('dbAccess');
        access.db.view('UserRoles', 'AllUserRolesByGoogleID', { keys: [googleID]}, function(err, docs){
            if(err){
                return callback(err);
            }
            if(docs.rows.length === 0){
                return callback(null, accessRights);
            }
            var userRole = docs.rows[0].value;
        
            /**
             * Members of the 'Executives' group...
             *
             * Is in the Executive Sponsor List (queried from People collection)
             * Can edit any project (projectManagementAccess)
             * Can view all financial info (financeAccess)
             * Can make project assignments (projectManagementAccess)
             * View Staffing Deficits (projectManagementAccess)
             * Update Role Types (adminAccess)
             * Can Assign Users to Groups (adminAccess)
             */
            if( _.contains(userRole.roles, access.DEFAULT_ROLES.EXECUTIVES) ||
                _.contains(userRole.roles, access.DEFAULT_ROLES.ADMIN)) {
                accessRights.hasFinanceRights = true;
                accessRights.hasAdminRights = true;
                accessRights.hasProjectManagementRights = true;
                accessRights.hasManagementRights = true;
                accessRights.hasExecutiveRights = true;
            }

            /**
             * Members of the 'Management' group...
             *
             * Can edit any project (projectManagementAccess)
             * Can view all financial info (financeAccess)
             * Can make project assignments (projectManagementAccess)
             * View Staffing Deficits (projectManagementAccess)
             * Update Role Types (adminAccess)
             * Can Assign Users to Groups (adminAccess)
             */
            if( _.contains(userRole.roles, access.DEFAULT_ROLES.MANAGEMENT) ) {
                accessRights.hasFinanceRights = true;
                accessRights.hasAdminRights = true;
                accessRights.hasProjectManagementRights = true;
                accessRights.hasManagementRights = true;
            }

            /**
             * Members of the 'Project Management' group...
             *
             * Can edit any project (projectManagementAccess)
             * Can make project assignments (projectManagementAccess)
             * View Staffing Deficits (projectManagementAccess)
             */
            if( _.contains(userRole.roles, access.DEFAULT_ROLES.PM) || 
                _.contains(userRole.roles, access.DEFAULT_ROLES.SSA) ) {
                accessRights.hasFinanceRights = true;
                accessRights.hasProjectManagementRights = true;
            }

            /**
             * Members of the 'Sales' group...
             *
             * Is in the Sales Sponsor List (queried from People collection)
             * Can view all financial info (financeAccess)
             */
            if( _.contains(userRole.roles, access.DEFAULT_ROLES.SALES) ) {
                accessRights.hasFinanceRights = true;
            }
    
            callback(null, accessRights);
        });
    });
};


module.exports.getPersonGoogleProfile = function(googleID, callback){
    var config = services.get('config');
    var cfg = config.get('google-apis');
    
    var SERVICE_ACCOUNT_EMAIL = cfg.accountEmail;
    var SERVICE_ACCOUNT_KEY_FILE = path.resolve('./', cfg.privateKeyPath);

    var SERVICE_SCOPE = [
        'https://www.googleapis.com/auth/admin.directory.user.readonly',
        'https://www.googleapis.com/auth/admin.directory.user.readonly'
    ];
    var APP_ACCOUNT_EMAIL = 'psapps@pointsourcellc.com';
    var authClient = new google.auth.JWT(
        SERVICE_ACCOUNT_EMAIL,
        SERVICE_ACCOUNT_KEY_FILE,
        null,
        SERVICE_SCOPE,
        APP_ACCOUNT_EMAIL
    );

    authClient.authorize(function(err, result) {
        if (err) {
            callback(err, null);
        }

        var client = google.admin('directory_v1');
        client.users.get({
                userKey: googleID,
                auth: authClient
            }, function(err, result) {
                callback(err, result);
            });
    });
};
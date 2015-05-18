// Data access layer for cloudant
var _ = require('underscore');

var PROJECTS_KEY = 'Projects';
var PEOPLE_KEY = 'People';
var ASSIGNMENTS_KEY = 'ProjectAssignments';
var TASKS_KEY = 'Tasks';
var ROLES_KEY = 'Roles';
var SECURITY_ROLES_KEY = 'SecurityRoles';
var USER_ROLES_KEY = 'UserRoles';
var CONFIGURATION_KEY = 'Configuration';
var VACATIONS_KEY = 'Vacations';
var SKILLS_KEY = 'Skills';
var LINKS_KEY = 'Links';
var HOURS_KEY = 'Hours';
var NOTIFICATIONS_KEY = 'Notifications';
var REPORT_FAVORITES_KEY = 'ReportFavorites';
var JOB_TITLE_KEY = "JobTitle";
var DEPARTMENTS_KEY = 'Department';
var DEPARTMENT_CATEGORY_KEY = 'DepartmentCategory';

module.exports.VACATIONS_KEY = VACATIONS_KEY;
module.exports.NOTIFICATIONS_KEY = NOTIFICATIONS_KEY;
module.exports.SECURITY_ROLES_KEY = SECURITY_ROLES_KEY;
module.exports.USER_ROLES_KEY = USER_ROLES_KEY;
module.exports.ASSIGNMENTS_KEY = ASSIGNMENTS_KEY;
module.exports.PROJECTS_KEY = PROJECTS_KEY;
module.exports.PEOPLE_KEY = PEOPLE_KEY;
module.exports.ROLES_KEY = ROLES_KEY;
module.exports.HOURS_KEY = HOURS_KEY;
module.exports.LINKS_KEY = LINKS_KEY;
module.exports.CONFIGURATION_KEY = CONFIGURATION_KEY;
module.exports.SKILLS_KEY = SKILLS_KEY;
module.exports.TASKS_KEY = TASKS_KEY;
module.exports.REPORT_FAVORITES_KEY = REPORT_FAVORITES_KEY;
module.exports.JOB_TITLE_KEY = JOB_TITLE_KEY;
module.exports.DEPARTMENTS_KEY = DEPARTMENTS_KEY;
module.exports.DEPARTMENT_CATEGORY_KEY = DEPARTMENT_CATEGORY_KEY;

module.exports.init = function(logger, config, callback) {
    var cfg = config.get("cloudant");
    
    // cloudant module
    var dbName = cfg.db;
    var dbAccount = cfg.account;
    var dbApiKey = cfg.user;
    var dbPwd = cfg.password;
    
    var dbConnParams = {
        account: dbAccount,
        key: dbApiKey,
        password: dbPwd,
        request_defaults: {
            maxSockets: 30
        }
    }; 
    var Cloudant = require('cloudant')(dbConnParams);

    module.exports.db = Cloudant.db.use(dbName);
    callback();
};

module.exports.executeView = function(ddoc, viewName, callback){
    module.exports.db.view(ddoc, viewName, function(err, results){
        if(err){
            return callback(err);
        }
        var docs = _.map(results.rows, function(row){
            return row.value;
        });
        callback(null, docs);
    });
};
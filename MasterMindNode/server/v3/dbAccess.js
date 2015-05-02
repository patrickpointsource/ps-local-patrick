// Data access layer for cloudant
var config = require('../config/config.js');
var _ = require('underscore');
var validation = require( '../data/validation.js' );
var winston = require('winston');

var PROJECTS_KEY = 'Projects';
var PEOPLE_KEY = 'People';
var ASSIGNMENTS_KEY = 'Assignments';
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

module.exports.init = function(params) {
    // cloudant module
    var dbName = config.cloudant[params.env].db;
    var dbAccount = config.cloudant[params.env].account;
    var dbApiKey = config.cloudant[params.env].user;
    var dbPwd = config.cloudant[params.env].password;
    
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
};

module.exports.sendJson = function(res, obj, statusCode){
	res.header('Content-Type', 'application/json');
	if(statusCode){
		res.status(statusCode);
	}
	res.json(obj);
};
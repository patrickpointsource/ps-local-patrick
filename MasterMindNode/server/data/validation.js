/**
 * Complex Business Logic validation for database objects that can't be covered by JSON Schema
 * plus JSON Schema validation
 */

var _ = require( 'underscore' );
var jsonValidator = require('../data/jsonValidator.js');
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
var DEPARTMENT_KEY = 'Department';
var DEPARTMENT_CATEGORY_KEY = 'DepartmentCategory';

var PROJECT_TYPES = [ "invest", "poc", "paid" ];
var PROJECT_STATES = [ "planning", "active", "done", "poc", "supportActive", "clientActive" ];
var ALLOWED_ROLES_TO_CREATE_PROJECT = [ "PM", "BA", "SBA" ];

var HOURS_PER_MONTH = 180;

var validate = function(obj, type) {
  var validationMessages = [];
  
  if (!obj.form) {
	  obj.form = type;
  }
  
  switch(type) {
    case ASSIGNMENTS_KEY: 
      validationMessages = isAssignmentValid(obj);
      break;
      
    case PROJECTS_KEY:
      validationMessages = isProjectValid(obj);
      break;
    
    case PEOPLE_KEY:
      validationMessages = isPersonValid(obj);
      break;
      
    case HOURS_KEY:
      validationMessages = isHoursValid(obj);
      break;
      
    case LINKS_KEY:
      validationMessages = isLinkValid(obj);
      break;
      
    case ROLES_KEY:
      validationMessages = isRolesValid(obj);
      break;
      
    case VACATIONS_KEY:
      validationMessages = isVacationValid(obj);
      break;
      
    case NOTIFICATIONS_KEY:
      validationMessages = isNotificationValid(obj);
      break;
      
    case CONFIGURATION_KEY:
      validationMessages = isConfigurationValid(obj);
      break;
    
    case SKILLS_KEY:
      validationMessages = isSkillValid(obj);
      break;
      
    case TASKS_KEY:
      validationMessages = isTaskValid(obj);
      break;
      
    case USER_ROLES_KEY:
      validationMessages = isUserRoleValid(obj);
      break;
      
    case SECURITY_ROLES_KEY:
      validationMessages = isSecurityRoleValid(obj);
      break;
      
    case REPORT_FAVORITES_KEY:
        validationMessages = isReportFavoriteValid(obj);
        break;

    case DEPARTMENT_KEY:
        validationMessages = isDepartmentValid(obj);
        break;

    case DEPARTMENT_CATEGORY_KEY:
        validationMessages = isDepartmentCategoryValid(obj);
        break;

    default: 
      break;
  }
  
  return validationMessages;
};

/*
 *  Validation for Assignment
 */
var isAssignmentValid = function(assignment) {
  var messages = [];

  messages = jsonValidator.validateDocument(assignment);
  return messages;
};

/*
 *  Validation for Project
 */
var isProjectValid = function(project) {
	/*
	 * MM 12/11/14
	 * require is set here instead of header to avoid cycle module dependency problem.
	 * If you know better way how to resolve it - feel free to update.
	 */
	var dataAccess = require( '../data/dataAccess.js' );	
	var messages = [];
	var rolesFromDb = [];

	dataAccess.listRoles( function(err, body){
	    if (err) {
	      var msg = "project validation, error loading roles";
	      winston.info(msg + ": " + err, null);
	    } else {
	      rolesFromDb = body.members;
	    }
	});
	
  // fix some issues first.
  if(!project.state) {
	    // 'planning' state by default
	    project.state = PROJECT_STATES[0];
	  }

  // clean up assignees if they exist in a project.role object
  // 12/11/14 MM if(role.assignees) {
  // 12/11/14 MM     delete role.assignees;
  // 12/11/14 MM   }

	messages = jsonValidator.validateDocument(project);
	if(new Date(project.endDate) < new Date(project.startDate)) {
		messages.push("Start date cannot be after end date");
	};
  
  
  	//TODO: add checking executive sponsor for new nodejs security
	if(!project.roles.length || project.roles.length < 1) {
		messages.push("Project must include atleast one role");
    } else {
    	var isRequiredRoleIncluded = false;
    	for(var i = 0; i < project.roles.length; i++) {
    		var role = project.roles[i];
    		
    		var actualRole = _.findWhere(rolesFromDb, { resource: role.type.resource });        
    		if(!actualRole) {
    			messages.push("Unknown role type: " + role.type.resource);
    		} else {
    			if(ALLOWED_ROLES_TO_CREATE_PROJECT.indexOf(actualRole.abbreviation) > -1) {
    				isRequiredRoleIncluded = true;
    			}
    		}
        
    		switch(role.rate.type) {
    		case "hourly":
    			if(!role.rate.fullyUtilized) {
    				if(!role.rate.hoursPerMth || parseInt(role.rate.hoursPerMth) < 1) {
    					messages.push("An Hourly Role must specify the number hours per month");
    				} else {
    					if(parseInt(role.rate.hoursPerMth) > HOURS_PER_MONTH) {
    						messages.push( "An Hourly Role cannot exceed " + HOURS_PER_MONTH +" hours per month");
    					} else {
    						//TODO: Add validation for SUXD role
    					}
    				}
    			}
    			break;
    		case "weekly":
    			if(!role.rate.fullyUtilized) {
    				if(!role.rate.hoursPerWeek || parseInt(role.rate.hoursPerWeek) < 1) {
    					messages.push("A Weekly Role must specify the number hours per week");
    				} else {
    					if(parseInt(role.rate.hoursPerWeek) > 50) {
    						messages.push("A Weekly Role cannot exceed 50 hours per week");
    					} else {
    						// TODO: add validation for SUXD role
    					}
    				}
    			}
    			break;
    		case "monthly":
    			role.rate.fullyUtilized = true;
    			break;
    		default:
    			messages.push("Unknown Role Rate Type: " + role.rate.type);
	        	break;
    		}
    	}
      
    	if(rolesFromDb.length > 0 && !isRequiredRoleIncluded) {
        messages.push("A Project must include Project Managment or Business Analyst oversight");
    	}
	}
  return messages;
};


var isPersonValid = function(person) {
  var messages = [];

  messages = jsonValidator.validateDocument(person);
  return messages;
};

var isHoursValid = function(hours) {
  var messages = [];

  messages = jsonValidator.validateDocument(hours);
  return messages;
};

var isLinkValid = function(link) {
  var messages = [];
  
  messages = jsonValidator.validateDocument(link);
  return messages;
};

var isRolesValid = function(role) {
  var messages = [];
  
  messages = jsonValidator.validateDocument(role);
  return messages;
};


var isVacationValid = function(vacation) {
  var messages = [];
  
  messages = jsonValidator.validateDocument(vacation);
  return messages;
};


var isNotificationValid = function(notification) {
  var messages = [];
  
  messages = jsonValidator.validateDocument(notification);  
  return messages;
};


var isConfigurationValid = function(obj) {
  var messages = [];
  
  messages = jsonValidator.validateDocument(obj);
  return messages;
};


var isSkillValid = function(skill) {
  var messages = [];
  
  messages = jsonValidator.validateDocument(skill);
  return messages;
};


var isTaskValid = function(task) {
  var messages = [];
  
  messages = jsonValidator.validateDocument(task);
  return messages;
};


var isUserRoleValid = function(userRole) {
  var messages = [];
  
  messages = jsonValidator.validateDocument(userRole);
  return messages;
};


var isSecurityRoleValid = function(securityRole) {
  var messages = [];
  
  messages = jsonValidator.validateDocument(securityRole);    
  return messages;
};

var isReportFavoriteValid = function(favorite) {
  var messages = [];
	  
  messages = jsonValidator.validateDocument(favorite);    
  return messages;
};

var isDepartmentValid = function(department) {
	var messages = [];
	messages = jsonValidator.validateDocument(department);    
	return messages;
};

var isDepartmentCategoryValid = function(departmentCategory) {
	var messages = [];
	messages = jsonValidator.validateDocument(departmentCategory);    
	return messages;
};

var isDate = function(date) {
  return (new Date(date) !== "Invalid Date" && !isNaN(new Date(date)) );
};

module.exports.validate = validate;
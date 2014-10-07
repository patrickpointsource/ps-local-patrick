/**
 * Validation for database objects.
 */

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

var validate = function(obj, type) {
  var isValid = false;
  
  switch(type) {
    case ASSIGNMENTS_KEY: 
      if(obj.project) {
        if(obj.project.resource) {
          isValid = true;
        }
      }
      break;

    default: 
      isValid = true;
  }
  
  return isValid;
};

module.exports.validate = validate;
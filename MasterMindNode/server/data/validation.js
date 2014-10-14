/**
 * Validation for database objects.
 */

var _ = require( 'underscore' );
var dataAccess = require( '../data/dataAccess.js' );

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

var PROJECT_TYPES = [ "invest", "poc", "paid" ];
var PROJECT_STATES = [ "planning", "active", "done", "poc", "supportActive" ];
var ALLOWED_ROLES_TO_CREATE_PROJECT = [ "PM", "BA", "SBA" ];

var HOURS_PER_MONTH = 180;

var rolesFromDb = [];

dataAccess.listRoles({}, function(err, body){
    if (err) {
      var msg = "project validation, error loading roles";
      console.log(msg + ": " + err, null);
    } else {
      rolesFromDb = body.members;
    }
});

var validate = function(obj, type) {
  var validationMessages = [];
  
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
  if(!assignment.project) {
    messages.push("'project' field is required");
  }
  if(!assignment.project.resource) {
    messages.push("'project.resource' field is required");
  }
  if(assignment.members && assignment.members.length > 0) {
    for(var i = 0; i < assignment.members.length; i++) {
      var member = assignment.members[i];
      
      if(!member.role) {
        messages.push("'member.role' field is required");
      } else {
        if(!member.role.resource) {
          messages.push("'member.role.resource' field is required");
        }
      }
      
      if(!member.person) {
        messages.push("'member.person' field is required");
      } else {
        if(!member.person.resource) {
          messages.push("'member.person.resource' field is required");
        }
      }
      
      if(!member.startDate) {
        messages.push("'member.startDate' field is required");
      }
    }
  }
  return messages;
};

/*
 *  Validation for Project
 */
var isProjectValid = function(project) {
  var messages = [];
  
  if(!project.customerName || project.customerName === '') {
    messages.push("'customerName' field is required");
  }
  
  if(!project.name || project.name === '') {
    messages.push("'name' field is required");
  }
  
  if(!project.type) {
    messages.push("'type' field is required");
  }
  
  if(PROJECT_TYPES.indexOf(project.type) < 0) {
    messages.push("unknown project type: " + project.type);
  }
  
  if(!project.startDate) {
    messages.push("'startDate' field is required");
  } else {
    if(!isDate(project.startDate)) {
      messages.push("'startDate' field is not a date");
    } else {
      if(project.endDate) {
        if(!isDate(project.endDate)) {
          messages.push("'endDate' field is not a date");
        } else {
          if(new Date(project.endDate) < new Date(project.startDate)) {
            messages.push("startDate cannot be after endDate");
          }
        }
      }
    }
  }
  
  if(!project.state) {
    // 'planning' state by default
    project.state = PROJECT_STATES[0];
  } else {
    if(PROJECT_STATES.indexOf(project.state) < 0) {
      messages.push("unknown project state: " + project.state);
    }
  }
  
  // TODO: add checking executive sponsor for new nodejs security
  if(!project.executiveSponsor) {
    messages.push("'executiveSponsor' field is required");
  } else {
    if(!project.executiveSponsor.resource) {
      messages.push("'executiveSponsor.resource' field is required");
    }
  }
  
  if(!project.roles) {
    messages.push("'roles' field is required");
  } else {
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
        
        if(!role.type) {
          messages.push("'role.type' is required");
        } else {
          if(!role.type.resource) {
            messages.push("'role.type.resource' is required");
          }
        }
        
        // clean up assignees if they exist in a project.role object
        if(role.assignees) {
          delete role.assignees;
        }
        
        if(!role.rate) {
          messages.push("'role.rate' is required");
        } else {
          if(!role.rate.type) {
            messages.push("'role.rate.type' is required");
          } else {
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
        }
      }
      
      if(rolesFromDb.length > 0 && !isRequiredRoleIncluded) {
        messages.push("A Project must include Project Managment or Business Analyst oversight");
      }
    }
  }
    
  return messages;
};

var isPersonValid = function(person) {
  var messages = [];
  if(!person.name) {
    messages.push("'name' field is required");
  }
  
  return messages;
};

var isHoursValid = function(hours) {
  var messages = [];
  if(!hours.person || !hours.person.resource) {
    messages.push("Person is required");
  }
  
  if((!hours.project || !hours.project.resource) && (!hours.task || !hours.task.resource)) {
    messages.push("Project or Task is required");
  }
  
  if(!hours.hours) {
    messages.push("Hours is required");
  }
  
  if(!hours.description) {
    messages.push("Description is required");
  }
  
  return messages;
};

var isLinkValid = function(link) {
  var messages = [];
  
  if(!link.url) {
    messages.push("Url is required");
  }
  
  if(!link.label) {
    messages.push("Label is required");
  }
  
  if(!link.project) {
    messages.push("'project' field is required");
  } else {
    if(!link.project.resource) {
      messages.push("'project.resource' field is required");
    }
  }
  
  return messages;
};

var isRolesValid = function(role) {
  var messages = [];
  
  if(!role.title || role.title === '') {
    messages.push("Role title is required");
  }
  
  if(!role.abbreviation || role.abbreviation === '') {
    messages.push("Role abbreviation is required");
  }
  
  return messages;
};

var isVacationValid = function(vacation) {
  var messages = [];
  
  if(!vacation.person) {
    messages.push("'person' field is required");
  } else {
    if(!vacation.person.resource) {
      messages.push("'person.resource' field is required");
    }
  }
  
  if(!vacation.vacationManager) {
    messages.push("'vacationManager' field is required");
  } else {
    if(!vacation.vacationManager.resource) {
      messages.push("'vacationManager.resource' field is required");
    }
  }
  
  if(!vacation.type || vacation.type === '') {
    messages.push("Out-of-office entry should have a type.");
  }
  
  if(!vacation.status || vacation.status === '') {
    messages.push("Out-of-office entry should have a status.");
  }
  
  if(!vacation.startDate) {
    messages.push("Out-of-office entry should have a start date.");
  } else {
    if(!isDate(vacation.startDate)) {
      messages.push("Start date is not a Date");
    }
  }
  
  if(!vacation.endDate) {
    messages.push("Out-of-office entry should have a end date.");
  } else {
    if(!isDate(vacation.endDate)) {
      messages.push("End date is not a Date");
    }
  }
  
  return messages;
};

var isNotificationValid = function(notification) {
  var messages = [];
  
  if(!notification.person) {
    messages.push("'person' field is required");
  } else {
    if(!notification.person.resource) {
      messages.push("'person.resource' field is required");
    }
  }
  
  if(!notification.type || notification.type === '') {
    messages.push("Notification entry should have a type.");
  }
  
  if(!notification.text || notification.text === '') {
    messages.push("Notification entry should have a text.");
  }
  
  return messages;
};

var isConfigurationValid = function(obj) {
  var messages = [];
  
  if(!obj.config) {
    messages.push("'config' field is required");
  }
  
  if(!obj.properties || !obj.properties.length) {
    messages.push("'properties' field is required");
  } else {
    for(var i = 0; i < obj.properties.length; i++) {
      var property = obj.properties[i];
      if(!property.name) {
        messages.push("'properties.name' field is required");
        return messages;
      }
      if(!property.value) {
        messages.push("'properties.value' field is required");
        return messages;
      }
    }
  }
  
  return messages;
};

var isSkillValid = function(skill) {
  var messages = [];
  
  return messages;
};

var isTaskValid = function(task) {
  var messages = [];
  
  if(!task.name) {
    messages.push("Name is required");
  }
  
  return messages;
};

var isDate = function(date) {
  return (new Date(date) !== "Invalid Date" && !isNaN(new Date(date)) );
};

module.exports.validate = validate;
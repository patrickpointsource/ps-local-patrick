'use strict';

var dataAccess = require('../data/dataAccess');
var moment = require('moment');
var _ = require('underscore');
var util = require("../util/util");
var people = require("../controllers/people");
var Q = require('q');
var assignmentsService = require("../controllers/assignments");
//12/11/14 MM var validation = require( '../data/validation.js' );

module.exports.listVacations = function(callback) {
    dataAccess.listVacations(function(err, body){
        if (err) {
            console.log(err);
            callback('error loading vacations', null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.listVacationsByPerson = function(personResource, callback) {
    dataAccess.listVacationsByPerson(personResource, function(err, body){
        if (err) {
            console.log(err);
            callback("error loading vacations by person " + personResource, null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.listVacationsByPeriod = function(people, startDate, endDate, fields, callback) {
    dataAccess.listVacationsByPeriod(people, startDate, endDate, fields, function(err, body){
        if (err) {
            console.log(err);
            callback("error loading vacations by period", null);
        } else {
            callback(null, body);
        }
    });
};


module.exports.listAllEmployeeVacations = function(statuses, startDate, endDate, persons, fields, callback) {
    dataAccess.listAllEmployeeVacations(statuses, startDate, endDate, persons,  fields, function(err, body){
        if (err) {
            console.log(err);
            callback("error loading requests", null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.listRequests = function(manager, statuses, startDate, endDate, showSubordinateManagerRequests, fields, callback) {
	if (showSubordinateManagerRequests) {
		dataAccess.listPeople(null, function (err, people) {
			if (err) {
				return callback("error loading requests", null);
			}
			
			getSubordinateManagers([manager], people.members, function (managerResources) {
				managerResources.push(manager);
	            console.log("managerResourses : " + JSON.stringify(managerResources));
				listRequestsByManagers(managerResources, statuses, startDate, endDate, fields, callback);
			})
		});
	}
	else {
		listRequestsByManagers(manager, statuses, startDate, endDate, fields, callback);
	}
};


var getSubordinateManagers = function (managers, people, callback ) {
	findSubordinateManagers(managers, people, [], callback);
}

var findSubordinateManagers = function (initialManagerResources, people, result, callback ) {
    var subordinateManagers = _.filter(people, function(person) {
    	var check =  _.find(initialManagerResources, function(manager){ 
    		if (person.manager && person.manager.resource == manager) {
    			return true;
    		}
            return false;
        });
    	if (check) {
    		return true;
    	}
    	return false;
    });
    if (subordinateManagers && subordinateManagers.length > 0) {
    	var managerResources = _.map(subordinateManagers, function(person) {
            return person.resource;
        });
    	for (var i in managerResources) {
        	result.push(managerResources[i]);
    	}
       	findSubordinateManagers(managerResources, people, result, callback);
    } else {
    	callback(result);
    }
};

var listRequestsByManagers = function(managers, statuses, startDate, endDate, fields, callback) {
    dataAccess.listRequests(managers, statuses, startDate, endDate, fields, function(err, body){
        if (err) {
            console.log(err);
            callback("error loading requests", null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.insertVacation = function(obj, callback) {
    
	//12/11/14 MM     var validationMessages = validation.validate(obj, dataAccess.VACATIONS_KEY);
	//12/11/14 MM     if(validationMessages.length > 0) {
	//12/11/14 MM       callback( validationMessages.join(', '), {} );
	//12/11/14 MM       return;
	//12/11/14 MM     }
    
    dataAccess.insertItem(obj._id, obj, dataAccess.VACATIONS_KEY, function(err, body){
        if (err) {
            console.log(err);
            callback('error insert vacation:' + JSON.stringify(err), null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.deleteVacation = function(obj, callback) {
    dataAccess.deleteItem(obj._id, obj._rev, dataAccess.VACATIONS_KEY, function(err, body){
        if (err) {
            console.log(err);
            callback('error delete vacation', null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.getVacation = function(id, callback) {
    dataAccess.getItem(id, function(err, body){
        if (err) {
            console.log(err);
            callback('error get vacation', null);
        } else {
            callback(null, body);
        }
    });
};

var VACATION_PERIODS = ["JAN", "MAY", "SEP"];
var MONTHS_IN_PERIODS = {
    JAN: ["JAN", "FEB", "MAR", "APR"],
    MAY: ["MAY", "JUN", "JUL", "AUG"],
    SEP: ["SEP", "OCT", "NOV", "DEC"]
};
// [["JAN", "FEB", "MAR", "APR"], ["MAY", "JUN", "JUL", "AUG"], ["SEP", "OCT", "NOV", "DEC"]]
var MONTHS = [[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11]];

var monthInPeriod = function (month) {
    if (month < 12 && month > -1) {
        for (var i = 0; i < MONTHS.length; i++) {
            if (MONTHS[i].indexOf(month) > -1) {
                return i;
            }
        }
    }

    return null;
};

var filterVacationsForPeriod = function(period, year, vacations) {
    var startMonth = period * 4;
    var startMoment = moment([year, startMonth, 1, 0, 0, 0, 0]);
    var start = startMoment.format("YYYY-MM-DD");
    var end = startMoment.add(4, 'months').subtract(1, 'days').format("YYYY-MM-DD");

    return _.filter(vacations.members, function(vacation) {
        var startDateInRange = util.inTimeRange(vacation.startDate, start, end, 'days');
        var endDateInRange = util.inTimeRange(vacation.endDate, start, end, 'days');
        
        return startDateInRange || endDateInRange;
    });
};

var DEFAULT_VAC_DAYS = 10;
var calculateDaysLeft = function(entitlements, vacations) {
    var year = moment().year();
    var hoursLeft = DEFAULT_VAC_DAYS * 8;
    if (entitlements) {
        hoursLeft = entitlements * 8;
    }
    _.each(vacations.members, function(vacation) {
        var vacStartMoment = moment(vacation.startDate);
        var vacEndMoment = moment(vacation.endDate);
        if (vacStartMoment.year() == year) {
            var duration = moment.duration(vacEndMoment.diff(vacStartMoment));
            var hoursDiff = duration.asHours();
            if (hoursDiff > 8) {
                hoursDiff = 8;
            }
            if (hoursDiff >= 0) {
                hoursLeft -= hoursDiff;
            }
        }
    });

    return hoursLeft;
};

var PERIOD_NAMES = ["January - April", "May - August", "September - December"];

module.exports.getMyVacations = function (me, callback) {
    var returnedObject = {
        periods: [],
        daysLeft: 0
};

    dataAccess.listVacationsByPerson(me.resource, function (err, vacations) {
        if (err) {
            console.log(err);
            callback("error loading vacations by person " + me.name.fullName, null);
        } else {
            var today = moment();
            var year = today.year();
            var period = monthInPeriod(today.months());
            returnedObject.vacations = vacations.members;
            if (period == 0) {
                returnedObject.periods.push({
                    name: PERIOD_NAMES[2],
                    year: year - 1,
                    vacations: filterVacationsForPeriod(2, year - 1, vacations)
                });
                returnedObject.periods.push({
                    name: PERIOD_NAMES[0],
                    year: year,
                    vacations: filterVacationsForPeriod(0, year, vacations)
                });
                returnedObject.periods.push({
                    name: PERIOD_NAMES[1],
                    year: year,
                    vacations: filterVacationsForPeriod(1, year, vacations)
                });
            }
            if (period == 1) {
                returnedObject.periods.push({
                    name: PERIOD_NAMES[0],
                    year: year - 1,
                    vacations: filterVacationsForPeriod(0, year - 1, vacations)
                });
                returnedObject.periods.push({
                    name: PERIOD_NAMES[1],
                    year: year,
                    vacations: filterVacationsForPeriod(1, year, vacations)
                });
                returnedObject.periods.push({
                    name: PERIOD_NAMES[2],
                    year: year,
                    vacations: filterVacationsForPeriod(2, year, vacations)
                });
            }
            if (period == 2) {
                returnedObject.periods.push({
                    name: PERIOD_NAMES[1],
                    year: year,
                    vacations: filterVacationsForPeriod(1, year, vacations)
                });
                returnedObject.periods.push({
                    name: PERIOD_NAMES[2],
                    year: year,
                    vacations: filterVacationsForPeriod(2, year, vacations)
                });
                returnedObject.periods.push({
                    name: PERIOD_NAMES[0],
                    year: year + 1,
                    vacations: filterVacationsForPeriod(0, year + 1, vacations)
                });
            }
            
            returnedObject.daysLeft = (calculateDaysLeft(me.vacationCapacity, vacations) / 8).toFixed(1);

            callback(null, returnedObject);
        }
    });
};

module.exports.getMyRequests = function(me, callback) {
    var returnedObjects = [];

    dataAccess.listRequests(me.resource, "Pending", null, null, null, function (err, result) {
        if (err) {
            callback(err, null);
        } else {
            var promises = [];
            _.each(result.members, function (vacation) {
                var promise = getReturnedObject(vacation);
                promise.then(function (returnedObject) {
                    returnedObjects.push(returnedObject);
                });

                promises.push(promise);
            });

            Q.all(promises).then(function() {
                callback(null, returnedObjects);
            });
        }
    });
};

var getReturnedObject = function(vacation) {
    var deffered = Q.defer();
    var returnedObject = { request: vacation };
    people.getPersonByResource(vacation.person.resource, function (personErr, person) {
        if (!personErr) {
            returnedObject.request.person = person;
            assignmentsService.listAssignmentsByPersonResource(person.about, function (err, assignments) {
                if (!err) {
                    returnedObject.projects = _.map(assignments, function(assignment) {
                        return assignment.project;
                    });

                    deffered.resolve(returnedObject);
                } else {
                    deffered.reject(personErr);
                }
                
            });
        } else {
            deffered.reject(personErr);
        }
    });

    return deffered.promise;
};
'use strict';

var dataAccess = require('../data/dataAccess');
var util = require('../util/util');
var emailSender = require('../util/emailSender');
var smtpHelper = require('../util/smtpHelper');
//12/11/14 MM var validation = require( '../data/validation.js' );
var configProperties = require('../../config.json');
var os = require('os');
var validation = require( '../data/validation.js' );
var configProperties = require('../../config.json');
var moment = require('moment');
var Q = require('q');
var _ = require('underscore');

var OLD_TYPES = {
    Vacation: "Vacation",
    VacationCancel: "VacationCancel"
};

var TYPES = {
    VACATION_PENDING: "ooo-pending",
    VACATION_APPROVED: "ooo-approved",
    VACATION_CANCELLED: "ooo-cancelled",
    VACATION_DENIED: "ooo-denied"
};

var VACATION_TYPES = {
    Pending: "Pending",
    Approved: "Approved",
    Denied: "Denied",
    Cancelled: "Cancelled"
};


module.exports.listNotifications = function( callback) {
    dataAccess.listNotifications( function(err, body){
        if (err) {
            console.log(err);
            callback('error loading notifications', null);
        } else {
            callback(null, body);
        }
    });
};

// list notifications by person, for ooo notifications insert actual vacation obj into notification obj
module.exports.listNotificationsByPerson = function(person, fields, callback) {
    dataAccess.listNotificationsByPerson(person, fields, function(err, body){
        if (err) {
            console.log(err);
            callback('error loading notifications by person', null);
        } else {
            var promises = [];
            var notifications = [];
            _.each(body.members, function(notification) {
                if (isOOONotification(notification)) {
                    var promise = resolveVacation(notification).then(function(resultNotification) {
                        notifications.push(resultNotification);
                    });

                    promises.push(promise);
                } else {
                    notifications.push(notification);
                }
            });
            
            if (promises.length > 0) {
                Q.all(promises).then(function(results) {
                    callback(null, notifications);
                }, function (err) {
                    console.log("Error resolving vacation inside notification: " + err);
                    callback(null, notifications);
                });
            } else {
                callback(null, notifications);
            }
        }
    });
};

var resolveVacation = function(notification) {
    var deferred = Q.defer();
    if (!notification || !notification.details) {
        deferred.reject("Error resolving vacation for notification.");
        return deferred.promise;
    }

    var id = "";
    if (notification.details && notification.details.resource) {
        id = util.getId(notification.details.resource);
    }
    
    if (id) {
        dataAccess.getItem(id, function(err, vacation) {
            if (!err) {
                notification.details = vacation;
                deferred.resolve(notification);
            } else {
                if (err.message == "deleted") {
                    dataAccess.deleteItem(notification._id, notification.rev, dataAccess.NOTIFICATIONS_KEY, function(err, body) {
                        deferred.reject(err);
                    });
                } else {
                    deferred.reject(err);
                }
            }
        });
    } else {
        deferred.reject("Error resolving vacation for notification.");
    }

    return deferred.promise;
};

module.exports.insertNotification = function(obj, callback) {
    
	//12/11/14 MM     var validationMessages = validation.validate(obj, dataAccess.NOTIFICATIONS_KEY);
	//12/11/14 MM     if(validationMessages.length > 0) {
	//12/11/14 MM       callback( validationMessages.join(', '), {} );
	//12/11/14 MM     }
    
    dataAccess.insertItem(obj._id, obj, dataAccess.NOTIFICATIONS_KEY, function(err, body){
        if (err) {
            console.log(err);
            callback('error insert notification', null);
        } else {
          sendEmailTo(obj);
          callback(null, body);
        }
    });
};

module.exports.deleteNotification = function(obj, callback) {
    dataAccess.deleteItem(obj._id, obj._rev, dataAccess.NOTIFICATIONS_KEY, function(err, body){
        if (err) {
            console.log(err);
            callback('error delete notification', null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.getNotification = function(id, callback) {
    dataAccess.getItem(id, function(err, body){
        if (err) {
            console.log(err);
            callback('error get notification', null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.constructVacationNotification = function(vacation) {
    var notification = {};

    notification.details = { resource: "vacations/" + vacation.id };

    if (vacation.status == VACATION_TYPES.Pending) {
        notification.type = TYPES.VACATION_PENDING;
        notification.person = { resource: vacation.vacationManager.resource };
        notification.header = "Pending out of office request";
    }

    if (vacation.status == VACATION_TYPES.Cancelled) {
        notification.type = TYPES.VACATION_CANCELLED;
        notification.person = { resource: vacation.vacationManager.resource };
        notification.header = "Out of office request cancelled";
    }

    if (vacation.status == VACATION_TYPES.Approved) {
        notification.type = TYPES.VACATION_APPROVED;
        notification.person = { resource: vacation.person.resource };
        notification.header = "Out of office request approved!";
    }

    if (vacation.status == VACATION_TYPES.Denied) {
        notification.type = TYPES.VACATION_DENIED;
        notification.person = { resource: vacation.person.resource };
        notification.header = "Out of office request denied.";
    }

    return notification;
};

var isOOONotification = function(notification) {
    if ((notification.type == TYPES.VACATION_APPROVED ||
        notification.type == TYPES.VACATION_CANCELLED ||
        notification.type == TYPES.VACATION_DENIED ||
        notification.type == TYPES.VACATION_PENDING)&&
        notification.details &&
        notification.details.resource) {
        return true;
    }

    return false;
};

module.exports.isOOONotification = isOOONotification;

var sendEmailTo = function(notification) {
    var userId = util.getId(notification.person.resource);

    dataAccess.getItem(userId, function(err, user) {
        if (!err) {
            if (!notification.details || !notification.details.resource) {
                var msg = "error sending notification email.";
                console.log("error sending notification email.");
                return;
            }
            var vacationId = util.getId(notification.details.resource);
            dataAccess.getItem(vacationId, function(vacErr, vacation) {
                if (!err) {
                    if (user) {
                        // by default email to Manager
                        var personId = util.getId(vacation.person.resource);
                        
                        // if email to subordinate
                        if (notification.type == 'ooo-approved' || notification.type == 'ooo-denied') {
                            personId = util.getId(vacation.vacationManager.resource);
                        }

                        dataAccess.getItem(personId, function(personErr, person) {
                            if (!personErr) {
                                var message = "";
                                if (notification.type == 'ooo-pending' || notification.type == 'ooo-cancelled') {
                                    message = getOutOfOfficeRequestMessageForManager(util.getPersonName(user), util.getPersonName(person), vacation.type, vacation.startDate, vacation.endDate, vacation.description, notification.type);
                                }
                                
                                if (notification.type == 'ooo-approved' || notification.type == 'ooo-denied') {
                                    message = getOutOfOfficeRequestMessageForSubordinate(util.getPersonName(user), util.getPersonName(person), vacation.type, vacation.startDate, vacation.endDate, vacation.description, notification.type);
                                }
                                
                                message += smtpHelper.getServerInformation("NodeJS service", os.hostname(), configProperties.env);
                                message += "<br/><br/>Sincerely Yours, <br/><strong>MasterMind Notice.</strong>";
                                emailSender.sendEmailFromPsapps(
                                    user.mBox, null,
                                    notification.header, message,
                                    function(err, info) {
                                        if (err) {
                                            console.log("error sending email to: ", err);
                                        }

                                        console.log("Email sent. Info: ", info);
                                    });
                            } else {
                                console.log("Error getting person from vacation while sending email: " + vacErr);
                            }
                        });
                        
                    } else {
                        console.log("Cant find user with resource: " + notification.person.resource + " while trying to send an email.");
                    }
                } else {
                    console.log("Error getting vacation while sending email: " + vacErr);
                }

            });

        } else {
            console.log("Error: " + err);
        }
    });
};

var getOutOfOfficeRequestMessageForManager = function (userName, personName, requestType, startDate, endDate, description, notificationType) {
    var result = '';
    
    var requestTypeLabel = (requestType == "Vacation") ? requestType + "days" : requestType;
    var actionNeeded = (requestType == "Customer Travel") ? "none" : "Review and approve or deny";
    var action = "requested";
    if (notificationType == "ooo-cancelled") {
        action = "cancelled";
    }
    
    var result = 
        userName + ",<br/>" +
			"<br/>" + 
			personName + " has " + action + " " + requestTypeLabel + "<br/>" +
			"<br/>" +
			"Further action needed: " + actionNeeded + "<br/>" +
			"<br/>" +
			"Type of request : " + requestType + "<br/>" +
			"From : " + startDate + "<br/>" +
			"Until : " + endDate + "<br/>" +
			"Person : " + personName + "<br/>" +
			"Description : " + description + "<br/>" +
			"<br/>" +
			"Please log on to Mastermind for details by visiting the URL below." + "<br/>" + 
			"https://mastermind.pointsource.com" + "<br/>";
    
    return result;
}

var getOutOfOfficeRequestMessageForSubordinate = function (userName, personName, requestType, startDate, endDate, description, notificationType) {
    var result = '';
    
    var action = "approved";
    if (notificationType == "ooo-denied") {
        action = "denied";
    }
    
    var result = 
        userName + ",<br/>" +
			"<br/>" + 
			personName + " has " + action + " your out of office request" + "<br/>" +
			"<br/>" +
			"<br/>" +
			"Type of request : " + requestType + "<br/>" +
			"From : " + startDate + "<br/>" +
			"Until : " + endDate + "<br/>" +
			"Description : " + description + "<br/>" +
			"<br/>" +
			"Please log on to Mastermind for details by visiting the URL below." + "<br/>" + 
			"https://mastermind.pointsource.com" + "<br/>";
    
    return result;
}
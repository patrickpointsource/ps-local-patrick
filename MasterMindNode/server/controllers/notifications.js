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
                }, function(err) {
                    callback(err, null);
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

    var id = util.getId(notification.details.resource);
    dataAccess.getItem(id, function(err, vacation) {
        if (!err) {
            notification.details = vacation;
            deferred.resolve(notification);
        } else {
            deferred.reject(err);
        }
    });

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
    if (notification.type == TYPES.VACATION_APPROVED ||
        notification.type == TYPES.VACATION_CANCELLED ||
        notification.type == TYPES.VACATION_DENIED ||
        notification.type == TYPES.VACATION_PENDING) {
        return true;
    }

    return false;
};

module.exports.isOOONotification = isOOONotification;

var sendEmailTo = function(notification) {
  util.getIDfromResource(notification.person.resource, function (err, userId){
	  if (err) {
          console.log("error getting id : ", err);
	  }
	  else {
		  dataAccess.getItem(userId, function(err, user) {
			    if(!err) {
			      if(user) {
			        var message = "<h3>" + notification.header + "</h3><br/><br/>"  + notification.text + "<br/>";
			        message += smtpHelper.getServerInformation("NodeJS service", os.hostname(), configProperties.env);
			        message += "<br/><br/>Sincerely Yours, <br/><strong>MasterMind Notice.</strong>";
			        emailSender.sendEmailFromPsapps(
			                    user.mBox, null,
			                    notification.header, message, 
			        function(err, info) {
			          if(err) {
			            console.log("error sending email to: ", err);
			          }
			      
			          console.log("Email sent. Info: ", info);
			        });
			      } else {
			        console.log("Cant find user with resource: " + notification.person.resource + " while trying to send an email.");
			      }
			    } else {
			      console.log("Error: " + err);
			    }
		  });		  
	  }
  });
};
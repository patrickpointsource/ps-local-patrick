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
var os = require('os');


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

module.exports.listNotificationsByPerson = function(person, fields, callback) {
    dataAccess.listNotificationsByPerson(person, fields, function(err, body){
        if (err) {
            console.log(err);
            callback('error loading notifications by person', null);
        } else {
            callback(null, body);
        }
    });
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

var sendEmailTo = function(notification) {
  var user;
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
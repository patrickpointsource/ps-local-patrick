'use strict';

var dataAccess = require('../data/dataAccess');

var emailSender = require('../util/emailSender');

var validation = require( '../data/validation.js' );

module.exports.listNotifications = function(q, callback) {
    dataAccess.listNotifications(q, function(err, body){
        if (err) {
            console.log(err);
            callback('error loading notifications', null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.listNotificationsByPerson = function(person, callback) {
    dataAccess.listNotificationsByPerson(person, function(err, body){
        if (err) {
            console.log(err);
            callback('error loading notifications by person', null);
        } else {
            callback(null, body);
        }
    });
};

module.exports.insertNotification = function(obj, callback) {
    
    var validationMessages = validation.validate(obj, dataAccess.NOTIFICATIONS_KEY);
    if(validationMessages.length > 0) {
      callback( validationMessages.join(', '), {} );
      return;
    }
    
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
  var query = {
    resource: notification.person.resource
  };
  
  var user;
  
  dataAccess.listPeople(query, function(err, result) {
    if(!err) {
      if(result.members.length > 0) {
        user = result.members[0];
        
        emailSender.sendEmailFromPsapps(
                    user.mBox, null,
                    notification.header, 
                    '<h3>' + notification.header + '</h3><br/><br/>'  + notification.text + '<br/><br/>' + 'Sincerely Yours, <br/><strong>MasterMind Notice.</strong>', 
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
};
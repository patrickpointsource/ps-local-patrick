var later = require('later');
var dataAccess = require('../data/dataAccess');
var util = require('../util/util');
var smtpHelper = require('../util/smtpHelper');
var emailSender = require('../util/emailSender');
var _ = require( 'underscore' );
var os = require('os');
var configProperties = require('../../config.json');

// Configuration properties
var REMINDER_ACTIVE = "reminder.active";
var REMINDER_DEBUG = "reminder.debug";
var REMINDER_NOTIFICATION_LIST = "reminder.debug.notification.list";
var REMINDER_INTERESTED_PARTIES = "reminder.interested.parties";

// Schedulers should be in UTC format
var INITIAL_CRON_SCHEDULE = "00 30 14 * * 1-5";
var SECOND_CRON_SCHEDULE = "00 30 15 * * 1-5";

module.exports.initialize = function(callback) {
    console.log("initializing reminders");
    later.date.UTC();
    var initCronSched = later.parse.cron(INITIAL_CRON_SCHEDULE, true);
    var secondCronSched = later.parse.cron(SECOND_CRON_SCHEDULE, true);
    var initialEmailReminder = later.setInterval( function() {
    	emailReminderJob(false);
    }, initCronSched);
    var secondEmailReminder = later.setInterval( function() {
    	emailReminderJob(true);
    }, secondCronSched);
}


/**
 * Executes email reminder job ( if withInterestedParties set to 'true' REMINDER_INTERESTED_PARTIES will be used in CC)
 * 
 * @param withInterestedParties
 */

function emailReminderJob(withInterestedParties) {
    // gets configuration properties
    dataAccess.listConfiguration(null, function (err, configuration) {
	    if (!err) {
	    	var props = decodeProperties(configuration.members[0].properties);
	    	var isActive = getPropertyValueByName(REMINDER_ACTIVE, props) == "true";
	    	var isDebug = getPropertyValueByName(REMINDER_DEBUG, props) == "true";
	    	var notificationList = getPropertyValueByName(REMINDER_NOTIFICATION_LIST, props);
	    	var ccList = (withInterestedParties) ? getPropertyValueByName(REMINDER_INTERESTED_PARTIES, props) : null;

	    	console.log("isActive : " + isActive);
			console.log("isDebug : " + isDebug);
			console.log("ccList : " + JSON.stringify(ccList));
			console.log("notificationList : " + JSON.stringify(notificationList));
			
			if (!isActive && !isDebug) {
				return;
			}
			
			// gets active people
	        dataAccess.listPeopleByIsActiveFlag(true, null, function (err, people) {
	        	if (err) {
					console.log("error while getting active people : " + err);
	        	}
	        	else {
	        		var count;
	        		var successful;
	        		var failed;
	        		
	        		// gets non-billable roles
	        		dataAccess.listNonBillableRoles(function (err, nonBillableRoles) {
	    	        	if (err) {
	    					console.log("error while getting non-billable roles : " + err);
	    	        	}
	    	        	else {
	        				_.each(people.members, function(person) {
								
	        					var givenName = ( person.name.givenName) ? person.name.givenName : person.accounts[0].name.givenName;
	        					var fullName = ( person.name.fullName) ? person.name.fullName : person.accounts[0].name.fullName;
	        					var mBox = person.mBox;

	        					console.log("name : " + fullName);
	        					console.log(fullName + "'s mail : " + mBox);

	        					// checks role of each person
	        					checkRole(person, nonBillableRoles.members, function (checked) {
		        					console.log("check role of " + fullName + " (whether should it be sent) : " + checked);
	        						if (checked) {
	        							var date = util.getFormattedDate(util.getPreviousWorkingDay());

	        							// checks whether person had a vacation 
	        							dataAccess.listVacationsByPeriod(person.resource, util.getPreviousWorkingDay(), util.getPreviousWorkingDay(), null, function (err, vacations) {

	    		        					console.log(fullName + "'s vacation : " + JSON.stringify(vacations));
	    		        					if (err) {
		    		        					console.log("error while getting vacations of " + fullName + " : " + err);
	    		        					}
	    		        					else {
	        									if (!vacations || vacations.members.length == 0) {

	        										// checks filled hours of person
	        										dataAccess.listHoursByPersonAndDates(person.resource, 
	        												util.getPreviousWorkingDay(), 
	        													util.getPreviousWorkingDay(), function (err, hours) {

	        	    		        					console.log(fullName + "'s hours : " + JSON.stringify(hours));
	        	    		        					if (err) {
	        		    		        					console.log("error while getting hours of " + fullName + " : " + err);
	        	    		        					}
	        	    		        					else {
	            											if (!hours || hours.members.length == 0) {
            						        					

            						        					// send email reminders
	            												if (mBox && givenName && isActive) {
	            													count++;
		            												console.log("mail should be sent to " + fullName);

		            												var title = "Reminder for " + fullName;

	            						        					console.log(fullName + "'s mail title : " + title);

	            						        					var message = smtpHelper.getReminderMessage(givenName, "Node.JS service", os.hostname(), configProperties.env);

	        	        		    	        					emailSender.sendEmailFromPsapps(mBox, ccList, title, message, function (err, info) {
   	            						        						if(err) {
   	            						        							console.log("error sending email to: ", err);
   	            						        							failed++;
   	            						        						} else {
   	            						        							console.log("Email sent. Info: ", info);
   	            						        							successful++;
   	            						        						}
   	            						        					});
 	            												}
	            												
	            												//send debug email reminders
	            												if (givenName && isDebug && notificationList) {
		            												var title = "Reminder for " + fullName + " (Limited Notification List)";
		            	
		            												console.log("debug mail should be sent to " + notificationList);
	            						        					console.log("debug mail title : " + title);

	            						        					var message = smtpHelper.getReminderDebugMessage(givenName, mBox, ccList, "Node.JS service", os.hostname(), configProperties.env);
	            						        					emailSender.sendEmailFromPsapps(notificationList, null, title, message, function (err, info) {
	            						        						if(err) {
	            						        							console.log("error sending email to: ", err);
	            						        						} else {
	            						        							console.log("Email sent. Info: ", info);
	            						        						}
	            						        					});
	            						        					
	            												}
	            											}
	        											}
	        										});

	        									}
	        								}
	        							});
	        						}
	        					});
	        				});
	        				
	        			}
	        		});

	        		console.log("Mails to send : " + count);
	        		console.log("Mails that sent successful : " + successful);
	        		console.log("Mails with SMTP failures : " + failed);
	        		
	        	
	        	}
	        	
	        
	        });

	    	
	    }
    });
    
    

}

var getPropertyValueByName = function (propertyName, properties) {
	var res;
	_.each(properties, function(property) {
		if (property.name == propertyName) {
			res = property.value;
		}
	});
	return res;
}

var decodeProperties = function (properties) {
	for (var propertyIndex in properties) {
		var property = properties[propertyIndex];
		var regex = new RegExp("%2E", 'g');
		property.name = property.name.replace(regex, ".");
		property.value = property.value.replace(regex, ".");
	}
	return properties;
};


function checkRole(person, nonBillableRoles, callback) {
	if (person.primaryRole &&  
		! _.find(nonBillableRoles, 
			function (role) {
				return role.resource == person.primaryRole.resource;
			})
		) 
	{
		callback (true);
	} else {
		callback (false);
	}
}
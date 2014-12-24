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
//var INITIAL_CRON_SCHEDULE = "00 13 17 * * 1-5";
//var SECOND_CRON_SCHEDULE = "00 47 16 * * 1-5";
var ONE_HOUR = 60 * 60 * 1000;

var reminderJobInprogress = false;
var firstRoundStarted = false;
var secondRoundStarted = false;

module.exports.initialize = function(callback) {
    console.log(getFormattedTime() + " initializing reminders");
    later.date.UTC();
    var initCronSched = later.parse.cron(INITIAL_CRON_SCHEDULE, true);
    var secondCronSched = later.parse.cron(SECOND_CRON_SCHEDULE, true);
    
    console.log('reminders:init:' + initCronSched.toString())
    var initialEmailReminder = later.setInterval( function() {
    	console.log('reminders:1');
    	emailReminderJob(false);
    }, initCronSched);
    var secondEmailReminder = later.setInterval( function() {
    	console.log('reminders:2');
    	emailReminderJob(true);
    }, secondCronSched);
    
    //setTimeout(function() {
    //	emailReminderJob(false);
    //}, 60 * 1000);
}

var getFormattedTime = function() {
	var now = new Date();
	var result = '';
	
	return '[' +  ('0' + now.getHours()).slice(-2) + ':' + ('0' + now.getMinutes()).slice(-2) + ']';
	
}
/**
 * Executes email reminder job ( if withInterestedParties set to 'true' REMINDER_INTERESTED_PARTIES will be used in CC)
 * 
 * @param withInterestedParties
 */

function emailReminderJob(withInterestedParties) {
	
	if (reminderJobInprogress) {
		setTimeout(function() {
			console.log(getFormattedTime() + ' waited:emailReminderJob\r\n');
			emailReminderJob(withInterestedParties);
		}, 60 * 1000);
		
		return;
	}
	
	if (withInterestedParties && secondRoundStarted){
		console.log(getFormattedTime() + ' emailReminderJob:prevent from starting again:' + withInterestedParties + ':' + (new Date()).toTimeString());
		return;
	}
	
	if (!withInterestedParties && firstRoundStarted){
		console.log(getFormattedTime() + ' emailReminderJob:prevent from starting again:' + withInterestedParties + ':' + (new Date()).toTimeString());
		
		return;
	}
	
	if (withInterestedParties)
		secondRoundStarted = true;
	else
		firstRoundStarted = true;
	
	console.log(getFormattedTime() + ' emailReminderJob:' + withInterestedParties + ':' + (new Date()).toTimeString());
	
	reminderJobInprogress = true;
	
	var emailReminders = [];
	var emailNotifications = [];
	var remindersProcessed = false;
	var postponedCalled = false;
	
	var postponedCalls = [];
	var processedPeopleMap = {};
	var countProcessed = 0;
	
	var callPostponed = function() {
    	if (postponedCalled)
    		return;
    	
    	postponedCalled = true;
    	
    	var countProcessedPostponed = 0;
    	
    	var postponedCb = function() {
    		console.log('callPostponed:' + countProcessedPostponed);
    		
    		countProcessedPostponed += 1;
    		
    		if (countProcessedPostponed < postponedCalls.length && postponedCalls[countProcessedPostponed])
    			setTimeout(function() {
    				postponedCalls[countProcessedPostponed](postponedCb)
				}, 0);
    	}
    	
    	postponedCalls[0](postponedCb);
    };
    
    var getCountProcessed = function() {
    	var res = 0;
    	
    	for (var prop in processedPeopleMap ) {
			if (prop && prop.toLowerCase().indexOf('people') > -1 && processedPeopleMap[prop])
				res += 1;
		}
    	
    	//console.log('getCountProcessed:' + res);
    	
    	return res;
    };
    
	var isAllProcessed = function() {
		var res = true;
		var countProcessedPeople = 0;
		var unprocessed = [];
		
		for (var prop in processedPeopleMap ) {
			if (prop && prop.toLowerCase().indexOf('people') > -1)
				res = res && processedPeopleMap[prop];
			
			if (processedPeopleMap[prop])
				countProcessedPeople += 1;
			else
				unprocessed.push(prop)
		}
		
		//console.log('isAllProcessed:' + countProcessedPeople + ':' + res + ':' + (unprocessed.length <= 3 ? unprocessed.join(', '): ''));
		
		return res;
	}
		
    var processReminders = function() {
    	console.log('processReminders:' + remindersProcessed);
    	
    	if (!remindersProcessed) {
    		
    		remindersProcessed = true;
    		
    		emailReminders = _.uniq( emailReminders, function( em ) {
    			return em.mBox;
    		} );
    	    
    	    console.log('reminder:emailReminders:' + JSON.stringify(emailReminders));
    	    
    	    var emailReminderCounter = 0;
    	    
    	    var emailReminderCb = function() {
    	    	
    	    	
    	    	if (emailReminderCounter < emailReminders.length) {
    	    		emailSender.sendEmailFromPsapps(emailReminders[emailReminderCounter].mBox, emailReminders[emailReminderCounter].ccList, 
    	    				emailReminders[emailReminderCounter].title, emailReminders[emailReminderCounter].message, 
	        			_.bind(function (err, info) {
	        				if(err) {
	        					console.log("error sending email to: " + this.notification.mBox + ':' + err);
	        				} else {
	        					console.log("Email sent. to: " + this.notification.mBox);
	        				}
	        				emailReminderCounter += 1;
	        				
	        				setTimeout(emailReminderCb, 10);
	        			}, {notification: emailReminders[emailReminderCounter]}));    		
    	    	}
    	    };
    	    
    	    emailReminderCb();
    	    
    	    /*
    	    for (var i = 0; i < emailReminders.length; i ++) {
    	    	emailSender.sendEmailFromPsapps(emailReminders[i].mBox, emailReminders[i].ccList, emailReminders[i].title, emailReminders[i].message, 
    			_.bind(function (err, info) {
    				if(err) {
    					console.log("error sending email to: " + this.notification.mBox + ':' + err);
    				} else {
    					console.log("Email sent. to: " + this.notification.mBox + ':' + info);
    				}
    			}, {notification: emailReminders[i]}));
    	    }
    	    */
    	    emailNotifications = _.uniq( emailNotifications, function( em ) {
    			return em.mBox;
    		} );
    	    
    	    console.log('reminder:emailNotifications:' + JSON.stringify(emailNotifications));
    	    
    	    var emailCounter = 0;
    	    
    	    var emailNotifCb = function() {
    	    	
    	    	
    	    	if (emailCounter < emailNotifications.length) {
    	    		emailSender.sendEmailFromPsapps(emailNotifications[emailCounter].notificationList, null, 
    	    				emailNotifications[emailCounter].title, emailNotifications[emailCounter].message, 
	        			_.bind(function (err, info) {
	        				if(err) {
	        					console.log("error sending email to: " + this.notification.mBox + ':' + err);
	        				} else {
	        					console.log("Email sent. to: " + this.notification.mBox);
	        				}
	        				
	        				emailCounter += 1;
	        				
	        				setTimeout(emailNotifCb, 10);
	        				
	        			}, {notification: emailNotifications[emailCounter]}));	    		
    	    	} else {
    	    		reminderJobInprogress = false;
    	    		console.log('processReminders:processed:' +  emailReminders.length + ':' + emailNotifications.length);
    	    		
    	    		//reset in 4 hours
    	    		if (withInterestedParties)
	    	    		setTimeout(function() {
	    	    			secondRoundStarted = false;
	    	    			firstRoundStarted = false;
	    	    		}, 4 * 60 * 60 * 1000);
    	    			
    	    	}
    	    };
    	    
    	    emailNotifCb();
    	    
    	    
    	    
    	    
    	    
    	}
    } 
    
    // gets configuration properties
    dataAccess.listConfiguration(null, _.bind(function (err, configuration) {
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
	        dataAccess.listPeopleByIsActiveFlag(true, null, _.bind(function (err, people) {
	        	if (!err) {
	        		
	        		// init map of processed people
	        		for (var k = 0; k < people.members.length; k ++)
	        			processedPeopleMap[ people.members[k].resource ] = false;
	        		
	        		//var counter = 0;
	        		
	        		//console.log('listPeopleByIsActiveFlag:' + counter);
	        		
	        		// gets non-billable roles
	        		dataAccess.listNonBillableRoles(_.bind(function (err, nonBillableRoles) {
	        			if (!err) {
	        				_.each(people.members, _.bind(function(person) {
	        					
	        					//counter += 1;
	        					
	        					//console.log('before:checkRole:' + counter);
	        					
	        					// checks role of each person
	        					checkRole(person, nonBillableRoles.members, _.bind(function (checked) {
		        					var mBox = person.mBox;
		        					
		        					//console.log('inside:checkRole:' + counter + ':' +  person.mBox);
		        					//console.log('inside:checkRole:2:' + checked + ':' + (isAllProcessed ? 'true': 'false') 
	        						//			+ ':' + (processReminders ? 'true': 'false') + ':' + (callPostponed ? 'true': 'false'));
		        					
	        						if (checked) {
	        							var previousWorkingDate = util.getFormattedDate(util.getPreviousWorkingDay());

	        							// checks whether person had a vacation 
	        							dataAccess.listVacationsByPeriod(person.resource, previousWorkingDate, 
	        									util.getFormattedDate(new Date(util.getPreviousWorkingDay().getTime() + 24 * ONE_HOUR)), null, 
	        							_.bind(function (err, vacations) {

	        								if (!err) {
	        									if (!vacations || vacations.members.length == 0) {

	        										var entry = _.bind(function(cb) {
	        											
	        										
		        										// checks filled hours of person
		        										dataAccess.listHoursByPersonAndDates(this.person.resource, 
		        												previousWorkingDate, 
		        												previousWorkingDate, 
	    												_.bind(function (err, hours) {
	
		        											if (!err) {
		            											if (!hours || hours.members.length == 0) {
	            						        					
		            												var givenName = ( this.person.name.givenName) ? this.person.name.givenName : this.person.accounts[0].name.givenName;
	            						        					var fullName = ( this.person.name.fullName) ? this.person.name.fullName : this.person.accounts[0].name.fullName;
	        	        		    	        					var mBox = this.person.mBox;
	        	        		    	        					
	            						        					// send email reminders
		            												if (mBox && givenName && isActive) {
		            						        					var title = "Reminder for " + fullName;
	
		            						        					var message = smtpHelper.getReminderMessage(givenName, "Node.JS service", os.hostname(), configProperties.env);
		            						        					
		            						        					this.emailReminders.push({
		            						        						mBox: mBox,
		            						        						ccList: ccList,
		            						        						title: title,
		            						        						message: message
		            						        					});
		            						        					/*
		        	        		    	        					emailSender.sendEmailFromPsapps(mBox, ccList, title, message, function (err, info) {
	   	            						        						if(err) {
	   	            						        							console.log("error sending email to: ", err);
	   	            						        						} else {
	   	            						        							console.log("Email sent. Info: ", info);
	   	            						        						}
	   	            						        					});
	   	            						        					*/
	 	            												}
		            												
		            												//send debug email reminders
		            												if (givenName && isDebug && notificationList) {
		            						        					var title = "Reminder for " + fullName + " (Limited Notification List)";
		            						        					var message = smtpHelper.getReminderDebugMessage(givenName, mBox, ccList, "Node.JS service", os.hostname(), configProperties.env);
		            						        					
		            						        					this.emailNotifications.push({
		            						        						notificationList: notificationList,
		            						        						title: title,
		            						        						message: message,
		            						        						mBox: mBox
		            						        					});
		            						        					/*
		            						        					emailSender.sendEmailFromPsapps(notificationList, null, title, message, function (err, info) {
		            						        						if(err) {
		            						        							console.log("error sending email to: ", err);
		            						        						} else {
		            						        							console.log("Email sent. Info: ", info);
		            						        						}
		            						        					});*/
		            						        					
		            												}
		            											}
		        											} else
		        												console.log('emailReminderJob:error:hours:' + err);
		        											
		    		    	        						this.processedPeopleMap[this.person.resource] = true;
		        											
		        											if (this.isAllProcessed())
		        												this.processReminders();
		        											
		        											if (cb)
		        												cb();
		        										}, {
		        											person: this.person, 
		        											emailNotifications: this.emailNotifications, 
		        											emailReminders: this.emailReminders,
		        											processedPeopleMap: this.processedPeopleMap,
		        											isAllProcessed: this.isAllProcessed,
		        	    	        						getCountProcessed: this.getCountProcessed,
		        	    	        						callPostponed: this.callPostponed,
		        	    	        						processReminders: this.processReminders
	        											}));
	        										
	        										},{
	        											person: this.person, 
	        											emailNotifications: emailNotifications, 
	        											emailReminders: emailReminders,
	        											processedPeopleMap: processedPeopleMap,
	        											isAllProcessed: this.isAllProcessed,
	        	    	        						getCountProcessed: this.getCountProcessed,
	        	    	        						callPostponed: this.callPostponed,
	        	    	        						processReminders: this.processReminders
        											});	
	        										
	        										postponedCalls.push(entry);
	        										
	        										
	        									} else 
	        										processedPeopleMap[this.person.resource] = true ;
	        										
	        									//console.log('inside:vacations:' + (this.getCountProcessed() + postponedCalls.length) + 
	        									//		':postponed=' + postponedCalls.length + ':processed:' + this.getCountProcessed());
	        									
		    	        						if ((this.getCountProcessed() + postponedCalls.length) == people.members.length)
        											this.callPostponed();
		    	        						
		    	        						if (this.isAllProcessed())
    												this.processReminders();
    												
	        								} else {
	    	        							processedPeopleMap[this.person.resource] = true;
	    	        							console.log('emailReminderJob:error:vacations:' + err);
	        								}
	    	        							
    	        							if (this.isAllProcessed())
												this.processReminders();
    	        							
    	        							if ((this.getCountProcessed() + postponedCalls.length) == people.members.length)
    											this.callPostponed();
    	        							
	        							}, {
	        								person: this.person,
	        								isAllProcessed: this.isAllProcessed,
	    	        						getCountProcessed: this.getCountProcessed,
	    	        						callPostponed: this.callPostponed,
	    	        						processReminders: this.processReminders,
	    	        						emailNotifications: this.emailNotifications, 
	    									emailReminders: this.emailReminders,
	    									processedPeopleMap: this.processedPeopleMap
        								}));
	        						} else 
	        							processedPeopleMap[this.person.resource] = true;
	        						
	        						//console.log('checkRole:' + this.person + ':' + (isAllProcessed ? 'true': 'false') 
	        						//			+ ':' + (processReminders ? 'true': 'false') + ':' + (callPostponed ? 'true': 'false'));
	        						
	        						if (this.isAllProcessed())
										this.processReminders();
	        						
	        						if ((this.getCountProcessed() + postponedCalls.length) == people.members.length)
										this.callPostponed();
	        						
	        					}, {
	        						person: person,
	        						isAllProcessed: this.isAllProcessed,
	        						getCountProcessed: this.getCountProcessed,
	        						callPostponed: this.callPostponed,
	        						processReminders: this.processReminders,
	        						emailNotifications: this.emailNotifications, 
									emailReminders: this.emailReminders,
									processedPeopleMap: this.processedPeopleMap,
        						}));
	        					
	        					
	        					
	        				}, {
								emailNotifications: this.emailNotifications, 
								emailReminders: this.emailReminders,
								processedPeopleMap: this.processedPeopleMap,
								isAllProcessed: this.isAllProcessed,
        						getCountProcessed: this.getCountProcessed,
        						callPostponed: this.callPostponed,
        						processReminders: this.processReminders
							}));
	        				
	        			} else
	        				console.log('emailReminderJob:error:roles:' + err);
	        		}, { 
						emailNotifications: this.emailNotifications, 
						emailReminders: this.emailReminders,
						processedPeopleMap: this.processedPeopleMap,
						isAllProcessed: this.isAllProcessed,
						getCountProcessed: this.getCountProcessed,
						callPostponed: this.callPostponed,
						processReminders: this.processReminders
					}));
	        		
	        		
	        	} else
	        		console.log('emailReminderJob:error:people:' + err);
	        	
	        }, {
				emailNotifications: this.emailNotifications, 
				emailReminders: this.emailReminders,
				processedPeopleMap: this.processedPeopleMap,
				isAllProcessed: this.isAllProcessed,
				getCountProcessed: this.getCountProcessed,
				callPostponed: this.callPostponed,
				processReminders: this.processReminders
			}));

	    } else
	    	console.log('emailReminderJob:error:config:' + err);
    }, {
		emailNotifications: emailNotifications, 
		emailReminders: emailReminders,
		processedPeopleMap: processedPeopleMap,
		isAllProcessed: isAllProcessed,
		getCountProcessed: getCountProcessed,
		callPostponed: callPostponed,
		processReminders: processReminders
	}));

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

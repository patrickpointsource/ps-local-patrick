
/**
 * Returns reminder message
 *
 * @param {Object} userName
 * @param {Object} service
 * @param {Object} host
 * @param {Object} environment
 */

var getReminderMessage = function(userName, service, host, environment) {
	var result = getInternalReminderMessage(userName) +
				 getServerInformation(service, host, environment);
	return result;
}


/**
 * Returns reminder debug message
 *
 * @param {Object} userName
 * @param {Object} userMail
 * @param {Object} ccMail
 * @param {Object} service
 * @param {Object} host
 * @param {Object} environment
 */

var getReminderDebugMessage = function(userName, userMail, ccMail, service, host, environment) {
	var result = getInternalReminderMessage(userName) +
		"<br/>" +
		"TO : " + userMail + "<br/>" +
		"CC : " + ccMail + "<br/>" +
		"<br/>" +
		getServerInformation(service, host, environment);
	return result;
}


/**
 * Returns server information
 *
 * @param {Object} service
 * @param {Object} host
 * @param {Object} environment
 */

var getServerInformation = function(service, host, environment) {
	var result = "<br/>" + 
		"This email was sent by a service machine. Service details follow :<br/>" + 
		"Service name: " + service + "<br/>" +
		"Machine address: " + host + "<br/>" + 
		"Environment: " + environment;
	return result;
}


/**
 * Returns internal message
 *
 * @param {Object} userName
 */

var getInternalReminderMessage = function(userName) {
	var result = 
		userName +",<br/>" +
		"<br/>" +
		"This email is a reminder for you to submit your hours into MasterMind. " +
		"Please remember that PointSource's policy is to submit the previous day's hours into MasterMind by 10 a.m. " + 
		"Eastern time the next business day.<br/>" +
		"<br/>" +
		"For your convenience, a link to submit hours is included below:<br/>" + 
		"https://mastermind.pointsource.us" + "<br/>";
	return result;
}

module.exports.getReminderMessage = getReminderMessage;
module.exports.getReminderDebugMessage = getReminderDebugMessage;
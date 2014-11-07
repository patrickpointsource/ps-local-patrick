
/**
 * Returns reminder message
 */

var getReminderMessage = function(userName) {
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


/**
 * Returns reminder debug message
 */

var getReminderDebugMessage = function(userName, userMail, ccMail, computerName) {
	var result = getReminderMessage(userName) +
		"<br/>" +
		"TO : " + userMail + "<br/>" +
		"CC : " + ccMail + "<br/>" +
		"<br/>" +
		"Message sent from " + computerName + " for Limited Notification List" + "<br/>";
	return result;
}

module.exports.getReminderMessage = getReminderMessage;
module.exports.getReminderDebugMessage = getReminderDebugMessage;
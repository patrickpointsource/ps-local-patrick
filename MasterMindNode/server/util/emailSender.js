/**
 * Service to operate with email-related functions
 */

var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

var fs = require('fs');

module.exports = function(params) {

	var options = {
		from : "MasterMind Notice <mmapps@pointsource.com>",
		host : "smtp-relay.gmail.com",
		// name: "pointsource.com",
		port : 465,
		auth : {
			user : "mmapps@pointsource.com",
			pass : "MMapps777"
		},
		// ignoreTLS: false,
		secure : true // use SSL
	// debug: true
	};

	var transporter = nodemailer.createTransport(smtpTransport(options));

	var wellknown = require('nodemailer-wellknown');

	var config = wellknown("Gmail");

	module.exports.sendEmailFromPsapps = function(to, cc, subject, body, callback) {
		var mailOptions = {
			from : "MasterMind Notice <mmapps@pointsource.com>",
			to : to,
			cc : cc,
			subject : subject,
			html : body,
		};

		transporter.sendMail(mailOptions, function(error, info) {
			callback(error, info);
		});
	};
};
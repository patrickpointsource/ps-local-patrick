/**
 * Service to operate with email-related functions
 */

var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

var fs = require('fs');

var privateKey  = fs.readFileSync('server/cert/server.key', 'utf8');
var certificate = fs.readFileSync('server/cert/server.crt', 'utf8');

var options = {
  from: "MasterMind Notice <system@pointsourcellc.com>",
  host: "smtp.gmail.com",
  //name: "pointsource.com",
  port: 465,
  auth: { 
    user: "psapps@pointsourcellc.com",
    pass: "ps@pp$777"
  },
  //ignoreTLS: false,
  secure: true,
  tls: {
    key: privateKey,
    cert: certificate
  }
  //debug: true
};

var transporter = nodemailer.createTransport(smtpTransport(options));

var wellknown = require('nodemailer-wellknown');

var config = wellknown("Gmail");

module.exports.sendEmailFromPsapps = function(to, subject, body, callback) {
  var mailOptions = { 
    from: "MasterMind Notice <system@pointsourcellc.com>",
    to: to,
    subject: subject,
    html: body,
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    callback(error, info);
});
};
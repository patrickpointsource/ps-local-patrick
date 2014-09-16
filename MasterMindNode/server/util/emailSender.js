/**
 * Service to operate with email-related functions
 */

var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

/*var options = {
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

  //debug: true
};*/

//var transporter = nodemailer.createTransport(smtpTransport(options));

var wellknown = require('nodemailer-wellknown');

var config = wellknown("Gmail");
console.log(config);

var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: "psapps@pointsourcellc.com",
      pass: "ps@pp$777"
    }
});

module.exports.sendEmailFromPsapps = function(to, subject, body, callback) {
  var mailOptions = { 
    from: "MasterMind Notice <system@pointsourcellc.com>",
    to: to,
    subject: subject,
    html: body,
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if(error){
      console.log(error);
    } else {
      console.log('Message sent: ' + info.response);
    }
    
    callback(error, info);
});
};
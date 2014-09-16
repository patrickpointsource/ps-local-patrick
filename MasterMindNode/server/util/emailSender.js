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
    //user: "psapps@pointsourcellc.com",
    //pass: "ps@pp$777"
    user: "donila2008@gmail.com",
    pass: "Nuttertools123"
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
console.log(config);

/*var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: "psapps@pointsourcellc.com",
      pass: "ps@pp$777"
    }
});*/

module.exports.sendEmailFromPsapps = function(to, subject, body, callback) {
  var mailOptions = { 
    //from: "MasterMind Notice <system@pointsourcellc.com>",
    from: "donila2008@gmail.com",
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
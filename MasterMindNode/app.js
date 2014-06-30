'use strict';
// app.js
// This file contains the server side JavaScript code for your application.
var config = require('./server/config/config.js');

var express =   require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;

// Setup logging
var log4js = require('log4js');
log4js.configure('server/config/log4js_config.json', {});
var logger = log4js.getLogger();

//Routes
var hoursByPerson = require('./server/routes/hoursByPerson');
var hoursByPersonDate = require('./server/routes/hoursByPersonDate');
var projects = require('./server/routes/projects');
var people = require('./server/routes/people');
var assignments = require('./server/routes/assignments');
var tasks = require('./server/routes/tasks');

// Configure passport
require('./server/config/passport.js')(passport);

// setup middleware
var app = express();

// configure Express
app.use(log4js.connectLogger(logger, { level: log4js.levels.INFO }));
app.set('view engine', 'jade');
app.set('views', __dirname + '/server/views'); //optional since express defaults to CWD/views
app.use(cookieParser());
app.use(bodyParser());
app.use(session({ secret: config.sessionSecret,
                        cookie: { 
                          maxAge: config.sessionMaxAge
                        }
                      }));
app.use(passport.initialize());
app.use(passport.session());

// Public paths, mainly UI code
app.use(express.static(__dirname + '/public')); 
app.use(express.static(__dirname + '/bower_components')); 

app.use('/hoursByPerson', hoursByPerson);
app.use('/hoursByPersonDate', hoursByPersonDate);
app.use('/projects', projects);
app.use('/people', people);
app.use('/assignments', assignments);
app.use('/tasks', tasks);

// Setup routes
require('./server/routes/auth')(app, passport);

// Application paths that are protected
app.get('/', ensureLoggedIn('/login'),
  function(req, res){
    res.render('index');
});

// There are many useful environment variables available in process.env,
// please refer to the following document for detailed description:
// http://ng.w3.bluemix.net/docs/FAQ.jsp#env_var

// VCAP_APPLICATION contains useful information about a deployed application.
var appInfo = JSON.parse(process.env.VCAP_APPLICATION || '{}');
// TODO: Get application information and use it in your app.

// VCAP_SERVICES contains all the credentials of services bound to
// this application. For details of its content, please refer to
// the document or sample of each service.
var services = JSON.parse(process.env.VCAP_SERVICES || '{}');
// TODO: Get service credentials serProvided);and communicate with bluemix services.

// The IP address of the Cloud Foundry DEA (Droplet Execution Agent) that hosts this application:
var host = (process.env.VCAP_APP_HOST || 'localhost');
// The port on the DEA for communication with the application:
var port = (process.env.VCAP_APP_PORT || 3000);
// Start server
app.listen(port, host);
console.log('App started on port ' + port);

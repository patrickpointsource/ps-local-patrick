'use strict';
// app.js
// This file contains the server side JavaScript code for your application.
var config = require('./server/config/config.js');

var express =   require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var passport = require('passport');
var fs = require('fs');
var https = require('https');

var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;

// Setup logging
var log4js = require('log4js');

log4js.configure('server/config/log4js_config.json', {});
var logger = log4js.getLogger();

//Routes
var projects = require('./server/routes/projects');
var people = require('./server/routes/people');
var assignments = require('./server/routes/assignments');
var notifications = require('./server/routes/notifications');
var tasks = require('./server/routes/tasks');
var hours = require('./server/routes/hours');
var roles = require('./server/routes/roles');
var configuration = require('./server/routes/configuration');
var skills = require('./server/routes/skills');
var links = require('./server/routes/links');
var vacations = require('./server/routes/vacations');
var securityRoles = require('./server/routes/securityRoles');
var userRoles = require('./server/routes/userRoles');
var upgrade = require('./server/routes/upgrade');

var security = require('./server/util/security.js');


var privateKey  = fs.readFileSync('server/cert/server.key', 'utf8');
var certificate = fs.readFileSync('server/cert/server.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};

var HTTPS_PORT = 8443;

// Configure passport
require('./server/config/passport.js')(passport);

var allowCrossDomain = function(req, res, next) {
    //res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Origin', 'http://localhost:9000');

    //res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'accept, authorization');
    //res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.header('Access-Control-Allow-Headers', 'accept, authorization, content-type');
      res.header('Access-Control-Allow-Methods', 'POST, PUT, DELETE');
      res.send(200);
    }
    else {
      next();
    }
};

// setup middleware
var app = express();

app.use(allowCrossDomain);

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

app.use('/projects', projects);
app.use('/people', people);
app.use('/assignments', assignments);
app.use('/notifications', notifications);
app.use('/tasks', tasks);
app.use('/roles', roles);
app.use('/hours', hours);
app.use('/configuration', configuration);
app.use('/links', links);
app.use('/skills', skills);
app.use('/vacations', vacations);
app.use('/securityRoles', securityRoles);
app.use('/userRoles', userRoles);
app.use('/upgrade', upgrade);


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

// start https server
var httpsServer = https.createServer(credentials, app);

httpsServer.listen(HTTPS_PORT);

// Initialize security layer
security.initialize();

console.log('App started on port ' + port);


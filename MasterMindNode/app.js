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
var http = require('http');

var cluster = require('cluster');

var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;

// Setup logging
var log4js = require('log4js');
var configFileName = "config.json";

for (i = 0; i < process.argv.length; i ++) {
    tmpArg = process.argv[i].toString().replace('-', '');
    tmpArg = tmpArg.split('=');
    
    if (tmpArg[0] && tmpArg[1] && tmpArg[0].toLowerCase() == 'configfile')
    	configFileName = tmpArg[1];
}


function loadConfig() {
    return JSON.parse(fs.readFileSync(__dirname + "/" + configFileName));
}

var appConfig = loadConfig();

log4js.configure(appConfig.log4jsPath, {});
var logger = log4js.getLogger();


//Setup routes
require('./server/data/dbAccess')({
	env: appConfig.env
});

//Setup routes
require('./server/controllers/upgrade')({
	privateKeyPath: appConfig.privateKeyPath,
	accountEmail: appConfig.accountEmail
});

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
var reminder = require('./server/util/reminder.js');


//var privateKey  = fs.readFileSync(appConfig.privateKeyPath, 'utf8');
//var certificate = fs.readFileSync(appConfig.certificatePath, 'utf8');
//var credentials = {key: privateKey, cert: certificate};




var httpsPort = appConfig.httpsPort;
var httpPort = appConfig.httpPort;

var hostName = appConfig.hostName;
var webSiteUrl = appConfig.webSiteUrl;
var appName = appConfig.appName;
var oauthcbbaseurl = appConfig.oauthcbbaseurl;
var appNames = ['MMNodeServer', 'MMNodeStaging', 'MMNodeDemo'];

// parse command line arguments
var useAppNames = false;

var tmpArg;
var i;

for (i = 0; i < process.argv.length; i ++) {
    tmpArg = process.argv[i].toString().replace('-', '');
    tmpArg = tmpArg.split('=');
    
    if (tmpArg[0] && tmpArg[1] && tmpArg[0].toLowerCase() == 'hostname')
        hostName = tmpArg[1];
    else if (tmpArg[0] && tmpArg[1] && tmpArg[0].toLowerCase() == 'httpsport')
        httpsPort = tmpArg[1];   
    else if (tmpArg[0] && tmpArg[1] && tmpArg[0].toLowerCase() == 'useappnames')
        useAppNames = tmpArg[1].toLowerCase() == 'true'; 
    else if (tmpArg[0] && tmpArg[1] && tmpArg[0].toLowerCase() == 'appname')
        appName = tmpArg[1]; 
    else if (tmpArg[0] && tmpArg[1] && tmpArg[0].toLowerCase() == 'websiteurl')
        webSiteUrl = tmpArg[1];  
    else if (tmpArg[0] && tmpArg[1] && tmpArg[0].toLowerCase() == 'oauthcbbaseurl')
        oauthcbbaseurl = tmpArg[1];   
}

if (appName) {
   appNames = [appName];
   useAppNames = true;
}

// Configure passport
require('./server/config/passport.js')(passport, {
    appName: appName,
    callbackBaseUrl: oauthcbbaseurl,
    hostName: hostName,
    httpsPort: httpsPort
});

var allowCrossDomain = function(req, res, next) {
    //res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Origin', webSiteUrl);

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

var restoreUser = function(req, res, next) {
	
	if (req.session && req.session.user)
		req.user = req.session.user;
	
	next();
};

function openLog(logfile) {
    return fs.createWriteStream(logfile, {
        flags: "w", encoding: "utf8", mode: 644
    });
}

function openError(errorfile) {
    return fs.createWriteStream(errorfile, {
        flags: "w", encoding: "utf8", mode: 644
    });
}

function log(msg) {
	if (appConfig.logToFileStream)
		logStream.write(msg + "\n");
	else
		console.log(msg);
}

function logError(msg) {
	if (appConfig.logToFileStream)
		errorStream.write(msg + "\n");
	else
		console.error(msg);
}



var logStream = null;
var errorStream = null;

if (appConfig.logToFileStream) {
	logStream = openLog(appConfig.logFileName);
	errorStream = openError(appConfig.errorFileName);
	
	// override log function
	console.log = log;
	console.warn = log;
	console.info = log;
	
	console.error = logError;
}

log("Starting...");

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
app.use(restoreUser);

// Public paths, mainly UI code
app.use(express.static(__dirname + '/public')); 
app.use(express.static(__dirname + '/bower_components')); 

var resetUser = function(req, res) {
	if (req.session && req.session.user)
		delete req.session.user;
	
	res.json( {
		result: true
	} );
}

if (!useAppNames) {
    // Application paths that are protected
    app.get('/', ensureLoggedIn('/login'),
      function(req, res){
             res.render('index');
    });
    
    app.use('/projects', projects);
    app.use('/people', people);
    app.use('/assignments', assignments);
    app.use('/notifications', notifications);
    app.use('/tasks', tasks);
    app.use('/roles', roles);
    app.use('/hours', hours);
    app.use('/config', configuration);
    app.use('/links', links);
    app.use('/skills', skills);
    app.use('/vacations', vacations);
    app.use('/securityRoles', securityRoles);
    app.use('/userRoles', userRoles);
    app.use('/upgrade', upgrade);
    
    app.get( '/resetuser', resetUser);
} else {
    var  i = 0;
    
    for (i = 0; i < appNames.length; i ++) {
        // Application paths that are protected
        app.get('/' + appNames[i] + '/', ensureLoggedIn('/' + appNames[i] + '/login'),
          function(req, res){
                 res.render('index');
        });
        
        app.use('/' + appNames[i] + '/projects', projects);
        app.use('/' + appNames[i] + '/people', people);
        app.use('/' + appNames[i] + '/assignments', assignments);
        app.use('/' + appNames[i] + '/notifications', notifications);
        app.use('/' + appNames[i] + '/tasks', tasks);
        app.use('/' + appNames[i] + '/roles', roles);
        app.use('/' + appNames[i] + '/hours', hours);
        app.use('/' + appNames[i] + '/config', configuration);
        app.use('/' + appNames[i] + '/links', links);
        app.use('/' + appNames[i] + '/skills', skills);
        app.use('/' + appNames[i] + '/vacations', vacations);
        app.use('/' + appNames[i] + '/securityRoles', securityRoles);
        app.use('/' + appNames[i] + '/userRoles', userRoles);
        app.use('/' + appNames[i] + '/upgrade', upgrade);
        
        app.get( '/' + appNames[i] + '/resetuser', resetUser);
    }
}

// Setup routes
require('./server/routes/auth')(app, passport, {
    useAppNames: useAppNames,
    appNames: appNames
});

//Setup routes
require('./server/util/emailSender')({
    appConfig: appConfig
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

console.log('hostName=' + hostName + ':httpsPort=' + httpsPort + ':useAppNames=' + useAppNames + ':appName=' + appName + ':websiteurl:' + webSiteUrl + ':oauthcbbaseurl=' + oauthcbbaseurl);

// The IP address of the Cloud Foundry DEA (Droplet Execution Agent) that hosts this application:
var host = (process.env.VCAP_APP_HOST || hostName);
// The port on the DEA for communication with the application:
var port = httpPort;
// Start server
app.listen(port, host);

/*
// start https server
var httpsServer = https.createServer(credentials, app);

httpsServer.listen(httpsPort, hostName);

var httpServer = http.createServer( app);

httpServer.listen(httpPort, hostName);
*/
//Initialize reminders
reminder.initialize();

// Initialize security layer
security.initialize(false);

console.log('App started on httpPort=' + httpPort);


var configFileNameParam = process.argv[3] ? process.argv[3]: '';

var daemon = require("daemonize2").setup({
    //***************
	//dev deployment
	//***************
	//main: "app.js",
    //name: "mastermindnode",
	//argv: configFileNameParam ? ("configFile=" + configFileNameParam): "configFile=config.json",
    //pidfile: "/var/run/mastermindapp.pid",
    //user: "www",
    //group: "www",
    //silent: true
	
	//****************
	//demo deployment
	//****************
    //main: "app.js",
    //name: "mmnode",
	//argv: configFileNameParam ? ("configFile=" + configFileNameParam): "configFile=config_demo.json",
    //pidfile: "/var/run/mmnode.pid",
    
    //*****************
	//stage deployment
	//*****************
    //main: "app.js",
	//argv: configFileNameParam ? ("configFile=" + configFileNameParam): "configFile=config_stage.json",
    //name: "mmnode",
    //pidfile: "/var/run/mmnode.pid",
	
	//***********************
	//production deployment
	//***********************
    //main: "app.js",
	//argv: configFileNameParam ? ("configFile=" + configFileNameParam): "configFile=config_prod.json",
    //name: "mmnode",
    //pidfile: "/var/run/mmnode.pid",
	
	//************************
	//default deployment
	//  - app.js will try to load in config.json
	//************************
//    main: "app.js",
//    name: "mmnode",
//	  argv: configFileNameParam ? ("configFile=" + configFileNameParam): "configFile=config_demo.json",
//    pidfile: "/var/run/mmnode.pid",
});

if (process.getuid() != 0) {
    console.log("Expected to run as root");
    process.exit(1);
}

daemon
    .on("starting", function() {
        console.log("Starting daemon...");
    })
    .on("started", function(pid) {
        console.log("Daemon started. PID: " + pid);
    })
    .on("stopping", function() {
        console.log("Stopping daemon...");
    })
    .on("stopped", function(pid) {
        console.log("Daemon stopped.");
    })
    .on("running", function(pid) {
        console.log("Daemon already running. PID: " + pid);
    })
    .on("notrunning", function() {
        console.log("Daemon is not running");
    })
    .on("error", function(err) {
        console.log("Daemon failed to start:  " + err.message);
    });


switch (process.argv[2]) {

    case "start":
        daemon.start();
        break;

    case "stop":
        daemon.stop();
        break;

    case "kill":
        daemon.kill();
        break;

    case "restart":
        daemon.stop(function(err) {
            daemon.start();
        });
        break;

    case "reload":
        console.log("Reload.");
        daemon.sendSignal("SIGUSR1");
        break;

    case "status":
        var pid = daemon.status();
        if (pid)
            console.log("Daemon running. PID: " + pid);
        else
            console.log("Daemon is not running.");
        break;

    default:
        console.log("Usage: [start|stop|kill|restart|reload|status] (optionaly, configFile=config.json)");
}
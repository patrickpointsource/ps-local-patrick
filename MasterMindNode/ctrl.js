var configFileNameParam = process.argv[3] ? process.argv[3]: '';

var daemon = require("daemonize2").setup({
    main: "app.js",
    name: "mmnode",
	argv: configFileNameParam ? ("configFile=" + configFileNameParam): "configFile=config.json",
    pidfile: "/var/run/mmnode.pid",
});

if (process.getuid() != 0) {
    winston.info("Expected to run as root");
    process.exit(1);
}

daemon
    .on("starting", function() {
        winston.info("Starting daemon...");
    })
    .on("started", function(pid) {
        winston.info("Daemon started. PID: " + pid);
    })
    .on("stopping", function() {
        winston.info("Stopping daemon...");
    })
    .on("stopped", function(pid) {
        winston.info("Daemon stopped.");
    })
    .on("running", function(pid) {
        winston.info("Daemon already running. PID: " + pid);
    })
    .on("notrunning", function() {
        winston.info("Daemon is not running");
    })
    .on("error", function(err) {
        winston.info("Daemon failed to start:  " + err.message);
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
        winston.info("Reload.");
        daemon.sendSignal("SIGUSR1");
        break;

    case "status":
        var pid = daemon.status();
        if (pid)
            winston.info("Daemon running. PID: " + pid);
        else
            winston.info("Daemon is not running.");
        break;

    default:
        winston.info("Usage: [start|stop|kill|restart|reload|status] (optionaly, configFile=config.json)");
}
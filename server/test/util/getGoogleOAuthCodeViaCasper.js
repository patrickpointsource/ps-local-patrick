var links = [];
var casper = require('casper').create({
    // verbose: true,
    // logLevel: 'debug',
    viewportSize: {width: 800, height: 600},
    waitTimeout: 20000
});

if(!casper.cli.options.username){
    casper.die("Username (--username=<username>) is required.")
}
if(!casper.cli.options.password){
    casper.die("Password (--password=<password>) is required.")
}

var isAuthenticatedAlready = false;
casper.start('http://localhost:8080/alternative-login.html?justShowCode=1');
casper.wait(2000);
casper.thenClick('#signinButton'); // _step 4
casper.waitForPopup(/google/); // _step 5
casper.withPopup(/google/, function fillGoogleLoginForm(){
    this.fill('form#gaia_loginform', {
        Email: casper.cli.options.username,
        Passwd: casper.cli.options.password
    }, true);
});
casper.wait(4000);
casper.run(function finished(){
    this.echo(this.getHTML('h1#code'));
    this.exit();
});


describe("E2E: AdministrationPage tests.", function() {

  var ptor;

  beforeEach(function() {
    ptor = protractor.getInstance();
    ptor.ignoreSynchronization = true;
    browser.ignoreSynchronization = true;
  });
  
  var LoginPage = function() {
  
	this.url = ptor.baseUrl + "/login.html";
	
	this.get = function() {
		ptor.get(this.url);
	};
	
	this.login = function() {
		ptor.get("https://accounts.google.com/ServiceLogin?sacu=1");
		ptor.findElement(protractor.By.css('input[name="Email"]')).sendKeys('[POINTSOURCE_EMAIL]')
		ptor.findElement(protractor.By.css('input[name="Passwd"]')).sendKeys('[POINTSOURCE_PASSWORD]')
		ptor.findElement(protractor.By.css('input[name="signIn"]')).click();
		this.get();
	};
  };
  
  var IndexPage = function() {
  
	this.url = ptor.baseUrl + "/index.html";
	
	this.get = function() {
		ptor.get(this.url);
	};
  };
  
  var AdministrationPage = function() {
	this.url = ptor.baseUrl + "/#/admin";
	this.get = function() {
		ptor.get(this.url);
		// wait until roles loaded
		ptor.sleep(1000);
		console.log("ADMIN PAGE ALREADY SHOULD BE LOADED.");
	};
	this.roles = element.all(by.repeater('role in $data'));
	this.addRoleButton = element(by.css('[ng-click="toggleNewRole()"]'));
	this.deleteRoleButtonCssFinder = '[ng-click="deleteRole(role.resource)"]';
	this.newRole = {
		abbreviation: element(by.model('newRole.abbreviation')),
		title: element(by.model('newRole.title')),
		HAR: element(by.model('newRole.hourlyAdvertisedRate')),
		HLR: element(by.model('newRole.hourlyLoadedRate')),
		MAR: element(by.model('newRole.monthlyAdvertisedRate')),
		MLR: element(by.model('newRole.monthlyLoadedRate')),
		utilizationRate: element(by.model('newRole.utilizationRate')),
		addButton: element(by.css('[ng-click="addRole()"]')),
		cancelButton: element(by.css('[ng-click="cancelRole()"]'))
	}
	
	this.fastAddRole = function(abbr, title) {
		this.newRole.abbreviation.sendKeys(abbr);
		this.newRole.title.sendKeys(title);
		this.newRole.addButton.click();
	}
  }
  
  it ('Open Google login page, login in, login on mastermind loginpage.', function(){
	var loginPage = new LoginPage();
	loginPage.login();
	// asset for "/login.html"
	ptor.getCurrentUrl().then(function(url) {
		expect(url).toEqual(loginPage.url);
	});
  }, 30000);
  
  it ('Should delete existed roles.', function(){
	var adminPage = new AdministrationPage();
	adminPage.get();
	// asset for "/admin"
	ptor.getCurrentUrl().then(function(url) {
		expect(url).toEqual(adminPage.url);
		console.log("ADMIN PAGE CHECKED");
		//var elementsCount = waitForElementsCount(ptor, adminPage.roles, 5000);
		adminPage.roles.count().then(function(count) {
			if(count > 0) {
			    console.log("Found existed roles.");
				// delete existed roles
				adminPage.roles.each(function(role) {
					adminPage.roles.first().findElement(by.css(adminPage.deleteRoleButtonCssFinder)).then(function(deleteButton) {
						deleteButton.click();
						// wait for fast animation
						ptor.sleep(100);
					});
				});
			}
			
			expect(adminPage.roles.count()).toEqual(0);
		});
	});
  }, 30000);
  
  it ('Should create PM Role.', function(){
	var adminPage = new AdministrationPage();
	adminPage.get();
	// asset for "/admin"
	ptor.getCurrentUrl().then(function(url) {
		expect(url).toEqual(adminPage.url);
	});
	adminPage.addRoleButton.click();
	// wait for animation
	ptor.sleep(500);
	adminPage.newRole.abbreviation.sendKeys("PM");
	adminPage.newRole.title.sendKeys("Project Manager");
	adminPage.newRole.addButton.click();
	
    expect(adminPage.roles.count()).toEqual(1);
  }, 30000);
  
  it ('Should create a lot of roles.', function(){
	var adminPage = new AdministrationPage();
	adminPage.get();
	// asset for "/admin"
	ptor.getCurrentUrl().then(function(url) {
		expect(url).toEqual(adminPage.url);
	});
	adminPage.addRoleButton.click();
	// wait for animation
	ptor.sleep(500);
	adminPage.fastAddRole("SE", "Software Engineer");
	adminPage.fastAddRole("SSE", "Senior Software Engineer");
	adminPage.fastAddRole("BA", "Business Analyst");
	adminPage.fastAddRole("SBA", "Senior Business Analyst");
	
    expect(adminPage.roles.count()).toEqual(5);
  }, 30000);

  var showProps = function(property) {
	var str = '';
	for (var prop in property)
		str += prop + ': ';
	console.log('available methods in ' + property + ':' + str + '\n');
  };
  
  // wait for elements loading or timeout, returns count of elements
  var waitForElementsCount = function(ptorRef, elements, timeout) {
	var msIteration = 100;
	var waitTime = 0;
	var elementsCount = 0;
	console.log("Time-out: " + timeout);
	while((elementsCount < 1) && (waitTime <= timeout)) {
		console.log("wait time: " + waitTime + "/" + timeout + " Elements: " + elementsCount +"\n");
		elements.count().then(function(count) {
			elementsCount = count;
		});
		sleep(msIteration);
		waitTime += msIteration;
	}
	
	if((elementsCount < 1) && (waitTime >= timeout)) {
		console.log("Exit by time-out, no elements found");
	}
	
	if(elementsCount > 0) {
		console.log("Count of elements: " + elementsCount);
	}
	
	return elementsCount;
  };
  
  function sleep(ms) {
	var start = new Date().getTime(), expire = start + ms;
	while (new Date().getTime() < expire) { }
	return;
  }
});
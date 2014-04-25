describe("E2E: Create project, check projects list, delete project, check project list.", function() {

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
  
  var ProjectsPage = function() {
	this.url = ptor.baseUrl + "/index.html#/projects?filter=all";
	this.newUrl = ptor.baseUrl + "/index.html#/projects/new?filter=all";
	this.get = function() {
		ptor.get(this.url);
	};
	this.projects = element.all(by.repeater('project in projects'));
	this.addProjectButton = element(by.css('[ng-click="createProject()"]'));
  };
  
  var ProjectPage = function() {
	this.editButton = element(by.css('[ng-click="edit()"]'));
	this.deleteButton = element(by.css('[ng-show="canDeleteProject"]'));
	this.deleteButtonOk = element(by.css('[ng-click="deleteProject()"]'));
  };
  
  var NewProjectPage = function() {
	this.nameInput = element(by.model('project.name'));
	this.customerInput = element(by.model('project.customerName'));
	this.projectTypesRadio = element.all(by.model('project.type'));
	this.calendarToday = element(by.css('.day active'));
	this.startDate = element(by.model('project.startDate'));
	this.projectCommited = element(by.model('project.committed'));
	this.execSponsorSelect = function(number) {
		var options = element(by.model('project.executiveSponsor.resource')).findElements(by.tagName('option'))   
		.then(function(options){
			options[number].click();
		});
	};
	this.rolesTab = element(by.id('roles'));
	this.triggerAddRoleButton = element(by.css('[ng-click="triggerAddRole()"]'));
	this.roleSelect = function(number) {
		var options = element(by.model('newRole.type.resource')).findElements(by.tagName('option'))   
		.then(function(options){
			options[number].click();
		});
	};
	this.roleStartDate = element(by.model('newRole.startDate'));
	this.hoursPerMonth = element(by.model('newRole.rate.hoursPerMth'));
	this.addRoleButton = element(by.css('[ng-click="add()"]'));
	this.saveButton = element(by.css('[ng-click="checkShiftDates()"]'));
	this.successMessage = element.all(by.repeater('message in messages'));
  };
  
  it ('Open Google login page, login in, login on mastermind loginpage.', function(){
	var loginPage = new LoginPage();
	loginPage.login();
	// asset for "/login.html"
	ptor.getCurrentUrl().then(function(url) {
		expect(url).toEqual(loginPage.url);
	});
  }, 30000);

  // IMPORTANT: required at lest 1 sponsor in sponsor's list, 
  //            required at lest 1 role (and gets first of them)
  //            for correct project list check, we should not have any created projects
  it ('Should create a project.', function(){
	var projectsPage = new ProjectsPage();
	var newProjectPage = new NewProjectPage();
	
	projectsPage.get(); // going to projects
	ptor.sleep(1000); // wait until it loads
	projectsPage.addProjectButton.click();
	
	// assert for "project/new" url
	ptor.getCurrentUrl().then(function(url) {
		expect(url).toEqual(projectsPage.newUrl);
	});

	// common fields filling
	newProjectPage.execSponsorSelect(1); // assume that we have at least 1 sponsor in list.
	newProjectPage.nameInput.sendKeys("Automated test project");
	newProjectPage.customerInput.sendKeys("Automated test customer");
	newProjectPage.projectTypesRadio.first(0).click();
	newProjectPage.startDate.sendKeys("2014-04-01");
	newProjectPage.projectCommited.click();
	newProjectPage.rolesTab.click();
	// roles tab filling
	newProjectPage.triggerAddRoleButton.click();
	newProjectPage.roleSelect(1); // select project manager
	//newProjectPage.roleStartDate.sendKeys("2014-04-01");
	//newProjectPage.hoursPerMonth.sendKeys("120");
	newProjectPage.addRoleButton.click();
	ptor.sleep(3000);
	newProjectPage.saveButton.click();
	ptor.sleep(3000);
	newProjectPage.successMessage.then(function(arr) {
        expect(arr[0].getText()).toEqual('Project successfully saved');
	});
  }, 30000);
  
  it('Open projects page, shoud display created project.', function(){
	var projectsPage = new ProjectsPage();
	projectsPage.get();
	ptor.getCurrentUrl().then(function(url) {
		expect(url).toEqual(projectsPage.url);
	});
	ptor.sleep(1000);
	ptor.waitForAngular().then(function() {
		expect(projectsPage.projects.count()).toEqual(1);
	});
  }, 30000);
  
  it('Should delete created project', function(){
	var projectsPage = new ProjectsPage();
	projectsPage.get();
	ptor.sleep(1000);
	var project = projectsPage.projects.first();
	project.findElement(by.css('a')).then(function(link){
		link.click();
	});
	// now we are on project page
	var projectPage = new ProjectPage();
	ptor.sleep(500);
	projectPage.editButton.click();
	ptor.sleep(500);
	projectPage.deleteButton.click();
	ptor.sleep(500);
	projectPage.deleteButtonOk.click();
	// check that we are redirected to /projects
	ptor.getCurrentUrl().then(function(url) {
		expect(url).toEqual(projectsPage.url);
	});
	// check that there are no projects now
	ptor.waitForAngular().then(function() {
		expect(projectsPage.projects.count()).toEqual(0);
	});
	ptor.sleep(4000); // for demo
  }, 30000);

  var showProps = function(property) {
	var str = '';
	for (var prop in property)
		str += prop + ': ';
	console.log('available methods in ' + property + ':' + str + '\n');
  };
  /*var str = '';

 for (var prop in t)
  str += prop + ': ';
  
 console.log('available methods:' + str)*/
  
  
});
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
	this.endDate = element(by.model('project.endDate'));
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
  it ('Should create active project.', function(){
	var projectsPage = new ProjectsPage();
	var newProjectPage = new NewProjectPage();
	
	projectsPage.get(); // going to projects
	ptor.sleep(1000); // wait until it loads
	projectsPage.addProjectButton.click();
	
	// assert for "project/new" url
	ptor.getCurrentUrl().then(function(url) {
		expect(url).toEqual(projectsPage.newUrl);
	});

	fillCommonFields(newProjectPage, function() {
		fillActiveProjectPageFields(newProjectPage);
	});
	
	newProjectPage.successMessage.then(function(arr) {
        expect(arr[0].getText()).toEqual('Project successfully saved');
	});
  }, 30000);
  
  it ('Should create backlog project.', function(){
		var projectsPage = new ProjectsPage();
		var newProjectPage = new NewProjectPage();
		
		projectsPage.get(); // going to projects
		ptor.sleep(1000); // wait until it loads
		projectsPage.addProjectButton.click();
		
		// assert for "project/new" url
		ptor.getCurrentUrl().then(function(url) {
			expect(url).toEqual(projectsPage.newUrl);
		});

		fillCommonFields(newProjectPage, function() {
			fillBacklogProjectPageFields(newProjectPage);
		});
		
		newProjectPage.successMessage.then(function(arr) {
	        expect(arr[0].getText()).toEqual('Project successfully saved');
		});
	  }, 30000);
  
  it ('Should create pipeline project.', function(){
		var projectsPage = new ProjectsPage();
		var newProjectPage = new NewProjectPage();
		
		projectsPage.get(); // going to projects
		ptor.sleep(1000); // wait until it loads
		projectsPage.addProjectButton.click();
		
		// assert for "project/new" url
		ptor.getCurrentUrl().then(function(url) {
			expect(url).toEqual(projectsPage.newUrl);
		});

		fillCommonFields(newProjectPage, function() {
			fillPipelineProjectPageFields(newProjectPage);
		});
		
		newProjectPage.successMessage.then(function(arr) {
	        expect(arr[0].getText()).toEqual('Project successfully saved');
		});
	  }, 30000);
  
  it ('Should create completed project.', function(){
		var projectsPage = new ProjectsPage();
		var newProjectPage = new NewProjectPage();
		
		projectsPage.get(); // going to projects
		ptor.sleep(1000); // wait until it loads
		projectsPage.addProjectButton.click();
		
		// assert for "project/new" url
		ptor.getCurrentUrl().then(function(url) {
			expect(url).toEqual(projectsPage.newUrl);
		});

		fillCommonFields(newProjectPage, function() {
			fillCompletedProjectPageFields(newProjectPage);
		});
		
		newProjectPage.successMessage.then(function(arr) {
	        expect(arr[0].getText()).toEqual('Project successfully saved');
		});
	  }, 30000);
  
  it('Open projects page, shoud display created projects.', function(){
	var projectsPage = new ProjectsPage();
	projectsPage.get();
	ptor.getCurrentUrl().then(function(url) {
		expect(url).toEqual(projectsPage.url);
	});
	ptor.sleep(1000);
	ptor.waitForAngular().then(function() {
		expect(projectsPage.projects.count()).toEqual(3);
	});
  }, 30000);
  
  it('Should delete first project', function(){
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
  
  var fillCommonFields = function(newProjectPage, fillOtherFieldsCallback) {
	newProjectPage.execSponsorSelect(1); // assume that we have at least 1 sponsor in list.
	
	newProjectPage.customerInput.sendKeys("Test customer");
	newProjectPage.projectTypesRadio.first(0).click();
	
	fillOtherFieldsCallback();
	
	// roles tab filling
	newProjectPage.rolesTab.click();
	newProjectPage.triggerAddRoleButton.click();
	newProjectPage.roleSelect(1); // select project manager
	newProjectPage.addRoleButton.click();
	newProjectPage.saveButton.click();
  }
  
  var fillActiveProjectPageFields = function(newProjectPage) {
	    // start date in the past
		var today = new Date();
		today.setDate(today.getDate() - 2);
		var startDate = getShortDate(new Date(today));
		
		newProjectPage.startDate.sendKeys(startDate);
		newProjectPage.nameInput.sendKeys("Acrive project");
		newProjectPage.projectCommited.click();
  }
  
  var fillBacklogProjectPageFields = function(newProjectPage) {
	    // start date in the future
		var today = new Date();
		today.setDate(today.getDate() + 2);
		var startDate = getShortDate(new Date(today));
		
		newProjectPage.startDate.sendKeys(startDate);
		newProjectPage.nameInput.sendKeys("Backlog project");
		newProjectPage.projectCommited.click();
  }
  
  var fillPipelineProjectPageFields = function(newProjectPage) {
		// start date in the future
		var today = new Date();
		today.setDate(today.getDate() + 2);
		var startDate = getShortDate(new Date(today));
		
		newProjectPage.nameInput.sendKeys("Pipeline project");
		newProjectPage.startDate.sendKeys(startDate);
		// not contractually commited
		//newProjectPage.projectCommited.click();
  }
  
  var fillCompletedProjectPageFields = function(newProjectPage) {
	    newProjectPage.nameInput.sendKeys("Pipeline project");
	    // start date in the past
		var start = new Date();
		start.setDate(start.getDate() - 4);
		var startDate = getShortDate(new Date(start));
		
		// end date in the past
		var end = new Date();
		end.setDate(end.getDate() - 2);
		var endDate = getShortDate(new Date(end));
		
		newProjectPage.startDate.sendKeys(startDate);
		newProjectPage.endDate.sendKeys(endDate);
		newProjectPage.projectCommited.click();
  }
  
  var fillInvestmentProjectPageFields = function(newProjectPage) {
	    // start date in the future
		var today = new Date();
		today.setDate(today.getDate() + 2);
		var startDate = getShortDate(new Date(today));
		
		// TODO: click on 2nd item in projectTypesRadio
		newProjectPage.startDate.sendKeys(startDate);
		newProjectPage.nameInput.sendKeys("Investment project");
		newProjectPage.projectCommited.click();
  }
  
  var showProps = function(property) {
	var str = '';
	for (var prop in property)
		str += prop + ': ';
	console.log('available methods in ' + property + ':' + str + '\n');
  };
  
  var getShortDate = function(date){
   	 //Get todays date formatted as yyyy-MM-dd
      var dd = date.getDate();
       var mm = date.getMonth()+1; //January is 0!
       var yyyy = date.getFullYear();
       if (dd<10){
         dd='0'+dd;
       }
       if (mm<10){
         mm='0'+mm;
       }
       date = yyyy+'-'+mm+'-'+dd;
       return date;
   };
  /*var str = '';

 for (var prop in t)
  str += prop + ': ';
  
 console.log('available methods:' + str)*/
  
  
});
/**
 * @Author Denys Novalenko
 * 
 * */
describe('E2E: Staffing Tests', function() {	
    
	var ACTIVE_PROJECT_WITH_TWO_ROLES = 'Active project with two unassigned roles';
	var ACTIVE_PROJECT_WITH_UNASSIGNED_AND_ASSIGNED_ROLES = 'Active project with unassigned and unassigned roles';
	var ACTIVE_PROJECT_WITH_UNASSIGNED_AND_UNDERASSIGNED_ROLES = 'Active project with unassigned and underassigned roles';
	var BACKLOG_PROJECT_WITH_TWO_ROLES = 'Backlog project with two unassigned roles';
	var BACKLOG_PROJECT_WITH_UNASSIGNED_AND_ASSIGNED_ROLES = 'Backlog project with unassigned and assigned roles';
	var BACKLOG_PROJECT_WITH_UNASSIGNED_AND_UNDERASSIGNED_ROLES = 'Backlog project with unassigned and underassigned roles';
	var PIPELINE_PROJECT_WITH_TWO_ROLES = 'Pipeline project with two roles';

	var USER_NAME = 'psapps@pointsourcellc.com';
    var PASSWORD = 'ps@pp$777';
    
    var PROJECT_NAME = 'Tests - Staffing : ';
    var CLIENT_NAME = 'Test client name';
    var PROJECT_CONTACT = 'Test project contact';
    var SPONSOR = 'Reynolds, Brian';
    var START_DATE = '2015-01-01';
    var FUTURE_START_DATE = '2017-01-01';
    var ROLE_BA = 'BA';
    var ROLE_PM = 'PM';
    var HOURS_PER_WEEK = 45;
    
    var projectNameInput = by.id('projectName');
    var customerNameInput = by.id('customerName');
    var primaryContactInput = by.id('primaryContact');
    var startDateInput  = by.id('startDate');
    var executiveSponsorInput = by.id('executiveSponsor');
    var salesSponsorInput = by.id('salesSponsor');
    var projectTypePaidInput = by.css('[ng-class="{\'active\': project.type ==\'paid\'}"]');
    var projectTypePocInput = by.css('[ng-class="{\'active\': project.type ==\'poc\'}"]');
    var projectTypeInvestInput = by.css('[ng-class="{\'active\': project.type ==\'invest\'}"]');
    var projectCommitedInput = by.model('project.committed');
    var billingDateInput  = by.id('billingDate');
    
    var roleInput = by.id('role');
    var roleStartDateInput = by.id('roleStartDate');
    
	var sbutton = by.tagName('button');
	var logonEmail = by.id('Email');
	var logonPswd = by.id('Passwd');
	var signIn = by.id('signIn');
	var submit_approve_access = by.id('submit_approve_access');

	var projectNameBinding = 'project.name';
    var filterProjectsInput = by.model('filterText');
	
	var addProjectButton = by.css('[ng-click="createProject()"]'); 
	var addRoleButton = by.css('[ng-click="triggerAddRole()"]');
	var submitRoleButton = by.css('[ng-click="add()"]');
	var saveProjectButton = by.id('saveProjectButton');
	var editProjectButton = by.css('[ng-click="editProject()"]');
	var deleteProjectButton = by.css('[ng-show="canDeleteProject"]');
	var deleteProjectConfirmButton = by.css('[ng-click="deleteProject()"]');
	var assignmentsButton = by.id('assignmentsButton');
	var addAssignmentButton = by.css('[ng-mousedown="addNewAssignmentToRole($index, role)"]');
	
	//assignment fields
	var assignmentPersonInput = by.css('[ng-change="assigneeChanged($index, role)"]');
	var assignmentHoursInput = by.model('currentAssignee.hoursPerWeek');
	
	beforeEach(function() {
		browser.driver.getCurrentUrl().then(function(url) {
			if ( url.indexOf('http://localhost:9000/index.html#/') == -1 ) {  //Go to the dashboard page
				browser.driver.get('http://localhost:9000/index.html#/');
 	           	browser.driver.sleep(1000);
 	           	browser.driver.getCurrentUrl().then(function(loginUrl) {
 	           		if ( loginUrl.indexOf('http://localhost:9000/login.html') > -1 ) {  //  Re-login if needed
 	           			login();
 	           		} 
 	           	});
			}
		});
	});
	
	it('Staffing Test: Check active project with two unassigned roles.', function() {	
		console.log('> Running: Staffing - ' + ACTIVE_PROJECT_WITH_TWO_ROLES);
		checkActiveProjectWithTwoUnassignedRoles();
	});

	it('Staffing Test: Check active project with unassigned and assigned roles.', function() {	
		console.log('> Running: Staffing - ' + ACTIVE_PROJECT_WITH_UNASSIGNED_AND_ASSIGNED_ROLES);
		checkActiveProjectWithUnassignedAndAssignedRoles();
	});

	it('Staffing Test: Check active project with unassigned and underassigned roles.', function() {	
		console.log('> Running: Staffing - ' + ACTIVE_PROJECT_WITH_UNASSIGNED_AND_UNDERASSIGNED_ROLES);
		checkActiveProjectWithUnassignedAndUnderassignedRoles();
	});

	it('Staffing Test: Check backlog project with two unassigned roles.', function() {	
		console.log('> Running: Staffing - ' + BACKLOG_PROJECT_WITH_TWO_ROLES);
		checkBacklogProjectWithTwoUnassignedRoles();
	});

	it('Staffing Test: Check backlog project with unassigned and assigned roles.', function() {	
		console.log('> Running: Staffing - ' + BACKLOG_PROJECT_WITH_UNASSIGNED_AND_ASSIGNED_ROLES);
		checkBacklogProjectWithUnassignedAndAssignedRoles();
	});

	it('Staffing Test: Check backlog project with unassigned and underassigned roles.', function() {	
		console.log('> Running: Staffing - ' + BACKLOG_PROJECT_WITH_UNASSIGNED_AND_UNDERASSIGNED_ROLES);
		checkBacklogProjectWithUnassignedAndUnderassignedRoles();
	});

	it('Staffing Test: Check pipeline project with roles.', function() {	
		console.log('> Running: Staffing - ' + PIPELINE_PROJECT_WITH_TWO_ROLES);
		checkPipelineProjectWithRoles();
	});

	var checkActiveProjectWithTwoUnassignedRoles  = function () {
		var project = getActiveProjectWithTwoUnassignedRoles();
		createProject(project);
		checkStaffing(project);
		deleteProject(project);
	}; 

	var checkActiveProjectWithUnassignedAndAssignedRoles = function () {
		var project = getActiveProjectWithUnassignedAndAssignedRoles();
		createProject(project);
		checkStaffing(project);
		deleteProject(project);
	}; 

	var checkActiveProjectWithUnassignedAndUnderassignedRoles = function () {
		var project = getActiveProjectWithUnassignedAndUnderassignedRoles();
		createProject(project);
		checkStaffing(project);
		deleteProject(project);
	}; 

	var checkBacklogProjectWithTwoUnassignedRoles = function () {
		var project = getBacklogProjectWithTwoUnassignedRoles();
		createProject(project);
		checkStaffing(project);
		deleteProject(project);
	}; 

	var checkBacklogProjectWithUnassignedAndAssignedRoles = function () {
		var project = getBacklogProjectWithUnassignedAndAssignedRoles();
		createProject(project);
		checkStaffing(project);
		deleteProject(project);
	}; 

	var checkBacklogProjectWithUnassignedAndUnderassignedRoles = function () {
		var project = getBacklogProjectWithUnassignedAndUnderassignedRoles();
		createProject(project);
		checkStaffing(project);
		deleteProject(project);
	}; 

	var checkPipelineProjectWithRoles = function () {
		var project = getPipelineProjectWithRoles();
		createProject(project);
		checkStaffing(project);
		deleteProject(project);
	}; 

	var createProject = function (project) {
   		browser.get('http://localhost:9000/index.html#/projects?filter=all');
   		browser.wait(function(){	    		
       		return browser.isElementPresent(addProjectButton);
       	}).then(function(){
   			browser.findElement(addProjectButton).click().then(function () {
	   			browser.wait(function(){	    		
	   	    		return browser.isElementPresent(projectNameInput);
	   	    	}).then(function(){
	   	    		addProjectAttributes(project);
	   	    		addRoleAttributesToProject(project);
	   	    		addAssignmentsAttributes(project);
		    	 	browser.findElement(saveProjectButton).click().then(function () {
		    	 		browser.wait(function(){	    		
		    	       		return browser.isElementPresent(assignmentsButton);
		    	       	})	 
		    	 	});
	   		   	});
	   		});
       	})
	}; 
	
	var addProjectAttributes = function (project) {
   		var projectName = browser.findElement(projectNameInput);
   		projectName.clear().then( function () { projectName.sendKeys(project.name); } );
   		var customerName = browser.findElement(customerNameInput);
   		customerName.clear().then( function () { customerName.sendKeys(project.clientName); } );
   		var primaryContact = browser.findElement(primaryContactInput);
   		primaryContact.clear().then( function () { primaryContact.sendKeys(project.contact); } );
   		browser.findElement(projectTypePaidInput).click();
   		var startDate = browser.findElement(startDateInput);
   		startDate.clear().then( function () { startDate.sendKeys(project.startDate); } );
   		var executiveSponsor = browser.findElement(executiveSponsorInput);
   		executiveSponsor.sendKeys(project.executiveSponsor);
   		var salesSponsor = browser.findElement(salesSponsorInput);
   		salesSponsor.sendKeys(project.salesSponsor);
   		if (project.commited) {
   	   		browser.findElement(projectCommitedInput).click();
   		}
   		var billingDate = browser.findElement(billingDateInput);
   		billingDate.clear().then( function () { billingDate.sendKeys(project.billingDate); } );
	}
	
	var addRoleAttributesToProject = function (project) {
		for (var i in project.roles) {
			var roleItem = project.roles[i];
	   		browser.findElement(addRoleButton).click().then(function () {
	  		   	browser.wait(function(){	    		
	   	    		return browser.isElementPresent(roleInput);
	   	    	}).then(function(){
		 	    	var role = browser.findElement(roleInput);
		 	    	role.sendKeys(roleItem.name);
			    	var roleStartDate = browser.findElement(roleStartDateInput);
	 		    	roleStartDate.clear().then( function () { roleStartDate.sendKeys(roleItem.startDate); } );
		    	 	browser.findElement(submitRoleButton).click();
		   	   	});	
	   	 	});
		}
	}
	
	var addAssignmentsAttributes = function (project) {
		goToTop();
   		browser.findElement(assignmentsButton).click().then(function () {
    		for (var i in project.roles) {
    			var roleItem = project.roles[i];
    			if (roleItem.person) {
    		   		browser.findElements(addAssignmentButton).then(function (addAssignmentButtons) {
    		   			addAssignmentButtons[i].click().then(function () {
    		   				browser.findElement(assignmentPersonInput).sendKeys(roleItem.person);
           		   			if (roleItem.hours) {
               		   			var assignmentHours = browser.findElement(assignmentHoursInput);
               		   			assignmentHours.clear().then( function () { assignmentHours.sendKeys(roleItem.hours); } );
           		   			}	
    		   			})
     		   		});
    			}
    		}
   	 	});
	}
	
	var goToTop = function () {
		browser.executeScript("window.scrollTo(0,0)");
	}

	var deleteProject = function (project) {
 		browser.get('http://localhost:9000/index.html#/projects?filter=all');
 		browser.findElement(by.cssContainingText('a', project.name)).getAttribute('href').then(function(url) {
 	 		url = url.substring(0, url.indexOf("?")) + "/edit/summary";
 	 		browser.get(url).then(function(){
 	 			browser.wait(function(){	    		
 	   	   			return browser.isElementPresent(deleteProjectButton);
 	   		   	}).then(function(){
		    		browser.driver.sleep(1000);	
 	   		   		browser.findElement(deleteProjectButton).click().then(function () {
 	   		   			browser.wait(function(){	    		
 	   		   				return browser.isElementPresent(deleteProjectConfirmButton);
 			   	   	    }).then(function(){
 			   	   	    	browser.findElement(deleteProjectConfirmButton).click();
 			   	   	    });
 	   			   	});
 	   		   	});
 	 		});
 		});
	}
	   		
	var checkStaffing = function(project) {
 		browser.get('http://localhost:9000/index.html#/staffing');
 		browser.wait(function(){	    		
	    	return browser.isElementPresent(filterProjectsInput);
	    }).then(function(){
	    	browser.findElement(filterProjectsInput).sendKeys(project.name).then(function () {
	    		var unassignedRoleCount = 0;
	    		for (var i in project.roles) {
	    			if (!project.roles[i].person) {
		    			unassignedRoleCount++;
	    			}
	    			else if (project.roles[i].hours && project.roles[i].hours < HOURS_PER_WEEK ) {
	    				unassignedRoleCount++;
	    			}
	    		}
	    		if (isActiveProject(project)) {
	    		 	expect(element.all(by.repeater('unassignedRole in $data | filter:filterStaffing(filterText)')).count()).toBeCloseTo(unassignedRoleCount);
	    		} 
	    		else 
	    		if (isBacklogProject(project)) {
	    		 	expect(element.all(by.repeater('backlogRole in $data | filter:filterStaffing(filterText)')).count()).toBeCloseTo(unassignedRoleCount + 1);
	    		}
	    		else 
		    	if (isPipelineProject(project)) {
		    	 	expect(element.all(by.repeater('pipelineRole in $data | filter:filterStaffing(filterText)')).count()).toBeCloseTo(1);
		    	}
	    	});
	    });
	}

	
	var getActiveProjectWithTwoUnassignedRoles  = function () {
		var project = getActiveProject();
		project.name = project.name + ACTIVE_PROJECT_WITH_TWO_ROLES;
		project.roles = [
			{
				name : ROLE_BA,
				startDate : START_DATE
			},
			{
				name : ROLE_BA,
				startDate : START_DATE
			}
		];
		return project;
		
	}; 
	
	var getActiveProjectWithUnassignedAndAssignedRoles  = function () {
		var project = getActiveProject();
		project.name = project.name + ACTIVE_PROJECT_WITH_UNASSIGNED_AND_ASSIGNED_ROLES;
		project.roles = [
			{
				name : ROLE_BA,
				startDate : START_DATE,
		    	person : ROLE_PM + " " + SPONSOR
			},
			{
				name : ROLE_BA,
				startDate : START_DATE
			}
		];
		return project;
		
	}; 

	var getActiveProjectWithUnassignedAndUnderassignedRoles  = function () {
		var project = getActiveProject();
		project.name = project.name + ACTIVE_PROJECT_WITH_UNASSIGNED_AND_UNDERASSIGNED_ROLES;
		project.roles = [
			{
				name : ROLE_BA,
				startDate : START_DATE,
		    	person : ROLE_PM + " " + SPONSOR,
		    	hours : 25
			},
			{
				name : ROLE_BA,
				startDate : START_DATE
			}
		];
		return project;
		
	}; 
	
	
	var getBacklogProjectWithTwoUnassignedRoles  = function () {
		var project = getBacklogProject();
		project.name = project.name + BACKLOG_PROJECT_WITH_TWO_ROLES;
		project.roles = [
			{
				name : ROLE_BA,
				startDate : FUTURE_START_DATE
			},
			{
				name : ROLE_BA,
				startDate : FUTURE_START_DATE
			}
		];
		return project;
		
	}; 

	var getBacklogProjectWithUnassignedAndAssignedRoles  = function () {
		var project = getBacklogProject();
		project.name = project.name + BACKLOG_PROJECT_WITH_UNASSIGNED_AND_ASSIGNED_ROLES;
		project.roles = [
			{
				name : ROLE_BA,
				startDate : FUTURE_START_DATE,
		    	person : ROLE_PM + " " + SPONSOR
			},
			{
				name : ROLE_BA,
				startDate : FUTURE_START_DATE
			}
		];
		return project;
		
	}; 

	var getBacklogProjectWithUnassignedAndUnderassignedRoles  = function () {
		var project = getBacklogProject();
		project.name = project.name + BACKLOG_PROJECT_WITH_UNASSIGNED_AND_UNDERASSIGNED_ROLES;
		project.roles = [
			{
				name : ROLE_BA,
				startDate : FUTURE_START_DATE,
		    	person : ROLE_PM + " " + SPONSOR,
		    	hours : 25
			},
			{
				name : ROLE_BA,
				startDate : FUTURE_START_DATE
			}
		];
		return project;
	}; 

	var getPipelineProjectWithRoles  = function () {
		var project = getPipelineProject();
		project.name = project.name + PIPELINE_PROJECT_WITH_TWO_ROLES;
		project.roles = [
			{
				name : ROLE_BA,
				startDate : START_DATE
			},
			{
				name : ROLE_BA,
				startDate : START_DATE,
			}
		];
		return project;
	}; 

	var getProject = function() {
		var project = {
			name : PROJECT_NAME,
			clientName : CLIENT_NAME,
			contact : PROJECT_CONTACT,
			executiveSponsor : SPONSOR,
			salesSponsor : SPONSOR
		}
		return project;
	}

	var getActiveProject = function() {
		var project = getProject();
		project.startDate = START_DATE;
		project.billingDate = START_DATE;
		project.commited = true;
		return project;
	}

	var getBacklogProject = function() {
		var project = getProject();
		project.startDate = FUTURE_START_DATE;
		project.billingDate = FUTURE_START_DATE;
		project.commited = true;
		return project;
	}

	var getPipelineProject = function() {
		var project = getProject();
		project.startDate = START_DATE;
		project.billingDate = START_DATE;
		return project;
	}

	var isActiveProject = function (project) {
		var todayDate = new Date();
		var projectStartDate = new Date(project.startDate);
		return ( project.commited && projectStartDate <= todayDate) ? true : false;
	}

	var isBacklogProject = function (project) {
		var todayDate = new Date();
		var projectStartDate = new Date(project.startDate);
		return ( project.commited && projectStartDate > todayDate) ? true : false;
	}

	var isPipelineProject = function (project) {
		return ( !project.commited ) ? true : false;
	}

	var isDisplayed = function (index, collection, callback) {
		collection[index].isDisplayed().then(function (isVisible) {
			callback(isVisible, index);
		});
	}
	
	var byId = function (id, index) {
		return index ? by.id(id + index) : by.id(id + '0');
	};
	
	var login = function () {
    	browser.driver.ignoreSynchronization = true;
	    browser.driver.get('http://localhost:9000/login.html');
	    
	    var width = 1900;
	    var height = 1200;
	    browser.driver.manage().window().setSize(width, height);
	    
	    browser.driver.wait(function() {	    	
	    	return browser.driver.isElementPresent(sbutton);
	    }).then(function(){
		    // expect the signin button to be present
	    	// expect(browser.driver.isElementPresent(sbutton)).toBeTruthy();
		    console.log('login button is available. Clicking it');
	    	// find the signin button and click it
		    browser.driver.findElement(sbutton).click();	
		    
		    // expect the popup window to open and check that its url contains accounts.google.com
		    browser.driver.getAllWindowHandles().then(function (handles) {		    	
		    	browser.driver.switchTo().window(handles[1]).then(function(){
		    		console.log("> Swicthed window control to the popup.");
		    	});
		    	
		    	expect(browser.driver.getCurrentUrl()).toContain('https://accounts.google.com/ServiceLogin?');
		    	
		    	browser.driver.wait(function(){	    		
		    		return browser.driver.isElementPresent(logonEmail);
		    	}).then(function(){
		    		console.log("> Input fields found. Populating and submitting");
		    		browser.driver.findElement(logonEmail).sendKeys(USER_NAME);
		    		browser.driver.findElement(logonPswd).sendKeys(PASSWORD);
		    		browser.driver.findElement(signIn).click();	   
		    		browser.driver.sleep(2000);	
		    		
		    		// At this moment the accept window might be closed. 
		    		// So, check the total amount of windows again. If it is more than one,
		    		// goahead and click the accept button, otherwise do nothing.
		    		browser.driver.getAllWindowHandles().then(function (handles) {
		    			
		    			if(handles.length > 1){
		    	    		browser.driver.findElement(submit_approve_access).click();    		    			
		    			}   			
		    			
		    		});
		    		
		    		// back to the main window
					browser.driver.switchTo().window(handles[0]);
		    		browser.driver.sleep(5000);	    		
		    	});
		    	
		    });
	    }); 
    };
	
});
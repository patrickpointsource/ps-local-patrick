describe('E2E: Dashboard Test Cases >', function() {
	 
	var windowWidth = 1900;
	var windowHeight = 1200;
	
	var USER_NAME = 'psapps@pointsourcellc.com';
	var PASSWORD = 'ps@pp$777';
	
	var ACTIVE_PROJECT_NAME = "E2E Hours widget - Active Project";
	var BACKLOG_PROJECT_NAME = "E2E Hours widget - Backlog Project";
	var TASK_NAME = "E2E Hours widget - Task";
	var HOURS_VALUE = 8;
	var HOURS_ABSURD_VALUE = 50;
	var HOURS_NULL_VALUE = 0;
	var HOURS_DESCRIPTION = "Hours Widget: E2E Testing";
	
	//login
	var sbutton = by.tagName('button');
	var logonEmail = by.id('Email');
	var logonPswd = by.id('Passwd');
	var signIn = by.id('signIn');
	var submit_approve_access = by.id('submit_approve_access');
	
	//Hours widget
	var loggedProject = 'loggedProject';
	var loggedTask = 'loggedTask';
	var ddlProjectsTasks = 'ddlProjectsTasks';
	var loggedHours = 'loggedHours';
	var loggedDescription = 'loggedDescription';
	var loggedProjectInput = 'loggedProjectInput';
	var loggedHoursInput = 'loggedHoursInput';
	var loggedDescriptionInput = 'loggedDescriptionInput';
	var hoursValidationMsg = 'hoursValidationMsg';
	var hoursAdd = 'hoursAdd';
	var hoursSave = 'hoursSave';
	var hoursDelete = 'hoursDelete';	
	var hoursCopy = 'hoursCopy';
	var hoursEdit = 'hoursEdit';
	var clearProject = by.css('[ng-click="clearSelectedItem(e, hourEntry)"]');
	
	//Current project widget
	var activeProjectCount = 'activeCount';
	var backlogProjectCount = 'backlogCount';
	var pipelineProjectCount = 'pipelineCount';
	var investmentProjectCount = 'investmentCount';
	var addProjectBehaviour = by.css('[ng-click="createProject()"]');
	
	//Staffing deficits widget
	var activeProjectDeficitCount = 'activeProjectDeficitCount';
	
	//My projects widget
	var projectNameBinding = 'project.name';
	var myProjects = [];
	
	//People widget
	var showAllPeopleBehaviour = by.css('[ng-click="handleShowPeopleClick()"]');
	var peopleRoles = by.repeater("roleOption in rolesFilterOptions | orderBy:'title'");
	
	//Breadcrumb
	var breadcrumbCtrl = by.className('breadcrumb');
	
	//ProjectKickoffs
	var projectKickoffsCtrl = by.id('projectKickoffsWidget');
	var projectKickoffs =  by.repeater("project in projectsKickingOff | orderBy:'startDate'");
	

	beforeEach(function() {
		browser.driver.manage().window().setSize(windowWidth, windowHeight);
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
	
	it('Hours Widget Test: Add\Remove project.', function() {	
		console.log('> Running: Hours Widget - Add\Remove project.');
		dashboardHoursWidgetAddRemoveRecordTest();
	});
	
	it('Hours Widget Test: Add\Remove task.', function() {	
		console.log('> Running: Hours Widget - Add\Remove task.');
		dashboardHoursWidgetAddRemoveRecordTest(true);
	});
	
	it('Hours Widget Test: Edit hours value.', function() {	
		console.log('> Running: Hours Widget - Edit hours value.');
		dashboardHoursWidgetEditRecordTest();
	});
	
	it('Hours Widget Test: Add absurd value.', function() {	
		console.log('> Running: Hours Widget - Add absurd value.');
		dashboardHoursWidgetAddAbsurdValueTest();
	});
	
	it('Hours Widget Test: Add hours for backlog project.', function() {	
		console.log('> Running: Hours Widget - Add hours for backlog project.');
		dashboardHoursWidgetAddHoursForBacklogProjectTest();
	});

	it('Hours Widget Test: Copy record.', function() {	
		console.log('> Running: Hours Widget - Copy record.');
		dashboardHoursWidgetCopyRecordTest();
	});

	it('Project Kickoffs Widget Test: Should show my future projects', function() {
		console.log('> Running: Project Kickoffse - Show my future projects.');
		dashboardProjectKickoffsShowMyFutureProjectTest();
    });
	
	it('Current Project Widget Test: Projects count.', function() {
		console.log('> Running: Current Project Widget - Compare projects count.');
		dashboardCurrentProjectsCountTest();
    });
	
	it('Current Project Widget Test: Add project', function() {
		console.log('> Running: Current Project Widget - Add project.');
		dashboardCurrentProjectsAddProjectTest();
    });
	
	it('Staffing deficits Widget Test', function() {
		console.log('> Running: Staffing deficits - Compare deficits count.');
		dashboardStaffingDeficitsCountTest();
    });
	
	it('People Widget Test: Show all', function() {
		console.log('> Running: People - Show all.');
		dashboardPeopleShowAllTest();
    });
	
	it('People Widget Test: Show people by role', function() {
		console.log('> Running: People - Show people by role.');
		dashboardPeopleShowPeopleByRoleTest();
    });
	
	var dashboardHoursWidgetAddRemoveRecordTest = function ( isTask ) {
		browser.wait(function(){	    		
	    		return browser.isElementPresent(byId(loggedProjectInput));
	    	}).then(function(){
	    		var hoursTitle = !isTask ? ACTIVE_PROJECT_NAME : TASK_NAME;
	    		addNewHoursRecord(HOURS_VALUE, hoursTitle);
	    		
	    		var elementIndex = "1";
	    		browser.wait(function(){	    		
		    		return browser.isElementPresent(byId(hoursDelete, elementIndex));
		    	}).then(function(){
		    		console.log("> Verifying hours record.");
		    		if (!isTask) {
		    			expect(browser.findElement(byId(loggedProject, elementIndex)).getInnerHtml()).toEqual(hoursTitle);
		    		} else {
		    			expect(browser.findElement(byId(loggedTask, elementIndex)).getInnerHtml()).toEqual(hoursTitle);
		    		}
		    		expect(browser.findElement(byId(loggedHours, elementIndex)).getText()).toEqual(HOURS_VALUE + ' hrs');
		    		expect(browser.findElement(byId(loggedDescription, elementIndex)).getInnerHtml()).toEqual(HOURS_DESCRIPTION);
		    		
		    		console.log("> Removing hours record.");	
		    		browser.findElement(byId(hoursDelete, elementIndex)).click();
		    	});
	    });
	};
	
	var dashboardHoursWidgetEditRecordTest = function () {
		browser.wait(function(){	    		
	    		return browser.isElementPresent(byId(loggedProjectInput));
	    	}).then(function(){
	    		
	    		addNewHoursRecord(HOURS_VALUE);
	    		
	    		var elementIndex = "1";
	    		browser.wait(function(){	    		
		    		return browser.isElementPresent(byId(hoursEdit, elementIndex));
		    	}).then(function(){
		    		console.log("> Editing hours record.");
		    		
		    		browser.findElement(byId(hoursEdit, elementIndex)).click();
		    		browser.sleep(1000);	
		    		var hoursInput = browser.findElement(byId(loggedHoursInput, elementIndex));
		    		hoursInput.clear().then( function () { hoursInput.sendKeys('6'); } );
		    		browser.findElement(byId(hoursSave, elementIndex)).click();
		    		browser.sleep(2000);	
		    		
		    		browser.wait(function(){	    		
			    		return browser.isElementPresent(byId(hoursDelete, elementIndex));
			    	}).then(function(){
			    		console.log("> Removing hours record.");	
			    		browser.findElement(byId(hoursDelete, elementIndex)).click();
			    	});

		    	});
	    });
	};
	
	var dashboardHoursWidgetAddAbsurdValueTest = function () {
		browser.wait(function(){	    		
	    		return browser.isElementPresent(byId(loggedProjectInput));
	    	}).then(function(){
	    		addNewHoursRecord(HOURS_ABSURD_VALUE);
		    	console.log("> Verifying that the absurd value wasn't added.");
		    	verifyErrorMsg('Hours logged on a given day cannot exceed 24 hours.');
		    	element(clearProject).click();
		    	
		    	addNewHoursRecord(HOURS_NULL_VALUE);
		    	console.log("> Verifying that the null value wasn't added.");
		    	verifyErrorMsg('Hours value is empty');
		    	element(clearProject).click();
	    });
	};
	
	var dashboardHoursWidgetAddHoursForBacklogProjectTest = function () {
		browser.wait(function(){	    		
    		return browser.isElementPresent(byId(loggedProjectInput));
    	}).then(function(){
    		addNewHoursRecord(HOURS_VALUE, BACKLOG_PROJECT_NAME);
	    	console.log("> Verifying that the absurd value wasn't added.");
	    	verifyErrorMsg('You are logging hours for project which is already ended or not started');
    	});
	};
	
	var verifyErrorMsg = function ( errMsg ) {
    	var validationMsgCtrl = browser.findElement(byId(hoursValidationMsg));
    	expect(validationMsgCtrl.getInnerHtml()).toBeDefined();
    	expect(validationMsgCtrl.getInnerHtml()).toEqual(errMsg);
	};
	
	var dashboardHoursWidgetCopyRecordTest = function () {
		browser.wait(function(){	    		
	    		return browser.isElementPresent(byId(loggedProjectInput));
	    	}).then(function(){
	    		
	    		console.log("> Copying previous day hours.");
	    		browser.findElement(by.id(hoursCopy)).click();
	    		browser.sleep(2000);	
	    		
	    		console.log("> Verifying that copy button was clicked.");
	    		browser.findElement(byId(hoursValidationMsg)).then(function ( msg ) {
			    	expect(msg.getInnerHtml()).toEqual('No hours to copy found for the last week.');  
	    		}, function( err ) {
	    			expect(browser.findElement(byId(loggedHours)).getInnerHtml()).not.toEqual(' hrs');
	    	    }); 
	    });
	};

	var dashboardCurrentProjectsCountTest = function () {
		browser.wait(function(){	    		
	    		return browser.isElementPresent(by.binding(activeProjectCount));
	    	}).then(function(){
	        	
	    		console.log("> Check current projects count.");
	    		browser.findElement(by.binding(activeProjectCount)).getText().then(function( activeProjects ) {
	    			console.log("> Active projects: " + activeProjects);
	    			browser.findElement(by.binding(backlogProjectCount)).getText().then(function( backlogProjects ) {
	    				console.log("> Backlog projects: " + backlogProjects);
	    				browser.findElement(by.binding(pipelineProjectCount)).getText().then(function( pipelineProjects ) {
	    	    			console.log("> Pipeline projects: " + pipelineProjects);
	    	    			browser.findElement(by.binding(investmentProjectCount)).getText().then(function( investmentProjects ) {
	    		    			console.log("> Investment projects: " + investmentProjects);
	    		    			
	    		    			browser.get('http://localhost:9000/#/projects?filter=active');
	    		 	            browser.sleep(1000);
	    		 	            expect(element.all(by.repeater('project in projects | filter:filterText')).count()).toBeCloseTo(activeProjects);
	    		 	            
	    		 	            browser.get('http://localhost:9000/#/projects?filter=backlog');
	    		 	            browser.sleep(1000);
	    		 	            expect(element.all(by.repeater('project in projects | filter:filterText')).count()).toBeCloseTo(backlogProjects);
	    		 	            
	    		 	            browser.get('http://localhost:9000/#/projects?filter=pipeline');
	    		 	            browser.sleep(1000);
	    		 	            expect(element.all(by.repeater('project in projects | filter:filterText')).count()).toBeCloseTo(pipelineProjects);
	    		 	            
	    		 	            browser.get('http://localhost:9000/#/projects?filter=investment');
	    		 	            browser.sleep(1000);
	    		 	            expect(element.all(by.repeater('project in projects | filter:filterText')).count()).toBeCloseTo(investmentProjects);
	    		 	            
	    	    			});
	    				});
	    			});
	    		});
	    	});
	};
	
	var dashboardCurrentProjectsAddProjectTest = function () {
		browser.wait(function() {	    		
	    		return browser.isElementPresent(addProjectBehaviour);
	    	}).then(function() {
	    		console.log("> Click add project.");
	    		browser.findElement(addProjectBehaviour).click().then(function () {
	    			expect(browser.getCurrentUrl()).toContain('http://localhost:9000/index.html#/projects/new');
	    			browser.get('http://localhost:9000/index.html#/');
	    		});
	    	});
	};
	
	var dashboardStaffingDeficitsCountTest = function () {
		browser.wait(function(){	    		
	    		return browser.isElementPresent(by.binding(activeProjectDeficitCount));
	    	}).then(function(){
	        	
	    		console.log("> Check staffing deficits count.");
	    		browser.findElement(by.binding(activeProjectDeficitCount)).getText().then(function( activeProjectDeficit ) {
	    			console.log("> Active projects deficit: " + activeProjectDeficit);
	    		    
	    			browser.get('http://localhost:9000/index.html#/staffing');
	    		 	browser.sleep(1000);
	    		 	expect(element.all(by.repeater('unassignedRole in $data | filter:filterStaffing(filterText)')).count()).toBeCloseTo(activeProjectDeficit);
	    		 	
	    		 	browser.get('http://localhost:9000/index.html#/');
	    		});
	    	});
	};  
	
	var dashboardMyProjectsTest = function () {
		browser.wait(function(){	    		
	    		return browser.isElementPresent(by.binding(projectNameBinding));
	    	}).then(function(){
	        	
	    		console.log("> Check My projects.");
	    		browser.findElements(by.binding(projectNameBinding)).then(function( projects ) {
	    			var projectsCount = 0;
	    			for (var i in projects){
	    				var project = projects[i];
	    				project.getText().then(function( projectTitle ) {
	    					if (projectTitle) {
	    						projectsCount++;
	    						console.log("> Project title: " + projectTitle);
	    						var isMyProject = false;
	    						for (var j in myProjects) {
	    							if (projectTitle.indexOf(myProjects[j]) > -1) {
	    								isMyProject = true;
	    								break;
	    							}
	    						}
	    						expect(isMyProject).toBe(true);
	    					}
	    					expect(projectsCount).not.toBeGreaterThan(myProjects.length);
	    				});
	    			}
	    			
	    		});
	    		
	    	});
	}; 
	
	var dashboardPeopleShowAllTest = function () {
		browser.wait(function() {	    		
	    		return browser.isElementPresent(showAllPeopleBehaviour);
	    	}).then(function() {
	    		console.log("> Click show all people.");
	    		browser.findElement(showAllPeopleBehaviour).click().then(function () {
	    			expect(browser.getCurrentUrl()).toContain('http://localhost:9000/index.html#/people?filter=all');
	    			browser.get('http://localhost:9000/index.html#/');
	    		});
	    	});
	};
	
	var dashboardPeopleShowPeopleByRoleTest = function () {
		browser.wait(function() {	    		
	    		return browser.isElementPresent(peopleRoles);
	    	}).then(function() {
	    		console.log("> Select role.");
	    		browser.findElements(peopleRoles).then(function (roles) {
	    			var role = roles[0];
	    			role.getText().then(function (roleTitle) {
	    				role.click().then(function (roles) {
		    				console.log("> Show people by role: " + roleTitle);
			    			browser.findElement(showAllPeopleBehaviour).click();
			    			browser.sleep(1000);
			    			expect(browser.getCurrentUrl()).toContain('http://localhost:9000/index.html#/people?filter=roles');
			    			browser.findElement(breadcrumbCtrl).getText().then(function(breadcrumbTitle) {
			    				expect(breadcrumbTitle).toContain(roleTitle);
					    		browser.get('http://localhost:9000/index.html#/');
			    			});
		    			});
	    			});
	    		});
	    	});
	};
	
	var dashboardProjectKickoffsShowMyFutureProjectTest = function () {
		browser.wait(function() {	    		
	    		return browser.isElementPresent(projectKickoffsCtrl);
	    	}).then(function() {
	    		var projectName = BACKLOG_PROJECT_NAME;
	    		console.log("> Project kickoffs should contain: " + projectName);
	    		element.all(projectKickoffs).filter(function (elem) {
	                return elem.getText().then(function (text) {
	                    return text.indexOf(projectName) > -1;
	                });
	            }).then(function (filteredElements) {
	        		expect(filteredElements[0]).toBeDefined();
	        	});
	    	});
	};
	
	var addNewHoursRecord = function (hours, hoursTitle, description) {
		console.log("> Adding hours record.");
		var projectInput = browser.findElement(byId(loggedProjectInput));
		var hoursInput = browser.findElement(byId(loggedHoursInput));
		var descriptionInput = browser.findElement(byId(loggedDescriptionInput));
		projectInput.clear().then( function () { projectInput.sendKeys(hoursTitle ? hoursTitle : ACTIVE_PROJECT_NAME); } );
		browser.wait(function(){	    		
    		return browser.isElementPresent(byId(ddlProjectsTasks));
    	}).then(function(){
    		browser.findElement(byId(ddlProjectsTasks)).click();
    		hoursInput.clear().then( function () { hoursInput.sendKeys(hours); });
    		descriptionInput.clear().then( function () { descriptionInput.sendKeys(description ? description : HOURS_DESCRIPTION); });
    		browser.findElement(byId(hoursAdd)).click();
    		browser.sleep(5000);
    	});
	};
	
	var byId = function (id, index) {
		return index ? by.id(id + index) : by.id(id + '0');
	};
	
	var login = function () {
    	browser.driver.ignoreSynchronization = true;
	    browser.driver.get('http://localhost:9000/login.html');
	    
	    browser.driver.manage().window().setSize(windowWidth, windowHeight);
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
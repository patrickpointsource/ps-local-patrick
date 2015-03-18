/**
 * @Author Denys Novalenko
 * 
 * */
describe('E2E: Staffing Tests', function() {	
    
	// Login form elements
	var USER_NAME = 'psapps@pointsourcellc.com';
    var PASSWORD = 'ps@pp$777';
	var sbutton = by.tagName('button');
	var logonEmail = by.id('Email');
	var logonPswd = by.id('Passwd');
	var signIn = by.id('signIn');
	var submit_approve_access = by.id('submit_approve_access');
    
    // Project attributes
    var PROJECT_NAME = 'Tests - Project Update/Validate';
    var CLIENT_NAME = 'Test client name';
    var PROJECT_CONTACT = 'Test project contact';
    var SPONSOR = 'Reynolds, Brian';
    var START_DATE = new Date('2015-04-01');
    var END_DATE = new Date('2015-07-01');
    var UPDATED_START_DATE = new Date('2015-05-01');
    var UPDATED_END_DATE = new Date('2015-06-01');
    
    // Roles
    var ROLE_BA = { abbreviation : 'BA', title : 'Business Analyst'};
    var ROLE_PM = { abbreviation : 'PM', title : 'Project Manager'};
    var ROLE_ADMIN = { abbreviation : 'ADMIN', title : 'Administration' };
    var ROLE_DA = { abbreviation : 'DA', title : 'Data Architect' };
    
    // Hours attributes
    var HOURS_PER_WEEK = 45;
	var HOURS_VALUE = 7;
	var HOURS_DESCRIPTION = "hours description";
	
	// Hours elements
	var ddlProjectsTasks = 'ddlProjectsTasks';
	var loggedProject = 'loggedProject';
	var loggedHours = 'loggedHours';
	var loggedDescription = 'loggedDescription';
	var loggedProjectInput = 'loggedProjectInput';
	var loggedHoursInput = 'loggedHoursInput';
	var loggedDescriptionInput = 'loggedDescriptionInput';
	var hoursAdd = 'hoursAdd';
	
	// Project form elements
	var projectNameInput = by.id('projectName');
    var customerNameInput = by.id('customerName');
    var primaryContactInput = by.id('primaryContact');
    var startDateInput  = by.id('startDate');
    var endDateInput  = by.id('endDate');
    var executiveSponsorInput = by.id('executiveSponsor');
    var salesSponsorInput = by.id('salesSponsor');
    var projectTypePaidInput = by.css('[ng-class="{\'active\': project.type ==\'paid\'}"]');
    var projectTypePocInput = by.css('[ng-class="{\'active\': project.type ==\'poc\'}"]');
    var projectTypeInvestInput = by.css('[ng-class="{\'active\': project.type ==\'invest\'}"]');
    var projectCommitedInput = by.model('project.committed');
    var billingDateInput  = by.id('billingDate');

	var addProjectButton = by.css('[ng-click="createProject()"]'); 
	var addRoleButton = by.css('[ng-click="triggerAddRole()"]');
	var submitRoleButton = by.css('[ng-click="add()"]');
	var saveProjectButton = by.id('saveProjectButton');
	var editProjectButton = by.css('[ng-click="editProject()"]');
	var deleteProjectButton = by.css('[ng-show="canDeleteProject"]');
	var deleteProjectConfirmButton = by.css('[ng-click="deleteProject()"]');
	var assignmentsButton = by.id('assignmentsButton');
	var addAssignmentButton = by.css('[ng-mousedown="addNewAssignmentToRole($index, role)"]');
	var saveProjectWithShiftedDatesButton = by.css('[ng-click="save(true)"]');
	var projectRoles = by.repeater("role in $data");
	var projectRolesSummary = by.css('[class="row item-row role-row"]')
	
    var projectNameBinding = 'project.name';
    var filterProjectsInput = by.model('filterText');
    
    // Role form elements
    var roleInput = by.id('role');
    var roleStartDateInput = by.id('roleStartDate');
    var roleEndDateInput = by.id('roleEndDate');
    
    // Profile elements
	var profilePhoto = by.id('profile-photo');
	var viewProfile = by.partialLinkText('VIEW PROFILE');

	// Assignment fields
	var assignmentPersonInput = by.css('[ng-change="assigneeChanged($index, role)"]');
	var assignmentHoursInput = by.model('currentAssignee.hoursPerWeek');
	
	var NEEDS_ATTENTION = 'NEEDS ATTENTION';
	var OKAY = 'OKAY';
	var UNASSIGNED = 'UNASSIGNED';
	
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
	
	it('Project Update/Validate Test: Create project', function() {	
		console.log('> Running: Project Update/Validate Test - Create project');
		createProject();
	});

	it('Project Update/Validate Test: Check project date attributes', function() {	
		console.log('> Running: Project Update/Validate Test - Check project date attributes');
		checkProjectDateAttributes();
	});

	it('Project Update/Validate Test: Check project hours', function() {	
		console.log('> Running: Project Update/Validate Test - Check project hours');
		checkProjectHours();
	});

	it('Project Update/Validate Test: Check project assignments', function() {	
		console.log('> Running: Project Update/Validate Test - Check project assignments');
		checkProjectAssignments();
	});

	it('Project Update/Validate Test: Delete project', function() {	
		console.log('> Running: Project Update/Validate Test - Delete project');
		deleteProject();
	});
	
	var createProject = function () {
		var project = getProject();
   		browser.get('http://localhost:9000/index.html#/projects?filter=all').then( function() {
   	   		browser.wait(function(){	    		
   	       		return browser.isElementPresent(addProjectButton);
   	       	}).then(function(){
   	   			browser.findElement(addProjectButton).click().then(function () {
   		   			browser.wait(function(){	    		
   		   	    		return browser.isElementPresent(projectNameInput);
   		   	    	}).then(function(){
   		   	    		fillProjectAttributes(project);
   		   	    		fillRoleAttributes(project);
   		   	    		fillAssignmentsAttributes(project);
   			    	 	browser.findElement(saveProjectButton).click().then(function () {
   			    	 		browser.wait(function(){	    		
   			    	       		return browser.isElementPresent(assignmentsButton);
   			    	       	})	 
   			    	 	});
   			    	 
   		   		   	});
   		   		});
   	       	})
   		});
	}; 
	
	var fillProjectAttributes = function (project) {
   		var projectName = browser.findElement(projectNameInput);
   		projectName.clear().then( function () { projectName.sendKeys(project.name); } );
   		var customerName = browser.findElement(customerNameInput);
   		customerName.clear().then( function () { customerName.sendKeys(project.clientName); } );
   		var primaryContact = browser.findElement(primaryContactInput);
   		primaryContact.clear().then( function () { primaryContact.sendKeys(project.contact); } );
   		browser.findElement(projectTypePaidInput).click();
  		var executiveSponsor = browser.findElement(executiveSponsorInput);
   		executiveSponsor.sendKeys(project.executiveSponsor);
   		var salesSponsor = browser.findElement(salesSponsorInput);
   		salesSponsor.sendKeys(project.salesSponsor);
   		if (project.commited) {
   	   		browser.findElement(projectCommitedInput).click();
   		}
  	   	fillProjectDateAttributes(project);
	}

	var fillProjectDateAttributes = function (project) {
   		var startDate = browser.findElement(startDateInput);
   		startDate.clear().then( function () { startDate.sendKeys(project.startDate); } );
   		var endDate = browser.findElement(endDateInput);
   		endDate.clear().then( function () { endDate.sendKeys(project.endDate); } );
   		var billingDate = browser.findElement(billingDateInput);
   		billingDate.clear().then( function () { billingDate.sendKeys(project.billingDate); } );
	}
	
	var fillRole = function(role) {
		browser.findElement(addRoleButton).click().then(function () {
  		   	browser.wait(function(){	    		
   	    		return browser.isElementPresent(roleInput);
   	    	}).then(function(){
	 	    	browser.findElement(roleInput).sendKeys(role.name);
		    	var roleStartDate = browser.findElement(roleStartDateInput);
 		    	roleStartDate.clear().then( function () { roleStartDate.sendKeys(role.startDate); } );
		    	var roleEndDate = browser.findElement(roleEndDateInput);
		    	roleEndDate.clear().then( function () { roleEndDate.sendKeys(role.endDate); } );
	    	 	browser.findElement(submitRoleButton).click();
   	    	});
		});
	}

	var fillRoleAttributes = function (project) {
		for (var i in project.roles) {
			var role = project.roles[i];			
	    	fillRole(role);
	    	browser.sleep(1000);
		}
	}
	
	var fillAssignmentByIndexes = function (assignment, roleIndex, assignmentIndex) {
	   	browser.findElements(addAssignmentButton).then(function (addAssignmentButtons) {
			addAssignmentButtons[roleIndex].click().then(function () {
				browser.findElements(assignmentPersonInput).then ( function (assignmentPersonInputs) {
					assignmentPersonInputs[assignmentIndex].sendKeys(assignment.person);
				});
		   		if (assignment.hours) {
		   			browser.findElements(assignmentHoursInput).then ( function (assignmentHoursInputs) {
		   				assignmentHoursInputs[assignmentIndex].clear().then( function () { assignmentHoursInputs[assignmentIndex].sendKeys(assignment.hours); } );
		   			});
		   		}	
			});
	   	});
	}
	
	var fillAssignmentsAttributes = function (project) {
		goToTop();
		var assignmentIndex = 0;
   		browser.findElement(assignmentsButton).click().then(function () {
    		for (var i in project.roles) {
    			var role = project.roles[i];
    			if (role.assignments) {
    	     		for (var j in role.assignments) {
    	     			var assignment = role.assignments[j];
    	     			fillAssignmentByIndexes(assignment, i, assignmentIndex++);
    	     		}
    			}
    		}
   		});
	}
	
	var checkProjectDateAttributes = function () {
		var project = getProject();
		
		// update project dates
		project.startDate = getFormattedDate(getDateFromToday(-1));
		project.endDate = getFormattedDate(getDateFromToday(6));
		project.billingDate = getFormattedDate(getDateFromToday(-1));
		
		editAndCheckProjectDateAttributes(project);
	}; 

	var checkProjectHours = function () {
		var project = getProject();
		console.log("> Add hours in profile (weekly mode).");
		browser.findElement(profilePhoto).click().then(function () {
			browser.findElement(viewProfile).click().then(function () {
				addNewHoursRecord(HOURS_VALUE);
				browser.get('http://localhost:9000/index.html#/projects?filter=all').then( function() {
			 		browser.findElement(by.cssContainingText('a', project.name)).getAttribute('href').then(function(url) {
			 	 		url = url.substring(0, url.indexOf("?")) + "/hours";
			 	 		browser.get(url).then(function(){
			 	 		});
			 		});
				});
			});
		});
	}; 

	var checkProjectAssignments = function () {
		var project = getProject();
 		browser.get('http://localhost:9000/index.html#/projects?filter=all').then( function() {
 	 		browser.findElement(by.cssContainingText('a', project.name)).getAttribute('href').then(function(url) {
 	 	 		url = url.substring(0, url.indexOf("?")) + "/summary";
 	 	 		browser.get(url).then(function(){
 	 	 			browser.wait(function() {	    		
 		   	   	    		return browser.isElementPresent(projectRolesSummary);
 		   	   	    	}).then(function() {
 			   	    		browser.findElements(projectRolesSummary).then(function (roles) {
 			   	    			for (var i in roles) {
 			   	    				var roleElement = roles[i];
 			   	    				checkProjectRoleElementByIndex(project, roleElement, i);
 			   	    			}			   	    			
 			   	    		});
 		   	   	    	}); 	 			
 	 	 		});
 	 		});
 	 		
 		});
	}
	
	var checkProjectRoleElementByIndex = function (project, roleElement, roleIndex) {
		roleElement.findElements(by.css("div")).then(function (divs) {
				var assignmentOutput = divs[5];
				assignmentOutput.getText().then(function (assignmentOutputText) {
					var assignmentTitle = divs[0];
					assignmentTitle.getText().then(function (assignmentTitleText) {
						var projectRole = getProjectRoleByTitle(project, assignmentTitleText);
						if (projectRole) {
							var projectRoleAssignmentTextOutput = UNASSIGNED;
							if (projectRole.assignments) {
								var hours = 0;
								for (var i in projectRole.assignments) {
									if (projectRole.assignments[i].hours) {
										hours+= projectRole.assignments[i].hours;
									}
								}
								if (hours < HOURS_PER_WEEK) {
									projectRoleAssignmentTextOutput = NEEDS_ATTENTION;
								} else {
									projectRoleAssignmentTextOutput = OKAY;
								}
							}
							expect(projectRoleAssignmentTextOutput).toBe(assignmentOutputText);
						}
					});
				});
				
			});
	}
	
	var getProjectRoleByTitle = function (project, title) {
		for (var i in project.roles) {
			var role = project.roles[i];
			if (role.title == title) {
				return role;
			}
		}
		return null;
	}

	var goToTop = function () {
		browser.executeScript("window.scrollTo(0,0)");
	}
	
	var editAndCheckProjectDateAttributes = function (project) {
 		browser.get('http://localhost:9000/index.html#/projects?filter=all');
 		browser.findElement(by.cssContainingText('a', project.name)).getAttribute('href').then(function(url) {
 	 		url = url.substring(0, url.indexOf("?")) + "/edit/summary";
 	 		browser.get(url).then(function(){
 	 			browser.wait(function(){	    		
 	   	   			return browser.isElementPresent(saveProjectButton);
 	   		   	}).then(function(){
		    		browser.driver.sleep(1000);	
	   	    		fillProjectDateAttributes(project);
	   	    		browser.findElement(saveProjectButton).click().then(function () {
		    	 		browser.wait(function(){	    		
		    	       		return browser.isElementPresent(saveProjectWithShiftedDatesButton);
		    	        }).then(function(){
 			   	   	    	browser.findElement(saveProjectWithShiftedDatesButton).click().then(function () {
	 			   	   	    	
 			   	   	    		browser.wait(function() {	    		
	 			   	   	    		return browser.isElementPresent(projectRoles);
	 			   	   	    	}).then(function() {
		 			   	    		browser.findElements(projectRoles).then(function (roles) {
		 			   	    			for (var i in roles) {
		 			   	    				var role = roles[i];
			 			   	    			role.findElements(by.css("td")).then(function (tds) {
		 			   	    					var startDateText = tds[3];
		 			   	    					startDateText.getText().then(function (sdText) {
		 			   	    						expect(getFormattedDate(new Date(project.startDate))).toBe(getFormattedDate(new Date(sdText)));
		 			   	    					});
		 			   	    					var endDateText = tds[4];
		 			   	    					endDateText.getText().then(function (edText) {
		 			   	    						expect(getFormattedDate(new Date(project.endDate))).toBe(getFormattedDate(new Date(edText)));
		 			   	    					});
		 			   	    				});
		 			   	    			}
		 			   	    		});
	 			   	   	    	});
 	    		   			});
		    	        });
		    	 	});
 	   		   	});
 	 		});
 		});
	}
	
	var deleteProject = function () {
		var project = getProject();
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
	
	var getProject = function() {
		var project = {
			name : PROJECT_NAME,
			clientName : CLIENT_NAME,
			contact : PROJECT_CONTACT,
			executiveSponsor : SPONSOR,
			salesSponsor : SPONSOR, 
			startDate : getFormattedDate(getDateFromToday(-2)),
			endDate : getFormattedDate(getDateFromToday(7)),
			billingDate : getFormattedDate(getDateFromToday(-2)),
			commited : true,
			roles : [
				{
					name : ROLE_BA.abbreviation,
					title : ROLE_BA.title,
					startDate : getFormattedDate(getDateFromToday(-2)),
					endDate : getFormattedDate(getDateFromToday(7)),
				 	assignments : [
					 	{
						 	person : ROLE_PM.abbreviation + ": " + SPONSOR,
						 	hours : 45
					 	}
				 	]
				 },
				 {
					name : ROLE_PM.abbreviation,
					title : ROLE_PM.title,
				 	startDate : getFormattedDate(getDateFromToday(-2)),
				 	endDate : getFormattedDate(getDateFromToday(7))
				 },
				 {
					name : ROLE_ADMIN.abbreviation,
					title : ROLE_ADMIN.title,
				 	startDate : getFormattedDate(getDateFromToday(-2)),
				 	endDate : getFormattedDate(getDateFromToday(7)),
				 	assignments : [
					 	{
						 	person : ROLE_PM.abbreviation + ": " + SPONSOR,
						 	hours : 22
					 	}
				 	]
				 },
				 {
					name : ROLE_DA.abbreviation,
					title : ROLE_DA.title,
				 	startDate : getFormattedDate(getDateFromToday(-2)),
				 	endDate : getFormattedDate(getDateFromToday(7)),
				 	assignments : [
					 	{
					 		person : ROLE_PM.abbreviation + ": " + SPONSOR,
						 	hours : 22
					 	},
					 	{
					 		person : ROLE_PM.abbreviation + ": " + SPONSOR,
						 	hours : 23
					 	}
					]
				 },
				 
			]
			
		}
		return project;
	}

	var getDateFromToday = function(monthCount) {
		var date = new Date();
		date.setMonth( date.getMonth() + monthCount );
		return date;
	}
	
	var getFormattedDate = function(date) {
		var year = date.getFullYear();
		var month = (1 + date.getMonth()).toString();
		month = month.length > 1 ? month : '0' + month;
		var day = date.getDate().toString();
		day = day.length > 1 ? day : '0' + day;
		return year + '-' + month + '-' + day;
	}
	
	var addNewHoursRecord = function (hours) {
		console.log("> Adding hours record.");
		browser.findElement(byId(loggedProjectInput)).sendKeys(PROJECT_NAME);
		browser.wait(function(){	    		
    		return browser.isElementPresent(byId(ddlProjectsTasks));
    	}).then(function(){
    		browser.findElement(byId(ddlProjectsTasks)).click();
    		browser.findElement(byId(loggedHoursInput)).sendKeys(hours);
    		browser.findElement(byId(loggedDescriptionInput)).sendKeys(HOURS_DESCRIPTION);
    		browser.findElement(byId(hoursAdd)).click();
    		browser.sleep(2000);
    	});
	};
	

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
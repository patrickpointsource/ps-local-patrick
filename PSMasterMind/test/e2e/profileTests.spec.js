/**
 * @Author Denys Novalenko
 * 
 * */
describe('E2E: Profile Tests', function() {	
    
    var USER_NAME = 'psapps@pointsourcellc.com';
    var PASSWORD = 'ps@pp$777';
    var USER_FULLNAME = 'apps, ps';
    var CSV_FILENAME = 'ps apps.csv';
    
	var HOURS_PROJECT = "MasterMind";
	var HOURS_VALUE = 8;
	var HOURS_DESCRIPTION = "Profile hours Widget: E2E Testing";
	
	var FROM_DATE_STRING = "2015-01-01";
	var TO_DATE_STRING = "2015-02-01";

	var sbutton = by.tagName('button');
	var logonEmail = by.id('Email');
	var logonPswd = by.id('Passwd');
	var signIn = by.id('signIn');
	var submit_approve_access = by.id('submit_approve_access');
	
	var profilePhoto = by.id('profile-photo');
	var viewProfile = by.partialLinkText('VIEW PROFILE');
	
	var projectNameBinding = 'project.name';
	var assignmentNameBinding = 'assignment.project.name';
	var hourNameBinding = 'day.dayOfMonth';
	var projectHourNameBinding = 'projectHour.project.name';
	
	var monthlyButton = by.css('[ng-click="setSubmode($event, \'monthly\')"]');
	var weeklyButton = by.css('[ng-click="setSubmode($event, \'weekly\')"]');
	var customButton = by.css('[ng-click="setSubmode($event, \'custom\')"]');
	
	var editButton = by.css('[ng-click="edit()"]');
	var saveButton = by.css('[ng-click="save()"]');

	var fromDate = by.id('fromDate');
	var toDate = by.id('toDate');
	var applyCustomHoursButton = by.css('[ng-click="applyCustomHoursPeriod()"]');
	var csvDownloadButton = by.css('[ng-enabled="csvDownloadEnabled"]');
	
	var activeCircle = by.css('.active-circle');
		
	var ddlProjectsTasks = 'ddlProjectsTasks';
	var loggedProject = 'loggedProject';
	var loggedHours = 'loggedHours';
	var loggedDescription = 'loggedDescription';
	var loggedProjectInput = 'loggedProjectInput';
	var loggedHoursInput = 'loggedHoursInput';
	var loggedDescriptionInput = 'loggedDescriptionInput';
	
	var hoursAdd = 'hoursAdd';
	var hoursSave = 'hoursSave';
	var hoursDelete = 'hoursDelete';	
	var hoursCopy = 'hoursCopy';
	var hoursEdit = 'hoursEdit';
	
	// profile fields
	var profilePhone = by.id('profilePhone');
	var profileSkype = by.id('profileSkype');
	var profileJazzHub = by.id('profileJazzHub');
	var profilePrimaryRole = by.model('profile.primaryRole.resource');
	var profileUserSecurityGroups = by.model('userSecurityGroups');
	var profilePartTime = by.css('[ng-model="profile.partTime"]');
	var partTimeHours = by.model('profile.partTimeHours');
	
	var PHONE_TEST = '888-555-000';
	var SKYPE_TEST = 'testSkype';
	var JAZZHUB_TEST = 'testJazzHub';
	var PRIMARY_ROLE_TEST = 'ADMIN';
	var PRIMARY_ROLE_LABEL_TEST = 'Administration';
	var PRIMARY_USER_GROUPS_TEST = 'PM';
	var PART_TIME_HOURS_TEST = '25';
	
	var profilePrimaryRoleLabel = by.css('[ng-if="profile.primaryRole"]');
	var profilePhoneLabel = by.css('[ng-if="profile.phone"]');
	var profileSkypeLabel = by.css('[ng-if="profile.skypeId"]');
	var profileJazzHubLabel = by.css('[ng-if="profile.jazzHubId"]');
	var partTimeHoursLabel = by.css('[ng-show="profile.partTime"]');

	var NO_ACTIVE_PROJECTS = 'There are no active projects';
	
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
	
	it('Profile Test: Check assignments.', function() {	
		console.log('> Running: Profile - Check assignments.');
		checkAssignmentsTest();
	});

	it('Profile Test: Check hours.', function() {	
		console.log('> Running: Profile - Check hours.');
		checkHoursTest();
	});

	it('Profile Test: Add hours.', function() {	
		console.log('> Running: Profile - Add hours.');
		addHoursTest();
	});
	
	it('Profile Test: Add hours in monthly view.', function() {	
		console.log('> Running: Profile - Add hours in monthly view.');
		addHoursInMonthlyViewTest();
	});
	
	it('Profile Test: Display hours and check export.', function() {	
		console.log('> Running: Profile - Display hours and check export.');
		displayHoursAndCheckExportTest();
	});
	
	it('Profile Test: Edit profile.', function() {	
		console.log('> Running: Profile - Edit profile.');
		editProfileTest();
	});

	
	var checkAssignmentsTest = function () {
		console.log("> Check my projects in profile.");
		browser.findElement(profilePhoto).click().then(function () {
			browser.findElement(viewProfile).click().then(function () {
				browser.findElements(by.binding(assignmentNameBinding)).then(function( assignments ) {
					for (var i in assignments){
						var assignment = assignments[i];
						var assignmentsCount = 0;
	   					assignment.getText().then(function( projectTitle ) {
	    					if (projectTitle) {
	    						assignmentsCount++;
		    					console.log("> Project title: " + projectTitle);
		    				}
		   				});	
	   					if (assignmentsCount == 0 ) {
	   						expect(browser.findElement(by.cssContainingText('div', NO_ACTIVE_PROJECTS)).getText()).toEqual(NO_ACTIVE_PROJECTS);
	  					}
					}
				});
			});
		});
	}; 

	var isDisplayed = function (index, collection, callback) {
		collection[index].isDisplayed().then(function (isVisible) {
			callback(isVisible, index);
		});
	}
	
	var addHoursTest = function () {
		console.log("> Add hours in profile (weekly mode).");
		browser.findElement(profilePhoto).click().then(function () {
			browser.findElement(viewProfile).click().then(function () {
				addNewHoursRecord(HOURS_VALUE);
				console.log("> Verifying hours in profile (weekly mode).");
				var elementIndex = '1';
				expect(browser.findElement(byId(loggedProject, elementIndex)).getInnerHtml()).toEqual(HOURS_PROJECT);
		   		expect(browser.findElement(byId(loggedHours, elementIndex)).getText()).toEqual(HOURS_VALUE + ' hrs');
		   		expect(browser.findElement(byId(loggedDescription, elementIndex)).getInnerHtml()).toEqual(HOURS_DESCRIPTION);
		   		console.log("> Removing hours record (weekly mode).");	
		   		browser.findElement(byId(hoursDelete, elementIndex)).click();	
		 		browser.sleep(1000);
   			});
		});
	}; 
	
	
	
	
	var addHoursInMonthlyViewTest = function () {
		console.log("> Add hours in profile (monthly mode).");
			browser.findElement(profilePhoto).click().then(function () {
				browser.findElement(viewProfile).click().then(function () {
					browser.findElement(monthlyButton).click().then(function () {
			    		browser.findElements(activeCircle).then(function( dayLinks ) {
			    			for (var i in dayLinks ) {
			    				isDisplayed(i, dayLinks, function (isVisible, index) {
			    					if (isVisible) {
			    						dayLinks[index].click().then(function () {
			    							addNewHoursRecord(HOURS_VALUE);
	   			   					});
   			    			    } 
			    				});
   			    		}
		   				browser.refresh();
		   				console.log("> Verifying hours in profile (weekly mode).");
   						var elementIndex = '1';
	   					browser.wait(function(){	    		
	   						return browser.isElementPresent(byId(loggedProject, elementIndex));
	   					}).then(function(){
				    		expect(browser.findElement(byId(loggedProject, elementIndex)).getInnerHtml()).toEqual(HOURS_PROJECT);
				    		expect(browser.findElement(byId(loggedHours, elementIndex)).getText()).toEqual(HOURS_VALUE + ' hrs');
				    		expect(browser.findElement(byId(loggedDescription, elementIndex)).getInnerHtml()).toEqual(HOURS_DESCRIPTION);
				    		console.log("> Removing hours record (weekly mode).");	
				    		browser.findElement(byId(hoursDelete, elementIndex)).click();	
					 		browser.sleep(1000);
	   					});

			    		});
					});
   			});
		});
	}; 
	
	var checkHoursTest = function () {
		browser.get('http://localhost:9000/index.html#/').then(function(){
			browser.wait(function(){	    		
	    		return browser.isElementPresent(profilePhoto);
	    	}).then(function(){
	    		console.log("> Check hours on dashboard.");
	    		element.all(by.css('.hours-day-content')).then(function(dashboardElements) {
	    			var dashboardHours = [];
	    			for (i in dashboardElements) {
	    				dashboardHours.push(dashboardElements[i].getText());
	    			}
	    			browser.findElement(profilePhoto).click().then(function () {
		   				browser.findElement(viewProfile).click().then(function () {
		   		    		console.log("> Check hours in profile.");
		   		    		element.all(by.css('.hours-day-content')).then(function(profileElements) {
		   		    			for (i in profileElements) {
		    				    	expect(profileElements[i].getText()).toEqual(dashboardHours[i]);
		   		    			}
		   		    		});
		   				});
	    			});
	    		});
	     	});
		});
	}

	
	var editProfileTest = function () {
			browser.findElement(profilePhoto).click().then(function () {
   				browser.findElement(viewProfile).click().then(function () {
   					browser.wait(function(){	    		
   			    		return browser.isElementPresent(editButton);
   			    	}).then(function(){
   			    		browser.findElement(editButton).click().then(function () {
   			    			
   			    			browser.findElement(profilePrimaryRole).sendKeys(PRIMARY_ROLE_TEST);
   			    			var profilePhoneInput = browser.findElement(profilePhone);
   			    			profilePhoneInput.clear().then( function () { profilePhoneInput.sendKeys(PHONE_TEST); } );
   			    			var profileSkypeInput = browser.findElement(profileSkype);
   			    			profileSkypeInput.clear().then( function () { profileSkypeInput.sendKeys(SKYPE_TEST); } );
   			    			var profileJazzHubInput = browser.findElement(profileJazzHub);
   			    			profileJazzHubInput.clear().then( function () { profileJazzHubInput.sendKeys(JAZZHUB_TEST); } );
   			    				   			    			
   			    			if (!browser.findElement(profilePartTime).isSelected()) {
	   			    			browser.findElement(profilePartTime).click();
   			    			}
   			    			
   			    			var partTimeHoursInput = browser.findElement(partTimeHours);
   			    			partTimeHoursInput.clear().then( function () { partTimeHoursInput.sendKeys(PART_TIME_HOURS_TEST); } );

   			    			browser.findElement(saveButton).click().then(function () {
	    				    	expect(browser.findElement(profilePrimaryRoleLabel).getInnerHtml()).toEqual(PRIMARY_ROLE_LABEL_TEST);
	    				    	expect(browser.findElement(profilePhoneLabel).getInnerHtml()).toEqual(PHONE_TEST);
	    				    	expect(browser.findElement(profileSkypeLabel).getInnerHtml()).toEqual(SKYPE_TEST);
	    				    	expect(browser.findElement(profileJazzHubLabel).getInnerHtml()).toEqual(JAZZHUB_TEST);
	    				    	expect(browser.findElement(partTimeHoursLabel).getInnerHtml()).toEqual(PART_TIME_HOURS_TEST + 'h/w');
	    				    	
	    		    			browser.get('http://localhost:9000/index.html#/people?filter=administration');
	    			    		browser.wait(function(){	    		
	    	   			    		return browser.isElementPresent(by.css('.person-name'));
	    	   			    	}).then(function(){
		    				    	expect(browser.findElement(by.cssContainingText('.person-name', USER_FULLNAME)).getText()).toEqual(USER_FULLNAME);
	    	   			    	});
   			    			});
   			    		});
   			    	});
	   			});
    		});
	}; 
	
	
	var displayHoursAndCheckExportTest = function () {
    	console.log("> Add hours in profile (weekly mode).");
   		browser.findElement(profilePhoto).click().then(function () {
   			browser.findElement(viewProfile).click().then(function () {
   				browser.findElement(customButton).click().then(function () {
		    			browser.findElement(fromDate).sendKeys(FROM_DATE_STRING);
			   			browser.findElement(toDate).sendKeys(TO_DATE_STRING);
			    		browser.findElement(applyCustomHoursButton).click().then(function () {
			   				var entryCount = element.all(by.repeater('hourEntry in selected.hoursEntries')).count()
			   				//var csvFile = browser.executeScript('hoursToCSV.generate()');
			   			});
		   			});
   			});
		});
	}; 

	
	
	var addNewHoursRecord = function (hours) {
		console.log("> Adding hours record.");
		browser.findElement(byId(loggedProjectInput)).sendKeys(HOURS_PROJECT);
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
	
	var byId = function (id, index) {
		return index ? by.id(id + index) : by.id(id + '0');
	};
	
	var login = function () {
		browser.driver.ignoreSynchronization = true;
	    browser.driver.get('http://localhost:9000');
	    
	    browser.driver.wait(function() {	    	
	    	return browser.driver.isElementPresent(sbutton);
	    	
	    }).then(function(){
		    // expect the signin button to be present
	    	// expect(browser.driver.isElementPresent(sbutton)).toBeTruthy();
		    console.log('login button is available. Clicking it');
	    	// find the signin button and click it
		    browser.driver.findElement(sbutton).click();		    

	    }); 

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
	};
	
});
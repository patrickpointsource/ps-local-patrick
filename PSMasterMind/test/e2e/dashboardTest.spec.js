/**
 * @Author vitali prakapchuk
 * 
 * */
describe('E2E: Dashboard Test Cases >', function() {
	
	var USER_NAME = 'psapps@pointsourcellc.com';
	var PASSWORD = 'ps@pp$777';
	
	var HOURS_PROJECT = "MasterMind";
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
	
	//Current project widget
	var activeProjectCount = 'activeProjectCount';
	var backlogProjectCount = 'backlogProjectCount';
	var pipelineProjectCount = 'pipelineProjectCount';
	var investmentProjectCount = 'investmentProjectCount';
	

	beforeEach(function() {
		browser.driver.getCurrentUrl().then(function(url) {
			if ( url.indexOf('http://localhost:9000/index.html#/') == -1 ) {
				login();
			}
		});
	});
	
	var dashboardHoursWidgetAddRemoveRecordTest = function () {
		browser.wait(function(){	    		
	    		return browser.isElementPresent(byId(loggedProjectInput));
	    	}).then(function(){
	    		
	    		addNewHoursRecord(HOURS_VALUE);
	    		
	    		var elementIndex = "1";
	    		browser.wait(function(){	    		
		    		return browser.isElementPresent(byId(hoursDelete, elementIndex));
		    	}).then(function(){
		    		console.log("> Verifying hours record.");
		    		expect(browser.findElement(byId(loggedProject, elementIndex)).getInnerHtml()).toEqual(HOURS_PROJECT);
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
		    	var validationMsgCtrl = browser.findElement(byId(hoursValidationMsg));
		    	var loggedDescriptionCtrl = browser.findElement(byId(loggedDescription));
		    	var validationMsg = validationMsgCtrl ? validationMsgCtrl.getInnerHtml() : null;
		    	var description = loggedDescriptionCtrl ? loggedDescriptionCtrl.getInnerHtml() : null;
		    	expect(validationMsg).toEqual('Hours logged on a given day cannot exceed 24 hours.');
		    	expect(description).not.toEqual(HOURS_DESCRIPTION);
		    	
		    	console.log("> Adding null value.");
		    	var hoursInput = browser.findElement(byId(loggedHoursInput));
		    	hoursInput.clear().then( function () { hoursInput.sendKeys(HOURS_NULL_VALUE); } );
	    		browser.findElement(byId(hoursAdd)).click();
	    		browser.sleep(1000);	
	    		
		    	console.log("> Verifying that the null value wasn't added.");
		    	var validationMsgCtrl = browser.findElement(byId(hoursValidationMsg));
		    	var loggedDescriptionCtrl = browser.findElement(byId(loggedDescription));
		    	var validationMsg = validationMsgCtrl ? validationMsgCtrl.getInnerHtml() : null;
		    	var description = loggedDescriptionCtrl ? loggedDescriptionCtrl.getInnerHtml() : null;
		    	expect(validationMsg).toEqual('Hours value is empty');
		    	expect(description).not.toEqual(HOURS_DESCRIPTION);
	    });
	};
	
	var dashboardHoursWidgetCopyRecordTest = function () {
		browser.wait(function(){	    		
	    		return browser.isElementPresent(byId(loggedProjectInput));
	    	}).then(function(){
	    		
	    		console.log("> Copying previous day hours.");
	    		browser.findElement(by.id(hoursCopy)).click();
	    		browser.sleep(2000);	
	    		
	    		console.log("> Verifying that hours are not empty.");
		    	expect(browser.findElement(byId(loggedHours)).getInnerHtml()).not.toEqual(' hrs');    	
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
    		browser.sleep(4000);
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
	
	
	it('Hours Widget Test: Add\Remove record.', function() {	
		console.log('> Running: Hours Widget - Add\Remove record.');
		dashboardHoursWidgetAddRemoveRecordTest();
	});
	
	it('Hours Widget Test: Edit hours value.', function() {	
		console.log('> Running: Hours Widget - Edit hours value.');
		dashboardHoursWidgetEditRecordTest();
	});
	
	it('Hours Widget Test: Add absurd value.', function() {	
		console.log('> Running: Hours Widget - Add absurd value.');
		dashboardHoursWidgetAddAbsurdValueTest();
	});

	it('Hours Widget Test: Copy record.', function() {	
		console.log('> Running: Hours Widget - Copy record.');
		dashboardHoursWidgetCopyRecordTest();
	});
	
});
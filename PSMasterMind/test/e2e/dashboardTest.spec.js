/**
 * @Author vitali prakapchuk
 * 
 * */
describe('E2E: Dashboard Test Cases >', function() {
	
	var HOURS_PROJECT = "MasterMind";
	var HOURS_VALUE = 8;
	var HOURS_ABSURD_VALUE = 50;
	var HOURS_NULL_VALUE = 0;
	var HOURS_DESCRIPTION = "Hours Widget: E2E Testing";
	
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
    		return browser.isElementPresent(by.id(ddlProjectsTasks));
    	}).then(function(){
    		browser.findElement(by.id(ddlProjectsTasks)).click();
    		browser.findElement(byId(loggedHoursInput)).sendKeys(hours);
    		browser.findElement(byId(loggedDescriptionInput)).sendKeys(HOURS_DESCRIPTION);
    		browser.findElement(byId(hoursAdd)).click();
    		browser.sleep(4000);
    	});
	};
	
	var byId = function (id, index) {
		return index ? by.id(id + index) : by.id(id + '0');
	};
	
	beforeEach(function() {
		browser.getCurrentUrl().then(function(url) {
			if ( url.indexOf('http://localhost:9000/index.html#/') == -1 ) {
				browser.get('http://localhost:9000/index.html#/');
				browser.sleep(1000);
			}
		});
	});
	
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
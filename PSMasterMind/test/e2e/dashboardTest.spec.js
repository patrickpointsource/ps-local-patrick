/**
 * @Author vitali prakapchuk
 * 
 * */
describe('E2E: DashboardTest', function() {
	
	var HOURS_PROJECT = "MasterMind";
	var HOURS_VALUE = 8;
	var HOURS_DESCRIPTION = "Testing";
	
	var loggedProject = 'loggedProject';
	var loggedProjectSelector = 'loggedProjectSelector';
	var loggedHours = 'loggedHours';
	var loggedDescription = 'loggedDescription';
	var loggedProjectInput = 'loggedProjectInput';
	var loggedHoursInput = 'loggedHoursInput';
	var loggedDescriptionInput = 'loggedDescriptionInput';
	var hoursAdd = 'hoursAdd';
	var hoursSave = 'hoursSave';
	var hoursDelete = 'hoursDelete';	
	
	var byId = function (id, index) {
		return index ? by.id(id + index) : by.id(id);
	};
	
	var dashboardHoursWidgetAddRecord = function () {
		var elementIndex = "0";
		browser.driver.wait(function(){	    		
	    		return browser.driver.isElementPresent(byId(loggedProjectInput, elementIndex));
	    	}).then(function(){
	    		console.log("> Hours widget. Adding hours record.");
	    		
	    		browser.driver.findElement(byId(loggedProjectInput, elementIndex)).sendKeys(HOURS_PROJECT);
	    		browser.driver.findElement(byId(loggedProjectSelector, elementIndex)).click();
	    		browser.driver.findElement(byId(loggedHoursInput, elementIndex)).sendKeys(HOURS_VALUE);
	    		browser.driver.findElement(byId(loggedDescriptionInput, elementIndex)).sendKeys(HOURS_DESCRIPTION);
	    		browser.driver.findElement(byId(hoursAdd, elementIndex)).click();
	    		browser.driver.sleep(3500);	
	    		
	    		elementIndex = "1";
	    		browser.driver.wait(function(){	    		
		    		return browser.driver.isElementPresent(byId(hoursDelete, elementIndex));
		    	}).then(function(){
		    		console.log("> Hours widget. Verifying hours record.");
		    		expect(browser.driver.findElement(byId(loggedProject, elementIndex)).getInnerHtml()).toEqual(HOURS_PROJECT);
		    		expect(browser.driver.findElement(byId(loggedHours, elementIndex)).getText()).toEqual(HOURS_VALUE + ' hrs');
		    		expect(browser.driver.findElement(byId(loggedDescription, elementIndex)).getInnerHtml()).toEqual(HOURS_DESCRIPTION);
		    		console.log("> Hours widget. Removing hours record.");	
		    		browser.driver.findElement(byId(hoursDelete, elementIndex)).click();
		    		browser.driver.sleep(1000);	
		    	});
	    });
	};
		
	it('Test Dashboard page', function() {	
		console.log('> Running Dashboard Test');
		dashboardHoursWidgetAddRecord();
	});
	
});
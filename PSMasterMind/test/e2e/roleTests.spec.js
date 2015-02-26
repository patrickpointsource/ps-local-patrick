/**
 * @Author Denys Novalenko
 * 
 * */
describe('E2E: Staffing Tests', function() {	
    
	var USER_NAME = 'psapps@pointsourcellc.com';
    var PASSWORD = 'ps@pp$777';
    
    // buttons
    var addRolesButton = by.css('[ng-click="toggleNewRole()"]');
    var addRoleButton = by.css('[ng-click="addRole()"]');
    var saveRoleButton = by.css('[ng-click="saveRole()"]');
    var editRoleDialogButton = by.css('[ng-click="triggerEditRole(role, $index)"]')
    var deleteRoleButton = by.css('[ng-click="deleteRole(role.resource)"]');
    var editForm = by.css('[ng-form="RoleEditForm"]');
    
    // default values
    var DEFAULT_ABBREVIATION = 'TR';
    var DEFAULT_TITLE = 'Default Test Role';
    var DEFAULT_HOURLY_ADVERTISED_RATE = '10';
    var DEFAULT_HOURLY_LOADED_RATE = '11';
    var DEFAULT_MONTHLY_ADVERTISED_RATE = '12';
    var DEFAULT_MONTHLY_LOADED_RATE = '13';
    var DEFAULT_UTILIZATION_RATE = '14';
    var DEFAULT_IS_NON_BILLABLE = false;    
    
    // role fields
    var roleAbbreviationInput = by.css('[ng-model="newRole.abbreviation"]');
    var roleTitleInput = by.css('[ng-model="newRole.title"]');
    var hourlyAdvertisedRateInput = by.css('[ng-model="newRole.hourlyAdvertisedRate"]');
    var hourlyLoadedRateInput = by.css('[ng-model="newRole.hourlyLoadedRate"]');
    var monthlyAdvertisedRateInput = by.css('[ng-model="newRole.monthlyAdvertisedRate"]');
    var monthlyLoadedRateInput = by.css('[ng-model="newRole.monthlyLoadedRate"]');
    var utilizationRateInput = by.css('[ng-model="newRole.utilizationRate"]');
    var isNonBillableInput = by.css('[ng-model="newRole.isNonBillable"]');
        
	var sbutton = by.tagName('button');
	var logonEmail = by.id('Email');
	var logonPswd = by.id('Passwd');
	var signIn = by.id('signIn');
	var submit_approve_access = by.id('submit_approve_access');

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
	
	it('Role Test: Create & check role', function() {	
		console.log('> Running: Role - Create & check that role exists');
		createAndCheckRole();
	});

	it('Role Test: Update & check hourly role attributes', function() {	
		console.log('> Running: Role - Update & check hourly role attributes');
		updateAndCheckHourlyAttributes();
	});

	it('Role Test: Update & check monthly role attributes', function() {	
		console.log('> Running: Role - Update & check monthly role attributes');
		updateAndCheckMonthlyAttributes();
	});	

	it('Role Test: Delete role & check ', function() {	
		console.log('> Running: Role - Delete role & check');
		deleteRoleAndCheck();
	});	

	var createAndCheckRole  = function () {
		browser.get('http://localhost:9000/index.html#/admin');
   		browser.wait(function(){	    		
       		return browser.isElementPresent(addRolesButton);
       	}).then(function(){
       		browser.findElement(addRolesButton).click().then(function () {
	   			browser.wait(function(){	    		
	   	    		return browser.isElementPresent(roleAbbreviationInput);
	   	    	}).then(function(){
	   	    	    
	   	    		var roleAbbreviation = browser.findElement(roleAbbreviationInput);
	   	    		roleAbbreviation.clear().then( function () { roleAbbreviation.sendKeys(DEFAULT_ABBREVIATION); } );
	   	    		var roleTitle = browser.findElement(roleTitleInput);
	   	    		roleTitle.clear().then( function () { roleTitle.sendKeys(DEFAULT_TITLE); } );

	   	    		var utilizationRate = browser.findElement(utilizationRateInput);
	   	    		utilizationRate.clear().then( function () { utilizationRate.sendKeys(DEFAULT_UTILIZATION_RATE); } );
	   	    		
	   	    		if (DEFAULT_IS_NON_BILLABLE) {
	   	    			var isNonBillable = browser.findElement(isNonBillableInput);
	   	    			isNonBillable.click();
	   	    		}
	   	    		browser.findElement(addRoleButton).click().then(function () {
	   	    	 		var titleElement = browser.findElement(by.cssContainingText('td', DEFAULT_TITLE));
			    		expect(titleElement.getText()).toEqual(DEFAULT_TITLE);
	   	    		});
	   	    	});
       		});
       	});
	}; 

	var updateAndCheckHourlyAttributes  = function () {
		browser.get('http://localhost:9000/index.html#/admin');
   		browser.wait(function(){	    		
       		return browser.isElementPresent(addRolesButton);
       	}).then(function(){
	   		var titleElement = browser.findElement(by.cssContainingText('td', DEFAULT_TITLE));
   	   		var parentElement = titleElement.findElement(by.xpath('..'));
   	   		var editElement = parentElement.findElement(editRoleDialogButton);
   	     	editElement.click().then(function () {
   	     		browser.wait(function(){	    		
	   	    		return browser.isElementPresent(saveRoleButton);
	   	    	}).then(function(){
		    		browser.driver.sleep(1000);	
		    		browser.findElements(editForm).then( function (editForms) {
		   	    		var hourlyAdvertisedRate = editForms[1].findElement(hourlyAdvertisedRateInput);
		   	    		hourlyAdvertisedRate.clear().then( function () { hourlyAdvertisedRate.sendKeys(DEFAULT_HOURLY_ADVERTISED_RATE); } );
		   	    		var hourlyLoadedRate = editForms[1].findElement(hourlyLoadedRateInput);
		   	    		hourlyLoadedRate.clear().then( function () { hourlyLoadedRate.sendKeys(DEFAULT_HOURLY_LOADED_RATE); } );
		   	    		editForms[1].findElement(saveRoleButton).click().then( function () {
				    		browser.driver.sleep(1000);	
   	    					checkHourlyAttributes();
		   	    		});
		    		});
		   	   	});
   	     	});       		
       	});
	}
	
	var checkHourlyAttributes  = function () {
		browser.get('http://localhost:9000/index.html#/admin');
   		browser.wait(function(){	    		
       		return browser.isElementPresent(addRolesButton);
       	}).then(function(){
	   		var titleElement = browser.findElement(by.cssContainingText('td', DEFAULT_TITLE));
   	   		var parentElement = titleElement.findElement(by.xpath('..'));
   	   		var editElement = parentElement.findElement(editRoleDialogButton);
   	     	editElement.click().then(function () {
   	     		browser.wait(function(){	    		
	   	    		return browser.isElementPresent(saveRoleButton);
	   	    	}).then(function(){
		    		browser.driver.sleep(1000);	
		    		browser.findElements(editForm).then( function (editForms) {
		   	    		var hourlyAdvertisedRate = editForms[1].findElement(hourlyAdvertisedRateInput);
			    		expect(hourlyAdvertisedRate.getAttribute('value')).toEqual(DEFAULT_HOURLY_ADVERTISED_RATE);
		   	    		var hourlyLoadedRate = editForms[1].findElement(hourlyLoadedRateInput);
			    		expect(hourlyLoadedRate.getAttribute('value')).toEqual(DEFAULT_HOURLY_LOADED_RATE);
		    		});
		   	   	});
   	     	});       		
       	});
	}

	var updateAndCheckMonthlyAttributes  = function () {
		browser.get('http://localhost:9000/index.html#/admin');
   		browser.wait(function(){	    		
       		return browser.isElementPresent(addRolesButton);
       	}).then(function(){
	   		var titleElement = browser.findElement(by.cssContainingText('td', DEFAULT_TITLE));
   	   		var parentElement = titleElement.findElement(by.xpath('..'));
   	   		var editElement = parentElement.findElement(editRoleDialogButton);
   	     	editElement.click().then(function () {
   	     		browser.wait(function(){	    		
	   	    		return browser.isElementPresent(saveRoleButton);
	   	    	}).then(function(){
		    		browser.driver.sleep(1000);	
		    		browser.findElements(editForm).then( function (editForms) {
		   	    		var monthlyAdvertisedRate = editForms[1].findElement(monthlyAdvertisedRateInput);
		   	    		monthlyAdvertisedRate.clear().then( function () { monthlyAdvertisedRate.sendKeys(DEFAULT_MONTHLY_ADVERTISED_RATE); } );
		   	    		var monthlyLoadedRate = editForms[1].findElement(monthlyLoadedRateInput);
		   	    		monthlyLoadedRate.clear().then( function () { monthlyLoadedRate.sendKeys(DEFAULT_MONTHLY_LOADED_RATE); } );
		   	    		editForms[1].findElement(saveRoleButton).click().then( function () {
				    		browser.driver.sleep(1000);	
		   	    			checkMonthlyAttributes();
		   	    		});
		    		});
		   	   	});
   	     	});       		
       	});
	}

	var checkMonthlyAttributes  = function () {
		browser.get('http://localhost:9000/index.html#/admin');
   		browser.wait(function(){	    		
       		return browser.isElementPresent(addRolesButton);
       	}).then(function(){
	   		var titleElement = browser.findElement(by.cssContainingText('td', DEFAULT_TITLE));
   	   		var parentElement = titleElement.findElement(by.xpath('..'));
   	   		var editElement = parentElement.findElement(editRoleDialogButton);
   	     	editElement.click().then(function () {
   	     		browser.wait(function(){	    		
	   	    		return browser.isElementPresent(saveRoleButton);
	   	    	}).then(function(){
		    		browser.driver.sleep(1000);	
		    		browser.findElements(editForm).then( function (editForms) {
		   	    		var monthlyAdvertisedRate = editForms[1].findElement(monthlyAdvertisedRateInput);
			    		expect(monthlyAdvertisedRate.getAttribute('value')).toEqual(DEFAULT_MONTHLY_ADVERTISED_RATE);
		   	    		var monthlyLoadedRate = editForms[1].findElement(monthlyLoadedRateInput);
			    		expect(monthlyLoadedRate.getAttribute('value')).toEqual(DEFAULT_MONTHLY_LOADED_RATE);
		    		});
		   	   	});
   	     	});       		
       	});
	}
	
	var deleteRoleAndCheck  = function () {
		browser.get('http://localhost:9000/index.html#/admin');
   		browser.wait(function(){	    		
       		return browser.isElementPresent(addRolesButton);
       	}).then(function(){
	   		var titleElement = browser.findElement(by.cssContainingText('td', DEFAULT_TITLE));
   	   		var parentElement = titleElement.findElement(by.xpath('..'));
   	   		var deleteElement = parentElement.findElement(deleteRoleButton);
   	   		deleteElement.click().then( function() {
	    		browser.driver.sleep(3000);	
	    		expectByCssToBeAbsent(DEFAULT_TITLE);
   	   		});
       	});
	}
	
	
	var expectByCssToBeAbsent = function(css) {
		browser.driver.isElementPresent(by.css(css)).then(function(present) {
			expect(present).toBeFalsy();
		});
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
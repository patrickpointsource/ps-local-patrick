/**
 * @Author aram
 * 
 * */
describe('E2E: GoogleOAuthTest', function() {
		
	var USER_NAME = 'psapps@pointsourcellc.com';
	var PASSWORD = 'ps@pp$777';
	
	var sbutton = by.tagName('button');
	var logonEmail = by.id('Email');
	var logonPswd = by.id('Passwd');
	var signIn = by.id('signIn');
	var submit_approve_access = by.id('submit_approve_access');
	
	beforeEach(function() {
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
	});	
	
	it('Test Main Window Title', function() {	
		// The angular should be loaded by now, so continue as usual
		// i.e. use 'browser' instead of 'browser.driver'
		console.log('> Running Test 1');
		expect(browser.getTitle()).toEqual('MasterMind');

	});
});



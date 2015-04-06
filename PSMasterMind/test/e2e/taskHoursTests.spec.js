/**
 * @Author Denys Novalenko
 * 
 * */
describe('E2E: Task Hours Tests', function() {	
    
    var managerUserCreds = {
    	firstName : 'ps',
    	lastName : 'apps',
    	login : 'psapps@pointsourcellc.com',
    	password : 'ps@pp$777'
    }
    
    var employeeUserCreds = {
        firstName : 'ps',
        lastName : 'apps2',
        login : 'psapps2@pointsourcellc.com',
        password : 'PSapps123'
    }
    var loggedUser = managerUserCreds;
    
	var sbutton = by.id('signinButton');
	var logonEmail = by.id('Email');
	var logonPswd = by.id('Passwd');
	var signIn = by.id('signIn');
	var submit_approve_access = by.id('submit_approve_access');
	var signOut = by.css('[ng-click="logout()"]');
	var profilePhoto = by.id('profile-photo');
	var loggedAccount = by.css('[href="https://plus.google.com/u/0/me"]');
	var addAccount = by.css('a[href*="https://accounts.google.com/AddSession"]');
	var isLogged;

    beforeEach(function() {
    	if (!isLogged) {
        	var width = 1900;
    	    var height = 1200;
    	    browser.driver.manage().window().setSize(width, height);

    	    browser.driver.get('http://localhost:9000/index.html#/');
            browser.driver.sleep(2000);
            browser.driver.getCurrentUrl().then(function(loginUrl) {
    	        if ( loginUrl.indexOf('http://localhost:9000/login.html') > -1 ) {  //  Re-login if needed
    	        	login();
    	        } 
    	        else {    	        	
    	        	browser.findElement(profilePhoto).click().then(function () {
		        		var userInfoText = loggedUser.firstName + ' ' + loggedUser.lastName;
		        		browser.isElementPresent(by.cssContainingText('h4', userInfoText)).then(function(isRequiredUserLogged) {
		        			if (isRequiredUserLogged) {
		        				browser.findElement(by.cssContainingText('h4', userInfoText)).getText().then(function (text) {
		        					if (text != userInfoText) {
		        						relogin();
		        					}
		        				});
		        			} else {
		        				relogin();
		       				}
		      			});
		        	});
    	        }
            });
    	}
	});	
    
	var relogin = function() {
    	browser.findElement(signOut).click();
    	browser.sleep(2000);
		login();
	}

	var login = function () {
       	browser.ignoreSynchronization = true;
 	    browser.driver.get('http://localhost:9000/login.html');
	    browser.driver.wait(function() {	    	
	    	return browser.driver.isElementPresent(sbutton);
	    }).then(function(){
		    // expect the signin button to be present
	    	// expect(browser.driver.isElementPresent(sbutton)).toBeTruthy();
		    console.log('login button is available. Clicking it');
	    	// find the signin button and click it
		    browser.driver.findElement(sbutton).click().then(function(){
			    browser.driver.getAllWindowHandles().then(function (handles) {
					browser.driver.switchTo().window(handles[1]).then(function(){
						browser.isElementPresent(loggedAccount).then(function(isLoggedAccountPresent) {
			    			if (isLoggedAccountPresent) {
			    				browser.findElement(loggedAccount).click().then(function() {
			    					browser.findElement(addAccount).click().then(function() {
			    						sendCredentials(handles);
			    					});
			    				});
			    			}
			    			else {
			    				browser.isElementPresent(addAccount).then(function(isAddAccountPresent) {
			    					if (isAddAccountPresent) {
			    						browser.findElement(addAccount).click().then(function() {
				    						sendCredentials(handles);
				    					});
			    					}
			    					else {
					    				sendCredentials(handles);
			    					}
			    				});
			    			}
			    		});
					});
			    });
		    });
	    }); 
	};

	var prepareAuthCreds = function(creds) {
		isLogged = false;
		loggedUser = creds;
	}
	
	var sendCredentials = function(handles) {
   		console.log("> Switched window control to the popup.");
		browser.sleep(1000);
   		browser.driver.findElement(logonEmail).sendKeys(loggedUser.login);
		browser.driver.findElement(logonPswd).sendKeys(loggedUser.password);
		browser.driver.findElement(signIn).click();  
		browser.driver.sleep(2000);	    		
   	 
		browser.driver.getAllWindowHandles().then(function (handles) {
			if(handles.length > 1){
	    		browser.driver.findElement(submit_approve_access).click();    		    			
			}   			
		});
		isLogged = true;
		browser.ignoreSynchronization = false;
		browser.driver.switchTo().window(handles[0]);
		browser.driver.sleep(5000);	    		
	}
	

	it('Additional Task Hours Test: Add hours for task and verify.', function() {	
		console.log('> Running: Additional Task Hours Test - Add hours for task');
		taskHoursPage.addHoursForTaskAndVerify();
	}, 60000);

	it('Additional Task Hours Test: Remove hours for task and verify.', function() {	
		console.log('> Running: Additional Task Hours Test - Remove hours for task');
		taskHoursPage.removeHoursForTaskAndVerify();
	}, 60000);

	it('Additional Task Hours Test: Add hours for task without name and verify.', function() {	
		console.log('> Running: Additional Task Hours Test - Add hours for task without name');
		taskHoursPage.addHoursForTaskWithoutNameAndVerify();
	}, 60000);

	it('Additional Task Hours Test: Add hours for task without description and verify.', function() {	
		console.log('> Running: Additional Task Hours Test - Add hours for task without description');
		taskHoursPage.addHoursForTaskWithoutDescriptionAndVerify();
	}, 60000);

	it('Additional Task Hours Test: Add hours for task without hours value and verify.', function() {	
		console.log('> Running: Additional Task Hours Test - Add hours for task without hours value');
		taskHoursPage.addHoursForTaskWithoutHoursValueAndVerify();
	}, 60000);

	it('Additional Task Hours Test: Add hours for task without hours and verify.', function() {	
		console.log('> Running: Additional Task Hours Test - Add hours for task with invalid hours value');
		taskHoursPage.addHoursForTaskWithInvalidHoursValueAndVerify();
	}, 60000);

	it('Additional Task Hours Test: Add hours for empty task and verify.', function() {	
		console.log('> Running: Additional Task Hours Test - Add hours for empty task');
		taskHoursPage.addHoursForEmptyTaskAndVerifyErrors();
	}, 60000);

	it('Additional Task Hours Test: Prepare login creds (Employee).', function() {	
		console.log('> Running: Additional Task Hours Test - Prepare login creds (Employee)');
		prepareAuthCreds(employeeUserCreds);
	}, 60000);

	it('Additional Task Hours Test: Check hours as Employee.', function() {	
		console.log('> Running: Additional Task Hours Test - Check hours as Employee');
		taskHoursPage.checkHoursAsEmployee();
	}, 60000);

	it('Additional Task Hours Test: Prepare login creds (Employee).', function() {	
		console.log('> Running: Additional Task Hours Test - Prepare login creds (PM)');
		prepareAuthCreds(managerUserCreds);
	}, 60000);

	it('Additional Task Hours Test: Check hours as PM.', function() {	
		console.log('> Running: Additional Task Hours Test - Check hours as PM');
		taskHoursPage.checkHoursAsPM();
	}, 60000);

	
	var TaskHoursPage = function () {
		
		this.ddlProjectsTasks = 'ddlProjectsTasks';
		this.loggedProject = 'loggedProject';
		this.loggedTask = 'loggedTask';
		this.loggedHours = 'loggedHours';
		this.loggedDescription = 'loggedDescription';
		this.loggedProjectInput = 'loggedProjectInput';
		this.loggedHoursInput = 'loggedHoursInput';
		this.loggedDescriptionInput = 'loggedDescriptionInput';
		this.hoursAdd = 'hoursAdd';
		this.hoursDelete = 'hoursDelete';	
		this.hoursValidation = by.repeater("message in hoursValidation");

		this.profilePhoto = by.id('profile-photo');
		this.viewProfile = by.partialLinkText('VIEW PROFILE');
		this.editButton = by.css('[ng-click="edit()"]');
		this.saveButton = by.css('[ng-click="save()"]');
		this.removeUserRoleButton = by.css('ng-click="removeUserRole($index)"');
		this.userRoleDropdown = by.css('ng-model="userSecurityGroups"');
		this.clearTask = by.css('[ng-click="clearSelectedItem(e, hourEntry)"]')
		
		this.emptyNameError =  'Project or task hasn\'t been selected';
		this.incorrectHoursError =  'Incorrect value for hours';
		this.emptyHoursError =  'Hours value is empty';
		this.emptyDescriptionError =  'Hours description is empty';

		this.elementIndex = '1';
		
		this.task = {
			name : 'Sick time',
			description : 'Sick time description',
			hours : 5
		}
		
		this.testUser = {
			firstName : 'Denis',
			lastName : 'Novalenko'
		}
		
		this.addHoursForTaskAndVerify = function() {
	    	var $this = this;
			browser.findElement($this.profilePhoto).click().then(function () {
				browser.findElement($this.viewProfile).click().then(function () {
					$this.addNewHoursRecord($this.task)
					$this.verifyHours($this.task);
				});
			});			
		}
		
		this.removeHoursForTaskAndVerify = function() {
			var $this = this;
			browser.findElement($this.byId($this.hoursDelete, $this.elementIndex)).click().then( function() {
		   		$this.expectByCssToBeAbsent($this.task.name);
			})	
		}

		this.addHoursForTaskWithoutNameAndVerify = function() {
			var task = {
				description : this.task.description,
				hours : this.task.hours,
				validationErrors : [
				     this.emptyNameError
				]
			}
			this.verifyTask(task);
		}

		this.addHoursForTaskWithoutDescriptionAndVerify = function() {
			var task = {
				name : this.task.name,
				hours : this.task.hours,
				validationErrors : [
				   this.emptyDescriptionError
				]
			}
			this.verifyTask(task);
		}

		this.addHoursForTaskWithoutHoursValueAndVerify = function() {
			var task = {
				name : this.task.name,
				description : this.task.description,
				validationErrors : [
				    this.emptyHoursError
				]
			}
			this.verifyTask(task);
		}

		this.addHoursForTaskWithInvalidHoursValueAndVerify = function() {
			var task = {
				name : this.task.name,
				description : this.task.description,
				hours : -1,
				validationErrors : [
				   this.incorrectHoursError
				]
			}
			this.verifyTask(task);
		}
		
		this.addHoursForEmptyTaskAndVerifyErrors = function() {
			var emptyTask = {};
			emptyTask.validationErrors = [ this.emptyHoursError, this.emptyNameError, this.emptyDescriptionError ];
			this.verifyTask(emptyTask);
    		browser.sleep(1000);

			var taskWithHours = {};
			taskWithHours.hours = 5;
			taskWithHours.validationErrors = [this.emptyNameError, this.emptyDescriptionError];
			this.verifyTask(taskWithHours);
    		browser.sleep(1000);

			var taskWithHoursAndDescription = {};
			taskWithHoursAndDescription.hours = 5;
			taskWithHoursAndDescription.description = this.task.description;
			taskWithHoursAndDescription.validationErrors = [this.emptyNameError];
			this.verifyTask(taskWithHoursAndDescription);
    		browser.sleep(1000);

			var filledTask = {};
			filledTask.hours = 5;
			filledTask.name = this.task.name;
			filledTask.description = this.task.description;
			filledTask.validationErrors = [];
			this.verifyTask(filledTask);
    		browser.sleep(1000);
			
			this.removeHoursForTaskAndVerify();
		}
		
		this.removeUserRoles = function() {
			var $this = this;
			browser.findElements(by.repeater("userRole in userSecurityGroups")).then( function (permissionElements){
				for (var i in permissionElements) {
		    		permissionElements[i].findElement($this.removeUserRoleButton).click();
				} 
			});
		}
		
		this.setUserRole = function(role) {
			browser.findElement(this.userRoleDropdown).sendKeys(role); 
		}

		this.checkHoursAsEmployee = function () {
			var $this = this;
	 		browser.get('http://localhost:9000/index.html#/people?filter=all').then( function() {
		 		browser.findElement(by.cssContainingText('a', $this.testUser.lastName + ', ' + $this.testUser.firstName )).getAttribute('href').then(function(url) {
		 			browser.get(url).then(function(){
			 			browser.wait(function(){	    		
				    		return browser.isElementPresent($this.editButton);
				    	}).then(function(){
							$this.expectByElementToBeAbsent($this.byId($this.hoursAdd));
				    	});
		 			});
		 		});
	 		});
		}
		
		this.checkHoursAsPM = function () {
			var $this = this;
	 		browser.get('http://localhost:9000/index.html#/people?filter=all').then( function() {
		 		browser.findElement(by.cssContainingText('a', $this.testUser.lastName + ', ' + $this.testUser.firstName )).getAttribute('href').then(function(url) {
		 			browser.get(url).then(function(){
			 			browser.wait(function(){	    		
				    		return browser.isElementPresent($this.editButton);
				    	}).then(function(){
							var filledTask = {};
							filledTask.hours = 5;
							filledTask.name = $this.task.name;
							filledTask.description = $this.task.description;
							filledTask.validationErrors = [];
							$this.verifyTask(filledTask);
							browser.sleep(2000);
							$this.removeHoursForTaskAndVerify();
				    	});
		 			});
		 		});
	 		});
		}
		

		this.verifyHours = function(task) {
			var $this = this;
			expect(browser.findElement($this.byId($this.loggedTask, $this.elementIndex)).getInnerHtml()).toEqual(task.name);
	   		expect(browser.findElement($this.byId($this.loggedHours, $this.elementIndex)).getText()).toEqual(task.hours + ' hrs');
	   		expect(browser.findElement($this.byId($this.loggedDescription, $this.elementIndex)).getInnerHtml()).toEqual(task.description);
		}
		
		this.verifyValidationErrors = function(task) {
			var $this = this;
			browser.findElements($this.hoursValidation).then(function (errors) {
				expect(task.validationErrors.length == errors.length).toBeTruthy()
				for (var i in errors) {
					errors[i].getText().then(function(errorText){
						expect(task.validationErrors.indexOf(errorText) != -1).toBeTruthy()
					});
				}
			});
		}
		
		this.verifyTask = function(task) {
			this.addNewHoursRecord(task);
			this.verifyValidationErrors(task);
		}
		
		this.addNewHoursRecord = function (task) {
	    	var $this = this;
	    	if (browser.isElementPresent($this.clearTask)) {
	    		browser.findElements($this.clearTask).then(function (clearTaskElements) {
	    			clearTaskElements[0].isDisplayed().then(function (isVisible) {
		    		    if (isVisible) {
		    	    		clearTaskElements[0].click();
		    		    }
		    		});
	    		});
	    	}
	    	browser.sleep(1000);
			$this.clearAndSendKeys($this.loggedProjectInput, task.name);
			browser.wait(function(){	    		
	    		return browser.isElementPresent($this.byId($this.ddlProjectsTasks));
	    	}).then(function(){
	    		if (task.name) {
	    			browser.findElement($this.byId($this.ddlProjectsTasks)).click();
	    		}
    			$this.clearAndSendKeys($this.loggedHoursInput, task.hours);
    			$this.clearAndSendKeys($this.loggedDescriptionInput, task.description);
	    		browser.findElement($this.byId($this.hoursAdd)).click();
	    		browser.sleep(2000);
	    	});
		};
		
		this.clearAndSendKeys = function(elementId, value) {
			var element = browser.findElement(this.byId(elementId));
			element.clear().then( function () { 
				if (value) {
		  			element.sendKeys(value); 
				}
			});
		}
		
		this.byId = function (id, index) {
			return index ? by.id(id + index) : by.id(id + '0');
		};
		
		this.expectByCssToBeAbsent = function(css) {
			browser.driver.isElementPresent(by.css(css)).then(function(present) {
				expect(present).toBeFalsy();
			});
		};
		
		this.expectByElementToBeAbsent = function(element) {
			browser.driver.isElementPresent(element).then(function(present) {
				expect(present).toBeFalsy();
			});
		};
		
	}
	
	
    // Pages
	var taskHoursPage = new TaskHoursPage();

});
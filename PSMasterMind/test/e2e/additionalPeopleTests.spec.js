/**
 * @Author Denys Novalenko
 * 
 * */
describe('E2E: Additional People Hours Tests', function() {	
    
    var loggedUser = {
        	firstName : 'ps',
        	lastName : 'apps',
        	login : 'psapps@pointsourcellc.com',
        	password : 'ps@pp$777'
    };
    
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
	

	it('Additional People Test: Check sorting on people page.', function() {	
		console.log('> Running: Additional People Test - Check filter');
		additionalPeoplePage.checkFilter();
	}, 60000);

	it('Additional People Test: Check sorting on people page.', function() {	
		console.log('> Running: Additional People Test - Check inactive person in views');
		additionalPeoplePage.checkInactivePerson();
	}, 60000);

	it('Additional People Test: Check sorting on people page.', function() {	
		console.log('> Running: Additional People Test - Check different sorting on people page');
		additionalPeoplePage.checkDifferentSortingOnPeoplePage();
	}, 120000);

	it('Additional People Test: Check sorting on people page.', function() {	
		console.log('> Running: Additional People Test - Verify view fields in profile');
		additionalPeoplePage.verifyViewFieldsInProfile();
	}, 60000);

	
	var AdditionalPeoplePage = function () {
    	
		this.mainUrl = 'http://localhost:9000/index.html#/people';
		
		this.types = {
    		active : 'all',
    		inactive : 'inactive',
    		architects : 'architects',
    		administration : 'administration',
    		development : 'development'
    	};
    	
		this.editButton = by.css('[ng-click="edit()"]');
    	this.saveButton = by.css('[ng-click="save()"]');
    	
    	this.isActiveField = by.model('profile.isActive');
        
    	this.inactivePerson = {
                firstName : 'ps',
                lastName : 'apps2',
        };
        
		this.filterField = by.model('filterText');
		this.filterText = 'ssa'
			
		this.elements = element.all(by.repeater("person in people | filter:filterPerson(filterText)"));
		
		this.sortByName = element(by.css('[ng-click="switchSort(\'name\')"]'));
		this.sortByRole = element(by.css('[ng-click="switchSort(\'role\')"]'));
		this.sortByGroup = element.all(by.css('[ng-click="switchSort(\'group\')"]')).get(0);
		this.sortByRate = element.all(by.css('[ng-click="switchSort(\'rate\')"]')).get(0);
		
		this.row = {
	    	name: '{{getPersonName(person)}}',
	    	role: '{{person.primaryRole.abbreviation}}',
		    title: '{{person.primaryRole.title}}',
		    util: '{{person.activePercentage}}'
	    };

		this.getUrlByTypes = function(types) {
			if (types instanceof Array) {
				types = types.join(",");
			}
			return this.mainUrl + '?filter=' + types
		}
		
		this.checkInactivePerson = function() {
			this.updateIsActive(false);
			this.checkInactivePersonInActiveList();
			this.checkInactivePersonInInactiveList();
			this.updateIsActive(true);
		}
		
		this.updateIsActive = function(isActive) {
			var $this = this; 
			browser.get($this.getUrlByTypes([ $this.types.active, $this.types.inactive ]));
			browser.sleep(3000);
			element($this.filterField).sendKeys($this.inactivePerson.firstName + ' ' + $this.inactivePerson.lastName).then(function(){
				$this.elements.then( function (elements) {
					elements[0].element(by.binding($this.row.name)).click().then(function(){
						browser.wait(function(){	    		
				       		return browser.isElementPresent($this.editButton);
					  	}).then(function(){
					  		 browser.findElement($this.editButton).click().then(function(){
					  			browser.findElements($this.isActiveField).then(function(fields){
					  				var isActiveField = (isActive) ? fields[0] : fields[1];
					  				isActiveField.click().then(function(){
						  				browser.findElement($this.saveButton).click().then(function(){
						  					browser.sleep(1000);
						  				})
						  			});
					  			})
					  		 });
					  	});
					});
				});
			});
		}

		this.checkInactivePersonInActiveList = function() {
			var $this = this;
			browser.get($this.getUrlByTypes($this.types.active));
			browser.sleep(3000);
			element($this.filterField).sendKeys($this.inactivePerson.firstName + ' ' + $this.inactivePerson.lastName).then(function(){
				$this.elements.then( function (elements) {
					expect(elements.length).toEqual(0);
				});
			});
		}

		this.checkInactivePersonInInactiveList = function() {
			var $this = this;
			browser.get($this.getUrlByTypes($this.types.inactive));
			browser.sleep(4000);
			element($this.filterField).sendKeys($this.inactivePerson.firstName + ' ' + $this.inactivePerson.lastName).then(function(){
				$this.elements.then( function (elements) {
					expect(elements.length).toEqual(1);
				});
			});
		}
	
		this.verifyViewFieldsInProfile = function() {
			this.verifyFieldInProfile(this.row.title);
		}

		this.verifyFieldInProfile = function(field) {
			var $this = this; 
			browser.get($this.getUrlByTypes([ $this.types.active, $this.types.inactive ]));
			browser.sleep(3000);
			element($this.filterField).sendKeys(loggedUser.firstName + ' ' + loggedUser.lastName).then(function(){
				$this.elements.then( function (elements) {
					elements[0].element(by.binding(field)).getText().then(function(fieldText){
						elements[0].element(by.binding($this.row.name)).click().then(function(){
							browser.wait(function(){	    		
					       		return browser.isElementPresent($this.editButton);
						  	}).then(function(){
				 				browser.isElementPresent(by.cssContainingText('div', fieldText)).then(function(present) {
				 					expect(present).toBeTruthy();
				 				});
				 				
						  	});
						});
					})
				});
			});
		}
			
		this.checkFilter = function() {
			var $this = this;
			browser.get($this.getUrlByTypes($this.types.architects));
			browser.sleep(3000);
			element($this.filterField).sendKeys($this.filterText).then(function(){
				$this.elements.then( function (elements) {
					for (var i in elements) {
						var roleAbbreviation = elements[i].element(by.binding($this.row.role));
						roleAbbreviation.getText().then( function (role) {
							expect(role.toLowerCase()).toEqual($this.filterText);
						});
					}
				});
			});
	 	}

		this.checkDifferentSortingOnPeoplePage = function(url) {
			var $this = this;
			this.checkSortingOnPeoplePageByUrl($this.getUrlByTypes($this.types.active));
			this.checkSortingOnPeoplePageByUrl($this.getUrlByTypes($this.types.inactive));
			this.checkSortingOnPeoplePageByUrl($this.getUrlByTypes($this.types.architects));
			this.checkSortingOnPeoplePageByUrl($this.getUrlByTypes($this.types.development));
		}
		
		this.checkSortingOnPeoplePageByUrl = function(url) {
			var $this = this;
			browser.get(url);
			browser.wait(function(){	    		
	       		return browser.isElementPresent($this.filterField);
		  	}).then(function(){
		       	$this.sortBy($this.sortByName, $this.row.name);
		       	$this.sortBy($this.sortByRole, $this.row.role);
		       	$this.sortBy($this.sortByGroup, $this.row.title);
		       	$this.sortBy($this.sortByRate, $this.row.util);
		  	});
	 	}
		
		this.checkSorting = function (elements, validationRow, isASC) {
			elements.then( function (elements) {
	    		 var firstRecord = elements[0].element(by.binding(validationRow));
	    		 var lastRecord = elements[elements.length - 1].element(by.binding(validationRow));
	    		 firstRecord.getText().then( function (firstRecord) {
	    			 lastRecord.getText().then( function (lastRecord) {
	               		 var isSorted = lastRecord == '' ? true : 
	               					 	isASC ? firstRecord <= lastRecord : firstRecord >= lastRecord;
	                   	 expect(isSorted).toBe(true);
	                 });
	             });
	    	});
		 };
		 
		this.sortBy = function(sortField, validationRow) {
			sortField.click();
	    	this.checkSorting(this.elements, validationRow, false);
	    	browser.sleep(2000);
	    	sortField.click();
	    	this.checkSorting(this.elements, validationRow, true);
	        browser.sleep(2000);
		};
	}
	
    // Pages
	var additionalPeoplePage = new AdditionalPeoplePage();

});
describe("E2E: People test cases.", function () {

	var windowWidth = 1900;
	var windowHeight = 1200;
	
	var USER_NAME = 'psapps@pointsourcellc.com';
	var PASSWORD = 'ps@pp$777';

    //login
    var sbutton = by.tagName('button');
    var logonEmail = by.id('Email');
    var logonPswd = by.id('Passwd');
    var signIn = by.id('signIn');
    var submit_approve_access = by.id('submit_approve_access');
    
    var ACTIVE_PEOPLE_COUNT = 122;
    var PeoplePath = {
    	url: "/index.html#/people?filter=",
    	createUrl: "/index.html#/people?filter=all",
    	all: 'all',
    	administration: 'administration',
    	development: 'development',
    	clientexpierencemgmt: 'clientexpierencemgmt',
    	inactive: 'inactive'
    };
    
    SEARCH_TEST = {
    		Person: "apps",
    		Role: "admin"
    };
    
    var PeopleList = {
    		administration: [ "Campora",
    		                  "Burckart",
    		                  "Bailey" ],
    		clientexpierencemgmt: [ "Desai",
    		                        "Henderson",
    		                        "James",
    		                        "Organ",
    		                        "Peich",
    		                        "Reynolds",
    		                        "Trimandilis",
    		                        "Winders",
    		                        "York" ],
    		inactive: [ "Bosworth",
    		           "Daswani",
    		           "Garbarz",
    		           "Kesoyan",
    		           "Leshkevich",
    		           "Lewis",
    		           "List",
    		           "Lyon",
    		           "Matsukow",
    		           "Meyer",
    		           "Schell",
    		           "Taber",
    		           "Veramei" ]
    };

    beforeEach(function () {
    	browser.driver.manage().window().setSize(windowWidth, windowHeight);
        browser.driver.getCurrentUrl().then(function (url) {
            if (url.indexOf('http://localhost:9000/index.html#/people') == -1) { //Go to the people page
                browser.driver.get('http://localhost:9000/index.html#/people?filter=all');
                browser.driver.sleep(1000);
                browser.driver.getCurrentUrl().then(function (loginUrl) {
                    if (loginUrl.indexOf('http://localhost:9000/login.html') > -1) { //  Re-login if needed
                        console.log("> RE-LOGGING");
                        login();
                    }
                });
            }
        });
    });
    
 	it('Check default people listing', function () {
		checkDefaultPeopleListing();
	});
    
 	it('Test People sorting', function () {
 		checkPeopleSorting();
 	});
    
 	it('Test People searching', function () {
 		checkPeopleSearching();
 	});
 	
 	it('Click on Administration group, check that only admins listed', function () {
    	checkPeopleList(PeoplePath.administration, PeopleList.administration);
    });
    
    it('Click on Administration&ClientExperienceMgmt check that only admins&clientexpierencemgmt listed', function () {
    	checkPeopleList([PeoplePath.administration, PeoplePath.clientexpierencemgmt].join(','), PeopleList.administration.concat(PeopleList.clientexpierencemgmt));
    });
    
    it('Click on Inactive group, check that only inactive people listed', function () {
    	checkPeopleList(PeoplePath.inactive, PeopleList.inactive);
    });
    
    it('Click on Inactive group, check that only inactive people listed', function () {
    	checkPeopleList(PeoplePath.all, PeopleList.inactive, true);
    });

	it('Set IsActive to false and check Inactive people list.', function() {	
		console.log('> Running: Set IsActive to false and check Inactive people list.');
		editIsActiveProperty(false);
	}, 60000);
	
	it('Set IsActive to true and check All people list.', function() {	
		console.log('> Running: Set IsActive to true and check All people list.');
		editIsActiveProperty(true);
	}, 60000);
	
	it('Navigate to non-current user profile, make sure cannot add vacation request.', function() {	
		console.log('> Running: Navigate to non-current user profile, make sure cannot add vacation request.');
		checkThatAddVacactionDisabledForNonCurrentUser();
	}, 60000);

	//Doesn't support by new UI.
//    it('Check people utilization values.', function () {
//    	checkPeopleUtilization(PeoplePath.administration, PeopleList.administration);
//    });
    
    
 	var checkDefaultPeopleListing = function () {
 		var peoplePage = new PeoplePage();
    	peoplePage.get();
    	
    	expect(browser.driver.getCurrentUrl()).toContain('http://localhost:9000/index.html#/people?filter=all');
    	peoplePage.people.then(function (peopleList){
    		expect(peopleList.length).not.toBeLessThan(ACTIVE_PEOPLE_COUNT);
    	});
 	};
 	
    var checkPeopleSorting = function ( ) {
    	var checkSorting = function (people, validationRow, isASC) {
    		console.log("> Check sorting");
    		people.then( function (people) {
        		 var firstRecord = people[0].element(by.binding(validationRow));
        		 var lastRecord = people[people.length - 1].element(by.binding(validationRow));
        		 firstRecord.getText().then( function (firstRecord) {
        			 lastRecord.getText().then( function (lastRecord) {
                   		 var isSorted = lastRecord == '' ? true : 
                   					 	isASC ? firstRecord <= lastRecord : firstRecord >= lastRecord;
                       
                       	 expect(isSorted).toBe(true);
                     });
                 });
        	});
   	 	};
   	 	
   	 	var peoplePage = new PeoplePage();
    	peoplePage.get();
    	
        	var sortBy = function(sortField, validationRow) {
        		sortField.click();
            	checkSorting(peoplePage.people, validationRow, true);
            	browser.sleep(1000);
            	sortField.click();
                checkSorting(peoplePage.people, validationRow, false);
                browser.sleep(1000);
        	};
        	
        	peoplePage.sortByPerson.click();
        	sortBy(peoplePage.sortByPerson, peoplePage.sortRow.person);
        	sortBy(peoplePage.sortByRole, peoplePage.sortRow.role);
        	sortBy(peoplePage.sortByGroup, peoplePage.sortRow.title);
        	sortBy(peoplePage.sortByRate, peoplePage.sortRow.utilization);

    };
    
    var checkPeopleSearching = function () {
    	var peoplePage = new PeoplePage();
    	peoplePage.get();
    	
    	console.log("> Check searching by name");
    	peoplePage.searchPerson.clear().then( function () { peoplePage.searchPerson.sendKeys(SEARCH_TEST.Person); } );
    	peoplePage.findPerson(SEARCH_TEST.Person).then(function (filteredElements) {
        	expect(filteredElements[0]).toBeDefined();
        });
    	
    	console.log("> Check searching by role");
    	peoplePage.searchPerson.clear().then( function () { peoplePage.searchPerson.sendKeys(SEARCH_TEST.Role); } );
    	peoplePage.findPerson(SEARCH_TEST.Role).then(function (filteredElements) {
        	expect(filteredElements[0]).toBeDefined();
        });
    };
    
    var checkPeopleList = function (filterPath, peopleList, shouldExclude) {
    	var peoplePage = new PeoplePage(filterPath);
    	peoplePage.get();
    	
    	console.log("> Check " + filterPath + " people list.");
    	peoplePage.isPeopleExist(peopleList).then(function (res) {
    		if (!shouldExclude) {
    			expect(res[0]).toBeDefined();
    		} else {
    			expect(res[0]).toBeUndefined();
    		}
    	});
    };
    
    var checkPeopleUtilization = function (filterPath, peopleList) {
    	console.log("> Check " + filterPath + " utilization values.");
    	var peoplePage = new PeoplePage(filterPath);
    	peoplePage.get();
    	
    	var checkProfileUtilization = function (profile) {
    		profile.all(by.binding(peoplePage.sortRow.utilization)).get(1).getText().then(function(utilizationValue){
    			profile.all(by.tagName('a')).get(0).click();
    			var hoursRate = element(by.binding('{{hoursRateFromProjects ? hoursRateFromProjects : 0}}'));
    			return browser.wait(function () {
                    return browser.isElementPresent(hoursRate);
                }).then(function () {
                	expect(hoursRate.getText()).toEqual(utilizationValue.replace('%', ''));
                });    			
    		});
    	};
    	
    	peoplePage.people.then(function(peopleList) {
    		checkProfileUtilization(peopleList[0]);
    	});
    };
    
    var checkThatAddVacactionDisabledForNonCurrentUser = function() {
    	console.log("> Check that add vacation disabled.");
    	var peoplePage = new PeoplePage();
    	peoplePage.get();
    	
    	var checkVacationWidget = function (profile) {
    		profile.all(by.binding(peoplePage.sortRow.utilization)).get(1).getText().then(function(utilizationValue){
    			profile.all(by.tagName('a')).get(0).click().then(function() {
    				return browser.wait(function() {	    		
    		    		return browser.isElementPresent(element(by.css('[ng-controller="VacationsCtrl"]')));
    		    	}).then(function() {
    		    		expect(element(by.css('[ng-click="requestHours()"]')).isDisplayed()).toBe(false); 
    		    	});
    			}); 			
    		});
    	};
    	
    	peoplePage.people.then(function(peopleList) {
    		checkVacationWidget(peopleList[0]);
    	});
    };
    
    var editIsActiveProperty = function (isActive) {
    	var editButton = by.css('[ng-click="edit()"]');
    	var saveButton = by.css('[ng-click="save()"]');
    	
    	var peoplePage = new PeoplePage(!isActive ? PeoplePath.development : PeoplePath.inactive);
    	peoplePage.get();
    	var checkProfileIsActiveFlag = function (profileLine) {
    		var profile = profileLine.all(by.tagName('a')).get(1);
    		profile.getText().then(function (profileName){
    			profile.click();
       			browser.wait(function(){	    		
       		    	return browser.isElementPresent(editButton);
       		    }).then(function(){
       		    	var isActiveCbx = isActive ? element(by.css('[btn-radio="\'true\'"]')) : element(by.css('[btn-radio="\'false\'"]'));
       		    	browser.findElement(editButton).click().then(function () {
       		    		console.log('> Set IsActive to ' + isActive);
       		    		isActiveCbx.click();
       		    		browser.findElement(saveButton).click().then(function () {
       		    			browser.sleep(3000);
       		    			console.log("> Check people list.");
       		    			peoplePage = new PeoplePage(isActive ? PeoplePath.development : PeoplePath.inactive);
       	   		    	    peoplePage.get();
       	   		    	    peoplePage.findPerson(profileName).then(function (res) {
       		    				expect(res[0]).toBeDefined();
       		    			});
       		    		});
       		    	});
       		    });
    		});
    	};
    	
    	peoplePage.people.then(function(peopleList) {
    		checkProfileIsActiveFlag(peopleList[0]);
    	});
	}; 	

    var PeoplePage = function ( filterPath ) {
    	if ( filterPath ) {
    		this.url = browser.baseUrl + PeoplePath.url + filterPath;
    	} else {
    		this.url = browser.baseUrl + PeoplePath.url + PeoplePath.all;
    	}
        this.newUrl = browser.baseUrl + PeoplePath.createUrl;
        
        this.get = function () {
            browser.get(this.url);
            browser.sleep(2000);
        };
        
        this.people = element.all(by.repeater('person in people | filter:filterPerson(filterText)'));
        this.searchPerson =  element(by.model('filterText'));
        this.sortByPerson = element(by.css('[ng-click="switchSort(\'name\')"]'));
        this.sortByRole = element(by.css('[ng-click="switchSort(\'role\')"]'));
        this.sortByGroup = element.all(by.css('[ng-click="switchSort(\'group\')"]')).get(0);
        this.sortByRate = element.all(by.css('[ng-click="switchSort(\'rate\')"]')).get(0);
        this.sortRow = {
        		person: '{{getPersonName(person)}}',
        		role: '{{person.primaryRole.abbreviation}}',
        		title: '{{person.primaryRole.title}}',
        		utilization: '{{person.activePercentage}}'
        };
        this.findPerson = function (personName) {
            var $this = this;
            return $this.people.filter(function (elem) {
                return elem.getText().then(function (text) {
                    return text.toLowerCase().indexOf(personName.toLowerCase()) > -1;
                });
            });
        };
        this.isPeopleExist = function (peopleList) {
            var $this = this;
            var res = [];
            return $this.people.filter(function (elem) {
                return elem.getText().then(function (text) {
                	for (var index in peopleList) {
                    	var personName = peopleList[index];
                    	if (text.toLowerCase().indexOf(personName.toLowerCase()) > -1)
                    		res.push(personName);
                	}
                	if (res.length == peopleList.length)
                		return true;
                });
            });
        };
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
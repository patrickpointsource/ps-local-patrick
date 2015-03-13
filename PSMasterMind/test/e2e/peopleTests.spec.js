describe("E2E: People test cases.", function () {

	var USER_NAME = 'psapps@pointsourcellc.com';
	var PASSWORD = 'ps@pp$777';

    //login
    var sbutton = by.tagName('button');
    var logonEmail = by.id('Email');
    var logonPswd = by.id('Passwd');
    var signIn = by.id('signIn');
    var submit_approve_access = by.id('submit_approve_access');
    
    var PeoplePath = {
    	url: "/index.html#/people?filter=",
    	createUrl: "/index.html#/people?filter=all",
    	all: 'all',
    	administration: 'administration',
    	clientexpierencemgmt: 'clientexpierencemgmt',
    	inactive: 'inactive'
    };
    
    SEARCH_TEST = {
    		Person: "apps",
    		Role: "admin"
    };
    
    var PeopleList = {
    		administration: [ "apps",
    		                  "Campora",
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
    		                        "York" ]
    };

    beforeEach(function () {
    	
	    var width = 1900;
	    var height = 1200;
	    browser.driver.manage().window().setSize(width, height);
    	
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
    
 	it('Test People sorting', function () {
 		checkPeopleSorting();
 	});
    
 	it('Test People searching', function () {
 		checkPeopleSearching();
 	});
 	
 	it('Click on Administration group, check that only admins listed', function () {
    	checkPeopleList(PeoplePath.administration, PeopleList.administration);
    });
    
    it('Click on Administration&Development check that only admins&developer listed', function () {
    	checkPeopleList([PeoplePath.administration, PeoplePath.clientexpierencemgmt].join(','), PeopleList.administration.concat(PeopleList.clientexpierencemgmt));
    });
    
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
    
    var checkPeopleList = function (filterPath, peopleList) {
    	var peoplePage = new PeoplePage(filterPath);
    	peoplePage.get();
    	
    	console.log("> Check " + filterPath + " role list.");
        for (var index in peopleList) {
        	var personName = peopleList[index];
        	peoplePage.findPerson(personName).then(function (filteredElements) {
        		expect(filteredElements[0]).toBeDefined();
        	});
        }
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
    };
    
    
    var login = function () {
        browser.driver.ignoreSynchronization = true;

        browser.driver.wait(function () {
            return browser.driver.isElementPresent(sbutton);

        }).then(function () {
            // expect the signin button to be present
            // expect(browser.driver.isElementPresent(sbutton)).toBeTruthy();
            console.log('login button is available. Clicking it');
            // find the signin button and click it
            browser.driver.findElement(sbutton).click();

        });

        // expect the popup window to open and check that its url contains accounts.google.com
        browser.driver.getAllWindowHandles().then(function (handles) {
            browser.driver.switchTo().window(handles[1]).then(function () {
                console.log("> Swicthed window control to the popup.");
            });

            expect(browser.driver.getCurrentUrl()).toContain('https://accounts.google.com/ServiceLogin?');

            browser.driver.wait(function () {
                return browser.driver.isElementPresent(logonEmail);
            }).then(function () {
                console.log("> Input fields found. Populating and submitting");
                browser.driver.findElement(logonEmail).sendKeys(USER_NAME);
                browser.driver.findElement(logonPswd).sendKeys(PASSWORD);
                browser.driver.findElement(signIn).click();
                browser.driver.sleep(2000);

                // At this moment the accept window might be closed. 
                // So, check the total amount of windows again. If it is more than one,
                // goahead and click the accept button, otherwise do nothing.
                browser.driver.getAllWindowHandles().then(function (handles) {

                    if (handles.length > 1) {
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
describe("E2E: Project test cases.", function () {

	var USER_NAME = 'psapps@pointsourcellc.com';
	var PASSWORD = 'ps@pp$777';

    //login
    var sbutton = by.tagName('button');
    var logonEmail = by.id('Email');
    var logonPswd = by.id('Passwd');
    var signIn = by.id('signIn');
    var submit_approve_access = by.id('submit_approve_access');

    var ACTIVE_PROJECT_NAME = "E2E Active Project";
    var BACKLOG_PROJECT_NAME = "E2E Backlog Project";
    var PIPELINE_PROJECT_NAME = "E2E Pipeline Project";
    var COMPLETED_PROJECT_NAME = "E2E Completed Project";
    var INVEST_PROJECT_NAME = "E2E Investment Project";
    var TEST_PROJECT_NAME = "E2E Test Project";
    
    var projectsPath = {
    	url: "/index.html#/projects?filter=",
    	createUrl: "/index.html#/projects/new?filter=all",
    	all: 'all',
    	active: 'active',
    	backlog: 'backlog',
    	pipeline: 'pipeline',
    	investment: 'investment',
    	completed: 'complete'
    };
    
    var projectsList = {
    		active: [ "All Apps",
    		          "E2E Hours widget - Active Project",
    	              "Firewire Project Team",
    	              "MasterMind",
    	              "Navigation",
    	              "SC Test",
    	              "SIBC Condo Assoc. API & Database",
    	              "Test Assignments",
    	              "Test for Daniil",
    	              "TestProj#byVlad",
    	              "TestRoleAssignees"
    	             ],
    	    backlog: [ "E2E Hours widget - Backlog Project" ]
    };
    
    var projectRoles = {
    		PM: "Project Manager",
    		SSEO: "Senior Software Engineer Offshore",
    		SEO: "Software Engineer Offshore"
    };


    beforeEach(function () {
    	
	    var width = 1900;
	    var height = 1200;
	    browser.driver.manage().window().setSize(width, height);
    	
        browser.driver.getCurrentUrl().then(function (url) {
            if (url.indexOf('http://localhost:9000/index.html#/projects') == -1) { //Go to the projects page
                browser.driver.get('http://localhost:9000/index.html#/projects?filter=all');
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
    
 	it('Test Projects sorting', function () {
 		checkProjectsSorting();
 	});

    it('Click on Active projects, check that only active projects listed', function () {
    	checkProjectsList(projectsPath.active, projectsList.active);
    });
    
    it('Click on Active&Backlog projects, check that only active&backlog projects listed', function () {
    	checkProjectsList([projectsPath.active, projectsPath.backlog].join(','), projectsList.active.concat(projectsList.backlog));
    });
    
    // IMPORTANT: required at lest 1 sponsor in sponsor's list, 
    //            required at "Project Manager" role in roles dropdown
    
    it('Should create active project.', function () {
        createProject(fillActiveProjectPageFields);
    });
    
    it('Check that Services Estimate field is readonly for the created active project.', function () {
    	selectProject(ACTIVE_PROJECT_NAME, projectsPath.active, checkServicesEstimateField);
    });
    
    it('Select and remove active project.', function () {
    	selectProject(ACTIVE_PROJECT_NAME, projectsPath.active, removeProject);
    });

    it('Should create backlog project.', function () {
        createProject(fillBacklogProjectPageFields);
    });
    
    it('Select and remove backlog project.', function () {
    	selectProject(BACKLOG_PROJECT_NAME, projectsPath.backlog, removeProject);
    });

    it('Should create pipeline project.', function () {
        createProject(fillPipelineProjectPageFields);
    });
    
    it('Select and remove pipeline project.', function () {
    	selectProject(PIPELINE_PROJECT_NAME, projectsPath.pipeline, removeProject);
    });

    it('Should create completed project.', function () {
        createProject(fillCompletedProjectPageFields);
    });
    
    it('Select and remove completed project.', function () {
    	selectProject(COMPLETED_PROJECT_NAME, projectsPath.completed, removeProject);
    });

    it('Should create investment project.', function () {
        createProject(fillInvestmentProjectPageFields);
    });
    
    it('Select and remove investment project.', function () {
    	selectProject(INVEST_PROJECT_NAME, projectsPath.investment, removeProject);
    });
    
    it('Should create project with 3 roles.', function () {
    	createProject(fill3RolesPageFields, []);
    });
    
    it('Select and remove project with 3 roles.', function () {
    	selectProject(TEST_PROJECT_NAME, projectsPath.all, removeProject);
    });
    
    it('Cancel project creation: should redirect to the projects list.', function () {
    	cancelProjectCreation();
    });
    
    it('Check for modal dialog asking us about saving changes before leaving.', function () {
    	checkForSavingDialog();
    });
    
    it('Should verify mandatory fields for project.', function () {
    	createProject(fillBrokenProjectPageFields, []);
    });
      

    var checkProjectsSorting = function ( ) {
    	var checkSorting = function (projects, validationRow, isASC) {
    		console.log("checkSorting");
    		projects.then( function (projects) {
        		 var firstProj = projects[0].element(by.binding(validationRow));
        		 var lastProj = projects[projects.length - 1].element(by.binding(validationRow));
        		 firstProj.getText().then( function (firstProjTitle) {
                   	 lastProj.getText().then( function (lastProjTitle) {
                       	 var isSorted = isASC ? firstProjTitle <= lastProjTitle : firstProjTitle >= lastProjTitle;
                       	 console.log("First proj:" + firstProjTitle);
                       	 console.log("Last proj:" + lastProjTitle);
                       	 expect(isSorted).toBe(true);
                     });
                 });
        	});
   	 	};
   	 	
   	 	var projectsPage = new ProjectsPage();
    	projectsPage.get();
    	browser.wait(function () {
            return browser.isElementPresent(projectsPage.addProjectButton);
        }).then(function () {
        	
        	var sortBy = function(sortField, validationRow) {
        		sortField.click();
            	checkSorting(projectsPage.projects, validationRow, true);
            	browser.sleep(1000);
            	sortField.click();
                checkSorting(projectsPage.projects, validationRow, false);
                browser.sleep(1000);
        	};
        	
        	projectsPage.sortByProject.click();
        	sortBy(projectsPage.sortByProject, projectsPage.sortRow.project);
        	sortBy(projectsPage.sortByClient, projectsPage.sortRow.client);
        	sortBy(projectsPage.sortByStartDate, projectsPage.sortRow.startDate);
        	projectsPage.sortByProject.click();
        	sortBy(projectsPage.sortByStatus, projectsPage.sortRow.project);
     
        });
    };
    
    var checkProjectsList = function (filterPath, projectsList) {
    	var projectsPage = new ProjectsPage(filterPath);
    	projectsPage.get();
    	
    	console.log("> Check " + filterPath + " projects.");
        for (var index in projectsList) {
        	var projectName = projectsList[index];
        	projectsPage.findProject(projectName).then(function (filteredElements) {
        		expect(filteredElements[0]).toBeDefined();
        	});
        }
        
    	//* Log projects names to console. *//
//    	var projects = element.all(by.repeater('project in projects | filter:filterText')).then(function (projList) {
//    		for (var index in projList) {
//    			projList[index].element(by.tagName('a')).getText().then(function (projName) {
//    				console.log('"' + projName + '",');
//    			});
//    		}
//    	});
    };
    
    var createProject = function (fillCustomFieldsCallback, errorMsgs) {
    	console.log("> Create project");
        
    	var projectsPage = new ProjectsPage();
        var newProjectPage = new EditCreateProjectPage();

        projectsPage.get(); // going to projects
        browser.wait(function () {
            return browser.isElementPresent(projectsPage.addProjectButton);
        }).then(function () {
            projectsPage.addProjectButton.click();
            browser.sleep(2000);

            // assert for "project/new" url and button Save (should be disabled for empty project)
            browser.getCurrentUrl().then(function (url) {
                expect(url).toEqual(projectsPage.newUrl);
                expect(newProjectPage.saveButtonTop.isEnabled()).toBe(false);
           	 	expect(newProjectPage.saveButtonBottom.isEnabled()).toBe(false);
            });

            // filling project fields
            fillCommonFields(newProjectPage, function () {
                fillCustomFieldsCallback(newProjectPage);
            });
            
            newProjectPage.saveButtonBottom.click();
            if ( !errorMsgs ) {
            	browser.sleep(6000);            	
            	expect(browser.getCurrentUrl()).toContain('/edit');
            	newProjectPage.doneButtonBottom.click();
                browser.sleep(2000); 
                expect(browser.getCurrentUrl()).toContain('/summary');
            } else {
            	browser.sleep(1000);
           	 	expect(newProjectPage.errorMsgs).toBeDefined();
            }
            
        });
    };
    
    var cancelProjectCreation = function () {
    	var projectsPage = new ProjectsPage();
    	var newProjectPage = new EditCreateProjectPage();
    	projectsPage.get();
    	browser.wait(function () {
            return browser.isElementPresent(projectsPage.addProjectButton);
        }).then(function () {
        	 projectsPage.addProjectButton.click();
             browser.sleep(2000);
             
             fillBrokenProjectPageFields(newProjectPage);
        	
             newProjectPage.cancelButton.click();
             browser.sleep(2000); 
             console.log("> Project canceled.");
             expect(browser.getCurrentUrl()).toContain('/projects?filter');
        });
    };
    
    var selectProject = function (projectName, filterPath, callback) {
    	var projectsPage = new ProjectsPage(filterPath);
    	projectsPage.get();
    	browser.driver.wait(function () {
            return browser.isElementPresent(element(by.repeater('project in projects | filter:filterText')));
        }).then(function () {
        	projectsPage.findProject(projectName).then(function (filteredElements) {
        		var project = filteredElements[0];
        		expect(project).toBeDefined();
        		
        		if (project) {
        			var projLink = project.element(by.tagName('a'));
        			projLink.click();
        			browser.sleep(5000);
        			console.log("> Project selected ");

        			if (callback) {
        				callback();
        			}
        		}
        	});
        });
    };
    
    var removeProject = function () {
    	var projectPage = new ProjectPage();
		browser.wait(function () {
			return browser.isElementPresent(projectPage.editButton);
		}).then(function () {
			console.log("> Project removing ");
			projectPage.editButton.click();
			browser.sleep(2000);
			browser.wait(function () {
    			return browser.isElementPresent(projectPage.deleteButton);
    		}).then(function () {
    			browser.sleep(500);
    	        projectPage.deleteButton.click();
    	        browser.sleep(500);
    	        projectPage.deleteButtonOk.click();
    	        browser.sleep(2000);
    	        expect(browser.getCurrentUrl()).toContain('/projects?filter');
    	    });
	    });
    };

    var fillCommonFields = function (newProjectPage, fillOtherFieldsCallback) {
        newProjectPage.execSponsorSelect(1); // assume that we have at least 1 sponsor in list.

        newProjectPage.customerInput.sendKeys("E2E Test Customer Name");

        fillOtherFieldsCallback();

        // roles tab filling
        //newProjectPage.rolesTab.click();
        newProjectPage.triggerAddRoleButton.click();
        newProjectPage.roleSelect(projectRoles.PM); // select project manager
        newProjectPage.addRoleButton.click();
        browser.sleep(1000);

        console.log("> Common project fields filled in.");
    };

    var fillActiveProjectPageFields = function (newProjectPage) {
        // start date in the past
        var today = new Date();
        today.setDate(today.getDate() - 2);
        var startDate = getShortDate(new Date(today));

        newProjectPage.nameInput.sendKeys(ACTIVE_PROJECT_NAME);
        newProjectPage.selectType(0).then(function () {
            newProjectPage.projectCommited.click();
            console.log("> Active project fields entered.");
        });
        newProjectPage.startDate.sendKeys(startDate);
    };

    var fillBacklogProjectPageFields = function (newProjectPage) {
        // start date in the future
        var today = new Date();
        today.setDate(today.getDate() + 2);
        var startDate = getShortDate(new Date(today));

        newProjectPage.nameInput.sendKeys(BACKLOG_PROJECT_NAME);
        newProjectPage.selectType(0).then(function () {
            newProjectPage.projectCommited.click();
            console.log("> Backlog project fields entered.");
        });
        newProjectPage.startDate.sendKeys(startDate);
    };

    var fillPipelineProjectPageFields = function (newProjectPage) {
        // start date in the future
        var today = new Date();
        today.setDate(today.getDate() + 2);
        var startDate = getShortDate(new Date(today));
 
        newProjectPage.nameInput.sendKeys(PIPELINE_PROJECT_NAME);
        newProjectPage.selectType(0);
        newProjectPage.startDate.sendKeys(startDate);
        console.log("> Pipeline project fields entered.");
    };
    
    var fillInvestmentProjectPageFields = function (newProjectPage) {
        // start date in the future
        var today = new Date();
        today.setDate(today.getDate() + 2);
        var startDate = getShortDate(new Date(today));

        newProjectPage.nameInput.sendKeys(INVEST_PROJECT_NAME);
        newProjectPage.selectType(1);
        newProjectPage.startDate.sendKeys(startDate);
        console.log("> Investment project fields entered.");
    };

    var fillCompletedProjectPageFields = function (newProjectPage) {
        // start date in the past
        var start = new Date();
        start.setDate(start.getDate() - 4);
        var startDate = getShortDate(new Date(start));

        // end date in the past
        var end = new Date();
        end.setDate(end.getDate() - 2);
        var endDate = getShortDate(new Date(end));

        newProjectPage.nameInput.sendKeys(COMPLETED_PROJECT_NAME);
        newProjectPage.selectType(0).then(function () {
        	newProjectPage.projectCommited.click();
        	console.log("> Completed project fields entered.");
        });
        newProjectPage.startDate.sendKeys(startDate);
    	newProjectPage.endDate.sendKeys(endDate);
    };
    
    var fillBrokenProjectPageFields = function (newProjectPage) {
        newProjectPage.nameInput.sendKeys(TEST_PROJECT_NAME);
        console.log("> Broken project fields entered.");
    };
    
    var fill3RolesPageFields = function (newProjectPage) {    	
    	var today = new Date();
        today.setDate(today.getDate() - 2);
        var startDate = getShortDate(new Date(today));

        newProjectPage.nameInput.sendKeys(TEST_PROJECT_NAME);
        newProjectPage.selectType(0).then(function () {
            newProjectPage.projectCommited.click();
            console.log("> Active project fields entered.");
        });
        newProjectPage.startDate.sendKeys(startDate);
        
        newProjectPage.triggerAddRoleButton.click();
        newProjectPage.roleSelect(projectRoles.SSEO);
        newProjectPage.addRoleButton.click();
        
        newProjectPage.triggerAddRoleButton.click();
        newProjectPage.roleSelect(projectRoles.SEO);
        newProjectPage.addRoleButton.click();
    };
    
    var checkServicesEstimateField = function () {
    	console.log("Check that Services Estimate field is readonly for the created active project.");
    	var projectPage = new ProjectPage();
		browser.wait(function () {
			return browser.isElementPresent(projectPage.editButton);
		}).then(function () {
			var editProjectPage = new EditCreateProjectPage();
			projectPage.editButton.click();
			browser.sleep(2000);
			browser.wait(function () {
	    		return browser.isElementPresent(projectPage.deleteButton);
	    	}).then(function () {
	    		expect( editProjectPage.servicesEstimated.isDisplayed() ).toEqual( true );
	    	    expect( editProjectPage.servicesEstimated.isEnabled() ).toEqual( true );
	    	    expect( editProjectPage.servicesEstimated.getAttribute('readonly') ).toEqual( 'true' );
	    	});
		});
    };
    
    var checkForSavingDialog = function () {
    	var projectsPage = new ProjectsPage();
    	var newProjectPage = new EditCreateProjectPage();
    	projectsPage.get();
    	browser.wait(function () {
            return browser.isElementPresent(projectsPage.addProjectButton);
        }).then(function () {
        	 projectsPage.addProjectButton.click();
             browser.sleep(2000);
             
             fillBrokenProjectPageFields(newProjectPage);
             element.all(by.className('appTitle')).get(1).click(); // go to the home page
             browser.sleep(1000);
             
             expect(newProjectPage.saveDialog.getAttribute('aria-hidden')).toEqual( 'false' );
             newProjectPage.saveDialogNo.click();
             browser.sleep(2000);
             expect(browser.getCurrentUrl()).toContain('/index.html');
        });
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

    var getShortDate = function (date) {
        //Get todays date formatted as yyyy-MM-dd
        var dd = date.getDate();
        var mm = date.getMonth() + 1; //January is 0!
        var yyyy = date.getFullYear();
        if (dd < 10) {
            dd = '0' + dd;
        }
        if (mm < 10) {
            mm = '0' + mm;
        }
        date = yyyy + '-' + mm + '-' + dd;
        return date;
    };
    
    var ProjectsPage = function ( filterPath ) {
    	if ( filterPath ) {
    		this.url = browser.baseUrl + projectsPath.url + filterPath;
    	} else {
    		this.url = browser.baseUrl + projectsPath.url + projectsPath.all;
    	}
        this.newUrl = browser.baseUrl + projectsPath.createUrl;
        
        this.get = function () {
            browser.get(this.url);
            browser.sleep(2000);
        };
        
        this.projects = element.all(by.repeater('project in projects | filter:filterText'));
        this.addProjectButton = element(by.css('[ng-click="createProject()"]'));
        this.sortByProject = element(by.css('[ng-click="switchSort(\'proj\')"]'));
        this.sortByClient = element(by.css('[ng-click="switchSort(\'cust\')"]'));
        this.sortByStartDate = element.all(by.css('[ng-click="switchSort(\'sd\')"]')).get(0);
        this.sortByEndDate = element.all(by.css('[ng-click="switchSort(\'ed\')"]')).get(0);
        this.sortByStatus = element.all(by.css('[ng-click="switchSort(\'stat\')"]')).get(1);
        this.sortRow = {
        		project: '{{project.name}}',
        		client: '{{project.customerName ? project.customerName : \'No customer\'}}',
        		startDate: '{{project.startDate | date}}',
        		endDate: '{{project.endDate | date}}'
        };
        this.findProject = function (projectName) {
            var $this = this;
            return $this.projects.filter(function (elem) {
                return elem.getText().then(function (text) {
                    return text.indexOf(projectName) > -1;
                });
            });
        };
    };

    var ProjectPage = function () {
        this.editButton = element(by.css('[ng-click="editProject()"]'));
        this.deleteButton = element(by.css('[ng-show="canDeleteProject"]'));
        this.deleteButtonOk = element(by.css('[ng-click="deleteProject()"]'));
    };

    var EditCreateProjectPage = function () {
    	this.errorMsgs = element(by.id('projectMsgs')).element(by.className('alert-danger')).element(by.tagName('ul'));
        this.nameInput = element(by.model('project.name'));
        this.customerInput = element(by.model('project.customerName'));
        this.projectTypesRadio = element.all(by.model('project.type'));
        this.calendarToday = element(by.css('.day active'));
        this.startDate = element(by.model('project.startDate'));
        this.endDate = element(by.model('project.endDate'));
        this.servicesEstimated = element(by.id("servicesEstimatedValue"));
        this.projectCommited = element(by.model('project.committed'));
        this.execSponsorSelect = function (number) {
            element(by.model('project.executiveSponsor.resource')).all(by.tagName('option'))
            	.then(function (options) {
                        options[number].click();
                });
        };
        //this.rolesTab = element(by.id('roles'));
        this.triggerAddRoleButton = element(by.css('[ng-click="triggerAddRole()"]'));
        this.roleSelect = function (name) {
            element(by.cssContainingText('option', name)).click();
        };
        // 0 - PAID, 1 - POC, 2 - INVEST
        this.selectType = function (index) {
            return element(by.css(".project-edit-buttons")).all(by.tagName("label")).get(index).click();
        };
        this.roleStartDate = element(by.model('newRole.startDate'));
        this.hoursPerMonth = element(by.model('newRole.rate.hoursPerMth'));
        this.addRoleButton = element(by.css('[ng-click="add()"]'));
        this.doneButton = element(by.css('[ng-click="checkShiftDates(false)"]'));
        this.doneButtonBottom = element.all(by.css('[ng-click="checkShiftDates(true)"]')).get(1);
        this.saveButtonTop = element.all(by.css('[ng-click="checkShiftDates(false)"]')).first();
        this.saveButtonBottom = element.all(by.css('[ng-click="checkShiftDates(false)"]')).get(1);
        this.saveButton = element(by.css('[ng-click="checkShiftDates(true)"]'));
        this.cancelButton = element(by.css('[ng-click="close()"]'));
        this.successMessage = element.all(by.repeater('message in messages'));
        
        this.saveDialog = element(by.className("modalYesNo"));
        this.saveDialogYes = element(by.css('[ng-click="modalDialog.okHandler()"]'));
        this.saveDialogNo = element(by.css('[ng-click="modalDialog.noHandler()"]'));
        this.saveDialogCancel = element(by.css('[ng-click="modalDialog.cancelHandler()"]'));
    };
});
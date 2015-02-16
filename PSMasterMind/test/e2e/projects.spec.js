describe("E2E: Create project, check projects list, delete project, check project list.", function () {

    var USER_NAME = 'psapps@pointsourcellc.com';
    var PASSWORD = 'ps@pp$777';

    var DEFAULT_PROJECTS_COUNT = 46;

    var ACTIVE_PROJECT_NAME = "E2E Active Project";
    var BACKLOG_PROJECT_NAME = "E2E Backlog Project";
    var PIPELINE_PROJECT_NAME = "E2E Pipeline Project";
    var COMPLETED_PROJECT_NAME = "E2E Completed Project";
    var INVEST_PROJECT_NAME = "E2E Investment Project";

    //login
    var sbutton = by.tagName('button');
    var logonEmail = by.id('Email');
    var logonPswd = by.id('Passwd');
    var signIn = by.id('signIn');
    var submit_approve_access = by.id('submit_approve_access');

    beforeEach(function () {
        browser.driver.getCurrentUrl().then(function (url) {
            if (url.indexOf('http://localhost:9000/index.html#/') == -1) { //Go to the dashboard page
                browser.driver.get('http://localhost:9000/index.html#/');
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

    var ProjectsPage = function () {
        this.url = browser.baseUrl + "/index.html#/projects?filter=all";
        this.newUrl = browser.baseUrl + "/index.html#/projects/new?filter=all";
        this.get = function () {
            browser.get(this.url);
        };
        this.projects = element.all(by.repeater('project in projects | filter:filterText'));
        this.addProjectButton = element(by.css('[ng-click="createProject()"]'));
        this.findProject = function (projectName) {
            var $this = this;
            $this.projects.filter(function (elem) {
                return elem.getText().then(function (text) {
                    return text.indexOf(projectName) > -1;
                });
            }).then(function (filteredElements) {
                return filteredElements[0];
            });
        }
    };

    var ProjectPage = function () {
        this.editButton = element(by.css('[ng-click="edit()"]'));
        this.deleteButton = element(by.css('[ng-show="canDeleteProject"]'));
        this.deleteButtonOk = element(by.css('[ng-click="deleteProject()"]'));
    };

    var NewProjectPage = function () {
        this.nameInput = element(by.model('project.name'));
        this.customerInput = element(by.model('project.customerName'));
        this.projectTypesRadio = element.all(by.model('project.type'));
        this.calendarToday = element(by.css('.day active'));
        this.startDate = element(by.model('project.startDate'));
        this.endDate = element(by.model('project.endDate'));
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
            element(by.css(".project-edit-buttons")).all(by.tagName("label")).get(0).click();
        };
        this.roleStartDate = element(by.model('newRole.startDate'));
        this.hoursPerMonth = element(by.model('newRole.rate.hoursPerMth'));
        this.addRoleButton = element(by.css('[ng-click="add()"]'));
        this.doneButton = element(by.css('[ng-click="checkShiftDates(false)"]'));
        this.doneButtonBottom = element.all(by.css('[ng-click="checkShiftDates(true)"]')).get(1);
        this.saveButtonTop = element.all(by.css('[ng-click="checkShiftDates(false)"]')).first();
        this.saveButtonBottom = element.all(by.css('[ng-click="checkShiftDates(false)"]')).get(1);
        this.saveButton = element(by.css('[ng-click="checkShiftDates(true)"]'));
        this.successMessage = element.all(by.repeater('message in messages'));
    };

    it('Test All projects listed by default', function () {
         browser.driver.get('http://localhost:9000/#/projects');
         browser.driver.sleep(1000);
         expect(browser.driver.getCurrentUrl()).toContain('?filter=all');
         var projects = element.all(by.repeater('project in projects | filter:filterText'));

         console.log("> Calculating projects count. Should be equal to " + DEFAULT_PROJECTS_COUNT);
        projects.count().then(function (projectsCount) {
            console.log("> Projects count is " + projectsCount);
            expect(projectsCount).toEqual(DEFAULT_PROJECTS_COUNT);
        });

    });

    // IMPORTANT: required at lest 1 sponsor in sponsor's list, 
    //            required at "Project Manager" role in roles dropdown
    it('Should create active project.', function () {
        createProject(ACTIVE_PROJECT_NAME, fillActiveProjectPageFields);
    }, 30000);

    /*it('Should create backlog project.', function () {
        createProject(BACKLOG_PROJECT_NAME, fillBacklogProjectPageFields);
    }, 30000);

    it('Should create pipeline project.', function () {
        createProject(PIPELINE_PROJECT_NAME, fillPipelineProjectPageFields);
    }, 30000);

    it('Should create completed project.', function () {
        createProject(COMPLETED_PROJECT_NAME, fillCompletedProjectPageFields);
    }, 30000);

    it('Should create investment project.', function () {
        createProject(INVEST_PROJECT_NAME, fillInvestmentProjectPageFields);
    }, 30000);*/

    var createProject = function (projectName, fillCustomFieldsCallback) {
        var projectsPage = new ProjectsPage();
        var newProjectPage = new NewProjectPage();

        projectsPage.get(); // going to projects
        browser.wait(function () {
            return browser.isElementPresent(by.css('[ng-click="createProject()"]'));
        }).then(function () {
            projectsPage.addProjectButton.click();

            // assert for "project/new" url
            browser.getCurrentUrl().then(function (url) {
                expect(url).toEqual(projectsPage.newUrl);
            });

            // filling project fields
            fillCommonFields(newProjectPage, function () {
                fillCustomFieldsCallback(newProjectPage);
            });

            newProjectPage.doneButtonBottom.click();

            // clean up the environment: delete project
            browser.wait(function () {
                browser.isElementPresent(by.binding("project.customer"));
            }).then(function () {
                browser.driver.getCurrentUrl().then(function (createdProjectUrl) {
                    console.log("> Created project url: " + createdProjectUrl);
                    // check if project added
                    projectsPage.get();
                    var projects = element.all(by.repeater('project in projects | filter:filterText'));
                    projects.count().then(function (projectsCount) {
                        console.log("> Projects count is " + projectsCount);
                        expect(projectsCount).toEqual(DEFAULT_PROJECTS_COUNT + 1);
                    });

                    //deleteProject(createdProjectUrl);
                });
            });

            /*newProjectPage.successMessage.then(function (arr) {
                expect(arr[0].getText()).toEqual('Project successfully saved');
            });*/
        });
    }

    /*it('Should create backlog project.', function() {
        var projectsPage = new ProjectsPage();
        var newProjectPage = new NewProjectPage();

        projectsPage.get(); // going to projects
        browser.sleep(1000); // wait until it loads
        projectsPage.addProjectButton.click();

        // assert for "project/new" url
        browser.getCurrentUrl().then(function(url) {
            expect(url).toEqual(projectsPage.newUrl);
        });

        fillCommonFields(newProjectPage, function() {
            fillBacklogProjectPageFields(newProjectPage);
        });

        newProjectPage.successMessage.then(function(arr) {
            expect(arr[0].getText()).toEqual('Project successfully saved');
        });
    }, 30000);

    it('Should create pipeline project.', function() {
        var projectsPage = new ProjectsPage();
        var newProjectPage = new NewProjectPage();

        projectsPage.get(); // going to projects
        browser.sleep(1000); // wait until it loads
        projectsPage.addProjectButton.click();

        // assert for "project/new" url
        browser.getCurrentUrl().then(function(url) {
            expect(url).toEqual(projectsPage.newUrl);
        });

        fillCommonFields(newProjectPage, function() {
            fillPipelineProjectPageFields(newProjectPage);
        });

        newProjectPage.successMessage.then(function(arr) {
            expect(arr[0].getText()).toEqual('Project successfully saved');
        });
    }, 30000);

    it('Should create completed project.', function() {
        var projectsPage = new ProjectsPage();
        var newProjectPage = new NewProjectPage();

        projectsPage.get(); // going to projects
        browser.sleep(1000); // wait until it loads
        projectsPage.addProjectButton.click();

        // assert for "project/new" url
        browser.getCurrentUrl().then(function(url) {
            expect(url).toEqual(projectsPage.newUrl);
        });

        fillCommonFields(newProjectPage, function() {
            fillCompletedProjectPageFields(newProjectPage);
        });

        newProjectPage.successMessage.then(function(arr) {
            expect(arr[0].getText()).toEqual('Project successfully saved');
        });
    }, 30000);

    it('Open projects page, shoud display created projects.', function() {
        var projectsPage = new ProjectsPage();
        projectsPage.get();
        browser.getCurrentUrl().then(function(url) {
            expect(url).toEqual(projectsPage.url);
        });
        browser.sleep(1000);
        browser.waitForAngular().then(function() {
            expect(projectsPage.projects.count()).toEqual(3);
        });
    }, 30000);

    it('Should delete created project', function() {
        deleteProjectByName(ACTIVE_PROJECT_NAME);
    }, 30000*/

    var fillCommonFields = function (newProjectPage, fillOtherFieldsCallback) {
        newProjectPage.execSponsorSelect(1); // assume that we have at least 1 sponsor in list.

        newProjectPage.customerInput.sendKeys("E2E Test Customer Name");
        newProjectPage.selectType(0);

        fillOtherFieldsCallback();

        // roles tab filling
        //newProjectPage.rolesTab.click();
        newProjectPage.triggerAddRoleButton.click();
        newProjectPage.roleSelect("Project Manager"); // select project manager
        newProjectPage.addRoleButton.click();

        console.log("> Common project fields filled in.");
    };

    var fillActiveProjectPageFields = function (newProjectPage) {
        // start date in the past
        var today = new Date();
        today.setDate(today.getDate() - 2);
        var startDate = getShortDate(new Date(today));

        newProjectPage.startDate.sendKeys(startDate);
        newProjectPage.nameInput.sendKeys(ACTIVE_PROJECT_NAME);
        newProjectPage.projectCommited.click();
        console.log("> Active project fields entered.");
    };

    var fillBacklogProjectPageFields = function (newProjectPage) {
        // start date in the future
        var today = new Date();
        today.setDate(today.getDate() + 2);
        var startDate = getShortDate(new Date(today));

        newProjectPage.startDate.sendKeys(startDate);
        newProjectPage.nameInput.sendKeys(BACKLOG_PROJECT_NAME);
        newProjectPage.projectCommited.click();
    };

    var fillPipelineProjectPageFields = function (newProjectPage) {
        // start date in the future
        var today = new Date();
        today.setDate(today.getDate() + 2);
        var startDate = getShortDate(new Date(today));

        newProjectPage.nameInput.sendKeys(PIPELINE_PROJECT_NAME);
        newProjectPage.startDate.sendKeys(startDate);
        // not contractually commited
        //newProjectPage.projectCommited.click();
    };

    var fillCompletedProjectPageFields = function (newProjectPage) {
        newProjectPage.nameInput.sendKeys(COMPLETED_PROJECT_NAME);
        // start date in the past
        var start = new Date();
        start.setDate(start.getDate() - 4);
        var startDate = getShortDate(new Date(start));

        // end date in the past
        var end = new Date();
        end.setDate(end.getDate() - 2);
        var endDate = getShortDate(new Date(end));

        newProjectPage.startDate.sendKeys(startDate);
        newProjectPage.endDate.sendKeys(endDate);
        newProjectPage.projectCommited.click();
    };

    var fillInvestmentProjectPageFields = function (newProjectPage) {
        // start date in the future
        var today = new Date();
        today.setDate(today.getDate() + 2);
        var startDate = getShortDate(new Date(today));

        newProjectPage.selectType(2);
        newProjectPage.startDate.sendKeys(startDate);
        newProjectPage.nameInput.sendKeys(INVEST_PROJECT_NAME);
        newProjectPage.projectCommited.click();
    };

    var deleteProjectByName = function (name) {
        var projectsPage = new ProjectsPage();
        projectsPage.get();

        // now we are on project page
        var projectPage = new ProjectPage();
        browser.sleep(500);
        projectPage.editButton.click();
        browser.sleep(500);
        projectPage.deleteButton.click();
        browser.sleep(500);
        projectPage.deleteButtonOk.click();
        // check that we are redirected to /projects
        browser.getCurrentUrl().then(function (url) {
            expect(url).toEqual(projectsPage.url);
        });
        // check that there are no projects now
        browser.waitForAngular().then(function () {
            expect(projectsPage.projects.count()).toEqual(0);
        });
        browser.sleep(4000); // for demo
    };

    var login = function () {
        browser.driver.ignoreSynchronization = true;
        browser.driver.get('http://localhost:9000');

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
});
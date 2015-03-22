/**
 * @Author Denys Novalenko
 * 
 * */
describe('E2E: Staffing Tests', function() {	
    
	var USER_NAME = 'psapps@pointsourcellc.com';
    var PASSWORD = 'ps@pp$777';
    
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
	
	it('Administration Test: Check Roles page.', function() {	
		console.log('> Running: Administration - Check Roles page');
		var rolePage = new RolePage();
		rolePage.checkRolesPage();
	});

	it('Administration Test: Check sorting on Roles page.', function() {	
		console.log('> Running: Administration - Check sorting on Roles page');
		var rolePage = new RolePage();
		rolePage.checkSortingOnRolesPage();
	});

	it('Administration Test: Create new role and verify.', function() {	
		console.log('> Running: Administration - Create new role and verify');
		var rolePage = new RolePage();
		rolePage.createNewRoleAndVerify();
	});

	it('Administration Test: Edit existing role and verify.', function() {	
		console.log('> Running: Administration - Edit existing role and verify');
		var rolePage = new RolePage();
		rolePage.editExistingRoleAndVerify();
	});
		
	it('Administration Test: Delete role and verify.', function() {	
		console.log('> Running: Administration - Delete role and verify');
		var rolePage = new RolePage();
		rolePage.deleteRoleAndVerify();
	});

	it('Administration Test: Check Security Groups page.', function() {	
		console.log('> Running: Administration - Check Security Groups page');
		var securityGroupPage = new SecurityGroupPage();
		securityGroupPage.checkSecurityGroupsPage();
	});

	it('Administration Test: Create new security group and verify.', function() {	
		console.log('> Running: Administration - Create new security group and verify');
		var securityGroupPage = new SecurityGroupPage();
		securityGroupPage.createNewSecurityGroupAndVerify();
	});

	it('Administration Test: Edit existing security group and verify.', function() {	
		console.log('> Running: Administration - Edit existing security group and verify');
		var securityGroupPage = new SecurityGroupPage();
		securityGroupPage.editExistingSecurityGroupAndVerify();
	});
			
	it('Administration Test: Add members to security group and verify.', function() {	
		console.log('> Running: Administration - Add members to security group and verify');
		var securityGroupPage = new SecurityGroupPage();
		securityGroupPage.addMembersToSecurityGroupAndVerify();
	});
		
	it('Administration Test: Remove members of security group and verify.', function() {	
		console.log('> Running: Administration - Remove members of security group and verify');
		var securityGroupPage = new SecurityGroupPage();
		securityGroupPage.removeMembersInSecurityGroupAndVerify();
	});

	it('Administration Test: Update permissions in security group and verify.', function() {	
		console.log('> Running: Administration - Update permissions in security group and verify');
		var securityGroupPage = new SecurityGroupPage();
		securityGroupPage.updatePermissionsInSecurityGroupAndVerify();
	});

	it('Administration Test: Delete permissions in security group and verify.', function() {	
		console.log('> Running: Administration - Delete permissions in  security group and verify');
		var securityGroupPage = new SecurityGroupPage();
		securityGroupPage.deletePermissionsInSecurityGroupAndVerify();
	});

	it('Administration Test: Delete security group and verify.', function() {	
		console.log('> Running: Administration - Delete security group and verify');
		var securityGroupPage = new SecurityGroupPage();
		securityGroupPage.deleteSecurityGroupAndVerify();
	});
		
	it('Administration Test: Check Tasks page.', function() {	
		console.log('> Running: Administration - Check Tasks page');
		var taskPage = new TaskPage();
		taskPage.checkTasksPage();
	});

	it('Administration Test: Create new task and verify.', function() {	
		console.log('> Running: Administration - Create new task and verify');
		var taskPage = new TaskPage();
		taskPage.createNewTaskAndVerify();
	});

	it('Administration Test: Edit existing task and verify.', function() {	
		console.log('> Running: Administration - Edit existing task and verify');
		var taskPage = new TaskPage();
		taskPage.editExistingTaskAndVerify();
	});

	it('Administration Test: Delete task and verify.', function() {	
		console.log('> Running: Administration - Delete task and verify');
		var taskPage = new TaskPage();
		taskPage.deleteTaskAndVerify();
	});

	it('Administration Test: Check Configuration page.', function() {	
		console.log('> Running: Administration - Check Configuration page');
		var configurationPage = new ConfigurationPage();
		configurationPage.checkConfigurationPage();
	});

	it('Administration Test: Update Configuration and verify.', function() {	
		console.log('> Running: Administration - Update Configuration and verify');
		var configurationPage = new ConfigurationPage();
		configurationPage.updateConfigurationAndVerify();
	});

	
	var updateElement = function (form, element, value, isClickable) {
  		var element = form.findElement(element);
  		element.clear().then( function () { 
  			element.sendKeys(value); 
  			if (isClickable) {
  				browser.findElement(by.cssContainingText('a', value)).click();
  			}
  		} );
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
	

	var SecurityGroupPage = function () {
		
	    this.groupsButton = by.id('groups');
	    this.addGroupButton = by.css('[ng-click="createGroup()"]');
	    this.deleteGroupButton = by.css('[ng-click="deleteGroup()"]');
	    this.selectGroup = by.model('selectedGroup');

	    this.groupName = by.css('[ng-model="selectedGroup.name"]'); 
	    this.addGroupMember = by.id('memberToAdd');
	    this.addOtherGroup = by.id('groupToAdd');
	    this.groupMembers = by.repeater('member in selectedGroupMembers');
	    this.removeGroupMember = by.css('[ng-click="removeMember(member, $index)"]');
	    this.otherGroups = by.repeater('group in selectedGroupGroups');
	    this.removeOtherGroup = by.css('[ng-click="removeGroup(group, $index)"]');
	    
	    this.permissionGroups = by.repeater('permission in fullResourcesMap');
	    this.permissions = by.repeater('permissionName in permission.permissions');
	    this.checkPermission = by.css('[ng-checked="permissionChecked(permission.name, permissionName)"]');

	    this.saveButton = by.css('[ng-click="save()"]');
	    this.editButton = by.css('[ng-click="edit()"]');

	    this.initial = {
	    	name : 'TestSecurityGroup',
	    	members : [ { firstName : 'ps', lastName : 'apps'} ]
	    };

	    this.updated = {
	        name : 'UpdatedTestSecurityGroup',
	        members : [ { firstName : 'ps', lastName : 'apps'} ]
	    }
    	this.memberToAdd = { firstName : 'Brian', lastName : 'Reynolds'};
    	this.memberToRemove = { firstName : 'ps', lastName : 'apps'};
	   
	    this.permission = "View Tasks";
	    
	    this.checkSecurityGroupsPage = function() {
	    	var $this = this;
	 		browser.get('http://localhost:9000/index.html#/admin');
			browser.wait(function(){	    		
		    	return browser.isElementPresent($this.groupsButton);
		    }).then(function(){
		    	browser.findElement($this.groupsButton).click().then(function () {
		    		browser.wait(function(){	    		
		    	    	return browser.isElementPresent($this.addGroupButton);
		    	    }).then(function(){
				    	expect($this.addGroupButton).toBeDefined();	    
		    	    });
		    	});
		    });
		}

		this.createNewSecurityGroupAndVerify = function() {
			var $this = this;
			browser.get('http://localhost:9000/index.html#/admin');
			browser.wait(function(){	    		
		    	return browser.isElementPresent($this.groupsButton);
		    }).then(function(){
		    	browser.findElement($this.groupsButton).click().then(function () {
		    		browser.wait(function(){	    		
		    	    	return browser.isElementPresent($this.addGroupButton);
		    	    }).then(function(){
		    	   		browser.findElement($this.addGroupButton).click().then(function () {
		    	   			$this.updateSecurityGroup(browser, $this.initial);
		    	   	   		browser.findElement($this.saveButton).click().then(function () {
		    	   	   			$this.verifySecurityGroup($this.initial);
		    	   	   		});
		    	   		});
		    	    });
		    	});
		    });
		}

		this.editExistingSecurityGroupAndVerify = function() {
			var $this = this;
			browser.get('http://localhost:9000/index.html#/admin');
			browser.wait(function(){	    		
		    	return browser.isElementPresent($this.groupsButton);
		    }).then(function(){
		    	browser.findElement($this.groupsButton).click().then(function () {
		    		browser.wait(function(){	    		
		    	    	return browser.isElementPresent($this.addGroupButton);
		    	    }).then(function(){
		    	    	browser.findElement($this.selectGroup).sendKeys($this.initial.name).then( function () {
		    	    		browser.findElement($this.editButton).click().then(function () {
		    	    			$this.updateSecurityGroup(browser, $this.updated);
			    	   	   		browser.findElement($this.saveButton).click().then(function () {
			    	   	   			$this.verifySecurityGroup($this.updated);
			    	   	   		});
			    	   		});	
		    	    	});
		    	    });
		    	});
		    });
		}

		this.addMembersToSecurityGroupAndVerify = function() {
			var $this = this;
			browser.get('http://localhost:9000/index.html#/admin');
			browser.wait(function(){	    		
		    	return browser.isElementPresent($this.groupsButton);
		    }).then(function(){
		    	browser.findElement($this.groupsButton).click().then(function () {
		    		browser.wait(function(){	    		
		    	    	return browser.isElementPresent($this.addGroupButton);
		    	    }).then(function(){
		    	    	browser.findElement($this.selectGroup).sendKeys($this.updated.name).then( function () {
		    	    		browser.findElement($this.editButton).click().then(function () {
		    	    			// add member to security group
		    	    			$this.updated.members.push($this.memberToAdd);
		    	    			$this.updateSecurityGroup(browser, $this.updated);
			    	   	   		browser.findElement($this.saveButton).click().then(function () {
			    	   	   			$this.verifySecurityGroup($this.updated);
			    	   	   		});
			    	   		});	
		    	    	});
		    	    });
		    	});
		    });
		}

		this.removeMembersInSecurityGroupAndVerify = function() {
			var $this = this;
			browser.get('http://localhost:9000/index.html#/admin');
			browser.wait(function(){	    		
		    	return browser.isElementPresent($this.groupsButton);
		    }).then(function(){
		    	browser.findElement($this.groupsButton).click().then(function () {
		    		browser.wait(function(){	    		
		    	    	return browser.isElementPresent($this.addGroupButton);
		    	    }).then(function(){
		    	    	browser.findElement($this.selectGroup).sendKeys($this.updated.name).then( function () {
		    	    		browser.findElement($this.editButton).click().then(function () {
		    	    			var nameToRemove = $this.memberToRemove.lastName + ", " + $this.memberToRemove.firstName;
		    			   		var divElement = browser.findElement(by.cssContainingText('div .security-members-edit', nameToRemove));
		    			   		divElement.findElement($this.removeGroupMember).click().then(function () {
		    			   			browser.findElement($this.saveButton).click().then(function () {
		    		    	    		browser.driver.sleep(3000);	
		    		    	    		expectByCssToBeAbsent(nameToRemove);
				    	   	   		});
		    			   		});
			    	   		});	
		    	    	});
		    	    });
		    	});
		    });
		}

		this.updatePermissionsInSecurityGroupAndVerify = function() {
			var $this = this;
			browser.get('http://localhost:9000/index.html#/admin');
			browser.wait(function(){	    		
		    	return browser.isElementPresent($this.groupsButton);
		    }).then(function(){
		    	browser.findElement($this.groupsButton).click().then(function () {
		    		browser.wait(function(){	    		
		    	    	return browser.isElementPresent($this.addGroupButton);
		    	    }).then(function(){
		    	    	browser.findElement($this.selectGroup).sendKeys($this.updated.name).then( function () {
		    	    		browser.findElement($this.editButton).click().then(function () {
		    	    			browser.findElements(by.cssContainingText('li', $this.permission)).then( function(elements) {
	    		    	    		expect(elements[0].findElement($this.checkPermission).isSelected()).toBeTruthy();
	    		    	    	});
		    	    			browser.findElement($this.saveButton).click().then(function() {
		    		    	    	browser.driver.sleep(1000);	
			    	    			browser.findElements(by.cssContainingText('li', $this.permission)).then( function(elements) {
		    		    	    		elements[1].getText().then(function(txt) {
				    		    			expect(txt).toEqual($this.permission);
		    		    	    		});
		    		    	    	});
		    	    			});
			    	   		});	
		    	    	});
		    	    });
		    	});
		    });
		}

		this.deletePermissionsInSecurityGroupAndVerify = function() {
			var $this = this;
			browser.get('http://localhost:9000/index.html#/admin');
			browser.wait(function(){	    		
		    	return browser.isElementPresent($this.groupsButton);
		    }).then(function(){
		    	browser.findElement($this.groupsButton).click().then(function () {
		    		browser.wait(function(){	    		
		    	    	return browser.isElementPresent($this.addGroupButton);
		    	    }).then(function(){
		    	    	browser.findElement($this.selectGroup).sendKeys($this.updated.name).then( function () {
		    	    		browser.findElement($this.editButton).click().then(function () {
		    	    			browser.findElements(by.cssContainingText('li', $this.permission)).then( function(elements) {
		    	    				elements[0].findElement($this.checkPermission).click().then( function(){
				    	    			browser.findElement($this.saveButton).click().then(function() {
				    		    	    	browser.driver.sleep(1000);	
				    		    	    	expectByCssToBeAbsent($this.permission);
				    	    			});
		    	    				});
	    		    	    	});
			    	   		});	
		    	    	});
		    	    });
		    	});
		    });
		}

		this.deleteSecurityGroupAndVerify = function() {
			var $this = this;
			browser.get('http://localhost:9000/index.html#/admin');
			browser.wait(function(){	    		
		    	return browser.isElementPresent($this.groupsButton);
		    }).then(function(){
		    	browser.findElement($this.groupsButton).click().then(function () {
		    		browser.wait(function(){	    		
		    	    	return browser.isElementPresent($this.addGroupButton);
		    	    }).then(function(){
		    	    	browser.findElement($this.selectGroup).sendKeys($this.updated.name).then( function () {
		    	    		browser.findElement($this.editButton).click().then(function () {
		    	    			browser.findElement($this.deleteGroupButton).click().then(function() {
		    		    	    	browser.driver.sleep(1000);	
		    		    	    	expectByCssToBeAbsent($this.updated.name);
		    	    			});
			    	   		});	
		    	    	});
		    	    });
		    	});
		    });
		}

		this.updateSecurityGroup = function (form, group) {
			var $this = this;
	   		updateElement(form, $this.groupName, group.name);
	   		for (var i in group.members) {
	   			var nameToFind = group.members[i].lastName + ", " + group.members[i].firstName;
	   			element.all(by.repeater('member in selectedGroupMembers')).filter(function(elem, index) {
					return elem.getText().then(function(text) {
					    return text === nameToFind;
					});
				}).then(function(filteredElements) {
					if (filteredElements.length == 0 ) {
			   			var name = group.members[i].firstName + " " + group.members[i].lastName;
			   	   		updateElement(form, $this.addGroupMember, name , true);
					}
				});
	   		}
		}

		this.verifySecurityGroup = function (securityGroup) {
			var $this = this;
			browser.findElement($this.selectGroup).sendKeys(securityGroup.name).then( function () {
	    		browser.driver.sleep(1000);	
	       		if (securityGroup.members) {
	    			for (var i in securityGroup.members) {
	    				element.all(by.repeater('member in selectedGroupMembers')).filter(function(elem, index) {
	    					return elem.getText().then(function(text) {
	    						var name = securityGroup.members[i].lastName + ", " + securityGroup.members[i].firstName;
	    					    return text === name;
	    					});
	    				}).then(function(filteredElements) {
	    					expect(filteredElements.length).toEqual(1);
	    				});
	    	   		}
	    		}
			});
		}
		
	}
	
	
	
	var RolePage = function () {

		this.addRolesButton = by.css('[ng-click="toggleNewRole()"]');
		this.roleElements = element.all(by.repeater("role in $data"));
		this.sortByAbbreviation = element(by.cssContainingText('th', 'Abbreviation'));
		this.sortByTitle = element(by.cssContainingText('th', 'Name'));
		
		this.sortRow = {
	    	abbr: '{{role.abbreviation}}',
	    	name: '{{role.title}}'
	    };
	    
		this.abbreviation = by.css('[ng-model="newRole.abbreviation"]');
		this.title = by.css('[ng-model="newRole.title"]');
		this.hourlyAdvertisedRate = by.css('[ng-model="newRole.hourlyAdvertisedRate"]');
		this.hourlyLoadedRate = by.css('[ng-model="newRole.hourlyLoadedRate"]');
		this.monthlyAdvertisedRate = by.css('[ng-model="newRole.monthlyAdvertisedRate"]');
		this.monthlyLoadedRate = by.css('[ng-model="newRole.monthlyLoadedRate"]');
		this.utilizationRate = by.css('[ng-model="newRole.utilizationRate"]');
		this.isNonBillable = by.css('[ng-model="newRole.isNonBillable"]');
	    
	    this.saveButton = by.css('[ng-click="save()"]');
	    this.editButton = by.css('[ng-click="edit()"]');
	    
	    // Role buttons
	    this.addRoleButton = by.css('[ng-click="addRole()"]');
	    this.saveRoleButton = by.css('[ng-click="saveRole()"]');
	    this.editRoleButton = by.css('[ng-click="triggerEditRole(role, $index)"]')
	    this.deleteRoleButton = by.css('[ng-click="deleteRole(role.resource)"]');
	    this.roleForm = by.css('[ng-form="RoleEditForm"]');
	   
	    this.initial = {
	    	abbreviation : 'TROLE',
	    	title : 'Test Role Title',
	    	hourlyAdvertisedRate : '10',
	    	hourlyLoadedRate : '20',
	    	monthlyAdvertisedRate : '30',
	    	monthlyLoadedRate : '40',
	    	utilizationRate : '50'
	    }

	    this.updated = {
	        abbreviation : 'TROLEUPD',
	        title : 'Test Role Title Updated',
	        hourlyAdvertisedRate : '11',
	        hourlyLoadedRate : '21',
	        monthlyAdvertisedRate : '31',
	        monthlyLoadedRate : '41',
	        utilizationRate : '51'
	    }
		
		this.checkRolesPage = function() {
	    	var $this = this;
	 		browser.get('http://localhost:9000/index.html#/admin');
			browser.wait(function(){	    		
		    	return browser.isElementPresent($this.addRolesButton);
		    }).then(function(){
		    	expect($this.addRolesButton).toBeDefined();	    
		    });
		}
	    
	    this.createNewRoleAndVerify = function() {
			var $this = this;
	   		browser.findElement($this.addRolesButton).click().then(function () {
	   			$this.updateRole(browser, $this.initial);
	   	   		browser.findElement($this.addRoleButton).click().then(function () {
	   	   			$this.verifyRole($this.initial);
	   	   		});
	   		});
	 	}

		this.updateRole = function (form, role) {
	   		updateElement(form, this.abbreviation, role.abbreviation);
	   		updateElement(form, this.title, role.title);
	   		updateElement(form, this.hourlyAdvertisedRate, role.hourlyAdvertisedRate);
	   		updateElement(form, this.hourlyLoadedRate, role.hourlyLoadedRate);
	   		updateElement(form, this.monthlyAdvertisedRate, role.monthlyAdvertisedRate);
	   		updateElement(form, this.monthlyLoadedRate, role.monthlyLoadedRate);
	   		updateElement(form, this.utilizationRate, role.utilizationRate);
		}
		
		this.editExistingRoleAndVerify = function() {
			var $this = this;
			browser.get('http://localhost:9000/index.html#/admin');
	   		browser.wait(function(){	    		
	       		return browser.isElementPresent($this.addRolesButton);
	       	}).then(function(){
		   		var titleElement = browser.findElement(by.cssContainingText('td', $this.initial.title));
	   	   		var parentElement = titleElement.findElement(by.xpath('..'));
	   	   		var editElement = parentElement.findElement($this.editRoleButton);
	   	   		editElement.click().then(function () {
	  	     		browser.wait(function(){	    		
		   	    		return browser.isElementPresent($this.saveRoleButton);
		   	    	}).then(function(){
			    		browser.driver.sleep(1000);	
			    		browser.findElements($this.roleForm).then( function (editForms) {
			   	    		browser.driver.sleep(1000);	
			   	    		$this.updateRole(editForms[1], $this.updated);
			   	    		browser.findElements($this.saveRoleButton).then( function (saveRoleButtons) {
			   	    			saveRoleButtons[1].click().then(function () {
						    		browser.driver.sleep(1000);	
						    		$this.verifyRole($this.updated);
				   	    		});
			   	    		});
			    		});
			   	   	});
	  	     	}); 	
	       	});
		}
		
		this.verifyRole = function(role) {
			var $this = this;
			var titleElement = browser.findElement(by.cssContainingText('td', role.title));
		   	var parentElement = titleElement.findElement(by.xpath('..'));
		   	var editElement = parentElement.findElement($this.editRoleButton);
		   	editElement.click().then(function () {
		   		browser.wait(function(){	    		
		   			return browser.isElementPresent($this.saveRoleButton);
			   	}).then(function(){
			   		browser.driver.sleep(1000);	
			   		browser.findElements($this.roleForm).then( function (editForms) {
			   			browser.driver.sleep(1000);	
			   			console.log("editForms : " + editForms);
			   			$this.verifyRoleElements(editForms[1], role);
			   		});
			   	});
		   	}); 	
		}
		
		this.verifyRoleElements = function (form, role) {
			expect(form.findElement(this.abbreviation).getAttribute('value')).toEqual(role.abbreviation);
			expect(form.findElement(this.title).getAttribute('value')).toEqual(role.title);
			expect(form.findElement(this.hourlyAdvertisedRate).getAttribute('value')).toEqual(role.hourlyAdvertisedRate);
			expect(form.findElement(this.hourlyLoadedRate).getAttribute('value')).toEqual(role.hourlyLoadedRate);
			expect(form.findElement(this.monthlyAdvertisedRate).getAttribute('value')).toEqual(role.monthlyAdvertisedRate);
			expect(form.findElement(this.monthlyLoadedRate).getAttribute('value')).toEqual(role.monthlyLoadedRate);
			expect(form.findElement(this.utilizationRate).getAttribute('value')).toEqual(role.utilizationRate);
		}
		
		this.checkSortingOnRolesPage = function() {
	       	this.sortBy(this.sortByAbbreviation, this.sortRow.abbr);
	       	this.sortBy(this.sortByTitle, this.sortRow.name);
	 	}
		
		this.sortBy = function(sortField, validationRow) {
			sortField.click();
	    	this.checkSorting(this.roleElements, validationRow, false);
	    	browser.sleep(1000);
	    	sortField.click();
	    	this.checkSorting(this.roleElements, validationRow, true);
	        browser.sleep(1000);
		};
		
		
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
		
		this.deleteRoleAndVerify  = function () {
			var $this = this;
			browser.get('http://localhost:9000/index.html#/admin');
			browser.wait(function(){	    		
	       		return browser.isElementPresent($this.addRolesButton);
		  	}).then(function(){
		   		var titleElement = browser.findElement(by.cssContainingText('td', $this.updated.title));
	   	   		var parentElement = titleElement.findElement(by.xpath('..'));
	   	   		var deleteElement = parentElement.findElement($this.deleteRoleButton);
	   	   		deleteElement.click().then( function() {
			    	browser.driver.sleep(3000);	
			   		expectByCssToBeAbsent($this.updated.title);
		   		});
	    	});
		} 
	}

	var TaskPage = function () {

		this.tasksButton = by.id('tasks');
		this.addTaskFormButton = by.css('[ng-click="toggleNewTask()"]');
		this.taskName = by.css('[ng-model="newTask.name"]');
		this.addTaskButton = by.css('[ng-click="addTask()"]');
		this.saveTaskButton = by.css('[ng-click="saveTask()"]');
		this.editTaskButton = by.css('[ng-click="triggerEditTask(task, $index)"]');
		this.deleteTaskButton = by.css('[ng-click="deleteTask(task.resource)"]');

		this.initial = {
	    	name : 'TestAdministrationTask'
	    };

		this.updated = {
			name : 'UpdatedTestAdministrationTask'
	    }

		this.checkTasksPage = function() {
			var $this = this;
	 		browser.get('http://localhost:9000/index.html#/admin');
			browser.wait(function(){	    		
		    	return browser.isElementPresent($this.tasksButton);
		    }).then(function(){
		    	browser.findElement($this.tasksButton).click().then(function () {
		    		browser.wait(function(){	    		
		    	    	return browser.isElementPresent($this.addTaskFormButton);
		    	    }).then(function(){
				    	expect($this.addTaskFormButton).toBeDefined();	    
		    	    });
		    	});
		    });
		}


		this.createNewTaskAndVerify = function() {
			var $this = this;
			browser.get('http://localhost:9000/index.html#/admin');
			browser.wait(function(){	    		
		    	return browser.isElementPresent($this.tasksButton);
		    }).then(function(){
		    	browser.findElement($this.tasksButton).click().then(function () {
		    		browser.wait(function(){	    		
		    	    	return browser.isElementPresent($this.addTaskFormButton);
		    	    }).then(function(){
		    	   		browser.findElement($this.addTaskFormButton).click().then(function () {
		    	   			browser.sleep(1000);
		    	   			$this.updateTask(browser, $this.initial);
		    	   	   		browser.findElement($this.addTaskButton).click().then(function () {
		    	   	   			$this.verifyTask($this.initial);
		    	   	   		});
		    	   		});
		    	    });
		    	});
		    });
		}
		
		this.editExistingTaskAndVerify = function() {
			var $this = this;
			browser.get('http://localhost:9000/index.html#/admin');
			browser.wait(function(){	    		
		    	return browser.isElementPresent($this.tasksButton);
		    }).then(function(){
		    	browser.findElement($this.tasksButton).click().then(function () {
		    		browser.wait(function(){	    		
		    	    	return browser.isElementPresent($this.addTaskFormButton);
		    	    }).then(function(){
		    			var titleElement = browser.findElement(by.cssContainingText('div .row-fluid', $this.initial.name));
		    		   	var editElement = titleElement.findElement($this.editTaskButton);
		    		   	editElement.click().then(function () {
		    		   		browser.wait(function(){	    		
		    		   			return browser.isElementPresent($this.saveTaskButton);
		    			   	}).then(function(){
		    	    			var formElement = titleElement.findElement(by.xpath('following-sibling::div'));
		    	    			$this.updateTask(formElement, $this.updated);
			    	   			formElement.findElement($this.saveTaskButton).click().then(function () {
			    	   				$this.verifyTask($this.updated);
			    	   	   		});
		    			   	});
		    		   	});
		    	    });
		    	});
		    });
		}

		this.deleteTaskAndVerify  = function () {
			var $this = this;
			browser.get('http://localhost:9000/index.html#/admin');
			browser.wait(function(){	    		
		    	return browser.isElementPresent($this.tasksButton);
		    }).then(function(){
		    	browser.findElement($this.tasksButton).click().then(function () {
		    		browser.wait(function(){	    		
		    	    	return browser.isElementPresent($this.addTaskFormButton);
		    	    }).then(function(){
		    			var titleElement = browser.findElement(by.cssContainingText('div .row-fluid', $this.initial.name));
		    		   	var deleteElement = titleElement.findElement($this.deleteTaskButton);
		    		   	deleteElement.click().then(function () {
		    	    		browser.driver.sleep(3000);	
		    	    		expectByCssToBeAbsent($this.updated.name);
		    		   	});
		    	    });
		    	});
		    });
		}
		
		this.updateTask = function (form, task) {
	   		updateElement(form, this.taskName, task.name);
		}

		this.verifyTask = function(task) {
			element.all(by.repeater('task in availableTasks')).filter(function(elem, index) {
				return elem.getText().then(function(text) {
				    return text === task.name;
				});
			}).then(function(filteredElements) {
				expect(filteredElements.length).toEqual(1);
			});
		}
		
	}
	

	
	var ConfigurationPage = function () {
		
		this.configurationButton = by.id('config');
		this.INTERESTED_PARTIES = 'reminder.interested.parties';
		this.interestedParties = 'test@test.com';
		this.editConfigurationButton = by.css('[ng-click="edit($index)"]');
		this.saveConfigurationButton = by.css('[ng-click="save($index)"]');
		this.property = by.css('[ng-model="property.value"]');
	    this.saveButton = by.css('[ng-click="save()"]');
	    this.editButton = by.css('[ng-click="edit()"]');

		this.checkConfigurationPage = function() {
			var $this = this;
	 		browser.get('http://localhost:9000/index.html#/admin');
			browser.wait(function(){	    		
		    	return browser.isElementPresent($this.configurationButton);
		    }).then(function(){
		    	browser.findElement($this.configurationButton).click().then(function () {
		    		var configurationTitle = by.cssContainingText('div', 'Configuration');
		    		browser.wait(function(){	    		
		    	    	return browser.isElementPresent(configurationTitle);
		    	    }).then(function(){
				    	expect(configurationTitle).toBeDefined();	    
		    	    });
		    	});
		    });
		}

		this.updateConfigurationAndVerify = function () {
			var $this = this;
	 		browser.get('http://localhost:9000/index.html#/admin');
			browser.wait(function(){	    		
		    	return browser.isElementPresent($this.configurationButton);
		    }).then(function(){
		    	browser.findElement($this.configurationButton).click().then(function () {
	    			var configElement = browser.findElement(by.cssContainingText('div .col-xs-3', $this.INTERESTED_PARTIES));
	    			var editElement = configElement.findElement(by.xpath('following-sibling::*[2]/self::div')).findElement($this.editConfigurationButton);
	    		   	editElement.click().then(function () {
	    		   		browser.wait(function(){	    		
	    		   			return browser.isElementPresent($this.saveButton);
	    			   	}).then(function(){
	    	    			var formElement = configElement.findElement(by.xpath('following-sibling::*[1]/self::div'));
	    			   		$this.updateConfiguration(formElement, $this.interestedParties);
	    			   		configElement.findElement(by.xpath('following-sibling::*[2]/self::div')).findElement($this.saveConfigurationButton).click().then(function () {
			    	   	   		$this.verifyConfiguration($this.interestedParties);
		    	   	   		});
	    			   	});
	    		   	});
		    	});
		    });
		}
		
		this.updateConfiguration = function(form, value) {
	   		updateElement(form, this.property, value);
		}

		this.verifyConfiguration = function(value) {
			var configElement = browser.findElement(by.cssContainingText('div .col-xs-3', this.INTERESTED_PARTIES));
			var formElement = configElement.findElement(by.xpath('following-sibling::div'));
			formElement.getText().then( function(txt) {
				expect(txt).toEqual(value);
			});
		}
				 
	}
	

});
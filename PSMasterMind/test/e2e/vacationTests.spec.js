describe('E2E: Vacation Tests', function() {	
    
	 var windowWidth = 1900;
	 var windowHeight = 1200;
	    
    var USER_NAME = 'psapps@pointsourcellc.com';
    var PASSWORD = 'ps@pp$777';
    var USER_FULLNAME = 'apps, ps';

	var sbutton = by.tagName('button');
	var logonEmail = by.id('Email');
	var logonPswd = by.id('Passwd');
	var signIn = by.id('signIn');
	var submit_approve_access = by.id('submit_approve_access');
	
	var profilePhoto = element(by.id('profile-photo'));
	var viewProfile = element(by.partialLinkText('VIEW PROFILE'));

	var addRequest = element.all(by.css('[ng-click="requestHours()"]')).get(0);
	var closeRequest = element.all(by.css('[ng-click="requestHours()"]')).get(1);
	var submitRequest = element(by.css('[ng-click="addVacation()"]'));
	var resubmitRequest = element(by.css('[ng-click="updateVacation(vacation)"]'));
	var editRequest = element.all(by.css('[ng-click="editVacation($index)"]')).get(0);
	var cancelRequest = element(by.css('[data-target="#vacCancelModal"]'));
	var cancellationOk = element(by.css('[ng-click="deleteVacation()"]'));
	var cancellationReason = element(by.model("cancellationReason"));
	var submitErrors = element.all(by.repeater("error in errors"));
	
	var requestType = element(by.id("vacationType"));
	var requestDescription = element(by.model("newDescription"));
	var requestList = element.all(by.repeater("vacation in displayedVacations"));
	var vacationDays = element(by.binding("{{getCurrentYearVacationDays()}}"));
	var vacationStartDate = element.all(by.model("vacationStartDate")).get(0);
	var vacationEndDate = element.all(by.model("vacationEndDate")).get(0);
	var vacationEditStartDate = element.all(by.model("vacationEditStartDate")).get(0);
	var vacationEditEndDate = element.all(by.model("vacationEditEndDate")).get(0);
	var vacationStartTime = element(by.model("vacationStartTime"));
	var vacationEndTime = element(by.model("vacationEndTime"));
	
	var notificationCtrl = element(by.id("notifications"));
	var notificationBtn = element(by.id("notifications")).all(by.tagName('i')).get(0);
	var requestApprove = element(by.css('[ng-click="oooDecide($index, true)"]'));
	var requestDeny = element(by.css('[ng-click="oooDecide($index, false)"]'));
	var notifications = element.all(by.repeater("notification in notifications"));
	var notificationType = element(by.css('[ng-if="notification.type == \'ooo-pending\' || notification.type == \'ooo-approved\' || notification.type == \'ooo-cancelled\' || notification.type == \'ooo-denied\'"]'));
	var notificationTypeCancel = element(by.className('notification-request-cancel'));
	var removeNotification = element(by.css('[ng-click="removeNotification($index)"]'));
			
	var REQUEST_TYPE = 2; //VACATION
	var VACATION_DESCRIPTION = "E2E Vacation Test";
	var REQUEST_APPROVED_MSG = "Out of office request approved";
	var REQUEST_DENIED_MSG = "Out of office request denied";
	var REQUEST_CANCELLED_MSG = "Out of office request cancelled";
	
	beforeEach(function() {
		browser.driver.manage().window().setSize(windowWidth, windowHeight);
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
	
	it('Add vacation.', function() {	
		console.log('> Running: Add vacation.');
		checkVacationList(addVacation);
	});
	
	it('Add multiple vacation.', function() {	
		console.log('> Running: Add multiple vacation.');
		checkVacationList(addVacation, 1, "Conflict with vacation");
	});
	
	it('Edit vacation.', function() {	
		console.log('> Running: Edit vacation.');
		checkVacationList(editVacation);
	});
	
	it('Remove Vacation', function() {	
		console.log('> Running: Remove Vacation.');
		checkVacationList(removeVacation);
	});
	
	it('Request a vacation for longer than the number of days available.', function() {	
		console.log('> Running: Request a vacation for longer than the number of days available.');
		checkVacationList(addVacation, 6).then(removeVacation);
	}, 60000);
	
	it('Request a vacation for an extended period of time', function() {	
		console.log('> Running: Request a vacation for an extended period of time');
		checkVacationList(addVacation, 50).then(removeVacation);
	}, 60000);

	it('Approve vacation request from notification control.', function() {	
		console.log('> Running: Approve vacation request from notification control.');
		checkVacationList(addVacation).then(approveVacation).then(removeVacation);
	}, 120000);
	
	it('Deny vacation request from notification control.', function() {	
		console.log('> Running: Deny vacation request from notification control.');
		checkVacationList(addVacation).then(denyVacation).then(removeVacation);
	}, 120000);
	
	it('Check approve rules.', function() {	
		console.log('> Running: Check approve rules.');
		checkVacationList(checkApproveRules).then(removeVacation);
	}, 60000);
	
	var goToProfileVacationWidget = function () {
		return browser.wait(function(){	    		
    		return browser.isElementPresent(profilePhoto);
    	}).then(function() {
    		profilePhoto.click().then(function () {
    			viewProfile.click().then(function () {
    				var scrollDownScript = 'window.scrollTo(0,' + windowHeight + ');';
    				return browser.executeScript(scrollDownScript);
    			});
    		});
    	});
	};

	var checkVacationList = function (callback, vacDays, errorMsg) {
    	return goToProfileVacationWidget().then(function() {
    			browser.wait(function(){	    		
    				return browser.isElementPresent(vacationDays);
    			}).then(function() {
    				vacationDays.getText().then(function( vacDaysBefore ) {
    					callback( vacDays ).then(function() { browser.sleep(3000).then(function() {
    						if (!errorMsg) {
    							browser.wait(function(){	    		
    								return browser.isElementPresent(vacationDays);
    							}).then(function() {
    								expect(vacationDays.getText()).not.toEqual(vacDaysBefore);
    							});
    						} else {
    							browser.wait(function(){	    		
    								return browser.isElementPresent(submitErrors.get(0));
    							}).then(function() {
    								expect(submitErrors.get(0).getText()).toContain(errorMsg);
    								closeRequest.click();
    							});
    						}	
    					}); });
    				});
    			});
    	});
	};
	
	var checkApproveRules = function () {
		return browser.wait(function(){	    		
			return browser.isElementPresent(element(by.css('[ng-click="requestHours()"]')));
    	}).then(function() {
    		addRequest.click().then(function () {
    			var startDate = new Date();
				var endDate = new Date();
    			var shortStartDate = getShortDate(new Date(startDate.setDate(startDate.getDate() - 3)));
    			var shortEndDate = getShortDate(new Date(endDate.setDate(endDate.getDate() - 1)));
    			selectRequestType(REQUEST_TYPE).then(function() {
    				requestDescription.clear().then( function () { 
            			requestDescription.sendKeys(VACATION_DESCRIPTION);
            			vacationStartDate.clear().then(function() { vacationStartDate.sendKeys(shortStartDate); }).then(function() {
        	    			vacationEndDate.clear().then(function() { vacationEndDate.sendKeys(shortEndDate); }).then(function() {    
        	    				console.log('> Submit request.');
        	    				submitRequest.click().then(function() {
        	    					browser.sleep(2000).then(function() { browser.wait(function(){	    		
                    					return browser.isElementPresent(element(by.repeater("vacation in displayedVacations")));
                    		    	}).then(function() {
                    		    		expect(requestList.get(0).getText()).toContain("APPROVED");
                    		    		checkNotification(REQUEST_APPROVED_MSG);
                    		    	}); });
                    			});
        	    			});
        	    		});  
            		});
    			});        		
    		});
    	});
	};
	
	var addVacation = function ( days ) {
		console.log('> Add vacation.');
		return browser.wait(function(){	    		
    		return browser.isElementPresent(element(by.css('[ng-click="requestHours()"]')));
    	}).then(function() {
    		addRequest.click().then(function () {
    			var period = days ? days : 1;
    			var startDate = new Date();
				var endDate = new Date();
				var shortStartDate = getShortDate(new Date(startDate.setDate(startDate.getDate() - period)));
				var shortEndDate = getShortDate(new Date(endDate.setDate(endDate.getDate() + period)));
    			selectRequestType(REQUEST_TYPE).then(function() {
    				requestDescription.clear().then( function () {
    					requestDescription.sendKeys(VACATION_DESCRIPTION).then(function() {			
            	    		vacationStartDate.clear().then(function() { vacationStartDate.sendKeys(shortStartDate); }).then(function() {
            	    			vacationEndDate.clear().then(function() { vacationEndDate.sendKeys(shortEndDate); }).then(function() {    
            	    				console.log('> Submit request.');
                					submitRequest.click();
            	    			});
            	    		});            	    		    	    		
    					});     					
    				});
    			});
    		});
    	});
	};
	
	var editVacation = function () {
		console.log('> Edit vacation.');
		return browser.wait(function(){	    		
			return browser.isElementPresent(element(by.css('[ng-click="editVacation($index)"]')));
    	}).then(function() {
    		editRequest.click().then(function () {
    			var startDate = new Date();
    			var endDate = new Date();
    			var shortStartDate = getShortDate(new Date(startDate.setDate(startDate.getDate() - 2)));
				var shortEndDate = getShortDate(new Date(endDate.setDate(endDate.getDate() + 2)));
    			browser.wait(function(){	    		
    	    		return browser.isElementPresent(resubmitRequest);
    	    	}).then(function() {
    	    		vacationEditStartDate.clear().then(function() { vacationEditStartDate.sendKeys(shortStartDate); }).then(function() {
    	    			vacationEditEndDate.clear().then(function() { vacationEditEndDate.sendKeys(shortEndDate); }).then(function() {    
    	    				console.log('> Resubmit request.');
    	    	    		resubmitRequest.click();
    	    			});
    	    		});
    	    	});
    		});
    	});
	};
	
	var removeVacation = function () {
		console.log('> Remove vacation.');
		return browser.wait(function(){	    		
			return browser.isElementPresent(element(by.css('[ng-click="editVacation($index)"]')));
    	}).then(function() {
    		editRequest.click().then(function () {
    			browser.wait(function(){	    		
    	    		return browser.isElementPresent(cancelRequest);
    	    	}).then(function() {
    	    		cancelRequest.click().then(function () {
    	    			browser.wait(function(){	    		
    	    	    		return browser.isElementPresent(cancellationReason);
    	    	    	}).then(function() {
    	    	    		cancellationReason.clear().then(function() { cancellationReason.sendKeys(VACATION_DESCRIPTION).then(function() {
    	    	    			cancellationOk.click().then(function() {
            	    				checkNotification(REQUEST_CANCELLED_MSG);
            	    			});
    	    	    		}); });
    	    	    	});
    	    		});
    	    	});	
    		});
    	});
	};
	
	var approveVacation = function () {
		console.log('> Deny vacation.');
		return browser.sleep(7000).then(function() {
			browser.refresh().then(function () {
				browser.wait(function(){	    		
					return browser.isElementPresent(notificationCtrl);
				}).then(function() {
					notificationBtn.click().then(function () {
						browser.wait(function(){	    		
							return browser.isElementPresent(requestDeny);
						}).then(function() {
							requestApprove.click().then(function () {
								checkNotification(REQUEST_APPROVED_MSG).then(function() {
									expect(vacationDays.getText()).not.toEqual('5 days');
								});
							});
						});	
					});
				});
			});
		});
	};
	
	var denyVacation = function () {
		console.log('> Deny vacation.');
		return browser.sleep(7000).then(function() { 
			browser.refresh().then(function () {
				browser.wait(function(){	    		
				return browser.isElementPresent(notificationCtrl);
				}).then(function() {
					notificationBtn.click().then(function () {
						browser.wait(function(){	    		
							return browser.isElementPresent(requestDeny);
						}).then(function() {
							requestDeny.click().then(function () {
								checkNotification(REQUEST_DENIED_MSG).then(function() {
									expect(vacationDays.getText()).toEqual('5 days');
								});
							});
						});	
					});
				});
			});
		});
	};
	
	var checkNotification = function ( notificationMsg ) {
		console.log('> Check notification msg.');
		return browser.sleep(7000).then(function() { 
			browser.refresh().then(function () {
				browser.wait(function(){	    		
					return browser.isElementPresent(notificationCtrl);
				}).then(function() {
					notificationBtn.click().then(function () {
						browser.wait(function(){	    		
							return browser.isElementPresent(notificationType);
						}).then(function() {
							notifications.get(0).getText().then(function( msg ) {
								expect(msg).toContain(notificationMsg);
								removeNotification.click();
							});
						});
					});
				});
			});
		});
	};
	
	var selectRequestType = function ( optionNum ) {
		return browser.wait(function(){	    		
			return browser.isElementPresent(requestType);
    	}).then(function() {
    		return browser.wait(function(){	    		
    			return browser.isElementPresent(requestType.element(by.tagName('button')));
        	}).then(function() {
        		requestType.element(by.tagName('button')).click().then(function () {
        			return browser.wait(function(){	    		
            			return browser.isElementPresent(requestType.element(by.tagName('li')));
                	}).then(function() {
                		requestType.all(by.tagName('li')).then(function (options) {
            				options[optionNum].click();
            			});
                	});
        		});
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
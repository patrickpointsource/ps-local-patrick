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

	var addRequest = element(by.css('[ng-click="requestHours()"]'));
	var addRequestBtn = element.all(by.css('[ng-click="requestHours()"]')).get(0);
	var closeRequestBtn = element.all(by.css('[ng-click="requestHours()"]')).get(1);
	var submitRequest = element(by.css('[ng-click="addVacation()"]'));
	var resubmitRequest = element(by.css('[ng-click="updateVacation(vacation)"]'));
	var editRequest = element(by.css('[ng-click="editVacation($index)"]'));
	var editRequestBtn = element.all(by.css('[ng-click="editVacation($index)"]')).get(0);
	var closeEditRequestBtn =  element.all(by.css('[ng-click="editVacation($index)"]')).get(1);
	var cancelRequest = element(by.css('[data-target="#vacCancelModal"]'));
	var cancellationOk = element(by.css('[ng-click="deleteVacation()"]'));
	var cancellationReason = element(by.model("cancellationReason"));
	var submitErrors = element.all(by.repeater("error in errors"));
	
	var requestType = element(by.id("vacationType"));
	var editManagerArea = element(by.id('editManager'));
	var editManagerBtn = element(by.css('[ng-click="editManagerEditCallback($index)"]'));
	var managerTitle = element(by.css('[ng-if="profile.manager && !editManagerEdit"]'));
	var requestDescription = element(by.model("newDescription"));
	var requestList = element(by.repeater("vacation in displayedVacations"));
	var requestListAll = element.all(by.repeater("vacation in displayedVacations"));
	var requestListIsEmpty = element(by.css('[ng-show="vacations.length == 0"]'));
	var vacationDays = element(by.binding("{{getCurrentYearVacationDays()}}"));
	var vacationStartDate = element.all(by.model("vacationStartDate")).get(0);
	var vacationEndDate = element.all(by.model("vacationEndDate")).get(0);
	var vacationEditStartDate = element.all(by.model("vacationEditStartDate")).get(0);
	var vacationEditEndDate = element.all(by.model("vacationEditEndDate")).get(0);
	var vacatilonStartTime = element(by.model("vacationStartTime"));
	var vacationEndTime = element(by.model("vacationEndTime"));
	
	var notificationCtrl = element(by.id("notifications"));
	var notificationBtn = element(by.id("notifications")).all(by.tagName('i')).get(0);
	var requestApprove = element(by.css('[ng-click="oooDecide($index, true)"]'));
	var requestDeny = element(by.css('[ng-click="oooDecide($index, false)"]'));
	var notifications = element(by.repeater("notification in notifications"));
	var notificationsAll = element.all(by.repeater("notification in notifications"));
	var notificationType = element(by.css('[ng-if="notification.type == \'ooo-pending\' || notification.type == \'ooo-approved\' || notification.type == \'ooo-cancelled\' || notification.type == \'ooo-denied\'"]'));
	var notificationTypeCancel = element(by.className('notification-request-cancel'));
	var removeNotificationBtn = element.all(by.css('[ng-click="removeNotification($index)"]'));
	
	var dashboardRequestCtrl = element(by.css('[ng-controller="VacationRequestsCtrl"]'));
	var dashboardRequests = element(by.repeater('request in requests'));
	var dashboardRequestExpand = element.all(by.css('[ng-show="expandedIndex != $index"]'));
	var dashboardRequestCollapse = element.all(by.css('[ng-show="expandedIndex == $index"]'));
	var dashboardRequestComment = element.all(by.model("request.comment"));
	var dashboardRequestApprove = element.all(by.css('[ng-click="decide($index, true)"]'));
	var dashboardRequestDeny = element.all(by.css('[ng-click="decide($index, false)"]'));
			
	var REQUEST_TYPE_VAC = 2; //VACATION
	var VACATION_DESCRIPTION = "E2E Vacation Test";
	var REQUEST_APPROVED = "APPROVED";
	var REQUEST_DENIED = "DENIED";
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
		checkVacationList(addVacation, "Conflict with vacation");
	});
	
	it('Edit vacation.', function() {	
		console.log('> Running: Edit vacation.');
		checkVacationList(editVacation);
	});
	
	it('Remove Vacation', function() {	
		console.log('> Running: Remove Vacation.');
		checkVacationList(removeVacation);
	});
	
	it('Cancel vacation creation', function() {	
		console.log('> Running: Cancel vacation creation.');
		checkCreationCancel();
	});
	
	it('Verify that you cannot select an end date earlier than the start date.', function() {	
		console.log('> Running: Verify that you cannot select an end date earlier than the start date.');
		addEndDateEarlierThanStartDate();
	});
	
	it('Request a vacation for longer than the number of days available.', function() {	
		console.log('> Running: Request a vacation for longer than the number of days available.');
		checkVacationList(function() { return addVacation(6); }).then(removeVacation);
	}, 60000);
	
	it('Request a vacation for an extended period of time', function() {	
		console.log('> Running: Request a vacation for an extended period of time');
		checkVacationList(function() { return addVacation(50); }).then(removeVacation);
	}, 60000);
	
	it('Change vacation manager.', function() {	
		console.log('> Running: Change vacation manager.');
		checkVacationList(addVacation).then(changeRequestManager).then(function() { removeVacation(true); });
	}, 120000);
	
	it('Check auto approve rules.', function() {	
		console.log('> Running: Check auto approve rules.');
		checkVacationList(checkApproveRules).then(removeVacation);
	}, 60000);

	it('Approve vacation request from notification control.', function() {	
		console.log('> Running: Approve vacation request from notification control.');
		checkVacationList(addVacation).then(approveVacationFromNotificationControl).then(removeVacation);
	}, 120000);
	
	it('Deny vacation request from notification control.', function() {	
		console.log('> Running: Deny vacation request from notification control.');
		checkVacationList(addVacation).then(denyVacationFromNotificationControl).then(removeVacation);
	}, 120000);

	it('Approve vacation request from dashboard widget.', function() {	
		console.log('> Running: Approve vacation request from dashboard widget.');
//		TODO: Will be used when the Approve/Deny notification issue will fixed.
//		checkVacationList(addVacation).then(approveVacationFromDashboardWidget).then(removeVacation);
		checkVacationList(addVacation).then(approveVacationFromDashboardWidget).then(function() { removeVacation(true); });
	}, 120000);
	
	it('Deny vacation request from dashboard widget.', function() {	
		console.log('> Running: Deny vacation request from dashboard widget.');
//		TODO: Will be used when the Approve/Deny notification issue will fixed.
//		checkVacationList(addVacation).then(denyVacationFromDashboardWidget).then(removeVacation);
		checkVacationList(addVacation).then(denyVacationFromDashboardWidget).then(function() { removeVacation(true); });
	}, 120000);
	

	var goToProfileVacationWidget = function () {
		console.log('> Go to the profile OOO widget.');
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
	
	var goToDashboardVacationWidget = function () {
		console.log('> Go to the dashboard OOO widget.');
		return browser.get(browser.baseUrl).then(function () {
					browser.wait(function(){	    		
						return browser.isElementPresent(dashboardRequestCtrl);
					}).then(function() {
						var scrollDownScript = 'window.scrollTo(0,' + windowHeight + ');';
	    				browser.executeScript(scrollDownScript).then(function() {
	    					browser.wait(function(){	    		
	    						return browser.isElementPresent(dashboardRequests);
	    					}).then(function() {
	    						return browser.wait(function(){	    		
	    							return browser.isElementPresent(element(by.css('[ng-show="expandedIndex != $index"]')));
	    						}).then(function() {
	    							getVisibleElement(dashboardRequestExpand).then(function(expander) {
	    								expander.click().then(function(){
	    	    							console.log('> Request was expanded.');
	    	    						});	
		    						});
	    						});	
	    					});
	    				});
					});
			});
	};

	var checkVacationList = function (callback, errorMsg) {
		console.log('> Check vacation list.');
    	return goToProfileVacationWidget().then(function() {
    			browser.wait(function(){	    		
    				return browser.isElementPresent(vacationDays);
    			}).then(function() {
    				vacationDays.getText().then(function( vacDaysBefore ) {
    					callback().then(function() { browser.sleep(3000).then(function() {
    						if (!errorMsg) {
    							browser.wait(function(){	    		
    								return browser.isElementPresent(vacationDays);
    							}).then(function() {
    								expect(vacationDays.getText()).not.toEqual(vacDaysBefore);
    							});
    						} else {
    							browser.wait(function(){	    		
    								return browser.isElementPresent(submitErrors.first());
    							}).then(function() {
    								expect(submitErrors.first().getText()).toContain(errorMsg);
    								closeRequestBtn.click();
    							});
    						}	
    					}); });
    				});
    			});
    	});
	};
	
	var checkApproveRules = function () {
		console.log('> Check auto approve rules.');
		return browser.wait(function(){	    		
			return browser.isElementPresent(addRequest);
    	}).then(function() {
    		addRequestBtn.click().then(function () {
    			var startDate = new Date();
				var endDate = new Date();
    			var shortStartDate = getShortDate(new Date(startDate.setDate(startDate.getDate() - 3)));
    			var shortEndDate = getShortDate(new Date(endDate.setDate(endDate.getDate() - 1)));
    			selectDropDownElement(requestType, REQUEST_TYPE_VAC).then(function() {
    				requestDescription.clear().then( function () { 
            			requestDescription.sendKeys(VACATION_DESCRIPTION);
            			vacationStartDate.clear().then(function() { vacationStartDate.sendKeys(shortStartDate); }).then(function() {
        	    			vacationEndDate.clear().then(function() { vacationEndDate.sendKeys(shortEndDate); }).then(function() {    
        	    				submitRequest.click().then(function() {
            	    				console.log('> Submit request.');
        	    					checkNotification(REQUEST_APPROVED_MSG).then(function() {
        	    						checkRequestState(REQUEST_APPROVED);
        	    					});
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
    		return browser.isElementPresent(addRequest);
    	}).then(function() {
    		addRequestBtn.click().then(function () {
    			var period = days ? days : 1;
    			var startDate = new Date();
				var endDate = new Date();
				var shortStartDate = getShortDate(new Date(startDate.setDate(startDate.getDate() - period)));
				var shortEndDate = getShortDate(new Date(endDate.setDate(endDate.getDate() + period)));
    			selectDropDownElement(requestType, REQUEST_TYPE_VAC).then(function() {
    				requestDescription.clear().then( function () {
    					requestDescription.sendKeys(VACATION_DESCRIPTION).then(function() {
            	    		vacationStartDate.clear().then(function() { vacationStartDate.sendKeys(shortStartDate); }).then(function() {
            	    			vacationEndDate.clear().then(function() { vacationEndDate.sendKeys(shortEndDate); }).then(function() {    
                					submitRequest.click();
            	    				console.log('> Submit request.');
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
			return browser.isElementPresent(editRequest);
    	}).then(function() {
    		editRequestBtn.click().then(function () {
    			var startDate = new Date();
    			var endDate = new Date();
    			var shortStartDate = getShortDate(new Date(startDate.setDate(startDate.getDate() - 2)));
				var shortEndDate = getShortDate(new Date(endDate.setDate(endDate.getDate() + 2)));
    			browser.wait(function(){	    		
    	    		return browser.isElementPresent(resubmitRequest);
    	    	}).then(function() {
    	    		vacationEditStartDate.clear().then(function() { vacationEditStartDate.sendKeys(shortStartDate); }).then(function() {
    	    			vacationEditEndDate.clear().then(function() { vacationEditEndDate.sendKeys(shortEndDate); }).then(function() {    
    	    	    		resubmitRequest.click();
    	    				console.log('> Resubmit request.');
    	    			});
    	    		});
    	    	});
    		});
    	});
	};
	
	var removeVacation = function ( ignoreNotificationCheck ) {
		console.log('> Remove vacation.');
		return browser.wait(function(){	    		
			return browser.isElementPresent(editRequest);
    	}).then(function() {
    		editRequestBtn.click().then(function () {
    			browser.wait(function(){	    		
    	    		return browser.isElementPresent(cancelRequest);
    	    	}).then(function() {
    	    		cancelRequest.click().then(function () {
    	    			browser.wait(function(){	    		
    	    	    		return browser.isElementPresent(cancellationReason);
    	    	    	}).then(function() {
    	    	    		cancellationReason.clear().then(function() { cancellationReason.sendKeys(VACATION_DESCRIPTION).then(function() {
    	    	    			cancellationOk.click().then(function() {
                    		    	if (!ignoreNotificationCheck)
                    		    		checkNotification(REQUEST_CANCELLED_MSG);
    	    	    			});
    	    	    		}); });
    	    	    	});
    	    		});
    	    	});	
    		});
    	});
	};
	
	var approveVacationFromNotificationControl = function () {
		console.log('> Approve vacation from the notification control.');
		return browser.sleep(8000).then(function() {
			browser.refresh().then(function () {
				browser.wait(function(){	    		
					return browser.isElementPresent(notificationCtrl);
				}).then(function() {
					notificationBtn.click().then(function () {
						browser.wait(function(){	    		
							return browser.isElementPresent(requestApprove);
						}).then(function() {
							requestApprove.click().then(function () {
								checkNotification(REQUEST_APPROVED_MSG).then(function(){
									checkRequestState(REQUEST_APPROVED).then(function() {
										expect(vacationDays.getText()).not.toEqual('5 days');
									});
								});
							});
						});	
					});
				});
			});
		});
	};
	
	var denyVacationFromNotificationControl = function () {
		console.log('> Deny vacation from the notification control.');
		return browser.sleep(8000).then(function() { 
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
									checkRequestState(REQUEST_DENIED).then(function() {
										expect(vacationDays.getText()).toEqual('5 days');
									});
								});
							});
						});	
					});
				});
			});
		});
	};
	
	var approveVacationFromDashboardWidget = function () {
		console.log('> Approve vacation from the dashboard widget.');
		return browser.sleep(8000).then(function() { 
			goToDashboardVacationWidget().then(function () {
				getVisibleElement(dashboardRequestComment).then(function(requestComment){
					requestComment.clear().then(function() { 
						requestComment.sendKeys(VACATION_DESCRIPTION).then(function() {
							getVisibleElement(dashboardRequestApprove).then(function(requestApprove){
								requestApprove.click().then(function () {
//									TODO: Will be used when the Approve/Deny notification issue will fixed.
//									checkRequestState(REQUEST_APPROVED).then(function(){
//										checkNotification(REQUEST_APPROVED_MSG);
//									});
									checkRequestState(REQUEST_APPROVED);
								});
							}); 
						});
					});
				});
			});
		});
	};
	
	var denyVacationFromDashboardWidget = function () {
		console.log('> Deny vacation from the dashboard widget.');
		return browser.sleep(8000).then(function() { 
			goToDashboardVacationWidget().then(function () {
				getVisibleElement(dashboardRequestComment).then(function(requestComment){
					requestComment.clear().then(function() { 
						requestComment.sendKeys(VACATION_DESCRIPTION).then(function() {
							getVisibleElement(dashboardRequestDeny).then(function(requestDeny){
								requestDeny.click().then(function () {
//									TODO: Will be used when the Approve/Deny notification issue will fixed.
//									checkRequestState(REQUEST_DENIED).then(function() {
//										checkNotification(REQUEST_DENIED_MSG);
//									});
									checkRequestState(REQUEST_DENIED);
								});
							}); 
						});
					});
				});
			});
		});
	};

	var checkRequestState = function( state, requestIndex ) {
		console.log('> Check request state: ' + state);
		var index = requestIndex ? requestIndex : 0;
		return browser.sleep(3000).then(function() {
				goToProfileVacationWidget().then(function() {
					browser.wait(function(){
						return browser.isElementPresent(requestList);
					}).then(function() {
						browser.wait(function(){
							return browser.isElementPresent(requestListAll.get(index));
						}).then(function() {
							expect(requestListAll.get(index).getText()).toContain(state);
						});
					});
				});
			});	
	};
	
	var checkNotification = function ( notificationMsg ) {
		console.log('> Check notification msg: ' + notificationMsg);
		return browser.sleep(8000).then(function() { 
			browser.refresh().then(function () {
				browser.wait(function(){	    		
					return browser.isElementPresent(notificationCtrl);
				}).then(function() {
					notificationBtn.click().then(function () {
						browser.wait(function(){	    		
							return browser.isElementPresent(notifications);
						}).then(function() {
							notificationsAll.first().getText().then(function( msg ) {
								expect(msg).toContain(notificationMsg);
								removeNotificationBtn.first().click();
								console.log('> Notification was removed.');
							});
						});
					});
				});
			});
		});
	};
	
	var checkCreationCancel = function () {
		console.log('> Cancel creation.');
		return goToProfileVacationWidget().then(function() {
			return browser.wait(function(){	    		
	    		return browser.isElementPresent(addRequest);
	    	}).then(function() {
	    		vacationDays.getText().then(function( vacDaysBefore ) {
	    			addRequestBtn.click().then(function () {
		    			selectDropDownElement(requestType, REQUEST_TYPE_VAC).then(function() {
		    				requestDescription.clear().then( function () {
		    					requestDescription.sendKeys(VACATION_DESCRIPTION).then(function() {
            	    				console.log('> Cancel request.');
            	    				closeRequestBtn.click().then(function() {
            	    					expect(vacationDays.getText()).toEqual(vacDaysBefore);
            	    				});		
		    					});
		    				});
		    			});
		    		});
	    		});
	    	});
		});
	};
	
	var changeRequestManager = function () {
		console.log('> Change vacation manager.');
		return browser.wait(function(){	    		
			return browser.isElementPresent(editRequest);
    	}).then(function() {
    		editRequestBtn.click().then(function () {
    			browser.wait(function(){	    		
    	    		return browser.isElementPresent(resubmitRequest);
    	    	}).then(function() {
    	    		managerTitle.getText().then(function( origManager ){
    	    			editManagerBtn.click().then(function() {
        	    			selectDropDownElement(editManagerArea).then(function(){
        	    				console.log('> Resubmit request.');
        	    	    		resubmitRequest.click().then(function() {
        	    	    			console.log('> Check that manager was changed.');
        	    	    			browser.sleep(2000).then(function() {
        	    	    				editRequestBtn.click().then(function () {
        	    	    					expect(managerTitle.getText()).not.toEqual(origManager);
        	    	    					closeEditRequestBtn.click();
        	    	    				});
        	    	    			});
        	    	    		});
        	    			});
        	    		});
    	    		});
    	    	});
    		});
    	});
	};
	
	var addEndDateEarlierThanStartDate = function() {
		console.log('> Add end date earlier that start date.');
		return goToProfileVacationWidget().then(function() {
			return browser.wait(function(){	    		
	    		return browser.isElementPresent(addRequest);
	    	}).then(function() {
	    		addRequest.click().then(function () {
	    			var startDate = new Date();
	    			var shortStartDate = getShortDate(startDate);
					var shortEndDate = getShortDate(new Date(startDate.setDate(startDate.getDate() - 3)));
	    	    	selectDropDownElement(requestType, REQUEST_TYPE_VAC).then(function() {
	    	    		vacationStartDate.clear().then(function() { vacationStartDate.sendKeys(shortStartDate); }).then(function() {
        	    			vacationEndDate.clear().then(function() { vacationEndDate.sendKeys(shortEndDate); }).then(function() {    
        	    				vacationEndDate.getAttribute('data-date-start-date').then(function(attr) { 
	    	    					expect(attr).toEqual(shortStartDate);
	    	    					closeRequestBtn.click();
	    	    				});
        	    			});
        	    		}); 
	    	    	});
	    		});
	    	});
		});
	};
	
	var selectDropDownElement = function ( ddArea, optionNum ) {
		console.log('> Select drop down element.');
		return browser.wait(function(){	    		
			return browser.isElementPresent( ddArea );
    	}).then(function() {
    		return browser.wait(function(){	    		
    			return browser.isElementPresent(ddArea.element(by.tagName('button')));
        	}).then(function() {
        		ddArea.element(by.tagName('button')).click().then(function () {
        			return browser.wait(function(){	    		
            			return browser.isElementPresent(ddArea.element(by.tagName('li')));
                	}).then(function() {
                		ddArea.all(by.tagName('li')).then(function (options) {
                			var index = optionNum ? optionNum : 1;
            				options[index].click();
            			});
                	});
        		});
        	});    		
    	});
	};
	
	var getVisibleElement  = function( elements ) {
		return elements.filter(function (element) {
				return element.isDisplayed().then(function(isVisible) {
					return isVisible;
				});
			}).then(function(res){
				return res[0];
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
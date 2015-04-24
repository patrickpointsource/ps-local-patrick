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
	
	var profilePhoto = by.id('profile-photo');
	var viewProfile = by.partialLinkText('VIEW PROFILE');

	var addRequest = element(by.css('[ng-click="requestHours()"]'));
	var addRequestBtn = element.all(by.css('[ng-click="requestHours()"]')).get(0);
	var closeRequestBtn = element.all(by.css('[ng-click="requestHours()"]')).get(1);
	var submitRequest = element(by.css('[ng-click="addVacation()"]'));
	var resubmitRequest = element(by.css('[ng-click="updateVacation(vacation)"]'));
	var editRequest = element(by.css('[ng-click="editVacation($index)"]'));
	var editRequestBtn = element.all(by.css('[ng-click="editVacation($index)"]')).get(0);
	var closeEditRequestBtn =  element.all(by.css('[ng-click="editVacation($index)"]')).get(1);
	var cancelRequest = element(by.css('[data-target="#vacCancelModal"]'));
	var cancellationYes = element(by.css('[ng-click="deleteVacation()"]'));
	var cancellationNo = element(by.css('[ng-click="clearCancelModal()"]'));
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
	var vacationStartTime = element(by.model("vacationStartTime"));
	var vacationEndTime = element(by.model("vacationEndTime"));
	
	var notificationCtrl = element(by.repeater("notification in notifications"));
	var notificationBtn = element(by.id("notifications")).all(by.tagName('i')).get(0);
	var notificationCounter = element(by.binding('{{notifications.length}}'));
	var notificationIsEmpty = element(by.css('[ng-if="notifications.length == 0"]'));
	var requestApprove = element(by.css('[ng-click="oooDecide($index, true)"]'));
	var requestDeny = element(by.css('[ng-click="oooDecide($index, false)"]'));
	var notifications = element(by.repeater("notification in notifications"));
	var notificationsAll = element.all(by.repeater("notification in notifications"));
	var removeNotification = element(by.css('[ng-click="removeNotification($index)"]'));
	var removeNotificationBtn = element.all(by.css('[ng-click="removeNotification($index)"]')).get(0);
	
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
	var REQUEST_PENDING = "PENDING";
	var REQUEST_APPROVED_MSG = "Out of office request approved";
	var REQUEST_DENIED_MSG = "Out of office request denied";
	var REQUEST_CANCELLED_MSG = "Out of office request cancelled";

	
	beforeEach(function() {
		browser.driver.manage().window().setSize(windowWidth, windowHeight).then(function(){
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
	
	it('Verify that you cannot select an end date earlier than the start date.', function() {	
		console.log('> Running: Verify that you cannot select an end date earlier than the start date.');
		addEndDateEarlierThanStartDate();
	});
	
	it('Request a vacation for longer than the number of days available.', function() {	
		console.log('> Running: Request a vacation for longer than the number of days available.');
		checkVacationList(function() { return addVacation(6); }).then(removeVacation);
	}, 120000);
	
	it('Request a vacation for an extended period of time', function() {	
		console.log('> Running: Request a vacation for an extended period of time');
		checkVacationList(function() { return addVacation(50); }).then(removeVacation);
	}, 120000);
	
	it('Change vacation manager.', function() {	
		console.log('> Running: Change vacation manager.');
		checkVacationList(addVacation).then(changeRequestManager).then(function() { removeVacation(true); });
	}, 120000);
	
	it('Approve vacation request from notification control. Verify the appropriate message is displayed (vacation was approved).', function() {	
		console.log('> Running: Approve vacation request from notification control. Verify the appropriate message is displayed (vacation was approved).');
		checkVacationList(addVacation).then(approveVacationFromNotificationControl).then(removeVacation);
	}, 120000);
	
	it('Deny vacation request from notification control. Verify the appropriate message is displayed (vacation was denied).', function() {	
		console.log('> Running: Deny vacation request from notification control. Verify the appropriate message is displayed (vacation was denied).');
		checkVacationList(addVacation).then(denyVacationFromNotificationControl).then(removeVacation);
	}, 120000);

	it('Approve vacation request from dashboard widget.', function() {	
		console.log('> Running: Approve vacation request from dashboard widget.');
		checkVacationList(addVacation).then(approveVacationFromDashboardWidget).then(removeVacation);
	}, 120000);
	
	it('Deny vacation request from dashboard widget.', function() {	
		console.log('> Running: Deny vacation request from dashboard widget.');
		checkVacationList(addVacation).then(denyVacationFromDashboardWidget).then(removeVacation);
	}, 120000);
	
	it('Cancel vacation creation', function() {	
		console.log('> Running: Cancel vacation creation.');
		checkCreationCancel();
	});
	
	it('Cancel vacation removing', function() {	
		console.log('> Running: Cancel vacation removing.');
		checkVacationList(addVacation).then(checkRemovingCancel).then(removeVacation);
	}, 120000);
	
	it('Add an Appointment request with more than 4 hours duration, verify that it does not automatically approve.', function() {	
		console.log('> Running: Add an Appointment request with more than 4 hours duration, verify that it does not automatically approve.');
		checkVacationList(function() { return checkAutoApproveRules(0, 3, REQUEST_PENDING); }).then(removeVacation);
	}, 120000);
	
	it('Check auto approve rules.', function() {	
		console.log('> Running: Check auto approve rules.');
//		//TODO: Uncomment when the bug (should not have apportunity to remove passed vac) will be fixed.
//		checkVacationList(function() { return checkAutoApproveRules(-3, null, REQUEST_APPROVED); });
		checkVacationList(function() { return checkAutoApproveRules(-3, null, REQUEST_APPROVED); }).then(function() { removeVacation(true); });
	}, 120000);
	
	it('Check that notifications list was cleared.', function() {	
		console.log('> Running: Check that notifications list was cleared.');
		checkNotificationIsEmpty();
	});
	
//	//TODO: Uncomment when the bug (should not have apportunity to remove passed vac) will be fixed.
//	it('Edit\Cancel a vacation entry that has passed - should not be able to.', function() {	
//		console.log('> Running: Edit\Cancel a vacation entry that has passed - should not be able to.');
//		editCancelPassedVacation();
//	}, 120000);
	
	var goToProfilePage = function () {
		console.log('> Go to the profile page.');
		return browser.driver.wait(function(){	    		
	    		return browser.driver.isElementPresent(profilePhoto);
	    	}).then(function() {
	    		browser.driver.findElement(profilePhoto).click().then(function(){
	    			browser.driver.wait(function(){	    		
	    	    		return browser.driver.isElementPresent(viewProfile);
	    	    	}).then(function() {
	    	    		browser.driver.findElement(viewProfile).click().then(function() {
	    	    			return browser.driver.sleep(3000);
	    	    		});
	    			});
	    		});
	    	});
	};
	        			
	var goToProfileVacationWidget = function () {
		console.log('> Go to the profile OOO widget.');
		return goToProfilePage().then(function(){
			var scrollDownScript = 'window.scrollTo(0,' + windowHeight + ');';
			return browser.executeScript(scrollDownScript);
		});
	};
	
	var goToDashboardVacationWidget = function () {
		console.log('> Go to the dashboard OOO widget.');
		return browser.sleep(7000).then(function(){
			browser.get(browser.baseUrl).then(function () { browser.sleep(3000).then(function () {
				browser.driver.wait(function(){	    		
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
			}); });
		});
	};

	var checkVacationList = function (callback, errorMsg) {
		console.log('> Check vacation list.');
    	return goToProfileVacationWidget().then(function() {
    			browser.wait(function(){	    		
    				return browser.isElementPresent(vacationDays);
    			}).then(function() {
    				vacationDays.getText().then(function( vacDaysBefore ) {
    					callback().then(function() { browser.sleep(2000).then(function() {
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
	
	var fillVacation = function( shortStartDate, shortEndDate, startHours, endHours  ) {
		console.log('> Submit vacation.');
		return selectDropDownElement(requestType, REQUEST_TYPE_VAC).then(function() {
			sendKeys(requestDescription, VACATION_DESCRIPTION).then( function () {
    	    	sendKeys(vacationStartDate, shortStartDate).then(function(){
    	    		sendKeys(vacationEndDate, shortEndDate).then(function(){
    	    			if (startHours && endHours) {
    	        			vacationStartTime.sendKeys(startHours).then(function(){
    	        				vacationEndTime.sendKeys(endHours).then(function(){
    	        					return true;
	        					});
    	        			});
    	    			} else {
    	    				return true;
    	    			}
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
				fillVacation(shortStartDate, shortEndDate).then(function(){
					return submitRequest.click().then(function(){
	    				console.log('> Vacation was submitted.');
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
    	    		sendKeys(vacationEditStartDate, shortStartDate).then(function(){
        	    		sendKeys(vacationEditEndDate, shortEndDate).then(function(){
        	    			return resubmitRequest.click().then(function(){
    	    					console.log('> Resubmit request.');
    	    				});
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
    	    	    		console.log('> Check that cancellation reason is empty by default.');
    	    	    		expect(cancellationReason.getText()).toBe('');
    	    	    		sendKeys(cancellationReason, VACATION_DESCRIPTION).then(function(){
    	    	    			console.log('> Confirm deletion.');
       	    	    			cancellationYes.click().then(function() {
       	    	    				if (!ignoreNotificationCheck)
       	    	    					return checkNotification(REQUEST_CANCELLED_MSG).then(function(){
       	    	    						browser.sleep(1000);
       	    	    					});
       	    	    				else
       	    	    					return browser.sleep(1000);
    	    	    			});
    	    	    		});
    	    	    	});
    	    		});
    	    	});	
    		});
    	});
	};
	
	var checkAutoApproveRules = function ( days, hours, requiredState ) {
		console.log('> Check auto approve rules.');
		return browser.wait(function(){	    		
			return browser.isElementPresent(addRequest);
    	}).then(function() {
    		addRequestBtn.click().then(function () {
    			var startDate = new Date();
    			var endDate = new Date();
    			var startTime = startDate.getHours();
    			var endTime = hours ? startTime + hours : null;
        		var shortStartDate = getShortDate(new Date(startDate.setDate(startDate.getDate() + days)));
        		var shortEndDate = getShortDate(new Date(endDate.setDate(endDate.getDate() - 1)));
        		fillVacation(shortStartDate, shortEndDate, startTime, endTime).then(function(){
        			console.log('> Submit request.');
        			submitRequest.click().then(function(){
        				return checkRequestState(requiredState).then(function() {

        					 if (requiredState == REQUEST_APPROVED) {
                 		    	checkNotification(REQUEST_APPROVED_MSG);
        					 }
        				});
    	    		});
        		});	
    		});
    	});
	};
	
	var editCancelPassedVacation = function () {
		console.log('> Edit\Cancel passed vacation.');
		return browser.wait(function(){	    		
			return browser.isElementPresent(editRequest);
    	}).then(function() {
    		editRequestBtn.click().then(function () {
    			expect(resubmitRequest.isDispalyed()).toBeFalsy();
    			expect(cancelRequest.isDispalyed()).toBeFalsy();
    		});
    	});
	};
	
	var approveVacationFromNotificationControl = function () {
		console.log('> Approve vacation from the notification control.');
		return waitAndRefresh(7000).then(function () {
				browser.driver.wait(function(){	    		
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
	};
	
	var denyVacationFromNotificationControl = function () {
		console.log('> Deny vacation from the notification control.');
		return waitAndRefresh(7000).then(function () {
				browser.driver.wait(function(){	    		
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
	};
	
	var approveVacationFromDashboardWidget = function () {
		console.log('> Approve vacation from the dashboard widget.');
		return goToDashboardVacationWidget().then(function () {
				getVisibleElement(dashboardRequestComment).then(function(requestComment){
					sendKeys(requestComment, VACATION_DESCRIPTION).then(function(){
						getVisibleElement(dashboardRequestApprove).then(function(requestApprove){
							requestApprove.click().then(function () {
								checkRequestState(REQUEST_APPROVED).then(function(){
									checkNotification(REQUEST_APPROVED_MSG);
								});
							});
						}); 
					});
				});
			});
	};
	
	var denyVacationFromDashboardWidget = function () {
		console.log('> Deny vacation from the dashboard widget.');
		return goToDashboardVacationWidget().then(function () {
				getVisibleElement(dashboardRequestComment).then(function(requestComment){
					sendKeys(requestComment, VACATION_DESCRIPTION).then(function(){
						getVisibleElement(dashboardRequestDeny).then(function(requestDeny){
							requestDeny.click().then(function () {
								checkRequestState(REQUEST_DENIED).then(function() {
									checkNotification(REQUEST_DENIED_MSG);
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
		return waitAndRefresh(7000).then(function () {
				browser.driver.wait(function(){	    		
					return browser.isElementPresent(notificationCtrl);
				}).then(function() {
					console.log('> Click on notifications');
					notificationBtn.click().then(function () {
						browser.wait(function(){	    		
							return browser.isElementPresent(notifications);
						}).then(function() {
							console.log('> Get first notification');
							notificationsAll.first().getText().then(function( msg ) {
								expect(msg).toContain(notificationMsg);
								browser.driver.wait(function(){	    		
									return browser.isElementPresent(removeNotification);
								}).then(function() {
									return removeNotificationBtn.click().then(function(){
										browser.sleep(2000).then(function(){
											expect(browser.isElementPresent(notificationCounter)).toBeFalsy();
											console.log('> Notification was removed.');
										});	
									});
								});
							});
						});
					});
				});
			});
	};
	
	var checkNotificationIsEmpty = function ( notificationMsg ) {
		console.log('> Check notifications');
		return waitAndRefresh(1000).then(function () {
				browser.driver.wait(function(){	    		
					return browser.isElementPresent(notificationBtn);
				}).then(function() {
					console.log('> Click on notifications');
					notificationBtn.click().then(function () {
						browser.sleep(1000).then(function () {
							expect(browser.isElementPresent(notificationIsEmpty)).toBeTruthy();					
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
		    				sendKeys(requestDescription, VACATION_DESCRIPTION).then(function(){
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
	};
	
	var checkRemovingCancel = function () {
		console.log('> Cancel removing.');
		return goToProfileVacationWidget().then(function() {
			return browser.wait(function(){	    		
	    		return browser.isElementPresent(addRequest);
	    	}).then(function() {
	    		editRequestBtn.click().then(function () {
	    			browser.wait(function(){	    		
	    	    		return browser.isElementPresent(cancelRequest);
	    	    	}).then(function() {
	    	    		cancelRequest.click().then(function () {
	    	    			browser.wait(function(){	    		
	    	    	    		return browser.isElementPresent(cancellationReason);
	    	    	    	}).then(function() {
	    	    	    		console.log('> Click outside of pop box - box should persist - not disappear.');
	    	    	    		browser.actions().mouseMove({x: 50, y: 50}).doubleClick().perform().then(function(){
	    	    	    			expect(cancellationReason.isDisplayed()).toBeTruthy();
		    	    	    		sendKeys(cancellationReason, VACATION_DESCRIPTION).then(function(){
		    	    	    			console.log('> Click NO on cancellation popup.');
		    	    	    			cancellationNo.click().then(function() {
		    	    	    				browser.sleep(1000).then(function(){
			    	    	    				expect(resubmitRequest.isDisplayed()).toBeTruthy();
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
		});
	};
	
	var changeRequestManager = function () {
		console.log('> Change vacation manager.');
		return browser.wait(function(){	    		
			return browser.isElementPresent(editRequest);
    	}).then(function() {
    		editRequestBtn.click().then(function () {
    			browser.wait(function(){	    		
    	    		return browser.isElementPresent(managerTitle);
    	    	}).then(function() {
    	    		managerTitle.getText().then(function( origManager ){
    	    			editManagerBtn.click().then(function() {
        	    			selectDropDownElement(editManagerArea).then(function(){
        	    				console.log('> Resubmit request.');
        	    	    		resubmitRequest.click().then(function() {
        	    	    			console.log('> Check that manager was changed.');
        	    	    			browser.sleep(2000).then(function(){
        	    	    				browser.wait(function(){
        	    	    					return browser.isElementPresent(editRequestBtn);
            	    	    	    	}).then(function() {
            	    	    				editRequestBtn.click().then(function () {
            	    	    					browser.wait(function(){	    		
            	    	    	    	    		return browser.isElementPresent(managerTitle);
            	    	    	    	    	}).then(function() {
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
					fillVacation(shortStartDate, shortEndDate).then(function(){
						vacationEndDate.getAttribute('data-date-start-date').then(function(attr) { 
	    					expect(attr).toEqual(shortStartDate);
	    					closeRequestBtn.click();
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
	
	var sendKeys = function (element, text){
		return element.clear().then(function() { 
			return element.sendKeys(text); 
		});
	};
	
	var waitAndRefresh = function (time){
		return browser.sleep(time).then(function() { 
			browser.refresh().then(function () {
				browser.driver.sleep(4000).then(function(){
					return goToProfilePage();
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
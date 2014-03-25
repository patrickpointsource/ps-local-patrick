'use strict';

/**
 * Controller for modifying an existing project.
 */
angular.module('Mastermind')
  .controller('ProjectCtrl', ['$q','$rootScope', '$scope', '$state', '$stateParams', '$location', '$filter', 'ProjectsService', 'Resources', 'People', 'Groups', 'RoleTypes', 'Rates', 'ngTableParams', 'editMode',
  function ($q, $rootScope, $scope, $state, $stateParams, $location, $filter, ProjectsService, Resources, People, Groups, RoleTypes, Rates, TableParams, editMode) {
    var detailsValid = false, rolesValid = false;

    //Set our currently viewed project to the one resolved by the service.
    if($stateParams.projectId){
      $scope.projectId = $stateParams.projectId;
    }
    $scope.projectLoaded = false;
    $scope.projectEstimate = 0;
    $scope.shiftDatesChecked = false;

    /**
     * Set the profile view in edit mode
     */
    $scope.edit = function(){
    	if($scope.canEdit()) {
    		$state.go('projects.edit', {projectId:$scope.projectId});
    	}
    };
    
    $scope.canEdit = function() {
    	return $scope.adminAccess || ($scope.project.created.resource == $scope.me.about);
    };
    
  //Load the members of the executive Group
    var execQuery = {groups:'Executives'};
    var salesQuery = {groups:'Sales'};
    var fields = {name:1,resource:1};

    Resources.query('people', execQuery, fields, function(result){
      $scope.execs = result;
    });
    Resources.query('people', salesQuery, fields, function(result){
      $scope.sales = result;
    });

    
    $scope.close = function(){
    	$scope.stopWatchingProjectChanges();
    	$rootScope.formDirty = false;
    	$scope.editMode = false;
        $scope.submitAttempted = false;
    	
    	//Throw it away if it is a new project
	      if($scope.isTransient){
	        $state.go('projects.index');
	      }
	      //Fetch the old version of the project and show the read only mode
	      else{
	        Resources.get('projects/' + $scope.projectId).then(function(){
	        	$scope.projectEstimate = 0;
	          $state.go('projects.show', {projectId:$scope.projectId, edit:null});
	        });
	      }
    };
    
    /**
     * Set the profile view in edit mode
     */
    $scope.cancel = function(){
      //If the model is dirty ask if they would like to save the changes
      if($rootScope.formDirty){
    	  
    	  $rootScope.modalDialog = {
		  		title: "Changes are not saved",
		  		text: "You have made changes to this project did you want to save your changes?",
		  		ok: "Yes",
		  		no: "No",
		  		cancel: "Cancel",
		  		okHandler: function() {
		  			$(".modalYesNoCancel").modal('hide');
		  			
		  			$scope.save().then(function(project) {//Unset dirty flag
			  			$scope.close();
			  		});
		  		},
		  		noHandler: function() {
		  			$(".modalYesNoCancel").modal('hide');
		  			$scope.close();
		  		},
		  		cancelHandler: function() { 
		  			$(".modalYesNoCancel").modal('hide');
		  		}
		  };
		  		
		  $(".modalYesNoCancel").modal('show');
      }
      else{
    	  $scope.close();
      }
    };

    /**
     * Get the date short format
     */
    var getShortDate = function(date){
      	 //Get todays date formatted as yyyy-MM-dd
         var dd = date.getDate();
          var mm = date.getMonth()+1; //January is 0!
          var yyyy = date.getFullYear();
          if (dd<10){
            dd='0'+dd;
          }
          if (mm<10){
            mm='0'+mm;
          }
          date = yyyy+'-'+mm+'-'+dd;
          return date;
      }
    
    
    /**
     * On project save ask if the user would like to shift the start and and dates for the
     * roles in the project
     */
    $scope.handleProjectStartDateShifts = function(callback){
    	//Check if the start date has been updated.
        var project = $scope.project;
        
        if(project.initStartDate && project.startDate && project.startDate != project.initStartDate){
        	
        	$rootScope.modalDialog = {
    		  		title: "The start date on your project has changed",
    		  		text: "Would you like to shift the role start dates based on this change?",
    		  		ok: "Yes",
    		  		no: "No",
    		  		cancel: "",
    		  		okHandler: function() {
    		  			var delta = new Date(project.startDate) - new Date(project.initStartDate);
    		      		var roles = project.roles;
    		      		for(var i = 0; i < roles.length; i++) {
    		      			var role = roles[i];
    		      			//Shift the start date
    		      			if(role.startDate){
    		      				//If the role date == the original start date keep them the same
    		      				if(role.startDate == project.initStartDate){
    		      					role.startDate = project.startDate;
    		      				}
    		      				else {
    			      				var tmpDate = new Date(role.startDate);
    			      				tmpDate = new Date(tmpDate.getTime() + delta);
    			      				role.startDate = getShortDate(tmpDate);
    		      				}
    		      			}
    		      			//Shift the end date
    		      			if(role.endDate){
    		      				var tmpDate = new Date(role.endDate);
    		      				tmpDate = new Date(tmpDate.getTime() + delta);
    		      				role.endDate = getShortDate(tmpDate);
    		      			}
    		      		}
    		      		
    		      		callback();
    		      		$(".modalYesNo").modal('hide');
    		  		},
    		  		noHandler: function() {
    		  			$(".modalYesNo").modal('hide');
    		  		}
    		  };
        	
        	//hiding previous modal
        	$(".modalYesNoCancel").modal('hide');
    		$(".modalYesNo").modal('show');
        }
        else {
        	callback();
        }
    }
    
    /**
     * Hide the messages dialog
     */
    $scope.hideMessages = function(){
    	$scope.messages = null;
    	 $('#messages').hide();
    };
    
    /**
     * Show a page level info message
     */
    $scope.showInfo = function(messages){
    	 $('#messages').removeClass('alert-danger');
    	 $('#messages').addClass('alert-info');
    	 $scope.messages = messages;
    	 $('#messages').show();
    }
    
    /**
     * Show a page level error message
     */
    $scope.showErrors = function(messages){
    	 $('#messages').removeClass('alert-info');
    	 $('#messages').addClass('alert-danger');
    	 $scope.messages = messages;
    	 $('#messages').show();
    }

    /**
     * Method which provides apropriate css for the assignments panels
     */
    $scope.getCoverageClass = function(role) {
    	var result = '';
    	
    	if (role.percentageCovered == 0)
    		result = 'panel-danger';
    	else if (role.percentageCovered < 100)
    		result = 'panel-warning';
    	else
    		result = 'panel-success';
    	
    	return result;
    }
    
    $scope.getCoverageValue = function(role) {
    	var result = '';
    	var HOURS_PER_WEEK = 40;
    	var HOURS_PER_MONTH = 180;
    	var isMonthly = role.rate.type == "hourly";
    	var getHours = function(h) {
    		if (isMonthly)
    			return Math.round(HOURS_PER_MONTH * h / HOURS_PER_WEEK);
    		
    		return h;
    			
    	}
    	
    	if (role.percentageCovered < 100)
    		result = '-' + getHours(role.hoursNeededToCover);
    	
    	if (role.hoursExtraCovered > 0) {
    		result = result ? ('/' + result): '';
    		result = '+' + getHours(role.hoursExtraCovered);
    	}
    	
    	if (result)
    		result += isMonthly ? ' h/m': ' h/w'
    	
    	return result;
    }
    

	$scope.getRoleCSSClass= function(abr, role) {
		var result = 'panel ';
		
		
		result += $scope.getCoverageClass(role);
		
		return result;
	}
	
    /**
     * Save the loaded project.
     */
    $scope.save = function () {
      var deferred = $q.defer();	
    	
      var savingCallback = function() {
          // set the project creator and created time
          //TODO - Do we need this refresh why would it be out of date with the area controller?
      	
          Resources.refresh('people/me').then(function(me){
            if ($scope.project.created === undefined) {
            
            //TODO Created and Modified should be set on the server side not here.	
            $scope.project.created = {
                date: new Date().toString(),
                resource: me.about
              };
            }

            $scope.project.modified = {
              date: new Date().toString(),
              resource: me.about
            };

            ProjectsService.save($scope.project).then(function (updatedProject) {
            	//On Create the project ID will be null.  Pull it from the about.
            	if(!$scope.projectId){
    	        	var projectURI = updatedProject.about;
    	        	var oid = projectURI.substring(projectURI.lastIndexOf('/')+1);
    	        	//Set our currently viewed project to the one resolved by the service.
    	            $scope.projectId = oid;
            	}
              
                $scope.showInfo(['Project successfully saved']);
                
            	ProjectsService.getForEdit($scope.projectId).then(function(project){
                    $scope.project = project;
                    $scope.handleProjectSelected();
                    $rootScope.formDirty = false;
                    
                    deferred.resolve($scope.project);
                 });
            }, 
            function (response) {
              if(response.data.reasons){
            	  $scope.showErrors(response.data.reasons);
              }
              else if(response.status && response.data && response.data.message){
            	  var error = response.status + ": " + response.data.message;
            	  $scope.showErrors([error]);
              }
              else if(response.status && response.data){
            	  var error = response.status + ": " + JSON.stringify(response.data);
            	  $scope.showErrors([error]);
              }
              
              //Decode the description
              $scope.project.description = decodeURIComponent($scope.project.description);
              
              deferred.reject($scope.project);
    	      
            });
            
          });
       };
      
      $scope.submitAttempted = true;
      
      $scope.handleProjectStartDateShifts(savingCallback);
      
      return deferred.promise;
    };
    
    /**
     * Delete the loaded project
     */
    $scope.deleteProject = function () {
      Resources.remove($scope.project.about).then(function(){
        $state.go('projects.index');
      });
    };

    /**
     * Expected margin on a project
     */
    $scope.projectMargin = function(){
      var servicesEst = $scope.servicesEstimate;
      var softwareEst = $scope.project.terms.softwareEstimate;

      //Cannot be null
      servicesEst = servicesEst?servicesEst:0;
      softwareEst = softwareEst?softwareEst:0;

      var revenue = servicesEst;
      var cost = $scope.servicesLoadedTotal;

      var margin = null;

      if(cost){
        margin = revenue/cost*100;
      }

      return margin;
    };

    /**
     * Display the expected hours a role should work
     */
    $scope.displayRate = function(role){
      var ret = null;
      if(role){
        if(role.rate.type === Rates.MONTHLY){
          ret = '$' + role.rate.amount + '/m';
        }
        else{
          ret = '$' + role.rate.amount + '/hr';
        }
      }
      return ret;
    };

    /**
     * Display the expected hours a role should work
     */
    $scope.displayHours = function(role){
      var ret = '';
      if(role.rate.fullyUtilized){
        if(role.rate.type === Rates.WEEKLY){
          ret = '100% Weekly';
        }
        else if(role.rate.type === Rates.HOURLY){
          ret = '100% Hourly';
        }
        else if(role.rate.type === Rates.MONTHLY){
          ret = '100% Monthly';
        }
      }
      else if(role.rate.type === Rates.WEEKLY){
        ret = role.rate.hoursPerWeek + ' per week';
      }
      else if(role.rate.type === Rates.HOURLY){
        ret = role.rate.hoursPerMth + ' per month';
      }
      return ret;
    };

    /**
     * Calculate total services cost in plan
     */
    $scope.servicesTotal = function(){
      var roles = $scope.project.roles;

      var runningTotal = 0;
      for(var i = 0; roles && i < roles.length; i++){
        var role = roles[i];
        var rate = role.rate;
        if(rate && rate.amount){
          var amount = rate.amount;
          if(amount){
            var type = rate.type;
            var startDate = new Date(role.startDate);
            var endDate = new Date(role.endDate);
            var numMonths;
            var roleTotal;

            if(startDate && endDate){
              //Hourly Charge rate
              if(type && type === 'monthly'){
                numMonths = $scope.monthDif(startDate, endDate);
                roleTotal = numMonths * amount;
                runningTotal += roleTotal;
              }
              //Weekly Charge rate
              else if(type && type === 'weekly'){
                var numWeeks = $scope.weeksDif(startDate, endDate);
                var hoursPerWeek = rate.fullyUtilized?50:rate.hoursPerWeek;
                roleTotal = numWeeks * hoursPerWeek * amount;
                runningTotal += roleTotal;
              }
              //Hourly Charge rate
              else if(type && type === 'hourly'){
                numMonths = $scope.monthDif(startDate, endDate);
                var hoursPerMonth = rate.fullyUtilized?220:rate.hoursPerMth;
                roleTotal = numMonths * hoursPerMonth * amount;
                runningTotal += roleTotal;
              }
            }
          }
        }
      }

      return runningTotal;
    };


    /**
     * Number of months between 2 dates
     */
    $scope.monthDif = function(d1, d2) {
//      var months;
//      months = (d2.getFullYear() - d1.getFullYear()) * 12;
//      months -= d1.getMonth() + 1;
//      months += d2.getMonth() + 1;
//      return months <= 0 ? 0 : months;
      
      return Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24 * 30));
    };

    /**
     * Number of weeks between 2 dates
     */
    $scope.weeksDif = function(d1, d2) {
//      // The number of milliseconds in one week
//      var ONE_WEEK = 1000 * 60 * 60 * 24 * 7;
//      // Convert both dates to milliseconds
//      var date1Ms = d1.getTime();
//      var date2Ms = d2.getTime();
//      // Calculate the difference in milliseconds
//      var differenceMs = Math.abs(date1Ms - date2Ms);
//      // Convert back to weeks and return hole weeks
//      return Math.floor(differenceMs / ONE_WEEK);
      
      return Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24 * 4.5));
    };

    /**
     * Whenever the roles:add event is fired from a child controller,
     * handle it by adding the supplied role to our project.
     */
    $scope.$on('roles:add', function (event, role) {
      $scope.project.addRole(role);
      $scope.summaryRolesTableParams.total($scope.project.roles.length);
      $scope.summaryRolesTableParams.reload();
      $scope.sowRolesTableParams.total($scope.project.roles.length);
      $scope.sowRolesTableParams.reload();

    });

    /**
     * Whenever the roles:change event is fired from a child controller,
     * handle it by updating the supplied role in our project.
     */
    $scope.$on('roles:change', function (event, index, role) {
      $scope.project.changeRole(index, role);
      $scope.summaryRolesTableParams.total($scope.project.roles.length);
      $scope.summaryRolesTableParams.reload();
      $scope.sowRolesTableParams.total($scope.project.roles.length);
      $scope.sowRolesTableParams.reload();

    });

    /**
     * Whenever the roles:remove event is fired from a child controller,
     * handle it by removing the supplied role from our project.
     */
    $scope.$on('roles:remove', function (event, role) {
      $scope.project.removeRole(role);
      $scope.summaryRolesTableParams.total($scope.project.roles.length);
      $scope.summaryRolesTableParams.reload();
      $scope.sowRolesTableParams.total($scope.project.roles.length);
      $scope.sowRolesTableParams.reload();

    });

    /**
     * Whenever the details form's state changes, update the watchers in this view.
     */
    $scope.$on('detailsForm:valid:change', function (event, validity) {
      detailsValid = validity;
    });

    /**
     * Whenever the roles form's state changes, update the watchers in this view.
     */
    $scope.$on('roles:valid:change', function (event, validity) {
      rolesValid = validity;
    });
    
    /**
     * Whenever the roles:assignments:change event is fired from a child controller,
     * handle it by updating the supplied role's assignments in our project.
     */
    $scope.$on('roles:assignments:change', function (event, index, role) {
      //$scope.project.changeRole(index, role);
      $scope.summaryRolesTableParams.total($scope.project.roles.length);
      $scope.summaryRolesTableParams.reload();
    });
    
    /**
     * Must have the details filled out before the user can view the roles tab.
     *
     * @returns {boolean}
     */
    $scope.isRolesTabDisabled = function () {
      return !detailsValid;
    };

    /**
     * Must have the details filled out and at least one role assigned before the user
     * can view the assignments tab.
     *
     * @returns {boolean}
     */
    $scope.isAssignmentsTabDisabled = function () {
      return !detailsValid || !rolesValid;
    };

    /**
     * Must have the details filled out and at least one role assigned before the user
     * can view the summary tab.
     *
     * @returns {boolean}
     */
    $scope.isSummaryTabDisabled = function () {
      return !detailsValid || !rolesValid;
    };

    $scope.activeTab = {
    	"assignments": $state.params.tabId == "assignments",
    	"summary": $state.params.tabId == "summary",
    	"hours": $state.params.tabId == "hours",
    	"links": $state.params.tabId == "links"
    }
    
    $scope.getDefaultAssignmentsFilter = function() {
		var result = "current";
		var now = new Date();
		  
		var todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		  
    	if (new Date($scope.project.startDate) >= todayDate && (!$scope.project.endDate || new Date($scope.project.endDate) > todayDate))
	  		  result = "future";
	  	  else  if (new Date($scope.project.startDate) < todayDate && ($scope.project.endDate && new Date($scope.project.endDate) < todayDate))
	  		  result = "past";
    	
    	return result;
    }
    
    $scope.tabSelected = function(selectedTabId) {
		if ($scope.projectTabId != selectedTabId) {

			if (!$scope.projectTabId) {
				var updatedUrl = $state.href('projects.show.tabId', { 
					tabId: selectedTabId,
					filter: selectedTabId != 'assignments' ? null: $scope.getDefaultAssignmentsFilter()
				}).replace('#', '');
	        
	        
	        	$location.url(updatedUrl).replace();
			} else
				$state.go('projects.show.tabId', {
						tabId: selectedTabId,
						filter: selectedTabId != 'assignments' ? null: $scope.getDefaultAssignmentsFilter()
				});
			
			$scope.projectTabId = selectedTabId;
		}
    }
    
    $scope.editAssignments = function(){
    	$state.go('projects.show.tabId.edit', {
				tabId: 'assignments',
				filter: 'all'
		});
    }
    
    /**
     * Get All the Role Types
     */
    Resources.get('roles').then(function(result){
      var resources = [];
      var roleGroups = {};
      //Save the list of role types in the scope
      $scope.roleTypes = result.members;
      //Get list of roles to query members
      for(var i = 0; i < result.members.length;i++){
        var role = result.members[i];
        var resource = role.resource;
        roleGroups[resource] = role;
        resources.push(resource);
        //create a members array for each roles group
        
        role.assiganble = [];
      }
      
      $scope.roleGroups = roleGroups;

      //Query all people with a primary role
      var roleQuery = {'primaryRole.resource':{$exists:1}};
      var fields = {resource:1,name:1,familyName:1,givenName:1,primaryRole:1,thumbnail:1};
      var sort = {'primaryRole.resource':1,'familyName':1,'givenName':1};
      Resources.query('people',roleQuery, fields, function(peopleResults){
        var people = peopleResults.members;
        //Set up lists of people in roles
        for(var i = 0; i < people.length; i++){
          var person = people[i];
          var personsRole = roleGroups[person.primaryRole.resource];
          person.title = personsRole.abbreviation + ': ' + person.familyName + ', ' + person.givenName;

          for(var j = 0; j < result.members.length;j++){
            var roleJ = result.members[j];

            //Primary role match place it at the front of the array in sort order
            if(roleJ.resource === person.primaryRole.resource){
              //assignable list was empty add it to the front
              if(roleGroups[roleJ.resource].assiganble.length === 0){
                roleGroups[roleJ.resource].assiganble[0] = person;
              }
              //First match just add it to the font
              else if(roleGroups[roleJ.resource].assiganble[0].primaryRole.resource !== roleJ.resource){
                roleGroups[roleJ.resource].assiganble.unshift(person);
              }
              //Add it after the last match
              else{
                var index = 0;
                while(roleGroups[roleJ.resource].assiganble.length>index&&roleGroups[roleJ.resource].assiganble[index].primaryRole.resource === roleJ.resource){
                  index++;
                }
                roleGroups[roleJ.resource].assiganble.splice(index,0,person);
              }
            }
            //Not the primary role leave it in sort order
            else{
              roleGroups[roleJ.resource].assiganble.push(person);
            }
          }
        }
        	
        //Set a map of role types to members
        $scope.roleGroups = roleGroups;
      },sort);
    });

    /**
    * Add a new Hours Record to the server
    */
    $scope.addHours = function(){
      //Set the project context
      $scope.newHoursRecord.project = {resource:$scope.project.about};
      //Set the person context
      $scope.newHoursRecord.person = {resource:$scope.me.about};

      Resources.create('hours', $scope.newHoursRecord).then(function(){
        $scope.initHours();
        $scope.newHoursRecord = {};
      });
    };

    /**
     * Delete a role
     */
    $scope.deleteHours = function (hoursURL) {
      Resources.remove(hoursURL).then(function(){
        $scope.initHours();
      });
    };
    
    /**
     * Format Money
     * 
     */
    $scope.formatMoney = function(num, c, d, t){
    	var n = num, 
	    c = isNaN(c = Math.abs(c)) ? 2 : c, 
	    d = d == undefined ? "." : d, 
	    t = t == undefined ? "," : t, 
	    s = n < 0 ? "-" : "", 
	    i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", 
	    j = (j = i.length) > 3 ? j % 3 : 0;
	   return '$' + s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
    };

    $scope.initHours = function(){
      //Query all hours against the project
      var hoursQuery = {'project.resource':$scope.project.about};
      //All Fields
      var fields = {};
      var sort = {'created':1};
      Resources.query('hours',hoursQuery, fields, function(hoursResult){
        $scope.hours = hoursResult.members;

        if($scope.hoursTableParams){
          $scope.hoursTableParams.total($scope.hours.length);
          $scope.hoursTableParams.reload();

        }
        else{
          // Table Parameters
          var params = {
            page: 1,            // show first page
            count: 25,           // count per page
            sorting: {
              created: 'des'     // initial sorting
            }
          };


          $scope.hoursTableParams = new TableParams(params, {
            total: $scope.hours.length, // length of data
            getData: function ($defer, params) {
              var data = $scope.hours;
              var projectRoles = $scope.project.roles;

              var start = (params.page() - 1) * params.count();
              var end = params.page() * params.count();

              // use build-in angular filter
              var orderedData = params.sorting() ?
                $filter('orderBy')(data, params.orderBy()) :
                data;

              $scope.hoursTableData = orderedData.slice(start, end);
              var ret = $scope.hoursTableData;

              //Resolve all the people
              var defers = [];


              for (var i = 0; i < ret.length; i++){
                var ithHoursRecord = ret[i];
                defers.push(Resources.resolve(ithHoursRecord.person));

                //See if the user had a role in the project at the time of the record
                for (var j = 0; j < projectRoles.length;j++){
                  var role = projectRoles[j];
                  //Found a role for this person
                  if (role.assignee && ithHoursRecord.person.resource === role.assignee.resource){
                    var roleStartDate = new Date(role.startDate);
                    var hoursDate = new Date(ithHoursRecord.date);
                    //record was after role start date
                    if (hoursDate >= roleStartDate){
                      var roleEndDate = role.endDate?new Date(role.endDate):null;
                      //Record was before the end of role date
                      if (!roleEndDate || roleEndDate >= hoursDate){
                        ithHoursRecord.role=Resources.deepCopy(role);
                        defers.push(Resources.resolve(ithHoursRecord.role.type));
                      }
                    }
                  }
                }

              }

              $.when.apply(window, defers).done(function(){
                $defer.resolve(ret);
              });
            }
          });
        }

      }, sort);
    };


    $scope.handleProjectSelected = function(){
      var project = $scope.project;
      $scope.isTransient = ProjectsService.isTransient(project);
      /**
       * Controls the edit state of the project form (an edit URL param can control this from a URL ref)
       */
      if($scope.canEdit()) {
    	  $scope.editMode = editMode;
      } else {
    	  $scope.editMode = false;
    	  $state.go('projects.show', {projectId:$scope.projectId, edit:null});
      }
      
      $scope.projectLoaded = true;
      $scope.submitAttempted = false;
      
      

      // The title of the page is the project's name or 'New Project' if transient.
      $scope.title = $scope.isTransient ? 'New Project' : project.name;

      // Table Parameters
      var params = {
        page: 1,            // show first page
        count: 10,           // count per page
        sorting: {
          type: 'asc'     // initial sorting
        }
      };

      $scope.summaryRolesTableParams = new TableParams(params, {
        total: $scope.project.roles.length,
        getData: function ($defer, params) {
          var start = (params.page() - 1) * params.count();
          var end = params.page() * params.count();

          var orderedData = params.sorting() ?
              $filter('orderBy')($scope.project.roles, params.orderBy()) :
              $scope.project.roles;

          //use build-in angular filter
          var result = orderedData.slice(start, end);

          var defers = [];
          var ret = [];
          for(var i = 0; i < result.length; i++){
            var ithRole = Resources.deepCopy(result[i]);
            if(ithRole.assignee && ithRole.assignee.resource){
              defers.push(Resources.resolve(ithRole.assignee));
              //ithRole.assignee.name = "Test Name " + i + ": " + ithRole.assignee.resource;
            }

            if(ithRole.type && ithRole.type.resource){
              defers.push(Resources.resolve(ithRole.type));
              //ithRole.assignee.name = "Test Name " + i + ": " + ithRole.assignee.resource;
            }

            ret[i] = ithRole;
          }

          $.when.apply(window, defers).done(function(){
            $defer.resolve(ret);
          });
        }
      });

      $scope.sowRolesTableParams = new TableParams(params, {
          total: $scope.project.roles.length,
          getData: function ($defer, params) {
            var start = (params.page() - 1) * params.count();
            var end = params.page() * params.count();
            $scope.servicesEstimate = 0;

            var orderedData = params.sorting() ?
                $filter('orderBy')($scope.project.roles, params.orderBy()) :
                $scope.project.roles;

            //use build-in angular filter
            var result = orderedData.slice(start, end);

            var defers = [];
            var ret = [];
            for(var i = 0; i < result.length; i++){
              var ithRole = Resources.deepCopy(result[i]);
              var roleEstimate = 0;
              if(ithRole.startDate && ithRole.endDate) {
            	  roleEstimate = ithRole.rate.getEstimatedTotal(ithRole.startDate, ithRole.endDate);
              }
              else if(ithRole.startDate) {
            	  /*
            	   * Use the project endDate if the role doesn't have an endDate.
            	   */
            	  roleEstimate = ithRole.rate.getEstimatedTotal($scope.project.endDate);
              }
              $scope.servicesEstimate += roleEstimate;
              if(ithRole.assignee && ithRole.assignee.resource){
                defers.push(Resources.resolve(ithRole.assignee));
                //ithRole.assignee.name = "Test Name " + i + ": " + ithRole.assignee.resource;
              }

              if(ithRole.type && ithRole.type.resource){
                defers.push(Resources.resolve(ithRole.type));
                //ithRole.assignee.name = "Test Name " + i + ": " + ithRole.assignee.resource;
              }

              ret[i] = ithRole;
            }

            $.when.apply(window, defers).done(function(){
              $defer.resolve(ret);
            });
          }
        });
      
      if (!editMode){
        $scope.initHours();
      }

      /**
       * Calculate total loaded cost in plan
       */

      var roles = $scope.project.roles;
      var runningTotal = 0;
      for(var i = 0; roles && i < roles.length; i++){
        var role = roles[i];
        var roleType = $scope.roleGroups[role.type.resource];
        var rate = role.rate;
        var numMonths;
        var roleTotal;
        if (roleType === null){
          console.warn('Roles has and unknown type: ' + JSON.stringify(role));
        }
        else {
          var type = rate.type;
          var startDate = new Date(role.startDate);
          var endDate = new Date(role.endDate);
          var amount;

          if (startDate && endDate){
            //Hourly Charge rate
            if (type && type === 'monthly'){
              amount = role.rate.loadedAmount;
              if (amount === null){
                console.warn('Role Type has no monthly loaded rate: ' + roleType.title);
              }
              else {
                numMonths = $scope.monthDif(startDate, endDate);
                roleTotal = numMonths * amount;
                runningTotal += roleTotal;
              }
            }
            //Weekly Charge rate
            else if (type && type === 'weekly'){
              amount = role.rate.loadedAmount;
              if (amount === null){
                console.warn('Role Type has no hourly loaded rate: ' + roleType.title);
              }
              else {
                var numWeeks = $scope.weeksDif(startDate, endDate);
                var hoursPerWeek = rate.fullyUtilized?50:rate.hoursPerWeek;
                roleTotal = numWeeks * hoursPerWeek * amount;
                runningTotal += roleTotal;
              }
            }
            //Hourly Charge rate
            else if (type && type === 'hourly'){
              amount = role.rate.loadedAmount;
              if (amount === null){
                console.warn('Role Type has no hourly loaded rate: ' + roleType.title);
              }
              else {
                numMonths = $scope.monthDif(startDate, endDate);
                var hoursPerMonth = rate.fullyUtilized?220:rate.hoursPerMth;
                roleTotal = numMonths * hoursPerMonth * amount;
                runningTotal += roleTotal;
              }
            }
          }
        }
        $scope.servicesLoadedTotal = runningTotal;
      }
      
      
      //Watch for model changes
      if(editMode){
    	  $scope.stopWatchingProjectChanges();
    	  
    	  //Create a new watch
    	  $scope.sentinel = $scope.$watch('project', function(newValue, oldValue){
	    	  //console.debug(JSON.stringify(oldValue) + ' changed to ' + JSON.stringify(newValue));
	    	  if(!$rootScope.formDirty && $scope.editMode){
	    		  //Do not include anthing in the $meta property in the comparison
	    		  if(oldValue.hasOwnProperty('$meta')){
	    			  var oldClone = Resources.deepCopy(oldValue);
	    			  delete oldClone['$meta'];
	    			  oldValue = oldClone;
	    		  }
	    		  if(newValue.hasOwnProperty('$meta')){
	    			  var newClone = Resources.deepCopy(newValue);
	    			  delete newClone['$meta'];
	    			  newValue = newClone;
	    		  }
	    		  
	    		  //Text Angular seems to add non white space characters for some reason
	    		  if(newValue.description){
	    			  newValue.description = newValue.description.trim();
	    		  }
	    		  if(oldValue.description){
	    			  oldValue.description = oldValue.description.trim();
	    		  }
	    		  
	    		  
	    		  var oldStr = JSON.stringify(oldValue);
	    		  var newStr = JSON.stringify(newValue);
	    		  
	    		  if(oldStr != newStr){
	    			  console.debug('project is now dirty');
	    			  $rootScope.formDirty = true;
	    		  }
	    	  }
	    	 
	      },true);
      }
    };
    
    $scope.stopWatchingProjectChanges = function(){
    	var sentinel = $scope.sentinel;
	  	if(sentinel){
	  		sentinel();  //kill sentinel
	  	}
    };



    $scope.newHoursRecord = {};

    /**
     * Get Existing Project
     */
    if ($scope.projectId){
      ProjectsService.getForEdit($scope.projectId).then(function(project){
        $scope.project = project;
        $scope.handleProjectSelected();
      });
    }
    /**
     * Default create a new project
     */
    else {
      $scope.project = ProjectsService.create();
      $scope.handleProjectSelected();
    }

    $scope.canDeleteProject = false;

    $scope.projectTabId = $state.params.tabId;
    
    if($state.params && $state.params.tabId && !$scope.activeTab[$state.params.tabId]) {
        for (var tab in $scope.activeTab)
        	$scope.activeTab[tab] = false;
        
        $scope.activeTab[$state.params.tabId] = true;
    }

    //TODO - Do we need this refresh why would it be out of date with the area controller?
    Resources.refresh('people/me').then(function(me){
      $scope.me = me;

      if ($scope.me.groups &&
        (($scope.me.groups.indexOf('Management') !== -1) ||
        ($scope.me.groups.indexOf('Executives') !== -1) ||
        ($scope.project.creator && $scope.project.creator.resource === $scope.me.about))) {

        $scope.canDeleteProject = true;
      }

      if (!$scope.projectId) {
        $scope.canDeleteProject = false;
      }
    });

  }])
  .directive('exportHours', ['$parse', function ($parse) {
    return {
      restrict: 'A',
      scope: false,
      link: function(scope, element, attrs) {
        var data = '';
        var csv = {
          stringify: function(str) {
            return '"' +
              str.replace(/^\s\s*/, '').replace(/\s*\s$/, '') // trim spaces
                  .replace(/"/g,'""') + // replace quotes with double quotes
              '"';
          },
          rawJSON: function(){
            return scope.hoursTableData;
          },
          rawCSV: function(){
            return data;
          },
          generate: function() {
            var project = scope.project;
            var hours = scope.hoursTableData;

            for(var i = 0; i < hours.length; i++){
              data = csv.JSON2CSV(project, hours);
            }
          },
          link: function() {
            return 'data:text/csv;charset=UTF-8,' + encodeURIComponent(data);
          },
          JSON2CSV: function(project, hours) {
            var str = '';
            var line = '';

            console.log('hours:' + hours);

            //Print the header
            var head = ['Project', 'Peson', 'Role', 'Rate', 'Date', 'Hours', 'Description'];
            for (var i = 0; i < head.length; i++) {
              line += head[i] + ',';
            }
            //Remove last comma and add a new line
            line = line.slice(0, -1);
            str += line + '\r\n';

            //Print the values
            for (var x = 0; x < hours.length; x++) {
              line = '';

              var record = hours[x];

              //Project
              line += csv.stringify(project.name) + ',';
              line += csv.stringify(record.person.name) + ',';
              if(record.role && record.role.type && record.role.type.title){
                line += csv.stringify(record.role.type.title);
              }
              line += ',';
              if(record.role){
                line += scope.displayRate(record.role);
              }
              line += ',';
              line += record.date + ',';
              line += record.hours + ',';

              line += csv.stringify(record.description) + ',';



              str += line + '\r\n';
            }
            return str;
          }
        };
        $parse(attrs.exportHours).assign(scope.$parent, csv);
      }
    };
  }]);

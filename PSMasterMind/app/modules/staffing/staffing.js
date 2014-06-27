'use strict';

/*
 * Controller for navigating through areas of Mastermind like its dashboard,
 * projects, people, staffing and roles.
 */
var mmModule = angular.module('Mastermind').controller('StaffingCtrl', ['$scope', '$state','$filter', '$q', 'Resources','RolesService','ProjectsService','AssignmentService','ngTableParams',
  function ($scope, $state, $filter, $q, Resources, RolesService, ProjectsService, AssignmentService, TableParams) {
    // Table Parameters
    var params = {
      page: 1,            // show first page
      count: 100,           // count per page
      sorting: {
        title: 'asc'     // initial sorting
      }
    };
    
    $scope.summarySwitcher = 'projects';
    $scope.startDate = new Date();
    $scope.activeAndBacklogProjects = [];
    
    // TODO: change to css class
    $scope.getProjectItemCss = function(isProjectItem) {
    	var ret = "";
    	if(isProjectItem) {
    		ret = "background-color: antiquewhite;";
    	}
    	
    	return ret;
    };
    
    $scope.filterStaffing = function (filter)
    {
		return function (item)
	  		{
				return filter
					?
						item.clientName && item.clientName.toLowerCase().indexOf(filter.toLowerCase()) != -1 ||
						item.projectName && item.projectName.toLowerCase().indexOf(filter.toLowerCase()) != -1 ||
						item.role && item.role.toLowerCase().indexOf(filter.toLowerCase()) != -1
					:
						item;
			};
    };
    
    var today = new Date();
	var dd = today.getDate();
    var mm = today.getMonth(); 
    var yyyy = today.getFullYear();
   
    today =  new Date(yyyy, mm, dd);
    
    /*
     * Helps to filter past entries - roles and assignees
     **/
    $scope.filterPastEntries = function(entry) {  
	  	  if (new Date( entry.startDate) < today && (entry.endDate && new Date( entry.endDate) < today) )
	      		 return false;
	  	  
	  	  return true
    }
    /*
     * Fetch a list of all the active Projects.
     * 
     */
    var activeStaffing = {};
    var activeProjects = [];
    var activeProjectsWithUnassignedPeople = [];
    var unassignedIndex = 0;
    $scope.activeProjectsWithUnassignedPeople = [];
    
    ProjectsService.getActiveAndBacklogProjects(function(result){
    	$scope.activeAndBacklogProjects = result.data;
    	//console.log("staffing.js activeAndBacklogProjects:", $scope.activeAndBacklogProjects);
    });
    
    RolesService.getRolesMapByResource().then (
    		function (data) {
    			activeStaffing.rolesMap = data;
    			$scope.rolesMap = data;
    			
    			return ProjectsService.getActiveClientProjects();
    		}
    ).then(
    		function(data){
    			activeStaffing.projects = data;
    			$scope.activeProjects = data;
    			//console.log("staffing.js activeProjects:", $scope.activeProjects);
    			$scope.projectCount = data.count;
        
    	        /* Next, with the list of active projects, find the resource deficit on these projects.*/
    	        $scope.qvProjects = data.data;
    	        activeProjects = $scope.qvProjects;
    	        
    	         /* Next, run through the list of projects and set the active projects and people. */
    	        return AssignmentService.getAssignments(activeProjects);
    		}
        
    ).then(
    		function (data) {
                /*
                 * Finally set projects without any assigned people.
                 * 
                 */
    			
    			var fillDeficit = function(addAllRoles) {
    				/*
                	 * Loop through all the roles in the active projects 
                	 */
                	for(var b = 0; b < roles.length; b++){
	                        var activeRole = roles[b];	
                    
	                        if(activeRole.hoursNeededToCover > 0 || addAllRoles) {
		                        $scope.activeProjectsWithUnassignedPeople[unassignedIndex++] = {
		                            	  clientName: proj.customerName,
		                            	  projectName: proj.name,
		                            	  title: proj.customerName+': '+proj.name,
		                            	  projectResource: proj.resource,
		                            	  hours: getHoursDescription(activeRole.rate.fullyUtilized, activeRole.rate.type, activeRole.rate.hoursPerWeek, activeRole.rate.hoursPerMth ),
		                            	  role: $scope.rolesMap[activeRole.type.resource].abbreviation,
		                            	  startDate: activeRole.startDate,
		                            	  endDate: activeRole.endDate,
		                            	  rate: activeRole.rate.amount
		                        };
		                      }
                      }
    			}
    			var found = false;
    			
    			for(var i = 0; i < activeProjects.length; i++){
              		var proj = activeProjects[i];
              		var foundProjMatch = false;
              		var roles = _.filter(activeProjects[i].roles, $scope.filterPastEntries);
              		
              		
              		var projAssignments = undefined;
				
              		found = false;
              		
    				for (var l=0; l<data.length; l ++) {

    					projAssignments = data[l];
    					
    					if(projAssignments.project.resource == proj.resource) {
     						
    						if(projAssignments.members && projAssignments.members.length > 0) {
    							var assignees = _.filter(projAssignments.members, $scope.filterPastEntries);
    							
    							found = true;
    							
    			                if(roles){
    			                	AssignmentService.calculateRolesCoverage(roles, assignees);
    			                	// add info about deficit roles
    			                	fillDeficit()
    			                	
  			                      	break;
    			                }
    						}
    					}
    				}
    				
    				// add info about other deficit roles, which doesn't have assignments
    				if (!found) 
    					fillDeficit(true);
      			}
        	  
          	  /*
          	   * Build out the table that contains the Active Projects with resource deficits
          	   */
          	  $scope.unassignedRoleList = new TableParams(params, {
        		  total: $scope.activeProjectsWithUnassignedPeople.length, // length of data
        		  getData: function ($defer, params) {

        			  var data = $scope.activeProjectsWithUnassignedPeople;
        			  var start = (params.page() - 1) * params.count();
        			  var end = params.page() * params.count();
        			  // use build-in angular filter
        			  var orderedData = params.sorting() ? $filter('orderBy')(data, params.orderBy()) : data;
        			  var ret = orderedData.slice(start, end);

        			  $defer.resolve(ret);
        		  }
        	  });
            }
    );

    /*
     * Next, with the list of backlog projects, create a table with the resource deficit on these projects.
     * 
     */
    ProjectsService.getBacklogProjects(function(result){
    	$scope.projectBacklog = result;
        $scope.backlogCount = result.count;
        $scope.backlogProjectsList = [];

        
        //console.log("main.js $scope.projectBacklog:", $scope.projectBacklog);
        var projectBacklog = result.data;

        var unassignedIndex = 0;
        var rolesPromise = RolesService.getRolesMapByResource();
        $q.all(rolesPromise).then(function(rolesMap) {
        	//console.log("staging.js using rolesMap:", rolesMap);
        	$scope.rolesMap = rolesMap;
        	return AssignmentService.getAssignments(projectBacklog, "all");
        }).then(function (assignments) {
        	
            /*
             * Set backlog projects
             * 
             */
        	  
        	var projectRolesList = [];
        	
        	  for(var i = 0; i < projectBacklog.length; i++){
          		var proj = projectBacklog[i];
          		var foundProjMatch = false;
				var roles = projectBacklog[i].roles;
				var projAssignments = undefined;
				
				var roleList = [];
				for(var r = 0; r < roles.length; r++){
					var backlogRole = roles[r];
					var abbr = $scope.rolesMap[backlogRole.type.resource].abbreviation;
					var roleFinded = _.findWhere(roleList, {role: abbr});
					var backlogRoleFinded = _.findWhere(projectRolesList, {role: abbr});
					// collecting roles for each project
					if(roleFinded) {
						roleFinded.count++;
					}
					else {
						roleList.push(
								{
									role: $scope.rolesMap[backlogRole.type.resource].abbreviation,
									count: 1
								});
					}
					// collecting roles for backlog projects summary
					if(backlogRoleFinded) {
						backlogRoleFinded.count++;
					}
					else {
						projectRolesList.push(
								{
									role: $scope.rolesMap[backlogRole.type.resource].abbreviation,
									count: 1
								});
					}
				}
				
				for(var l=0; l<assignments.length; l++) {
					projAssignments = assignments[l];
					if(projAssignments.project.resource == proj.resource) {
						foundProjMatch = true;
						
						if(projAssignments.members && projAssignments.members.length > 0) {
							var assignees = projAssignments.members;
			                if(roles){
			        			var startingProjectIndex = $scope.backlogProjectsList.length;
			        			var projectDeficitesItemsCount = 0;
			                      /*
			                       * Loop through all the roles in the active projects
			                       */
			                      for(var b = 0; b < roles.length; b++){
			                        var backlogRole = roles[b];
			                        var foundRoleMatch = false;
			                        var updated = false;
			                        
			                        //console.log("Next backlogRole:",backlogRole);
			                        /*
			                         * Loop through assignees to find a match
			                         */
			                        for (var c=0; c<assignees.length; c++) {
			                        	//if(backlogRole.about == assignees[c].role.resource) {
			                        	if(assignees[c].role.resource && assignees[c].role.resource.indexOf(backlogRole._id) > -1) {
			                        		foundRoleMatch = true;
			                        	}
			                        }
			                        
			                        if(!foundRoleMatch) {
				                        // individual row for empty assignment
				                        $scope.backlogProjectsList[unassignedIndex++] = {
				                            	  clientName: proj.customerName,
				                            	  projectName: proj.name,
				                            	  title: proj.customerName+': '+proj.name,
				                            	  projectResource: proj.resource,
				                            	  hours: getHoursDescription(backlogRole.rate.fullyUtilized, backlogRole.rate.type, backlogRole.rate.hoursPerWeek, backlogRole.rate.hoursPerMth ),
				                            	  role: $scope.rolesMap[backlogRole.type.resource].abbreviation,
				                            	  startDate: backlogRole.startDate,
				                            	  endDate: backlogRole.endDate,
				                            	  rate: backlogRole.rate.amount,
				                            	  isProjectItem: false};
				                      }
			                      }
			                }
						}
						else {
							foundProjMatch = false;
						}
					}
				}
				
				if (!foundProjMatch) {
					if(roles) {
	        			  var startingProjectIndex = $scope.backlogProjectsList.length;
		        		  var projectDeficitesItemsCount = 0;
	                      for(var b = 0; b < roles.length; b++){
	                    	    var updated = false;
		                        var backlogRole = roles[b];
		                        $scope.backlogProjectsList[unassignedIndex++] = {
		                            	  clientName: proj.customerName,
		                            	  projectName: proj.name,
		                            	  title: proj.customerName+': '+proj.name,
		                            	  projectResource: proj.resource,
		                            	  hours: getHoursDescription(backlogRole.rate.fullyUtilized, backlogRole.rate.type, backlogRole.rate.hoursPerWeek, backlogRole.rate.hoursPerMth ),
		                            	  role: $scope.rolesMap[backlogRole.type.resource].abbreviation,
		                            	  startDate: backlogRole.startDate,
		                            	  endDate: backlogRole.endDate,
		                            	  rate: backlogRole.rate.amount,
		                            	  isProjectItem: false};
	                      }
					}
				}
				
				var stringRoleList = new String();
                for (var k=0; k<roleList.length;k++) {
                    if (stringRoleList.length > 1) 
                    	stringRoleList = stringRoleList.concat(", ");
                	stringRoleList = stringRoleList.concat(roleList[k].role,"(",roleList[k].count,")");
                }
                
                var projectItem = {
                        clientName: proj.customerName,
                    	  projectName: proj.name,
                    	  title: proj.customerName + ': ' + proj.name,
                    	  projectResource: proj.resource,
                    	  role: stringRoleList,
                    	  hours: '-',
                    	  startDate: proj.startDate,
                    	  endDate: proj.endDate,
                    	  isProjectItem: true
                    };
                
                $scope.backlogProjectsList.splice(startingProjectIndex, 0, projectItem);
                unassignedIndex++;
          	  }        	  
        	  
              //console.log("Backlogged project Role list:",$scope.backlogProjectsList);
      	
            	var peopleProm = Resources.get('people');
              	peopleProm.then(function(people) {
                  	//console.log("main.js peopleProm resolved. called with:", people);
                  	//console.log("main.js peopleProm resolved. I already have:", backlogProjectsList);

                    for (var i=0; i< $scope.backlogProjectsList.length;i++) {
                      	var backlogProject = $scope.backlogProjectsList[i];
                      	//console.log("main.js backlog project=", backlogProject);
                      	var assignee = backlogProject.assignee;
                      	if(assignee != undefined) {
                          	//console.log("main.js peopleProm resolved. assignee:", assignee);
                          	backlogProject.assignee = getPersonName(people, assignee);
                          }
                      }
              	});
            
                /*
                 * Build out the table that contains the backlog Projects with resource deficits
                 */
              	var backlogTableParams = {
              	      page: 1,              // show first page
              	      count: 100,           // count per page
              	      sorting: {}           // initial sorting is already done
              	    };
                $scope.backlogRoleList = new TableParams(backlogTableParams, {
                    total: $scope.backlogProjectsList.length, // length of data
                    getData: function ($defer, params) {
                    
                        var data = $scope.backlogProjectsList;
                        var start = (params.page() - 1) * params.count();
                        var end = params.page() * params.count();
                        // use build-in angular filter
                        var orderedData = params.sorting() ? $filter('orderBy')(data, params.orderBy()) : data;
                        var ret = orderedData.slice(start, end);
                        //console.log("Ret value for Backlog Role list:",ret);

                        $defer.resolve(ret);
                    }
                });
        });
    });

    /*
     * Next, with the list of pipeline projects, create a table that shows the pipeline with staff needs.
     * 
     */
    ProjectsService.getPipelineProjects(function(result){
    	$scope.projectPipeline = result;
        $scope.pipelineCount = result.count;
        $scope.pipelineProjectsList = [];
        
        //console.log("main.js $scope.projectPipeline:", $scope.projectPipeline);
        var projectPipeline = result.data;

        var unassignedIndex = 0;
        var rolesPromise = RolesService.getRolesMapByResource();
        $q.all(rolesPromise).then(function(rolesMap) {
            /*
             * Set pipeline projects
             * 
             */
        	for(var i = 0; i < projectPipeline.length; i++){
        		var pipeProj = projectPipeline[i];
        		var roles = projectPipeline[i].roles;
        		if(roles){
        			var roleList = [];
        			var roleListIndex = 0;
                	/*
                	 * Loop through all the roles in the pipeline projects  
                	 */
                    for(var b = 0; b < roles.length; b++){
                        var pipeProjRole = roles[b];
                        var updated = false;
                        
                        for (var j = 0; j < roleList.length; j++) {
                        	var roleCountObj = roleList[j];
                        	if(roleCountObj.role == rolesMap[pipeProjRole.type.resource].abbreviation) {
                        		roleCountObj.count++;
                        		updated = true;
                        		break;
                        	}                    
                        }
                        
                        if(!updated) {
                        	roleList[roleListIndex++] = 
                    		{
                    			role: rolesMap[pipeProjRole.type.resource].abbreviation,
                    			count: 1
                    		};
                        }
                     }
                    
                    var stringRoleList = new String();
                    for (var k=0; k<roleList.length;k++) {
                        if (stringRoleList.length > 1) 
                        	stringRoleList = stringRoleList.concat(", ");
                    	stringRoleList = stringRoleList.concat(roleList[k].role,"(",roleList[k].count,")");
                    }
                    
                    $scope.pipelineProjectsList[unassignedIndex++] = {
                      	  clientName: pipeProj.customerName,
                    	  projectName: pipeProj.name,
                    	  title: pipeProj.customerName + ': ' + pipeProj.name,
                    	  projectResource: pipeProj.resource,
                    	  roles: stringRoleList,
                    	  startDate: pipeProj.startDate,
                    	  endDate: pipeProj.endDate
                    };
                  };
              };                  
              return $scope.pipelineProjectsList;
        }).then(function(pipelineProjectsList) {
            /*
             * Build out the table that contains the backlog Projects with resource deficits
             */
            $scope.pipeListProjects = new TableParams(params, {
                total: pipelineProjectsList.length, // length of data
                getData: function ($defer, params) {
                
                    var data = pipelineProjectsList;
                    var start = (params.page() - 1) * params.count();
                    var end = params.page() * params.count();
                    // use build-in angular filter
                    var orderedData = params.sorting() ? $filter('orderBy')(data, params.orderBy()) : data;
                    var ret = orderedData.slice(start, end);
                    //console.log("Ret value for Backlog Role list:",ret);

                    $defer.resolve(ret);
                }
            });
        });
    });

    /**
     * Function to return a text description of the number of hours
     */
    var getHoursDescription = function (fullyUtilized, type, hoursPerWeek, hoursPerMth ) {
    	//console.log("getHoursDescription called with", hours, fullyUtilized, type);
    	if(!type) {
    		return '';
    	}
    	
    	var hoursDesc;
    	
    	if (fullyUtilized) {
    		hoursDesc="100%";
    	}
    	else {
    		switch (type) {
    		case 'hourly':
    			hoursDesc= hoursPerMth + "/m";
    			break;
    		case 'weekly':
    			hoursDesc= hoursPerWeek + "/w";
    			break;
    		case 'monthly':
    			hoursDesc= '100%';
    		}
    	}
    	//console.log("getHoursDescription returning ", hoursDesc);
    	return hoursDesc;
    }
    
}]);

mmModule.directive('exportBacklog', ['$parse', function ($parse) {
    return {
      restrict: '',
      scope: false,
      link: function(scope, element, attrs) {
        var data = '';
        var csv = {
          stringify: function(str) {
        	  if(str){
  	        	// trim spaces
  	        	var startSpace = str.replace(/^\s\s*/, '');
  	        	var endSpace = startSpace.replace(/\s*\s$/, '');
  	        	// replace quotes with double quotes
  	        	var replaceDoubleQuotes = endSpace.replace(/"/g,'""'); 
  	            return '"' +replaceDoubleQuotes +  '"';
          	}
          	else{
          		return '"'+'"';
          	}
          },
          rawJSON: function(){
            return scope.backlogProjectsList;
          },
          rawCSV: function(){
            return data;
          },
          generate: function() {
            var project = scope.project;
            var deficitRoles = scope.backlogRoleList.data;

            for(var i = 0; i < deficitRoles.length; i++){
              data = csv.JSON2CSV(project, deficitRoles);
            }
          },
          link: function() {
            return 'data:text/csv;charset=UTF-8,' + encodeURIComponent(data);
          },
          JSON2CSV: function(project, deficitRoles) {
            var str = '';
            var line = '';

            //Print the header
            var head = ['Project', 'Role', 'Hours', 'Start Date', 'End Date'];
            for (var i = 0; i < head.length; i++) {
              line += head[i] + ',';
            }
            //Remove last comma and add a new line
            line = line.slice(0, -1);
            str += line + '\r\n';

            //Print the values
            for (var x = 0; x < deficitRoles.length; x++) {
              line = '';

              var role = deficitRoles[x];

              //Project
              line += csv.stringify(role.title) + ',';
              line += csv.stringify(role.role) + ',';
              line += csv.stringify(role.hours) + ',';
              line += csv.stringify(role.startDate) + ',';
              line += csv.stringify(role.endDate) + ',';
              
              str += line + '\r\n';
            }
            return str;
          }
        };
        $parse(attrs.exportBacklog).assign(scope.$parent, csv);
      }
    };
  }]);

mmModule.directive('exportActive', ['$parse', function ($parse) {
    return {
      restrict: '',
      scope: false,
      link: function(scope, element, attrs) {
        var data = '';
        var csv = {
          stringify: function(str) {
        	if(str){
	        	// trim spaces
	        	var startSpace = str.replace(/^\s\s*/, '');
	        	var endSpace = startSpace.replace(/\s*\s$/, '');
	        	// replace quotes with double quotes
	        	var replaceDoubleQuotes = endSpace.replace(/"/g,'""'); 
	            return '"' +replaceDoubleQuotes +  '"';
        	}
        	else{
        		return '"'+'"';
        	}
          },
          rawJSON: function(){
            return scope.activeProjectsWithUnassignedPeople;
          },
          rawCSV: function(){
            return data;
          },
          generate: function() {
            var project = scope.project;
            var deficitRoles = scope.unassignedRoleList.data;

            for(var i = 0; i < deficitRoles.length; i++){
              data = csv.JSON2CSV(project, deficitRoles);
            }
          },
          link: function() {
            return 'data:text/csv;charset=UTF-8,' + encodeURIComponent(data);
          },
          JSON2CSV: function(project, deficitRoles) {
            var str = '';
            var line = '';

            //Print the header
            var head = ['Project', 'Role', 'Hours', 'Start Date', 'End Date'];
            for (var i = 0; i < head.length; i++) {
              line += head[i] + ',';
            }
            //Remove last comma and add a new line
            line = line.slice(0, -1);
            str += line + '\r\n';

            //Print the values
            for (var x = 0; x < deficitRoles.length; x++) {
              line = '';

              var role = deficitRoles[x];

              //Project
              line += csv.stringify(role.title) + ',';
              line += csv.stringify(role.role) + ',';
              line += csv.stringify(role.hours) + ',';
              line += csv.stringify(role.startDate) + ',';
              line += csv.stringify(role.endDate) + ',';
              
              str += line + '\r\n';
            }
            return str;
          }
        };
        $parse(attrs.exportActive).assign(scope.$parent, csv);
      }
    };
  }]);

mmModule.directive('exportPipeline', ['$parse', function ($parse) {
    return {
      restrict: '',
      scope: false,
      link: function(scope, element, attrs) {
        var data = '';
        var csv = {
          stringify: function(str) {
        	if(str){
	        	// trim spaces
	        	var startSpace = str.replace(/^\s\s*/, '');
	        	var endSpace = startSpace.replace(/\s*\s$/, '');
	        	// replace quotes with double quotes
	        	var replaceDoubleQuotes = endSpace.replace(/"/g,'""'); 
	            return '"' +replaceDoubleQuotes +  '"';
        	}
        	else{
        		return '"'+'"';
        	}
          },
          rawJSON: function(){
            return scope.pipelineProjectsList;
          },
          rawCSV: function(){
            return data;
          },
          generate: function() {
            var pipelineProjects = scope.pipeListProjects.data;

            for(var i = 0; i < pipelineProjects.length; i++){
              data = csv.JSON2CSV(pipelineProjects);
            }
          },
          link: function() {
            return 'data:text/csv;charset=UTF-8,' + encodeURIComponent(data);
          },
          JSON2CSV: function(pipelineProjects) {
            var str = '';
            var line = '';

            //Print the header
            var head = ['Project', 'Roles', 'Start Date', 'End Date'];
            for (var i = 0; i < head.length; i++) {
              line += head[i] + ',';
            }
            //Remove last comma and add a new line
            line = line.slice(0, -1);
            str += line + '\r\n';

            //Print the values
            for (var x = 0; x < pipelineProjects.length; x++) {
              line = '';

              var proj = pipelineProjects[x];

              //Project
              line += csv.stringify(proj.title) + ',';
              line += csv.stringify(proj.roles) + ',';
              line += csv.stringify(proj.startDate) + ',';
              line += csv.stringify(proj.endDate) + ',';
              
              str += line + '\r\n';
            }
            return str;
          }
        };
        $parse(attrs.exportPipeline).assign(scope.$parent, csv);
      }
    };
  }]);

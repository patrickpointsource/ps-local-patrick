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

    /*
     * Fetch a list of all the active Projects.
     * 
     */
    var rolesPromise = RolesService.getRolesMapByResource();;
    ProjectsService.getActiveAndBacklogProjects(function(result){
    	$scope.activeAndBacklogProjects = result.data;
    	//console.log("staffing.js activeAndBacklogProjects:", $scope.activeAndBacklogProjects);
    });
    
    var aProjectsPromise = ProjectsService.getActiveClientProjects(function(result){
    	$scope.activeProjects = result;
    	//console.log("staffing.js activeProjects:", $scope.activeProjects);
        $scope.projectCount = result.count;
        
        /*
         * Next, with the list of active projects, find the resource deficit on these projects.
         * 
         */
        $scope.qvProjects = result.data;
        
        /*
         * Next, run through the list of projects and set the active projects and people.
         * 
         */
        var activeProjects = $scope.qvProjects;
        var activeProjectsWithUnassignedPeople = [];
        var unassignedIndex = 0;
        
        $scope.activeProjectsWithUnassignedPeople = [];
        
        $q.all(rolesPromise).then(function(rolesMap) {
      	  //console.log("staging.js using rolesMap:", rolesMap);
        	$scope.rolesMap = rolesMap;
        	return AssignmentService.getAssignments(activeProjects);
        }).then(function (assignments) {
        	
        	
            /*
             * Finally set projects without any assigned people.
             * 
             */
        	  for(var i = 0; i < activeProjects.length; i++){
        		var proj = activeProjects[i];
				var roles = activeProjects[i].roles;
				var projAssignments = undefined;
				
				for(var l=0; l<assignments.count; l++) {
					projAssignments = assignments.data[l];
					if(projAssignments.project.resource == proj.resource) {
						if(projAssignments.members && projAssignments.members.length > 0) {
							var assignees = projAssignments.members;
			                if(roles){
			                      /*
			                       * Loop through all the roles in the active projects
			                       */
			                      for(var b = 0; b < roles.length; b++){
			                        var activeRole = roles[b];		
			                        var foundRoleMatch = false;
			                        //console.log("Next active Role:",activeRole);
			                        /*
			                         * Loop through assignees to find a match
			                         */
			                        for (var c=0; c<assignees.length; c++) {
			                        	if(activeRole.about == assignees[c].role.resource) {
			                        		foundRoleMatch = true;
			                        	}
			                        }
			                        
			                        if(!foundRoleMatch) {
				                        $scope.activeProjectsWithUnassignedPeople[unassignedIndex++] = {
				                            	  clientName: proj.customerName,
				                            	  projectName: proj.name,
				                            	  title: proj.customerName+': '+proj.name,
				                            	  projectResource: proj.resource,
				                            	  hours: getHoursDescription(activeRole.rate.fullyUtilized, activeRole.rate.type, activeRole.rate.hoursPerWeek, activeRole.rate.hoursPerMth ),
				                            	  role: $scope.rolesMap[activeRole.type.resource].abbreviation,
				                            	  startDate: activeRole.startDate,
				                            	  endDate: activeRole.endDate,
				                            	  rate: activeRole.rate.amount};
				                              //console.log("activeRole.type:",activeRole.type);
				                              //console.log("Unassigned Role in Proj:", $scope.activeProjectsWithUnassignedPeople[unassignedIndex-1]);
				                      }
			                      }
			                }
						}
					}
				}
        	  }
              //console.log("Unassigned Role list:",$scope.activeProjectsWithUnassignedPeople);
              
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
        });
    });

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
        	return AssignmentService.getAssignments(projectBacklog);
        }).then(function (assignments) {
        	
            /*
             * Set backlog projects
             * 
             */
        	
        	  for(var i = 0; i < projectBacklog.length; i++){
          		var proj = projectBacklog[i];
				var roles = projectBacklog[i].roles;
				var projAssignments = undefined;
				
				for(var l=0; l<assignments.count; l++) {
					projAssignments = assignments.data[l];
					if(projAssignments.project.resource == proj.resource) {
						if(projAssignments.members && projAssignments.members.length > 0) {
							var assignees = projAssignments.members;
			                if(roles){
			                      /*
			                       * Loop through all the roles in the active projects
			                       */
			                      for(var b = 0; b < roles.length; b++){
			                        var backlogRole = roles[b];		
			                        var foundRoleMatch = false;
			                        //console.log("Next backlogRole:",backlogRole);
			                        /*
			                         * Loop through assignees to find a match
			                         */
			                        for (var c=0; c<assignees.length; c++) {
			                        	if(backlogRole.about == assignees[c].role.resource) {
			                        		foundRoleMatch = true;
			                        	}
			                        }
			                        
			                        if(!foundRoleMatch) {
				                        $scope.backlogProjectsList[unassignedIndex++] = {
				                            	  clientName: proj.customerName,
				                            	  projectName: proj.name,
				                            	  title: proj.customerName+': '+proj.name,
				                            	  projectResource: proj.resource,
				                            	  hours: getHoursDescription(backlogRole.rate.fullyUtilized, backlogRole.rate.type, backlogRole.rate.hoursPerWeek, backlogRole.rate.hoursPerMth ),
				                            	  role: $scope.rolesMap[backlogRole.type.resource].abbreviation,
				                            	  startDate: backlogRole.startDate,
				                            	  endDate: backlogRole.endDate,
				                            	  rate: backlogRole.rate.amount};
				                              //console.log("backlogRole.type:",activeRole.type);
				                              //console.log("Unassigned Role in Proj:", $scope.backlogProjectsList[unassignedIndex-1]);
				                      }
			                      }
			                }
						}
					}
				}
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
                $scope.backlogRoleList = new TableParams(params, {
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
    	var hoursDesc;
    	
    	if (fullyUtilized) {
    		hoursDesc="100%";
    	}
    	else {
    		switch (type) {
    		case 'hourly':
    			hoursDesc= hoursPerMth + "/month";
    			break;
    		case 'weekly':
    			hoursDesc= hoursPerWeek + "/week";
    			break;
    		case 'monthly':
    			hoursDesc= 'Monthly';
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

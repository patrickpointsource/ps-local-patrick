'use strict';

/**
 * Controller for handling creation of Roles.
 */
angular.module('Mastermind.controllers.people')
  .controller('ProfileCtrl', ['$scope', '$state', '$stateParams', '$filter', 'Resources', 'People', 'AssignmentService', 'ProjectsService','TasksService','ngTableParams',
    function ($scope, $state, $stateParams, $filter, Resources, People, AssignmentService, ProjectsService, TasksService, TableParams) {
	  
	  var UNSPECIFIED = 'Unspecified';
	  $scope.projects = [];
	  $scope.hoursTasks = [];
	  
	  $scope.loadAvailableTasks = function() {
      	TasksService.refreshTasks().then(function(tasks) {
      		_.each(tasks, function(t){
      			$scope.hoursTasks.push(t)
      		})
      		
      		
      	})
      }
	  
	  $scope.loadAvailableTasks();
	  
    /**
     * Load Role definitions to display names
     */
    Resources.get('roles').then(function(result){
      var members = result.members;
      $scope.allRoles = members;
      var rolesMap = {};
      for(var i = 0; i < members.length;i++){
        rolesMap[members[i].resource] = members[i];
      }
      
      // sorting roles by title
      $scope.allRoles.sort(function(a,b) {
          var x = a.title.toLowerCase();
          var y = b.title.toLowerCase();
          return x < y ? -1 : x > y ? 1 : 0;
      });
      
      // add unspecified item to roles dropdown
      $scope.allRoles.unshift({"title": UNSPECIFIED});
      
      $scope.rolesMap = rolesMap;

      $scope.getRoleName = function(resource){
        var ret = UNSPECIFIED;
        if(resource && $scope.rolesMap[resource]){
          ret = $scope.rolesMap[resource].title;
        }
        return ret;
      };
    });

    /**
     * Controls the edit state of teh profile form (an edit URL param can control this from a URL ref)
     */
    $scope.editMode = $state.params.edit?$state.params.edit:false;

    /**
     * Populate the form with fetch profile information
     */
    $scope.setProfile = function(person){
      $scope.profile = person;

//      $scope.skillsList = person.skills;
//
//      //Setup the skills table
//      if(!$scope.skillsParams){
//        $scope.initSkillsTable();
//      }
//      //Have skill just refresh
//      else if($scope.skillsList){
//        $scope.skillsParams.total($scope.skillsList.length);
//        $scope.skillsParams.reload();
//      }
//      //I have no skill
//      else{
//        $scope.skillsParams.total(0);
//        $scope.skillsParams.reload();
//      }

      //Set checkbox states based on the groups
      var groups = person.groups;

      $scope.isExec = groups && $.inArray('Executives', groups) !== -1;
      $scope.isManagement = groups && $.inArray('Management', groups) !== -1;
      $scope.isSales = groups && $.inArray('Sales', groups) !== -1;
      $scope.isProjectManagement = groups && $.inArray('Project Management', groups) !== -1;

      var url = person.about + '/' + 'gplus';

      Resources.get(url).then(function(result){
        $scope.gplusProfile = result;
        //gapi.person.go();
      });

      //Check if you can add hours
      if($scope.adminAccess || $scope.me.about === $scope.profile.about){
        $scope.canAddHours = true;
      }
    };

    /**
     * In edit mode add/removed a group from the profile when the user checked or unchecked a group
     *
     */
    $scope.handleGroupChange = function(ev, group){
      //Is the group checked or unchecked
      var elem = ev.currentTarget;
      var checked = elem.checked;

      //If checked add the group to the profile
      if (checked){
        if (!$scope.profile.groups){
          $scope.profile.groups=[];
        }
        $scope.profile.groups.push(group);
      }
      //Remove the group from the profile
      else {
        var arr=$scope.profile.groups?$scope.profile.groups:[],ax;
        while ((ax= arr.indexOf(group)) !== -1) {
          arr.splice(ax, 1);
        }
      }
    };

    /**
     * Set the profile view in edit mode
     */
    $scope.edit = function(){
      Resources.refresh('people/'+$scope.profileId).then(function(person){
        $scope.setProfile(person);
        $scope.editMode = true;
      });
    };

    /**
     * Set the profile view in edit mode
     */
    $scope.cancel = function(){
      Resources.get('people/'+$scope.profileId).then(function(person){
        $scope.setProfile(person);
        $scope.editMode = false;
      });
    };

    /**
     * Save the user profile changes
     */
    $scope.save = function(){
      var profile = $scope.profile;
      
      if(!profile.primaryRole || !profile.primaryRole.resource) {
    	  profile.primaryRole = null;
      }
      
      Resources.update(profile).then(function(person){
      	var fields = {resource:1,name:1, familyName: 1, givenName: 1, primaryRole:1,thumbnail:1};
      	var params = {'fields':fields};
      	var key = "people?" + JSON.stringify(params);
     
      	delete localStorage[key];      
      	
      	var getBack = localStorage[key];
      	
        $scope.setProfile(person);
        $scope.editMode = false;

        //If you updated your self refresh the local copy of me
        if ($scope.me.about === profile.about){
          Resources.refresh('people/me').then(function(me){
            $scope.me = me;
          });
        }
      });
    };
    
    $scope.projectHours = [];
    
    $scope.initHours = function(){
      var projectHours = [];
    	
      //Query all hours against the project
      var hoursQuery = {'person.resource':$scope.profile.about};
      //All Fields
      var fields = {};
      var sort = {'created':1};
      Resources.query('hours',hoursQuery, fields, function(hoursResult){
        $scope.hours = hoursResult.members;
        $scope.hasHours = $scope.hours.length > 0;
        
        for(var i = 0; i < $scope.hours.length; i++) {
        	var hour = $scope.hours[i];
        	
        	if(hour.task) {
        		var taskRes = $scope.hours[i].task.resource;
            	var task = _.findWhere($scope.hoursTasks, { resource: taskRes});
            	$scope.hours[i].task.name = task.name;
        	}
        }
        
        var projects = _.pluck($scope.hours, "project");
        
        projects = _.pluck(projects, "resource");
        
        projects = _.uniq(projects);
        
        for(var projCounter = 0; projCounter < projects.length; projCounter++){
        	projectHours[projCounter] = { projectURI: projects[projCounter], hours: [], collapsed: false };
        	
        	var project = _.findWhere($scope.projects, { resource: projects[projCounter]});
        	
        	projectHours[projCounter].project = project;
        	
        	for(var hoursCounter = 0; hoursCounter < $scope.hours.length; hoursCounter++) {
        		if($scope.hours[hoursCounter].project.resource == projects[projCounter]) {
        			projectHours[projCounter].hours.push($scope.hours[hoursCounter]);
        		}
        	}
        }
        
        $scope.projectHours = projectHours;
        
        /*if($scope.hoursTableParams){
          $scope.hoursTableParams.total($scope.hours.length);
          $scope.hoursTableParams.reload();
        }
        else {
            // Table Parameters
          var params = {
            page: 1,            // show first page
            count: 25,           // count per page
            sorting: {
             // created: 'des'     // initial sorting
            	date: 'des'
            }*/
          //};


          /*$scope.hoursTableParams = new TableParams(params, {
            total: $scope.hours.length, // length of data
            getData: function ($defer, params) {
              var data = $scope.hours;

              var start = (params.page() - 1) * params.count();
              var end = params.page() * params.count();

              // use build-in angular filter
              var orderedData = params.sorting() ?
                $filter('orderBy')(data, params.orderBy()) :
                data;

              var ret = orderedData.slice(start, end);

              //Resolve all the people
              var defers = [];
              for(var i = 0; i < ret.length; i++){
                var ithHoursRecord = ret[i];
                
                if (ithHoursRecord.project)
                	defers.push(Resources.resolve(ithHoursRecord.project));
                else if (ithHoursRecord.task)
                	defers.push(Resources.resolve(ithHoursRecord.task));
              }
              
              $.when.apply(window, defers).done(function(){
                $defer.resolve(ret);
              });
            }
          });*/
        //}
      }, sort);
    };
    
    /**
     * Get the Profile
     */
    $scope.profileId = $stateParams.profileId;
    Resources.get('people/'+$scope.profileId).then(function(person){
      $scope.setProfile(person);

      ProjectsService.getOngoingProjects(function(result){
      	$scope.ongoingProjects = result.data;
        	//console.log("main.js ongoingProjects:", $scope.ongoingProjects);
      	
      	ProjectsService.getMyCurrentProjects($scope.me).then(function(myCurrentProjects) {
          	var myProjects = myCurrentProjects.data;
          	for (var m=0; m< myProjects.length; m++) {
          		var myProj = myProjects[m];
          		var found = undefined;
          		myProj.title = myProj.customerName+': '+myProj.name;
          		$scope.projects.push(myProj);
          		
          		for (var n=0;n< $scope.ongoingProjects.length; n++) {
          			var proj = $scope.ongoingProjects[n];
          			if(proj.resource == myProj.resource) {
          				$scope.ongoingProjects.splice(n,1);
          				break;
          			}
          		}
          	}
          	
          	function compare(a,b) {
          	  var titleA = a.customerName+': '+a.name;
          	  var titleB = b.customerName+': '+b.name;
          	  if (titleA < titleB)
          	     return -1;
          	  if (titleA > titleB)
          	    return 1;
          	  return 0;
          	}
          	
          	$scope.ongoingProjects.sort(compare);
          	$scope.ongoingProjects.reverse();
          	while($scope.ongoingProjects.length >0) {
          		var nextProj = $scope.ongoingProjects.pop();
          		nextProj.title = nextProj.customerName+': '+nextProj.name;
          		$scope.projects.push(nextProj);
          	}
          	
          	$scope.initHours();
          });
      });
      
      AssignmentService.getMyCurrentAssignments(person).then(function(assignments){
    	  $scope.assignments = assignments;
    	  $scope.hasAssignments = assignments.length > 0;
    	  
    	  if ($scope.hasAssignments){
            // Project Params
            var params = {
              page: 1,            // show first page
              count: 10,           // count per page
              sorting: {
            	 startDate: 'asc'     // initial sorting
              }
            };
            $scope.tableParams = new TableParams(params, {
              counts: [],
              total: $scope.assignments.length, // length of data
              getData: function ($defer, params) {
                var start = (params.page() - 1) * params.count(),
                  end = params.page() * params.count(),
  
                // use build-in angular filter
                orderedData = params.sorting() ?
                  $filter('orderBy')($scope.assignments, params.orderBy()) :
                      $scope.assignments,
                      ret = orderedData.slice(start, end);
  
                $defer.resolve(ret);
              }
            });
    	  }
      });
    });


    $scope.isCurrentProject = function(endDate) {
      var date = new Date(endDate);
      var currentDate = new Date();
      if (date.getTime() < currentDate.getTime()) {
        return false;
      }
      return true;
    };

    ///////////Profile Hours/////////
    $scope.newHoursRecord = {};

     /**
    * Add a new Hours Record to the server
    */
    $scope.addHours = function(){
      //Set the person context
      $scope.newHoursRecord.person = {resource:$scope.profile.about};

      Resources.create('hours', $scope.newHoursRecord).then(function(){
        $scope.initHours();
        $scope.newHoursRecord = {};
      });
    };

    /**
     * Delete an hours instance
     */
    $scope.deleteHours = function (hoursRecord) {
      Resources.remove(hoursRecord.resource).then(function(){
        var projectRecord = _.findWhere($scope.projectHours, { projectURI: hoursRecord.project.resource });
        for(var i = 0; i < projectRecord.hours.length; i++) {
        	if(projectRecord.hours[i].resource == hoursRecord.resource) {
        		projectRecord.hours.splice(i, 1);
        		
        		if(projectRecord.hours.length == 0) {
        			for(var j = 0; j < $scope.projectHours.length; j++) {
        				if($scope.projectHours[j].projectURI == projectRecord.projectURI) {
        					$scope.projectHours.splice(j, 1);
        				}
        			}
        		}
        	}
        }
      });
    };

//    /**
//     * Load Skill Definitions to display names
//     */
//    Resources.get('skills').then(function(result){
//     var members = result.members;
//     var skillsMap = {};
//     for(var i = 0; i < members.length;i++){
//       var role = members[i];
//       skillsMap[members[i].resource] = members[i];
//     }
//     $scope.skillsMap = skillsMap;
//
//     $scope.getSkillsName = function(resource){
//       var ret = 'Unspecified';
//       if(resource && $scope.skillsMap[resource]){
//         ret = $scope.skillsMap[resource].title;
//       }
//       return ret;
//     }
//    });
//
//    /**
//     * Get the display label for a skill proficiency value
//     */
//    $scope.getSkillProficiencyLabel = function(proficiency){
//      var ret = 'Unspecified';
//
//      if(proficiency == 1){
//        ret = 'Some';
//      }
//      else if(proficiency == 2){
//        ret = 'Moderate';
//      }
//      else if(proficiency == 3){
//        ret = 'Mastered';
//      }
//
//      return ret;
//    };
//
//    /**
//     * Remove a skill from the profile
//     */
//    $scope.removeSkill = function(skill){
//      var list = $scope.skillsList;
//      var i = list.length;
//      while( i-- ) {
//          if( list[i].type.resource == skill.type.resource ) break;
//      }
//
//      list.splice(i, 1);
//    };
//    /**
//     * Initalizes the skills table this should only be done of the first skill add
//     */
//    $scope.initSkillsTable = function(){
//    //Table Parameters
//        var params = {
//          page: 1,            // show first page
//          count: 10,           // count per page
//          sorting: {
//            title: 'asc'     // initial sorting
//          }
//        };
//        $scope.skillsParams = new TableParams(params, {
//          counts: [],
//          total: $scope.skillsList?$scope.skillsList.length:0, // length of data
//          getData: function ($defer, params) {
//            var ret = $scope.skillsList?$scope.skillsList:[];
//            $defer.resolve(ret);
//          }
//        });
//    };
//    /**
//     * Get the list of Skill Types
//     */
//    Resources.get('skills').then(function(result){
//      $scope.skillTypes = result.members;
//    });
//
//    /**
//     * New Skill Object
//     */
//    $scope.newSkill = {type:{}, proficiency:0};
//
//    $scope.cancelAddSkill = function () {
//      $('#newSkillDialog').collapse('hide');
//    };
//
//    /**
//     * Add a new Skill to the profile
//     */
//    $scope.addSkill = function(){
//      //If skills array is missing default it to an empty array
//      if(!$scope.profile.skills){
//        $scope.profile.skills = [];
//        $scope.skillsList = $scope.profile.skills;
//      }
//
//      //Add skill to the list
//      $scope.profile.skills.push($scope.newSkill);
//
//      //Default the template for the next skill entry
//      $scope.newSkill = {type:{}, proficiency:0};
//
//      //Init skills table if not already done so
//      if(!$scope.skillsParams){
//        $scope.initSkillsTable();
//      }
//      else{
//        var total = $scope.skillsList?$scope.skillsList.length:0;
//        $scope.skillsParams.total(total);
//        $scope.skillsParams.reload();
//      }
//    };

  }]);
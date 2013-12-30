'use strict';

/**
 * Controller for handling creation of Roles.
 */
angular.module('Mastermind.controllers.people')
  .controller('ProfileCtrl', ['$scope', '$state', '$stateParams', '$filter', 'Resources', 'People', 'ngTableParams',
    function ($scope, $state, $stateParams, $filter, Resources, People, TableParams) {
	  
	  //Load my profile for group and role checking
      Resources.refresh('people/me').then(function(me){
    	 $scope.me = me; 
    	 
//    	 //If you are a member of the management or exec groups provide access to financial info
//    	 if(me.groups && ((me.groups.indexOf('Management') != -1) || (me.groups.indexOf('Executives') != -1))){
//    		 $scope.financeAccess=true;
//    	 }
    	 
      });
	  
	  /**
	   * Load Role definitions to display names
	   */
	  Resources.get('roles').then(function(result){
		 var members = result.members;
		 $scope.allRoles = members;
		 var rolesMap = {};
		 for(var i = 0; i < members.length;i++){
			 var role = members[i];
			 rolesMap[members[i].resource] = members[i];
		 }
		 $scope.rolesMap = rolesMap;
		 
		 $scope.getRoleName = function(resource){
			 var ret = 'Unspecified';
			 if(resource && $scope.rolesMap[resource]){
				 ret = $scope.rolesMap[resource].title;
			 }
			 return ret;
		 }
	  });
	  
	  /**
	   * Load Skill Definitions to display names
	   */
	  Resources.get('skills').then(function(result){
		 var members = result.members;
		 var skillsMap = {};
		 for(var i = 0; i < members.length;i++){
			 var role = members[i];
			 skillsMap[members[i].resource] = members[i];
		 }
		 $scope.skillsMap = skillsMap;
		 
		 $scope.getSkillsName = function(resource){
			 var ret = 'Unspecified';
			 if(resource && $scope.skillsMap[resource]){
				 ret = $scope.skillsMap[resource].title;
			 }
			 return ret;
		 }
	  });
	  
	  /**
	   * Get the display label for a skill proficiency value
	   */
	  $scope.getSkillProficiencyLabel = function(proficiency){
		  var ret = 'Unspecified';
		  
		  if(proficiency == 1){
			  ret = 'Some';
		  }
		  else if(proficiency == 2){
			  ret = 'Moderate';
		  }
		  else if(proficiency == 3){
			  ret = 'Mastered';
		  }
		  
		  return ret;
	  };
	  
	  /**
	   * Remove a skill from the profile
	   */
	  $scope.removeSkill = function(skill){
		  var list = $scope.skillsList;
		  var i = list.length;
		  while( i-- ) {
		      if( list[i].type.resource == skill.type.resource ) break;
		  }
		  
		  list.splice(i, 1);
	  };
	  
	  /**
	   * Controls the edit state of teh profile form (an edit URL param can control this from a URL ref)
	   */
	  $scope.editMode = $state.params.edit?$state.params.edit:false;
	  
	  /**
	   * Initalizes the skills table this should only be done of the first skill add
	   */
	  $scope.initSkillsTable = function(){
		//Table Parameters
	      var params = {
	        page: 1,            // show first page
	        count: 10,           // count per page
	        sorting: {
	          title: 'asc'     // initial sorting
	        }
	      };
	      $scope.skillsParams = new TableParams(params, {
	        counts: [],
	        total: $scope.skillsList?$scope.skillsList.length:0, // length of data
	        getData: function ($defer, params) {
	          var ret = $scope.skillsList?$scope.skillsList:[];
	          $defer.resolve(ret);
	        }
	      });
	  };
	  
	  /**
	   * Populate the form with fetch profile information
	   */
	  $scope.setProfile = function(person){
		  $scope.profile = person;
		 
		  $scope.skillsList = person.skills;
		
		  //Setup the skills table
		  if(!$scope.skillsParams){
			  $scope.initSkillsTable();
		  }
		  //Have skill just refresh
		  else if($scope.skillsList){
			  $scope.skillsParams.total($scope.skillsList.length);
			  $scope.skillsParams.reload();
		  }
		  //I have no skill
		  else{
			  $scope.skillsParams.total(0);
			  $scope.skillsParams.reload();
		  }
		  
		  //Set checkbox states based on the groups
		  var groups = person.groups;
		  
		  $scope.isExec = groups && $.inArray('Executives', groups) != -1;
		  $scope.isManagement = groups && $.inArray('Management', groups) != -1;
		  $scope.isSales = groups && $.inArray('Sales', groups) != -1;
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
		  if(checked){
			  if(!$scope.profile.groups)$scope.profile.groups=[];
			  $scope.profile.groups.push(group);
		  }
		  //Remove the group from the profile
		  else{
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
		  Resources.update(profile).then(function(person){
			  $scope.setProfile(person);
			  $scope.editMode = false;
			  
			  //If you updated your self refresh the local copy of me
			  if($scope.me.about == profile.about){
			      Resources.refresh('people/me').then(function(me){
			     	 $scope.me = me; 
			       });
			  }
		  });
	  };
	  
	  /**
	   * Get the Profile
	   */
	  $scope.profileId = $stateParams.profileId;
	  Resources.get('people/'+$scope.profileId).then(function(person){
		  $scope.setProfile(person);
		  
		 
		 var query = {'roles.assignee':{resource:person.about}};
		 var fields = {resource:1,name:1};
		 
		 Resources.query('projects', query, fields, function(result){
			 $scope.projects = result.data;
			 $scope.hasProjects = result.data.length > 0;
			 
			 if($scope.hasProjects){
				  // Project Params
			      var params = {
			        page: 1,            // show first page
			        count: 10,           // count per page
			        sorting: {
			          name: 'asc'     // initial sorting
			        }
			      };
			      $scope.tableParams = new TableParams(params, {
			        counts: [],
			        total: $scope.projects.length, // length of data
			        getData: function ($defer, params) {
			          var start = (params.page() - 1) * params.count(),
			            end = params.page() * params.count(),
	
			          // use build-in angular filter
			            orderedData = params.sorting() ?
			              $filter('orderBy')($scope.projects, params.orderBy()) :
			            	  $scope.projects,
	
			              ret = orderedData.slice(start, end);
			             
			              
			          $defer.resolve(ret);
			        }
			      });
			 } 
		 });
	  });
	  
	  /**
	   * Get the list of Skill Types
	   */
	  Resources.get('skills').then(function(result){
		  $scope.skillTypes = result.members;
	  });
	  
	  /**
	   * New Skill Object
	   */
	  $scope.newSkill = {type:{}, proficiency:0};
	  
	  $scope.cancelAddSkill = function () {
	  	$('#newSkillDialog').collapse('hide');
	  };

	  /**
	   * Add a new Skill to the profile
	   */
	  $scope.addSkill = function(){
		  //If skills array is missing default it to an empty array
		  if(!$scope.profile.skills){
			  $scope.profile.skills = [];
			  $scope.skillsList = $scope.profile.skills;
		  }
		  
		  //Add skill to the list
		  $scope.profile.skills.push($scope.newSkill);
		  
		  //Default the template for the next skill entry
		  $scope.newSkill = {type:{}, proficiency:0};
		  
		  //Init skills table if not already done so
		  if(!$scope.skillsParams){
			  $scope.initSkillsTable();
		  }
		  else{
			  var total = $scope.skillsList?$scope.skillsList.length:0;
			  $scope.skillsParams.total(total);
			  $scope.skillsParams.reload();
		  }
	  };
	  
  }]);
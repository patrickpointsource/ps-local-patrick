'use strict';

/**
 * Controller for handling creation of Roles.
 */
angular.module('Mastermind.controllers.people')
  .controller('ProfileCtrl', ['$scope', '$state', '$stateParams', '$filter', 'Resources', 'People', 'ngTableParams',
    function ($scope, $state, $stateParams, $filter, Resources, People, TableParams) {
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
			 if(resource){
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
			 if(resource){
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
	   * Populate the form with fetch profile information
	   */
	  $scope.setProfile = function(person){
		  $scope.profile = person;
		 
		  $scope.skillsList = person.skills;
		
		  //Setup the skills table
		  if($scope.skillsList && !$scope.skillsParams){
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
		        total: $scope.skillsList.length, // length of data
		        getData: function ($defer, params) {
		          var ret = $scope.skillsList;
		          $defer.resolve(ret);
		        }
		      });
		  }
		  //Have skill just refresh
		  else if($scope.skillsList){
			  $scope.skillsParams.total($scope.skillsList.length);
			  $scope.skillsParams.reload();
		  }
		  //I have no skill
		  else{
			  $scope.skillsParams = null;
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
	   * Save the user profile changes
	   */
	  $scope.save = function(){
		  var profile = $scope.profile;
		  Resources.update(profile).then(function(person){
			  $scope.setProfile(person);
			  $scope.editMode = false;
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
	  
	  /**
	   * Add a new Skill to the profile
	   */
	  $scope.addSkill = function(){
		  //If skills array is missing default it to an empty array
		  if(!$scope.profile.skills){
			  $scope.profile.skills = [];
		  }
		  
		  //Add skill to the list
		  $scope.profile.skills.push($scope.newSkill);
		  
		  //Default the template for the next skill entry
		  $scope.newSkill = {type:{}, proficiency:0};
	  };
	  
  }]);
'use strict';

/**
 * Controller for handling creation of Roles.
 */
angular.module('Mastermind.controllers.people')
  .controller('ProfileCtrl', ['$scope', '$state', '$stateParams', '$filter', 'Resources', 'People', 'ngTableParams',
    function ($scope, $state, $stateParams, $filter, Resources, People, TableParams) {
	  Resources.get('roles').then(function(result){
		 $scope.allRoles = result; 		 
	  });
	  
	  $scope.editMode = $state.params.edit?$state.params.edit:false;
	  
	  $scope.setProfile = function(person){
		  $scope.profile = person;
		  
		  var skills = person.skills;
		  
		  //TODO fill in skills
		  
		  //Setup the skills table
		  if(skills && !$scope.skillsParams){
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
		        total: $scope.skills.length, // length of data
		        getData: function ($defer, params) {
		          var ret = $scope.skillsParams;
		          $defer.resolve(ret);
		        }
		      });
		  }
		  //Have skill just refresh
		  else if(skills){
			  $scope.skillsParams.total($scope.skills.length);
			  $scope.skillsParams.reload();
		  }
		  //I have no skill
		  else{
			  $scope.skillsParams = null;
		  }
	  };
	  
	  $scope.edit = function(){
		  Resources.refresh('people/'+$scope.profileId).then(function(person){
			  $scope.setProfile(person);
			  $scope.editMode = true;
		  });
	  };
	  
	  $scope.save = function(){
		  var profile = $scope.profile;
		  Resources.update(profile).then(function(person){
			  $scope.setProfile(person);
			  $scope.editMode = false;
		  });
	  };
	  
	  $scope.updateProfile = function(){
		  Resources.forceUpdate($scope.profile).then(function(person){
			  $scope.setProfile(person);
		  })
	  };
	  
	  
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
  }]);
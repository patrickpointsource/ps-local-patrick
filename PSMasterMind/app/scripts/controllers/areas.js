'use strict';

/*
 * Controller for navigating through areas of Mastermind like its dashboard,
 * projects, people, and roles.
 */
angular.module('Mastermind').controller('AreasCtrl', ['$scope', '$state','Resources',
  function ($scope, $state, Resources) {

	// make these vars accessible in scope methods - especially "showHome"
	var apQuery;
	var apFields;
    //Load my profile for group and role checking
    Resources.refresh('people/me').then(function(me){
      $scope.me = me;

      //If you are a member of the management or exec groups provide access to financial info
      if(me.groups && ((me.groups.indexOf('Management') !== -1) || (me.groups.indexOf('Executives') !== -1))){
        $scope.financeAccess = true;
        $scope.adminAccess = true;
      }

      //console.log('Logged In');
      $scope.authState = true;

      // Check what projects I am active in
      // not sure what this is used for... it is not being used, can we take it out?
      // var query = '{roles:{%27$elemMatch%27:{startDate:{%27$lt%27:%272013-11-05%27},assignee:{resource:%27people/52a1eeec30044a209c476477%27}}}}';

      //Get todays date formatted as yyyy-MM-dd
      var today = new Date();
      var dd = today.getDate();
      var mm = today.getMonth()+1; //January is 0!
      var yyyy = today.getFullYear();
      if (dd<10){
        dd='0'+dd;
      }
      if (mm<10){
        mm='0'+mm;
      }

      var startDateQuery = yyyy+'-'+mm+'-'+dd;

      apQuery = {roles:{'$elemMatch':{assignee:{resource:me.about},startDate:{$lte:startDateQuery},$or:[{endDate:{$exists:false}},{endDate:{$gt:startDateQuery}}]}}};
      apFields = {resource:1,name:1,'roles.assignee':1};
      
      Resources.query('projects', apQuery, apFields, function(result){
        $scope.myActiveProjects =  result.data;
        if(result.data.length>0){
          $scope.hasActiveProjects = true;
        }
      });

    });

    /**
     * Determine the active area of the application for the user.
     *
     * @returns {string}
     */
    function activeArea() {
      // default the value in case none of the states match.
      var area = 'home';

      if ($state.includes('projects')) {
        area = 'projects';
      } else if ($state.includes('people')) {
        area = 'people';
      } else if ($state.includes('staffing')) {
        area = 'staffing';
      } else if ($state.includes('admin')) {
          area = 'admin';
      }

      return area;
    }

    $scope.activeArea = activeArea;

    /*
     * Navigate to the dashboard.
     */
    $scope.showHome = function () {
    	 Resources.query('projects', apQuery, apFields, function(result){
	        $scope.myActiveProjects =  result.data;
	        
	        if(result.data.length>0){
	          $scope.hasActiveProjects = true;
	        }
    	 });
    	 $state.go('home');
    };

    /*
     * Navigate to the projects index.
     */
    $scope.showProjects = function () {
      $state.go('projects.index');
    };

    /*
     * Navigate to the projects index.
     */
    $scope.showPeople = function () {
      $state.go('people.index');
    };
    
    /*
     * Navigate to the staffing index.
     */
    $scope.showStaffing = function () {
      $state.go('staffing');
    };

    /*
     * Navigate to the projects index.
     */
    $scope.showAdmin = function () {
      $state.go('admin');
    };
    
    /**
     * Returns a label that represents the project's state
     * 
     * You must pass the startDate,endDate,type and committed
     */
    $scope.projectState = function(project){
    	var ret = 'Unknown';
    	if(project){
    		var today = new Date();
    		var startDate = new Date(project.startDate);
    		var endDate = project.endDate?new Date(project.endDate):new Date();
    		var type = project.type;
    		var committed = project.committed;
    		
    		if(endDate < today){
    			ret = 'Done';
    		}
    		else if(type!='paid'){
    			ret = 'Investment';
    		}
    		else if(!committed){
    			ret = 'Pipeline';
    		}
    		else if(today < startDate){
    			ret = 'Backlog';
    		} 
    		else{
    			ret = 'Active';
    		}
    	}
    	return ret;
    };
    
    /**
     * Get the icon classes associated with a project state
     */
    $scope.projectStateIcon = function(project){
    	var state = $scope.projectState(project);
    	var ret = '';
    	if(state == 'Investment'){
    		ret = 'fa fa-flask';
    	}
    	else if(state == 'Pipeline'){
    		ret = 'fa fa-angle-double-left';
    	}
    	else if(state == 'Backlog'){
    		ret = 'fa fa-angle-left';
    	}
    	else if(state == 'Active'){
    		ret = 'fa fa-angle-up';
    	}
    	else if(state == 'Done'){
    		ret = 'fa fa-times-circle-o';
    	}
    	
    	return ret;
    }

  }]).directive('backImg', function(){
    return function(scope, element, attrs){
      var url = attrs.backImg;
      element.css({
        'background-image': 'url(' + url +')',
        'background-size' : 'cover'
      });
    };
  });
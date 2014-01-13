'use strict';

/*
 * Controller for navigating through areas of Mastermind like its dashboard,
 * projects, people, and roles.
 */
angular.module('Mastermind').controller('AreasCtrl', ['$scope', '$state','Resources',
  function ($scope, $state, Resources) {
	
	//Load my profile for group and role checking
    Resources.refresh('people/me').then(function(me){
	  	 $scope.me = me; 
	  	 
	  	 //If you are a member of the management or exec groups provide access to financial info
    	 if(me.groups && ((me.groups.indexOf('Management') != -1) || (me.groups.indexOf('Executives') != -1))){
    		 $scope.financeAccess=true;
    		 $scope.adminAccess = true;
    	 }
    	 
    	 //console.log('Logged In');
    	 $scope.authState = true;
    	
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
     * Navigate to the projects index.
     */
    $scope.showAdmin = function () {
      $state.go('admin');
    };
  }]).directive('backImg', function(){
	    return function(scope, element, attrs){
	        var url = attrs.backImg;
	        element.css({
	            'background-image': 'url(' + url +')',
	            'background-size' : 'cover'
	        });
	    };
	});
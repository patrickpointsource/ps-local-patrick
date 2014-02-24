'use strict';

describe('Controller: MainCtrl', function () {

	var projectsDecorator = function($delegate) {
        var getActiveProjects = function() {
           
            //var result = $delegate.getActiveProjects();
			var result = [];
            
			console.log('projects:result:' + result)
            return result;
        };
		
		var getProjectsBacklog = function() {
            //var result = $delegate.getProjectsBacklog();
			var result = [];
			
			console.log('projects:result:' + result)
            return result;
		}
 
        return {
          getActiveProjects: getActiveProjects,
		  getProjectsBacklog: getProjectsBacklog
        };
    };
	
  // load the controller's module
  beforeEach( function() {
	module('Mastermind');
	
    var mm = angular.module('Mastermind');
	mm.config(["$provide", function ($provide) {
		$provide.decorator("ProjectsService", projectsDecorator);
    }]);
  });

  var MainCtrl,
    scope;
	
	
	
  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
	console.log('scope:' + scope)
    MainCtrl = $controller('MainCtrl', {
      $scope: scope
    });
  }));

  it('Quick View should default to projects2', function () {
    expect(scope.summarySwitcher).toEqual('projects');
  });
});

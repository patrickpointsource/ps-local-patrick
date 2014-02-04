'use strict';

describe('Controller: MainCtrl', function () {

  // load the controller's module
  beforeEach( function() {
    module('Mastermind');
  });

  var MainCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MainCtrl = $controller('MainCtrl', {
      $scope: scope
    });
  }));

  it('Quick View should default to projects', function () {
    expect(scope.summarySwitcher).toEqual('projects');
  });
});

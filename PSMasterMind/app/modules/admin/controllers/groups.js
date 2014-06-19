'use strict';

/**
 * Controller for handling the Groups tab in admin.
 */
angular.module('Mastermind').controller('GroupsCtrl',['$scope', 
                                                      '$rootScope', 
                                                      '$filter', 
                                                      'Resources', 
                                                      '$state', 
                                                      '$stateParams', 
                                                      'ngTableParams',
                                            function ($scope, 
                                            		  $rootScope, 
                                            		  $filter, 
                                            		  Resources, 
                                            		  $state, 
                                            		  $stateParams, 
                                            		  ngTableParams) {
   
	    
	    /**
	     * Get the list of people
	     * if person belongs in group, inject them into the group object
	     * 
	     * Currently Hard coded as {'Executives', 'Management', 'Project Management', 'Sales'}
	     */
	    
	    Resources.refresh('people').then(function(result){
	        $scope.members = result.members;
	        $scope.memberCount = result.count;
	        $scope.groups = [{label: 'Executives', members: []}, 
	    	                 {label: 'Management', members: []}, 
	    	                 {label: 'Project Management', members: []}, 
	    	                 {label: 'Sales', members: []}];
	        //Map the labels of the groups so I can match faster
	        var groupsMap = {};
	        $scope.groups.forEach(function(entry) {
	        	groupsMap[entry.label] = entry;
	        	entry.collapsed = true;
	        });
	        
	        // Count the number of entries into groups
	        var rowCount = 0;

	        for ( var i = 0 ; i < $scope.memberCount ; i++ ) {
	            var member = $scope.members[ i ];
	            if(member.groups) {
	            	for (var group in member.groups) {
	            		// Match the group label
	            		var groupLabel = member.groups[ group ];
	            		// push the member into the group
	            		groupsMap[ groupLabel ].members.push(member);
	            		rowCount++;
	            	}
	            }
	        }
	    });
  
  $scope.addToGroupIndex = -1;
	    
  $scope.triggerAddToGroup = function(index) {
	$scope.error = "";
	if(index == $scope.addToGroupIndex) {
		$scope.addToGroupIndex = -1;
		return;
	}
	$scope.addToGroupIndex = index;
	
	$scope.membersToAdd = _.reject($scope.members, function(member) {
	  return _.contains(member.groups, $scope.groups[index].label);
	});
  }
  
  $scope.memberToAddSelected = function() {
	  $scope.memberToAdd = this.memberToAdd;
	  $scope.error = "";
  }
  
  $scope.addMember = function() {
	if($scope.memberToAdd) {
	  var member = _.find($scope.members, function(m) {
	    return m.resource == $scope.memberToAdd;
	  });
		  
	  var groupToAdd = $scope.groups[$scope.addToGroupIndex].label;
		  
	  member.groups.push(groupToAdd);
		  
	  Resources.update( member ).then(function(addedMember) {
		$scope.groups[$scope.addToGroupIndex].members.push(addedMember);
		$scope.membersToAdd = _.reject($scope.membersToAdd, function(m) {
		  return _.contains(m.groups, $scope.groups[$scope.addToGroupIndex].label);
	    });
		$scope.memberToAdd = null;
	  });
	} else {
		$scope.error = "Please choose a member"
	}
  }
  
  $scope.deleteMember = function(member, index) {
	var groupToRemove = $scope.groups[index].label;
	
	var indexToRemove = member.groups.indexOf(groupToRemove);
	
	member.groups.splice(indexToRemove, 1);
	
	Resources.update( member ).then(function(removedMember) {
		$scope.groups[index].members = _.reject($scope.groups[index].members, function(m) {
			return m.resource == member.resource;
		})
		$scope.membersToAdd = _.reject($scope.members, function(m) {
			return _.contains(m.groups, $scope.groups[index].label);
		});
		$scope.memberToAdd = null;
	  });
  }
  
  $scope.collapseGroup = function(index) {
	$scope.groups[index].collapsed = $scope.groups[index].collapsed ? false : true;
  }
}]);


// Minimizes the Management group - added in case they want all collapsed at start
angular.module('Mastermind').controller('groupRowCtrl', ['$scope',
                                            function ($scope) {
	  if ($scope.group.label != 'Management')
	    $scope.groups.$hideRows = true;
}]);

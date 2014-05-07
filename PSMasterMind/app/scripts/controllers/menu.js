'use strict';

/*
 * Controller for navigating through areas of Mastermind like its dashboard,
 * projects, people, and roles.
 */
angular.module('Mastermind').controller('MenuCtrl', ['$scope', '$state','$filter', '$q',
  function ($scope, $state, $filter, $q) {
	//$scope.projectManagementAccess = false;
	
	$scope.menuItems = [ {
		text: "Dashboard",
		value: "home",
		handler: "showHome",
		iconCss: "fa-home",
		isRender: "true"
	}, {
		text: "Projects",
		value: "projects",
		handler: "showProjects",
		iconCss: "fa-briefcase",
		isRender: "true",
		subItems: [ {
			text: "All Statuses",
			value: "allstatuses",
			subheader: true,
			handler: "handleSubitem"
		}, {
			text: "Active",
			value: "active",
			handler: "handleSubitem"
		}, {
			text: "Backlog",
			value: "backlog",
			handler: "handleSubitem"
		}, {
			text: "Pipeline",
			value: "pipeline",
			handler: "handleSubitem"
		}, {
			text: "Investment",
			value: "investment",
			handler: "handleSubitem"
		}, {
			text: "Deal Lost",
			value: "deallost",
			handler: "handleSubitem"
		}, {
			text: "Complete",
			value: "complete",
			handler: "handleSubitem"
		}/*, {
			text: "All Clients",
			value: "allclients",
			subheader: true,
			handler: "handleSubitem"
		}, {
			text: "AlleveNet",
			value: "allevenet",
			handler: "handleSubitem"
		}, {
			text: "AllState Dealer Service",
			value: "allstate",
			handler: "handleSubitem"
		}*/]
		
	}, {
		text: "People",
		value: "people",
		handler: "showPeople",
		iconCss: "fa-users",
		isRender: "true",
		subItems: [ {
			text: "All People",
			value: "allpeople",
			subheader: true,
			handler: "handleSubitem"
		}, {
			text: "Administration",
			value: "administration",
			handler: "handleSubitem"
		}, {
			text: "Business Development",
			value: "businessdevelopment",
			handler: "handleSubitem"
		}, {
			text: "Client Experience Mgmt",
			value: "clientexpierencemgmt",
			handler: "handleSubitem"
		}, {
			text: "Development",
			value: "development",
			handler: "handleSubitem"
		}, {
			text: "Digital Experience",
			value: "digitalexperience",
			handler: "handleSubitem"
		}, {
			text: "Executive Mgmt",
			value: "executivemgmt",
			handler: "handleSubitem"
		}, {
			text: "Sales",
			value: "sales",
			handler: "handleSubitem"
		}]
	}, {
		text: "Staffing",
		value: "staffing",
		handler: "showStaffing",
		iconCss: "fa-tasks",
		isRender: $scope.projectManagementAccess
	}, {
		text: "Administration",
		value: "admin",
		handler: "showAdmin",
		iconCss: "fa-gear",
		isRender: $scope.adminAccess
	}];
	
	$scope.isSubitemSelected = function(subItem) {
		var result = false;
		var val = subItem.value;
		var f = $scope.getActiveAreaFilter();
		var tmp = f ? f.split(','): [];
		
		for (var i = 0; i < tmp.length; i ++) {
			if (tmp[i].trim().toLowerCase() == val) {
				result = true;
				break;
			}
		}
		subItem.active = result;
		
		return result;
	}
	
	$scope.handleClick = function(handler, menuItem, subItem, subIndex) {
		if (this[handler])
			this[handler]();
		else if (handler == "handleSubitem" && subItem){
			
			
			if (!subItem.subheader){
				for (var i = subIndex - 1; menuItem.subItems[i]; i --)
					if (menuItem.subItems[i].subheader) {
						menuItem.subItems[i].active = false;
						break;
					}
						
			} else {
				for (var i = subIndex + 1; menuItem.subItems[i] && !menuItem.subItems[i].subheader; i ++)
					menuItem.subItems[i].active =  !subItem.active;
						
			}
			
			var selected = [];

			subItem.active = !subItem.active;
			
			for (var i = 0; i < menuItem.subItems.length; i ++)
				if (menuItem.subItems[i].active)
					selected.push(menuItem.subItems[i].value)
					
			this[menuItem.handler](selected.join(','))
		}
	}
	
	if (!$scope.additionalClass)
		$scope.additionalClass = 'navbar-inverse visible-xs visible-sm';
  
  }]);
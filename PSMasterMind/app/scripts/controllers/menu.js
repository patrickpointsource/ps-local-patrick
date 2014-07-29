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
		iconCss: "icon-dashboard",
		isRender: "true"
	}, {
		text: "Projects",
		value: "projects",
		handler: "showProjects",
		iconCss: "icon-projects",
		isRender: "true",
		subItems: [ {
			text: "All Statuses",
			value: "all",
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
		}]

	}, {
		text: "People",
		value: "people",
		handler: "showPeople",
		iconCss: "icon-people",
		isRender: "true",
		subItems: [ {
			text: "All People",
			value: "all",
			subheader: true,
			handler: "handleSubitem"
		}, {
			text: "Administration",
			value: "administration",
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
			text: "Architects",
			value: "architects",
			handler: "handleSubitem"
		},{
			text: "Marketing",
			value: "marketing",
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
		}, {
            text: "Inactive",
            value: "inactive",
            handler: "handleSubitem",
            isNotRender: !$scope.projectManagementAccess
        }]
	}, {
		text: "Staffing",
		value: "staffing",
		handler: "showStaffing",
		iconCss: "icon-staffing",
		isRender: $scope.projectManagementAccess
	}, {
		text: "Administration",
		value: "admin",
		handler: "showAdmin",
		iconCss: "icon-admin",
		isRender: $scope.adminAccess
//	}, {
//		text: "Reports",
//		value: "reports",
//		handler: "showReports",
//		iconCss: "icon-reports",
//		isRender: $scope.projectManagementAccess
	}];

	$scope.isSubitemSelected = function(subItem, item) {
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
		/*
		if (!result && !subItem.subheader) {
			var start = _.indexOf(item.subItems, subItem)

			var i = start;

			for (; i >= 0 && !item.subItems[i].subheader; i --){}

			result = item.subItems[i].active;
		}
		*/
		subItem.active = result;

		return result;
	}

	$scope.handleClick = function(e, handler, menuItem, subItem, subIndex) {
		var e = e || window.event;

		if (this[handler]) {
			var li = $(e.target).closest('li');

			li.find('ul.subnavbar').removeClass('hidden');

			this[handler]();
		} else if (handler == "handleSubitem" && subItem){


			if (!subItem.subheader){
				for (var i = subIndex - 1; menuItem.subItems[i]; i --)
					if (menuItem.subItems[i].subheader) {
						menuItem.subItems[i].active = false;
						break;
					}

			} /*else {
				for (var i = subIndex + 1; menuItem.subItems[i] && !menuItem.subItems[i].subheader; i ++)
					menuItem.subItems[i].active =  !subItem.active;

			}*/

			var selected = [];

			subItem.active = !subItem.active;

			for (var i = 0; i < menuItem.subItems.length; i ++)
				if (menuItem.subItems[i].active)
					selected.push(menuItem.subItems[i].value)

			if (_.find(selected, function(v) {return v == "all"}))
				this[menuItem.handler]("all")
			else
				this[menuItem.handler](selected.join(','));


		}



		if (e) {
			e.stopPropagation()
		}
	}

	if (!$scope.additionalClass)
		$scope.additionalClass = 'navbar-inverse visible-xs visible-sm';

  }]);

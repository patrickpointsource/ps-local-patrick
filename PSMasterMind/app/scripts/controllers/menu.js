'use strict';

/*
 * Controller for navigating through areas of Mastermind like its dashboard,
 * projects, people, and roles.
 */
angular.module('Mastermind').controller('MenuCtrl', ['$scope', '$rootScope', '$state','$filter', '$q', 'DepartmentsService',
  function ($scope, $rootScope, $state, $filter, $q, DepartmentsService) {
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
		}]
	}, {
		text: "Calendar",
		value: "calendar",
		handler: "showCalendar",
		iconCss: "icon-calendar",
		isRender: "true"
	}, {
		text: "Staffing",
		value: "staffing",
		handler: "showStaffing",
		iconCss: "icon-staffing",
		isRender: $scope.projectManagementAccess
	}, {
        text: "Reports",
        value: "reports",
        handler: "showReports",
        iconCss: "icon-reports",
        isRender: $scope.projectManagementAccess
    }, {
		text: "Administration",
		value: "admin",
		handler: "showAdmin",
		iconCss: "icon-admin",
		isRender: $scope.adminAccess
    }];

	
	$scope.isSubitemSelected = function(subItem, item) {
		var result = false;
		var val = subItem.value;
		var f = $scope.getActiveAreaFilter();
		var tmp = f ? f.split(','): [];
		var tmpVal;
		
		for (var i = 0; i < tmp.length; i ++) {
			tmpVal = tmp[i].trim().split(':');
			
			if (tmpVal[0].toLowerCase() == val) {
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
	};
	
	$scope.subItemShown = function(menuItem, subItem) {
		var result = !subItem.hidden;
		var anyOtherWithSubItemsSelected = false;
		
		for (var k = 0; subItem.value != 'all' && !anyOtherWithSubItemsSelected && k < menuItem.subItems.length; k ++) {
			if (menuItem.subItems[k] != subItem && menuItem.subItems[k].value != 'all' && $scope.isSubitemSelected(menuItem.subItems[k]) && 
					menuItem.subItems[k].subItems && menuItem.subItems[k].subItems.length > 1)
				anyOtherWithSubItemsSelected = true;
		}
		return result && !anyOtherWithSubItemsSelected || subItem.active;
	};

	$scope.handleClick = function(e, handler, menuItem, subItem, subIndex, hideOtherSubItems) {
		var e = e || window.event;
		if (e) {
			e.stopPropagation();
			e.preventDefault();
		}
		
		if (this[handler]) {
			var li = $(e.target).closest('li');

			if (menuItem &&  menuItem.subItems) {
				// show all subitems
				for (var k = 0; k < menuItem.subItems.length; k ++) {
					menuItem.subItems[k].hidden = false;
				}
			}
			
			li.find('ul.subnavbar').removeClass('hidden');

			this[handler]();
		} else if (handler == "handleSubitem" && subItem){

			if (!subItem.subheader){
				for (var i = subIndex - 1; menuItem.subItems[i]; i --)
					if (menuItem.subItems[i].subheader) {
						menuItem.subItems[i].active = false;
						break;
					}

			} 

			var selected = [];

			subItem.active = !subItem.active;

			var getComplexVal = function(subI) {
				var res = subI.value;
				var vals;
				
				if (subI.subItems && subI.subItems.length > 1) {
					vals = _.map(subI.subItems, function(s) { if (s.active){return s.text} else{return null;}});
					vals = _.filter(vals, function(v) { return v;});
					
					res += ':' + vals.join(';');
				}
				
				return res;
			};
			
			for (var i = 0; i < menuItem.subItems.length; i ++) {
				if (menuItem.subItems[i].active)
					selected.push(getComplexVal(menuItem.subItems[i]));
				
				if (hideOtherSubItems && menuItem.subItems[i] != subItem && menuItem.subItems[i].value != 'all' && !menuItem.subItems[i].active && subItem.active) {
					 menuItem.subItems[i].hidden = true;
				} else
					 menuItem.subItems[i].hidden = false;
			}
			

			if (_.find(selected, function(v) {return v == "all";}))
				this[menuItem.handler]("all");
			else
				this[menuItem.handler](selected.join(','));


		}

	};

	$scope.handleSubcategoryClick = function(e, menuItem, subItem, si) {
		var e = e || window.event;
		if (e) {
			e.stopPropagation();
			e.preventDefault();
		}
		
		si.active = si.active ? false:true;
		
		var getComplexVal = function(subI) {
			var res = subI.value;
			var vals;
			
			if (subI.subItems && subI.subItems.length > 1) {
				vals = _.map(subI.subItems, function(s) { if (s.active){return s.text} else{return null;}});
				vals = _.filter(vals, function(v) { return v;});
				
				res += ':' + vals.join(';');
			}
			
			return res;
		};
		
		var selected = [];
		
		for (var i = 0; i < menuItem.subItems.length; i ++) {
			if (menuItem.subItems[i].active)
				selected.push(getComplexVal(menuItem.subItems[i]));
			
			
		}
		

		if (_.find(selected, function(v) {return v == "all";}))
			this[menuItem.handler]("all");
		else
			this[menuItem.handler](selected.join(','));


	};
	
	if (!$scope.additionalClass)
		$scope.additionalClass = 'navbar-inverse visible-xs visible-sm';
	
	$scope.initMenu = function() {
		DepartmentsService.loadDepartmentCategories().then(function(res) {
			var peopleMenuItem = _.find($scope.menuItems, function(mi) {
				return mi.value == 'people';
			});
			
			var categories = res && res.members ? res.members: res;
			var subItem;
			
			for (var k = peopleMenuItem.subItems.length - 1; k >= 0; k --)
				if (peopleMenuItem.subItems[k].dynamic)
					peopleMenuItem.subItems.splice(k, 1);
			
			for (var k = 0; k < categories.length; k ++) {
				subItem = {
					text: categories[k].name,
					value: categories[k].name.toLowerCase().replace(/\s+/g,'_'),
					handler: "handleSubitem",
					subItems: categories[k].nicknames ? _.map(categories[k].nicknames, function(n) { return {text: n, active: true}}): [],
					dynamic: true
				};
				
				peopleMenuItem.subItems.push(subItem);
			}
			
			peopleMenuItem.subItems.push({
	            text: "Inactive",
	            value: "inactive",
	            handler: "handleSubitem",
	            isNotRender: !$scope.projectManagementAccess,
	            dynamic: true
	        });
			
			 
		});
	};

	$scope.initMenu();
	
	$rootScope.$on('department:created', $scope.initMenu);
	$rootScope.$on('department:updated', $scope.initMenu);
	$rootScope.$on('department:deleted', $scope.initMenu);
	
  }]);

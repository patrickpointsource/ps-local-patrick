/* global Dropbox */
'use strict';

/**
 * Controller for handling the Details form.
 */
angular.module('Mastermind')
    .controller('DepartmentsCtrl', ['$scope', '$rootScope', '$filter', 'Resources', '$state', '$stateParams', 'DepartmentsService', 'People', '$q',
        function ($scope, $rootScope, $filter, Resources, $state, $stateParams, DepartmentsService, PeopleService, $q) {
            $scope.selectedDepartment = {
                isModifiedPeople: false
            };
            $scope.availableDepartments = [];
            $scope.managersList = [];
            $scope.availablePeopleList = [];
            $scope.departmentCodes = [];
            $scope.departmentCategories = [];
            $scope.extendedDepartmentCategories = [];
            $scope.hideDepartmentsSpinner = true;

            $scope.selectedManagerChanged = function (e, item) {
                var tmp;
            };

            $scope.editDepartment = function () {
                $scope.selectedDepartment.isEdit = true;
                $scope.currentDepartmentCodes = ([]).concat($scope.departmentCodes);

                $scope.currentDepartmentCodes.push($scope.selectedDepartment.departmentCode);
                $scope.setSentinel();
            };


            $scope.setSentinel = function () {
                //Watch for model changes
                if ($scope.selectedDepartment.isNew || $scope.selectedDepartment.isEdit || $scope.selectedDepartment.editDepartmentPeople) {
                    //Create a new watch
                    $scope.sentinel = $scope.$watch('selectedDepartment', function (newValue, oldValue) {
                        if (!$rootScope.formDirty &&
                            ( $scope.selectedDepartment.isNew || $scope.selectedDepartment.isEdit || $scope.selectedDepartment.editDepartmentPeople )) {
                            var changedByUser = $scope.hasChangesInFields(
                                ["departmentCategory", "departmentNickname", "departmentManager", "departmentCode", "departmentPeople", "isModifiedPeople"],
                                newValue,
                                oldValue);

                            if (changedByUser) {
                                console.debug('department is now dirty');

                                $rootScope.formDirty = true;
                                $rootScope.departmentEdit = true;
                                $rootScope.dirtySaveHandler = function () {
                                    return $scope.saveDepartmentPeople(true);
                                };
                            }
                        }

                    }, true);
                }
            };

            $scope.resetSentinelDirty = function () {
                $rootScope.formDirty = false;
                delete $rootScope.departmentEdit;
                $rootScope.dirtySaveHandler = function () {

                };
            };

            $scope.hasChangesInFields = function (fields, obj1, obj2) {
                if (fields) {
                    for (var fieldIndex in fields) {
                        var field = fields[fieldIndex];
                        if (field) {
                            var field1 = obj1[field];
                            var field2 = obj2[field];

                            if (_.isBoolean(field1) || _.isBoolean(field2)) {
                                if (field1 != field2) {
                                    return true;
                                }
                            } else {
                                if (field1 && field2) {
                                    var string1 = JSON.stringify(field1).trim();
                                    var string2 = JSON.stringify(field2).trim();
                                    if (string1 != string2) {
                                        return true;
                                    }
                                }
                            }
                        }
                    }
                }
                return false;
            };

            $scope.cancelDepartment = function () {
                if ($scope.selectedDepartmentOrig)
                    $scope.selectedDepartment = _.clone($scope.selectedDepartmentOrig);

                $scope.selectedDepartment.isEdit = false;
                $scope.selectedDepartment.isNew = false;
                $scope.selectedDepartment.isEdit = false;

                $scope.resetSentinelDirty();

                DepartmentsService.loadAvailablePeople().then(function (result) {

                    $scope.availablePeopleList = _.map(result.members, function (p) {
                        return {
                            resource: p.resource,
                            name: Util.getPersonName(p, true)
                        };

                    });

                    $scope.availablePeopleList.sort(function (p1, p2) {
                        if (p1.name > p2.name)
                            return 1;
                        else if (p1.name < p2.name)
                            return -1;
                    });

                });

                // $scope.selectedDepartmentForm.$setPristine();
            };

            $scope.$on("admin:departments", function (event, command) {
                if (command == 'create') {
                    $scope.onCreateDepartment();
                }
            });

            $scope.onCreateDepartment = function (e) {
                e = e ? e : window.event;

                $scope.selectedDepartment = {isNew: true};
                $scope.currentDepartmentCodes = ([]).concat($scope.departmentCodes);
                $scope.selectedDepartmentPeople = [];
                $scope.setSentinel();
            };

            $scope.searchDepartments = function (e) {
                if ($scope.searchDeptStr.length >= 1) {
                    DepartmentsService.searchDepartments($scope.searchDeptStr).then(function (result) {
                        $scope.availableDepartments = result;
                    });
                } else if ($scope.searchDeptStr.length == 0)
                    $scope.loadDepartments();
            };

            $scope.searchAvailablePeople = function (e, childScope) {
                var searchPromise;
                $scope.searchAvaialbleStr = childScope.searchAvaialbleStr;

                if ($scope.searchAvaialbleStr && $scope.searchAvaialbleStr.length >= 1) {
                    searchPromise = DepartmentsService.loadAvailablePeople($scope.searchAvaialbleStr);
                } else
                    searchPromise = DepartmentsService.loadAvailablePeople();

                searchPromise.then(function (result) {
                    $scope.availablePeopleList = _.map(result.members, function (p) {
                        return {
                            resource: p.resource,
                            name: Util.getPersonName(p, true),
                            alreadyAssigned: p.alreadyAssigned
                        };

                    });

                    $scope.availablePeopleList.sort(function (p1, p2) {
                        if (p1.name > p2.name)
                            return 1;
                        else if (p1.name < p2.name)
                            return -1;
                    });
                });

            };

            $scope.selectDepartment = function (e, department) {
                if ($rootScope.formDirty) {
                    var modalYesNoCancel = $(".modalYesNoCancel");
                    $rootScope.modalDialog = {
                        title: "Save Changes",
                        text: "Would you like to save your changes before leaving?",
                        ok: "Yes",
                        no: "No",
                        cancel: "Cancel",
                        okHandler: function () {
                            modalYesNoCancel.modal('hide');
                            $scope.saveDepartmentPeople().then(function () {
                                $scope.selectDepartmentFunc(e, department);
                            });
                        },
                        noHandler: function () {
                            modalYesNoCancel.modal('hide');
                            $scope.selectDepartmentFunc(e, department);
                        },
                        cancelHandler: function () {
                            modalYesNoCancel.modal('hide');
                        }
                    };
                    modalYesNoCancel.modal('show');
                } else {
                    $scope.selectDepartmentFunc(e, department);
                }
            };

            $scope.selectDepartmentFunc = function (e, department) {
                $rootScope.formDirty = false;
                $scope.selectedDepartment = _.extend({}, department);

                $scope.selectedDepartmentOrig = department;

                $scope.selectedDepartment.isNew = false;
                $scope.selectedDepartment.isEdit = false;
                $scope.selectedDepartment.editDepartmentPeople = false;

                $scope.selectedDepartmentPeople = [];

                var found;

                for (var k = 0; $scope.selectedDepartment.departmentPeople && k < $scope.selectedDepartment.departmentPeople.length; k++) {
                    found = _.find($scope.allPeopleList, function (p) {
                        return p.resource == $scope.selectedDepartment.departmentPeople[k];
                    });

                    $scope.selectedDepartmentPeople.push({
                        resource: $scope.selectedDepartment.departmentPeople[k],
                        name: found ? Util.getPersonName(found, true) : ''
                    });
                }

                $scope.selectedDepartmentPeople.sort(function (p1, p2) {
                    if (p1.name > p2.name)
                        return 1;
                    else if (p1.name < p2.name)
                        return -1;
                });
            };

            $scope.onEditDepartmentPeople = function () {
                //$scope.selectedDepartmentPeople = [];
                $scope.departmentPeopleChanged = false;
                $scope.selectedDepartment.editDepartmentPeople = true;
                $scope.searchAvaialbleStr = '';
                $scope.setSentinel();
            };

            $scope.cancelDepartmentPeople = function () {
                $scope.selectedDepartment.editDepartmentPeople = false;
                $scope.selectedDepartment.isModifiedPeople = false;

                $scope.resetSentinelDirty();

                var ind;

                //check for added persons
                for (var k = $scope.selectedDepartmentPeople.length - 1; k >= 0; k--) {
                    ind = _.indexOf($scope.selectedDepartment.departmentPeople, $scope.selectedDepartmentPeople[k].resource);

                    // if persons not in original department people collection - it was added
                    if (ind == -1)
                    //$scope.selectedDepartment.departmentPeople.splice(ind, 1);
                        $scope.selectedDepartmentPeople.splice(k, 1);
                }

                var p;

                // check for removed persons
                for (var k = $scope.selectedDepartment.departmentPeople.length - 1; k >= 0; k--) {
                    p = _.find($scope.selectedDepartmentPeople, function (p) {
                        return p.resource == $scope.selectedDepartment.departmentPeople[k];
                    });

                    // if persons not in currently displayed list but in original department people list - it was removed
                    if (!p) {
                        p = _.find($scope.allPeopleList, function (p) {
                            return p.resource == $scope.selectedDepartment.departmentPeople[k];
                        });

                        $scope.selectedDepartmentPeople.push({
                            resource: $scope.selectedDepartment.departmentPeople[k],
                            name: p ? Util.getPersonName(p, true) : ''
                        });

                    }
                }
            };

            $scope.saveDepartmentPeople = function (navigateOut) {
                var deferred = $q.defer();
                var prevDepartmentPeople = $scope.selectedDepartment.departmentPeople;

                $scope.selectedDepartment.departmentPeople = [];


                var alreadyAssigned = [];

                for (var k = 0; k < $scope.selectedDepartmentPeople.length; k++) {
                    $scope.selectedDepartment.departmentPeople.push($scope.selectedDepartmentPeople[k].resource);

                    if ($scope.selectedDepartmentPeople[k].alreadyAssigned)
                        alreadyAssigned.push($scope.selectedDepartmentPeople[k].resource);
                }

                $scope.hideDepartmentsSpinner = false;

                $scope.saveDepartment(alreadyAssigned).then(function (result) {
                    $scope.selectedDepartment.editDepartmentPeople = false;

                    $scope.hideDepartmentsSpinner = true;

                    if (!result) {
                        $scope.selectedDepartment.departmentPeople = prevDepartmentPeople;
                        $scope.selectedDepartment.editDepartmentPeople = false;
                    } else {
                        $rootScope.formDirty = false;
                        if (navigateOut) {
                            $rootScope.navigateOutFunc();
                        }
                    }


                    deferred.resolve(result);
                });
                return deferred.promise;
            };

            $scope.addDepartmentPerson = function (p) {
                $('.confirm-reassign-person').modal('hide');

                $scope.departmentPeopleChanged = true;
                $scope.selectedDepartment.isModifiedPeople = true;

                if (!$scope.selectedDepartment.departmentPeople)
                    $scope.selectedDepartment.departmentPeople = [];

                //$scope.selectedDepartment.departmentPeople.push(p.resource);
                //$scope.selectedDepartment.departmentPeople = _.uniq( $scope.selectedDepartment.departmentPeople);

                $scope.selectedDepartmentPeople.push(p);

                $scope.availablePeopleList = _.filter($scope.availablePeopleList, function (ap) {
                    return ap.resource != p.resource;
                });

                p.added = true;

                $scope.selectedDepartmentPeople.sort(function (p1, p2) {
                    if (p1.name > p2.name)
                        return 1;
                    else if (p1.name < p2.name)
                        return -1;
                });
            };

            $scope.notAllDataProvided = function () {
                var result = !$scope.selectedDepartment.departmentCategory;

                result = result || !$scope.selectedDepartment.departmentNickname;
                result = result || !$scope.selectedDepartment.departmentCode;

                return result;
            };

            $scope.checkAddDepartmentPerson = function (p) {
                if (p.alreadyAssigned) {
                    $scope.reassignedPerson = p;
                    $('.confirm-reassign-person').modal('show');
                } else {
                    $scope.addDepartmentPerson(p);
                }
            };

            $scope.removeDepartmentPerson = function (person) {
                $scope.departmentPeopleChanged = true;
                $scope.selectedDepartment.isModifiedPeople = true;

                $scope.selectedDepartmentPeople = _.filter($scope.selectedDepartmentPeople, function (p) {
                    return p.resource != person.resource;
                });

                $scope.availablePeopleList.push(person);

                $scope.availablePeopleList.sort(function (p1, p2) {
                    if (p1.name > p2.name)
                        return 1;
                    else if (p1.name < p2.name)
                        return -1;
                });
            };
            /**
             * Add a new task to the server
             */
            $scope.addDepartment = function () {
                DepartmentsService.addDepartment($scope.selectedDepartment).then(function () {
                    $scope.loadDepartments().then(function (result) {
                        //Reset New Role Object
                        $scope.selectedDepartment = {};


                        //Clear New Role Form
                        $scope.selectedDepartmentForm.$setPristine();
                        $rootScope.$emit('department:created');

                    });
                });
            };

            $scope.extendCategories = function (categories) {
                if (!_.find(categories, {trimmedValue: 'all'})) {
                    categories = categories.slice();

                    categories.unshift({
                        name: 'All Categories',
                        trimmedValue: 'all'
                    });
                }

                return categories;
            };

            $scope.filterDepartmentBeforeSave = function (department) {
                delete department.id;
                delete department.rev;
                delete department.ok;
                delete department.editDepartmentPeople;
                delete department.editDepartmenPeople;
                delete department.isEdit;
                delete department.isNew;
                delete department.isModifiedPeople;
                delete department.hidden;

                if (_.isString(department.departmentManager)) {
                    delete department.departmentManager;
                }
                /*
                 if (!department.departmentCategory)
                 if (department.departmentCategory) = {};
                 */
                if (department.departmentCategory) {
                    delete department.departmentCategory._id;
                    delete department.departmentCategory._rev;
                    delete department.departmentCategory.form;
                    delete department.departmentCategory.about;
                    delete department.departmentCategory.nicknames;
                    delete department.departmentCategory.TrimmedValue;
                }

                if (department.departmentCategory && department.departmentCategory.isEmptyCategory !== undefined)
                    delete department.departmentCategory.isEmptyCategory;

                return department;
            };

            /**
             * Update Department on the server
             */
            $scope.saveDepartment = function (alreadyAssigned, cb) {
                var deferred = $q.defer();
                var result = true;

                var correctCode = $scope.currentDepartmentCodes ?
                (_.filter($scope.currentDepartmentCodes, function (c) {
                    return c.name == $scope.selectedDepartment.departmentCode.name
                })).length > 0 : true;

                if (correctCode) {
                    var promise;

                    if (alreadyAssigned && alreadyAssigned.length > 0)
                        promise = DepartmentsService.unassignPeople(alreadyAssigned);


                    if (!$scope.selectedDepartment.isNew && promise)
                        promise = promise.then(function () {
                            return Resources.update($scope.filterDepartmentBeforeSave($scope.selectedDepartment))
                        });
                    else if (!$scope.selectedDepartment.isNew && !promise)
                        promise = Resources.update($scope.filterDepartmentBeforeSave($scope.selectedDepartment));
                    else if ($scope.selectedDepartment.isNew && promise)
                        promise = promise.then(function () {
                            return DepartmentsService.addDepartment($scope.filterDepartmentBeforeSave($scope.selectedDepartment))
                        });
                    else if ($scope.selectedDepartment.isNew && !promise)
                        promise = DepartmentsService.addDepartment($scope.filterDepartmentBeforeSave($scope.selectedDepartment))


                    //promises.push(DepartmentsService.addDepartment($scope.selectedDepartment));

                    promise.then(function (updated) {
                        $scope.selectedDepartment = Util.syncRevProp(updated);
                        $scope.selectedDepartment.isEdit = false;
                        $scope.selectedDepartment.isNew = false;
                        $rootScope.formDirty = false;

                        if (cb)
                            cb();

                        $scope.loadDepartments().then(function (result) {

                        });

                        $rootScope.$emit('department:updated');
                    });

                } else
                    result = false;

                if (promise)
                    promise.then(function () {
                        Resources.refresh("departments/available/people").then(function (availablePeople) {
                            var tmpPerson;

                            $scope.availablePeopleList = _.map(availablePeople.members, function (p) {
                                return {
                                    resource: p.resource,
                                    name: Util.getPersonName(p, true)
                                };

                            });

                            //$scope.availablePeopleList.splice(0, $scope.availablePeopleList.length - 7);
                            $scope.availablePeopleList.sort(function (p1, p2) {
                                if (p1.name > p2.name)
                                    return 1;
                                else if (p1.name < p2.name)
                                    return -1;
                            });

                            DepartmentsService.loadDepartmentCodes().then(function (res) {
                                $scope.departmentCodes = _.isArray(res) ? res : res.members;
                                deferred.resolve(result);
                            });

                        });


                    });


                return deferred.promise;
            };

            /**
             * Delete department
             */
            $scope.deleteDepartment = function () {
                $('.confirm-delete-department').modal('show');
            };

            $scope.onDeleteDepartmentCb = function () {
                return DepartmentsService.removeDepartment($scope.selectedDepartment.resource).then(function () {
                    $scope.selectedDepartment = {};
                    $scope.loadDepartments();

                    $rootScope.$emit('department:deleted');
                    $('.confirm-delete-department').modal('hide');
                });
            };


            $scope.loadDepartments = function () {
                $scope.hideDepartmentsSpinner = false;

                return DepartmentsService.refreshDepartments().then(function (result) {
                    for (var k = 0; k < result.length; k++) {
                        if (result[k].departmentPeople)
                            result[k].departmentPeople = _.map(result[k].departmentPeople, function (dp) {
                                return dp.replace('departments/people', 'people/');
                            });

                        $scope.checkDepartmentCategory(result[k]);
                    }

                    result = $scope.sortDepartments(result);

                    $scope.hideDepartmentsSpinner = true;
                    $scope.availableDepartments = result;

                    return result;
                });
            };

            $scope.checkDepartmentCategory = function (department) {
                if ($scope.departmentCategories) {
                    var val = department.departmentCategory.trimmedValue;
                    department.departmentCategory.isEmptyCategory = !_.find($scope.departmentCategories, function (c) {
                        return c.trimmedValue == val;
                    });
                }
            };

            $scope.sortDepartments = function (departments) {
                return _.sortBy(departments, function (dept) {
                    if (dept.departmentCode && dept.departmentCategory && !dept.departmentCategory.isEmptyCategory)
                        return dept.departmentCode.name;
                    else
                        return "z";
                });
            };

            /**
             * Departments categories
             */
            $scope.selectedCategory = {
                trimmedValue: 'all'
            };

            $scope.cleanCategoryBeforeSave = function (category) {
                category = _.extend({}, category);

                //if (!category.name)
                category.name = category.trimmedValue;

                delete category.isNew;
                delete category.isEdit;
                delete category.value;
                delete category.TrimmedValue;

                return category;
            };

            $scope.onCategoryChanged = function (e, childScope) {
                e = e ? e : window.event;

                if (!$scope.selectedCategory) {
                    var ind = $('select[name="departmentCategories"]').get(0) ? $('select[name="departmentCategories"]').get(0).selectedIndex : -1;

                    if (ind > -1) {
                        $scope.selectedCategory = $scope.departmentCategories[ind];
                    }
                }

                $scope.selectedCategory = childScope.selectedCategory;

                _.each($scope.availableDepartments, function (dep) {
                    var val = $scope.selectedCategory ? dep.departmentCategory.trimmedValue : '';
                    dep.hidden = !($scope.selectedCategory.trimmedValue == val || $scope.selectedCategory.trimmedValue == 'all');

                });
            };

            $scope.onCreateCategory = function (e) {
                $scope.selectedCategory = {isNew: true, isEdit: true};
            };

            $scope.saveDepartmentCategory = function (e) {
                var promise;

                $scope.hideDepartmentsSpinner = false;

                if ($scope.selectedCategory.isNew && $scope.selectedCategory.isEdit && $scope.selectedCategory.trimmedValue) {
                    promise = DepartmentsService.addDepartmentCategory($scope.cleanCategoryBeforeSave($scope.selectedCategory));
                } else if (!$scope.selectedCategory.isNew && $scope.selectedCategory.isEdit && $scope.selectedCategory.trimmedValue) {
                    promise = DepartmentsService.updateDepartmentCategory($scope.cleanCategoryBeforeSave($scope.selectedCategory));
                }

                if (promise)
                    promise.then(function () {
                        DepartmentsService.loadDepartmentCategories().then(function (res) {
                            $scope.departmentCategories = res && res.members ? res.members : res;
                            $scope.extendedDepartmentCategories = $scope.extendCategories($scope.departmentCategories);

                            $scope.selectedCategory = {
                                trimmedValue: 'all'
                            };
                        }).then(function () {
                            $scope.onCategoriesLoaded();
                        });
                    }).then(function () {
                        // refresh departments to hide "empty category" warnings if needed
                        $scope.loadDepartments();
                        $scope.hideDepartmentsSpinner = true;

                        $rootScope.$emit('department:categories:changed');
                    }).catch(function () {
                        $scope.selectedCategory = {
                            trimmedValue: 'all'
                        };
                        $scope.hideDepartmentsSpinner = true;
                    });
                else
                    $scope.hideDepartmentsSpinner = true;

            };

            $scope.onEditCategory = function (e) {
                $scope.selectedCategory.isEdit = true;
            };

            $scope.onDeleteCategory = function (e) {
                $scope.deleteCategoryName = $scope.selectedCategory.name;

                $('.confirm-delete-category').modal('show');

            };

            $scope.onDeleteCategoryCb = function () {
                var codes = $scope.getDepartmentsCodeForCategory($scope.selectedCategory.trimmedValue);

                $scope.hideDepartmentsSpinner = false;

                if (codes.length == 0) {
                    DepartmentsService.removeDepartmentCategory($scope.selectedCategory.resource).then(function () {
                        DepartmentsService.loadDepartmentCategories().then(function (res) {
                            $scope.departmentCategories = res && res.members ? res.members : res;
                            $scope.extendedDepartmentCategories = $scope.extendCategories($scope.departmentCategories);

                            $scope.selectedCategory = {
                                trimmedValue: 'all'
                            };
                            // hide delete confirm dialog
                            $('.confirm-delete-category').modal('hide');
                        }).then(function () {
                            // refresh departments to hide "empty category" warnings if needed
                            $scope.loadDepartments();
                            $rootScope.$emit('department:categories:changed');
                        }).then(function () {
                            $scope.onCategoriesLoaded();
                            $scope.hideDepartmentsSpinner = true;
                        });
                    });
                } else {
                    $('.confirm-delete-category').modal('hide');

                    $scope.departmentCodesToReassign = '';

                    if (codes.length > 1) {
                        $scope.departmentCodesToReassign = codes[codes.length - 2] + ' and ' + codes[codes.length - 1];

                        codes = codes.splice(0, codes.length - 2);

                        $scope.departmentCodesToReassign = codes.join(', ') + (codes.length > 0 ? ', ' : '') + $scope.departmentCodesToReassign;

                    } else
                        $scope.departmentCodesToReassign = codes[0];

                    $('.restrict-delete-department').modal('show');
                    $scope.hideDepartmentsSpinner = true;
                }
            };

            $scope.getDepartmentsCodeForCategory = function (categoryValue) {

                var deps = _.filter($scope.availableDepartments, function (dep) {
                    return dep.departmentCategory && dep.departmentCategory.trimmedValue && dep.departmentCategory.trimmedValue == categoryValue;
                });

                return _.map(deps, function (dep) {
                    return dep.departmentCode.name;
                });
            };

            $scope.onCategoriesLoaded = function () {
                for (var k = 0; k < $scope.availableDepartments.length; k++)
                    $scope.checkDepartmentCategory($scope.availableDepartments[k]);

                $scope.availableDepartments = $scope.sortDepartments($scope.availableDepartments);
            };

            $scope.initDepartments = function () {
                if ($scope.managersList.length == 0)
                    Resources.refresh("people/bytypes/byGroups", {group: "Managers"}).then(
                        function (result) {
                            for (var i = 0; result && result.members && i < result.members.length; i++) {
                                var manager = result.members[i];

                                $scope.managersList.push({
                                    name: Util.getPersonName(manager, true),
                                    resource: manager.resource
                                });

                            }

                            $scope.managersList.sort(function (m1, m2) {
                                if (m1.name.toLowerCase() < m2.name.toLowerCase())
                                    return -1;
                                else if (m1.name.toLowerCase() > m2.name.toLowerCase())
                                    return 1;

                            });
                        }
                    );

                if ($scope.availablePeopleList.length == 0)
                //PeopleService.getAllActivePeople().then(function(result) {
                    Resources.refresh("departments/available/people").then(function (result) {
                        var tmpPerson;

                        $scope.availablePeopleList = _.map(result.members, function (p) {
                            return {
                                resource: p.resource,
                                name: Util.getPersonName(p, true)
                            };

                        });

                        $scope.availablePeopleList.sort(function (p1, p2) {
                            if (p1.name > p2.name)
                                return 1;
                            else if (p1.name < p2.name)
                                return -1;
                        });

                    });

                if ($scope.departmentCodes.length == 0)
                    DepartmentsService.loadDepartmentCodes().then(function (res) {
                        $scope.departmentCodes = _.isArray(res) ? res : res.members;
                    });

                if ($scope.departmentCategories.length == 0)
                    DepartmentsService.loadDepartmentCategories().then(function (res) {
                        $scope.departmentCategories = res && res.members ? res.members : res;
                        $scope.extendedDepartmentCategories = $scope.extendCategories($scope.departmentCategories);
                    }).then(function () {
                        $scope.onCategoriesLoaded();
                    });

                if (!$scope.allPeopleList || $scope.allPeopleList.length == 0)
                    PeopleService.getAllActivePeople().then(function (result) {
                        $scope.allPeopleList = result.members;
                    });

                $scope.loadDepartments().then(function (departments) {
                    $scope.availableDepartments = departments;

                    for (var k = 0; k < departments.length; k++) {
                        if (departments[k].departmentPeople)
                            departments[k].departmentPeople = _.map(departments[k].departmentPeople, function (dp) {
                                return dp.replace('departments/people', 'people/');
                            });
                    }
                });
            };

            $scope.initDepartments();

        }]);
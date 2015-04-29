/* global Dropbox */
'use strict';

/**
 * Controller for handling the Details form.
 */
angular.module('Mastermind')
    .controller('TasksCtrl', ['$scope', '$rootScope', '$filter', 'Resources', '$state', '$stateParams', 'TasksService', '$location', 'ngTableParams',
        function ($scope, $rootScope, $filter, Resources, $state, $stateParams, TasksService, $location, TableParams) {


            $scope.newTask = {};

            $scope.cancelTask = function () {
                if ($('#newTaskDialog').hasClass('in')) {
                    $('#newTaskDialog').collapse('hide');
                }
                $scope.newTask = {};
                $scope.editingTask = false;
                $scope.editTaskIndex = null;

                //Clear New Task Form
                $scope.newTaskForm.$setPristine();
            };

            /**
             * Add a new task to the server
             */
            $scope.addTask = function () {
                Resources.create('tasks', $scope.newTask).then(function () {
                    $scope.loadTasks().then(function (result) {
                        //Reset New Role Object
                        $scope.newTask = {};

                        $scope.editingTask = false;
                        $scope.editTaskIndex = null;

                        //Clear New Role Form
                        $scope.newTaskForm.$setPristine();

                        //Close the new role dialog instance
                        if ($('#newTaskDialog').hasClass('in')) {
                            $('#newTaskDialog').collapse('hide');
                        }
                    });
                });
            };

            /**
             * Update a new Role to the server
             */
            $scope.saveTask = function () {
                Resources.update($scope.newTask).then(function () {
                    $scope.loadTasks().then(function (result) {
                        //Reset New Role Object
                        $scope.newTask = {};

                        $scope.editingTask = false;
                        $scope.editTaskIndex = null;

                        //Clear New Role Form
                        $scope.newTaskForm.$setPristine();
                    });
                });
            };

            /**
             * Delete a task
             */
            $scope.deleteTask = function (taskURL) {
                Resources.remove(taskURL).then(function () {
                    $scope.loadTasks();
                });
            };

            /**
             * When the new role button is clicked
             */
            $scope.toggleNewTask = function () {
                //Cancel edit of new role
                if ($scope.editTaskIndex === null && $scope.editingTask) {
                    $scope.cancelTask();
                }
                else {
                    $scope.editTaskIndex = null;
                    $scope.editingTask = true;
                    $scope.newTask = {};


                }
            };

            /**
             * Run when an edit on a row is clicked
             */
            $scope.triggerEditTask = function (role, index) {
                if ($scope.editTaskIndex === index) {
                    $scope.cancelTask();
                }
                else {
                    $scope.editingTask = true;
                    $scope.editTaskIndex = index;
                    //Close the new role dialog instance
                    if ($('#newTaskDialog').hasClass('in')) {
                        $('#newTaskDialog').collapse('hide');
                    }
                    $scope.newTask = role;
                }
            };

            $scope.loadTasks = function (index, role) {
                return TasksService.refreshTasks().then(function (tasks) {
                    $scope.availableTasks = tasks;
                });
            };


            $scope.loadTasks();

        }]);

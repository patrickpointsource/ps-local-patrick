/**
 * Created by kenhoes on 4/1/14.
 */
angular.module('Mastermind').controller('HoursCtrl', ['$scope', '$state', '$rootScope', 'Resources', 'ProjectsService',
    function ($scope, $state, $rootScope, Resources, ProjectsService) {

        /**
         * TODO THIS SECTION REQUIRES CLEANUP AND MODULARIZATION
         * TODO set up hour submission
         * TODO make the calendar scroll left/right
         * TODO save to MongoDB
         */
        $scope.newHoursRecord;
        $scope.entryFormOpen = false; //default open status of hours entry form
        //$scope.requestedDayHours = {"project": {"resource": "projects/5332d4ef036462ce38b2072d"}, "person": {"resource": "people/5331988a0364acc9309b1e8a"}, "etag": "0", "_id": {"$oid": "533473710364fdb301cbfa51"}, "created": "Thu Mar 27 14:52:33 EDT 2014", "hours": 10, "description": "hours", "resource": "hours/533473710364fdb301cbfa51", "date": "2014-03-25", "$$hashKey": "00V", "name": "Dakota", "oid": "5331b52d0364acc9309b1ece", "customerName": "Dakota"};
        $scope.openHoursEntry = function (day) {

            $scope.selected = day;
            console.log(day);
            $scope.entryFormOpen = true;


            //set value of hidden date field in form to selected date value
            $scope.newHoursRecord.date = day.date;
            console.log($scope.newHoursRecord.date);
        };

        //keep track of which day is selected
        $scope.isSelected = function (day) {
            return $scope.selected === day;
        }






        ProjectsService.getOngoingProjects(function (result) {
            $scope.ongoingProjects = result.data;

            ProjectsService.getMyCurrentProjects($scope.me).then(function (myCurrentProjects) {
                $scope.myProjects = myCurrentProjects.data;

                if ($scope.myProjects.length > 0) {
                    $scope.hasActiveProjects = true;
                }

                var myProjects = [];
                for (var m = 0; m < $scope.myProjects.length; m++) {
                    var myProj = $scope.myProjects[m];
                    var found = undefined;
                    myProj.title = myProj.customerName + ': ' + myProj.name;
                    myProjects.push(myProj);

                    for (var n = 0; n < $scope.ongoingProjects.length; n++) {
                        var proj = $scope.ongoingProjects[n];
                        if (proj.resource == myProj.resource) {
                            $scope.ongoingProjects.splice(n, 1);
                            break;
                        }
                    }
                }

                myProjects.sort(function (item1, item2) {
                    if (item1.title < item2.title)
                        return -1;
                    if (item1.title > item2.title)
                        return 1;
                    return 0;
                });

                var otherProjects = [];
                while ($scope.ongoingProjects.length > 0) {
                    var myProj = $scope.ongoingProjects.pop();
                    myProj.title = myProj.customerName + ': ' + myProj.name;
                    otherProjects.push(myProj);
                }

                otherProjects.sort(function (item1, item2) {
                    if (item1.title < item2.title)
                        return -1;
                    if (item1.title > item2.title)
                        return 1;
                    return 0;
                });

                $scope.hoursProjects = myProjects.concat(otherProjects);
                //console.log($scope.hoursProjects);
            });
        });


        //MOVE THIS TO FORM CONTROLLER WHEN READY
        $scope.addNewHours = function () {
            $scope.requestedDayHours.push({client: '', hours: null, description: ''});
        };

        //date formatter helper
        $scope.formatTheDate = function (d) {
            var dd = d.getDate();
            var mm = d.getMonth() + 1;
            var yyyy = d.getFullYear();
            if (dd < 10) {
                dd = '0' + dd;
            }
            if (mm < 10) {
                mm = '0' + mm;
            }
            $scope.theDayFormatted = yyyy + '-' + mm + '-' + dd;
        }



        var me = $scope.me;
        $scope.getHours = function () {
            var query = {
                "person.resource": me.about
            };
            var fields = {
                date: 1, hours: 1
            }
            Resources.query('hours', query, fields, function (result) {
                console.log(result.members);
            })
        }
        //$scope.getHours();

        //control time
        $scope.dateIndex = 0;
        $scope.backInTime = function() {
            $scope.dateIndex = $scope.dateIndex + 7;
            $scope.getDisplayedHours();

        }
        $scope.forwardInTime = function() {
            $scope.dateIndex = $scope.dateIndex -7;
            $scope.getDisplayedHours();

        }
        $scope.thisWeek = function() {
            $scope.dateIndex = 0;
            $scope.getDisplayedHours();
        }



        //TODO task: get this week of dates
        $scope.showWeekDates = function (callback) {
            //get the number of days since monday
            var day = $scope.startDate.getDay();
            console.log(day);
            var monday = ((day - 1)+$scope.dateIndex);

            //array to hold the dates
            $scope.thisWeekDates = [];


            //run through and build out the array of the week's dates
            for (var i = 0; i < 7; i++) {
                var d = new Date();
                d.setDate((d.getDate() - monday) + i);
                $scope.formatTheDate(d);
                $scope.thisWeekDates.push($scope.theDayFormatted);
            }
            callback($scope.thisWeekDates);
            //console.log($scope.thisWeekDates);
        }

        //TODO Build hours array for entire shown week


        $scope.getDisplayedHours = function (callback) {
            $scope.allHours = [];
            var user = $scope.me.about;
            var thisWeekDates = $scope.thisWeekDates;

            $scope.showWeekDates(function (datesArray) {
                console.log(datesArray);

                var query = {
                    "person.resource": user,
                    $and: [
                        {
                            "date": {
                                $in: datesArray
                            }
                        }
                    ]
                };
                var fields = {

                };

                var dateLength = datesArray.length;
                var daysOfTheWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
                //set up the allHours array to hold all requested hours
                for (var i = 0; i < dateLength; i++) {
                    var obj = {}
                    obj.date = datesArray[i];
                    obj.hoursEntries = [];
                    obj.day = "";
                    obj.totalHours = 0;
                    obj.day = daysOfTheWeek[i];
                    $scope.allHours.push(obj);
                }

                Resources.query('hours', query, fields, function (result) {
                    //add hour entries to each date
                    for (var i = 0; i < dateLength; i++) {
                        for (var j = 0; j < result.members.length; j++) {
                            if (result.members[j].date === datesArray[i]) {
                                var hourEntryObj = {}
                                hourEntryObj.date = result.members[j].date;
                                hourEntryObj.hours = result.members[j].hours;
                                hourEntryObj.project = result.members[j].project;
                                hourEntryObj.description = result.members[j].description;
                                //console.log(hourEntryObj);
                                $scope.allHours[i].hoursEntries.push(hourEntryObj);
                            }
                        }
                    }

                    //sum the total hours for each date and grab project IDs for use in retrieving project names
                    $scope.requestedProjectsIds = [];
                    $scope.requestedProjects = [];
                    for(var i=0; i<$scope.allHours.length; i++ ) {
                        var hoursEntryLength = $scope.allHours[i].hoursEntries.length;
                        for (var j=0; j<hoursEntryLength; j++) {
                            //build array of project IDs for project name retrieval next
                            //console.log($scope.allHours[i].hoursEntries[j].project.resource);
                            var resourceID = $scope.allHours[i].hoursEntries[j].project.resource;
                            var resourceIDStripped = resourceID.substring(resourceID.lastIndexOf('/') + 1)
                            var oid = {$oid: resourceIDStripped};


                            $scope.requestedProjects.push(oid);

                            //sum the hours
                            if($scope.allHours[i].date === $scope.allHours[i].hoursEntries[j].date) {
                                $scope.allHours[i].totalHours = $scope.allHours[i].totalHours + $scope.allHours[i].hoursEntries[j].hours;
                            }
                        }
                    }

                    //TODO set human readable project names, place in a callback or promise
                    //build query to get the project names
                    var query = {
                        "_id": {
                            $in: $scope.requestedProjects
                        }
                    };
                    var fields = {
                        name: 1, customerName: 1, resource: 1
                    }
                    Resources.query('projects', query, fields, function (result) {
                       console.log(result.data);
                        var projectsLength = result.data.length;
                        for(var i=0; i<$scope.allHours.length; i++ ) {
                            var hoursEntryLength = $scope.allHours[i].hoursEntries.length;
                            //go through each hoursEntry
                            for (var j=0; j<hoursEntryLength; j++) {
                                for(var k=0; k< projectsLength; k++) {
                                    if ($scope.allHours[i].hoursEntries[j].project.resource === result.data[k].resource) {
                                        $scope.allHours[i].hoursEntries[j].name = result.data[k].name;
                                        $scope.allHours[i].hoursEntries[j].customerName = result.data[k].customerName;
                                    }
                                }
                            }
                        }

                    });

                    console.log(result.members);
                    console.warn($scope.allHours);
                })
            })
        }

        $scope.getDisplayedHours();








        $scope.newHoursRecord = {};

        /**
         * Add a new Hours Record to the server
         */
//        $scope.addHours = function () {
//            console.log('clicked addHours')
//            //Set the person context
//            $scope.newHoursRecord.person = {resource: $scope.me.about};
//            console.log($scope.newHoursRecord)
//            Resources.create('hours', $scope.newHoursRecord).then(function(){
//                $scope.newHoursRecord = {};
//            });
//
//            //TODO update scopes to show new hours and count or rerun get day's hours.
//            $scope.openHoursEntry($scope.selected);
//        };

        $scope.addHours = function () {
            console.log('clicked addHours')
            //Set the project context
            $scope.newHoursRecord.project = {resource: $scope.newHoursRecord.project.resource};
            //Set the person context
            $scope.newHoursRecord.person = {resource: $scope.me.about};

            Resources.create('hours', $scope.newHoursRecord).then(function () {
                $scope.initHours();
                $scope.newHoursRecord = {};
                $scope.openHoursEntry($scope.selected);
            });
        };

    }
]);

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

        $scope.entryFormOpen = false; //default open status of hours entry form
        $scope.requestedDayHours = {};
        $scope.openHoursEntry = function (day) {
            $scope.selected = day;
            $scope.entryFormOpen = true;
            $scope.getDayHours(day.date);
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

        //date formatter
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

        //TODO task: get this week of dates
        $scope.thisWeek = function (callback) {
            //get the number of days since monday
            var day = $scope.startDate.getDay();
            var monday = day - 1;

            //array to hold the dates
            $scope.thisWeekDates = [];


            //run through and build out the array of the week's dates
            for (var i = 0; i < 5; i++) {
                var d = new Date();
                d.setDate((d.getDate() - monday) + i);
                $scope.formatTheDate(d);
                $scope.thisWeekDates.push($scope.theDayFormatted);
            }
            callback($scope.thisWeekDates);
            //console.log($scope.thisWeekDates);
        }


        //TODO tie this into the clicked upon day
        $scope.getDayHours = function (requestedDay) {
            var query = {
                "person.resource": $scope.me.about,
                'date': requestedDay
            };
            var fields = {
                // hours : 1, date : 1, "project.resource" : 1, "_id" : 1
            }
            Resources.query('hours', query, fields, function (result) {
                //console.log(result.members);
                $scope.requestedDayHours = result.members;
                //grab each result.members.project.resource put in array
                var memberLength = result.members.length;
                $scope.requestedProjects = [];
                for (i = 0; i < memberLength; i++) {
                    var resourceID = result.members[i].project.resource;
                    var resourceIDStripped = resourceID.substring(resourceID.lastIndexOf('/') + 1)
                    var oid = {$oid: resourceIDStripped};
                    $scope.requestedProjects.push(oid);
                }
               // console.log('requested projects: ' + $scope.requestedProjects);

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
                    console.warn(result.data);
                    var length = result.data.length;
                    for (i=0; i < length; i++) {
                        $scope.requestedDayHours[i]["name"] = result.data[i].name;
                        $scope.requestedDayHours[i]["customerName"] = result.data[i].customerName;
                    }
                    console.log($scope.requestedDayHours)
                });
            });

        };
        $scope.getDayHours();




        //console.log('monday fell on: ' + $scope.thisWeekDates[0]);



        //get all the hours for a person
        //console.log($scope.me);
        var me = $scope.me;
        $scope.getHours = function () {
            var query = {
                "person.resource": me.about
            };
            var fields = {
                date: 1, hours: 1
            }
            Resources.query('hours', query, fields, function (result) {
                //console.log(result.members);
            })
        }
        $scope.getHours();


        $scope.dummyDaysData = [
            {day: "Monday", date: '3/24', hours: 8, entryId: '1234'},
            {day: "Tuesday", date: '3/25', hours: 8, entryId: '1235'},
            {day: "Wednesday", date: '3/26', hours: 8, entryId: '1236'},
            {day: "Thursday", date: '3/27', hours: 8, entryId: '1237'},
            {day: "Friday", date: '3/28', hours: 8, entryId: '1238'}
        ];


        //using the week's dates retrieve the user's whole week's worth of hours.
        $scope.thisWeek(function(thisWeekDates) {
           // console.log('this week days: ' + thisWeekDates);
            var me = $scope.me
            //search hours collection for hours matching these dates and user ID
            var query = {
                "person.resource" : me.about,
                $and : [{
                    "date" : {
                        $in : thisWeekDates
                    }
                }]
            }
            var fields = {

            }
            Resources.query('hours', query, fields, function(result) {
               // console.log(result.members);

                //query projects collection to get common names of projects
                var weekDatesLength = thisWeekDates.length;
                var memberLength = result.members.length;
                $scope.hoursGrid = [];
                var initialHours = 0;
                var foundDates = [];
                var daysOfTheWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
                for (i=0; i<weekDatesLength; i++ ) {
                    var obj = {}
                    obj["date"] = thisWeekDates[i];
                    obj["hours"] = 0;
                    obj["day"] = daysOfTheWeek[i]
                    $scope.hoursGrid.push(obj);

                }
                for (var i=0; i<memberLength; i++) {
                    if($.inArray(result.members[i].date, foundDates) === -1) {
                        //add it to found dates
                        foundDates.push(result.members[i].date)
                    }
                }

                for (i=0; i<$scope.hoursGrid.length; i++) {
                    for(j=0; j<memberLength; j++) {
                        if (result.members[j].date === $scope.hoursGrid[i].date) {
                            $scope.hoursGrid[i].hours = result.members[j].hours + $scope.hoursGrid[i].hours;
                        }
                    }
                }





                for (var i=0; i<foundDates.length; i++) {
                    //console.log('searching records for date: ' + foundDates[i]);
                    var daysHours = 0;
                    for (var j=0; j<memberLength; j++) {
                        if(result.members[j].date === foundDates[i]) {
                            daysHours = daysHours + result.members[j].hours;
                            //console.log('total hours for day: ' + foundDates[i] + ' ' + daysHours);
                            var obj = {}
                            obj["date"] = foundDates[i];
                            obj["hours"] = daysHours;
                            //$scope.hoursGrid.push(obj);
                        }

                    }
                }
               // console.log(foundDates);
               // console.log($scope.hoursGrid)

                $scope.requestedProjects = [];
                for (i = 0; i < memberLength; i++) {
                    var resourceID = result.members[i].project.resource;
                    var resourceIDStripped = resourceID.substring(resourceID.lastIndexOf('/') + 1)
                    var oid = {$oid: resourceIDStripped};
                    $scope.requestedProjects.push(oid);
                }
                //console.log($scope.requestedProjects);

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
                    //console.warn(result.data);
                    var length = result.data.length;
                   // console.log(result.data)
                    for (i=0; i < length; i++) {
                        $scope.requestedDayHours[i]["name"] = result.data[i].name;
                        $scope.requestedDayHours[i]["oid"] = result.data[i]._id.$oid;
                    }
                    //console.log($scope.requestedDayHours)
                });
            });

        });


        $scope.newHoursRecord = {};

        /**
         * Add a new Hours Record to the server
         */
        $scope.addHours = function () {
            console.log('clicked addHours')
            //Set the person context
            $scope.newHoursRecord.person = {resource: $scope.me.about};

//            Resources.create('hours', $scope.newHoursRecord).then(function(){
//                $scope.newHoursRecord = {};
//
//                //Navigate over to the users profile
//                window.location='#'+$scope.me.about;
//            });
        };

    }
]);

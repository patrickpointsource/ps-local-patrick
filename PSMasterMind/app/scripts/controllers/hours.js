/**
 * Created by kenhoes on 4/1/14.
 */
angular.module('Mastermind').controller('HoursCtrl', ['$scope', '$state', '$rootScope', 'Resources', 'ProjectsService', 'HoursService',
    function ($scope, $state, $rootScope, Resources, ProjectsService, HoursService) {
//

        //EXAMPLE of fetch the hours entries for 7 days
//		var today = moment();
//		var oneWeekFromNow = moment().add(1, 'weeks');
//		HoursService.getHoursRecordsBetweenDates($scope.me, today.format('YYYY-MM-DD'), oneWeekFromNow.format('YYYY-MM-DD')).then(function(result){
//			//alert('Success!');
//		});


//        var today = moment();
//        var oneWeekAgo = moment().subtract(1, 'weeks');
//        HoursService.getHoursRecordsBetweenDates($scope.me, oneWeekAgo.format('YYYY-MM-DD'), today.format('YYYY-MM-DD')).then(function (result) {
//            //alert('Success!');
//        });


        $scope.checkForFutureness = function(date) {
            //flux capacitor
            var a = moment();
            var b = moment(date);
            var diff = a.diff(b);

            var futureness;
            if (diff < 0) {
                futureness = true
            } else {
                futureness = false
            }
            return futureness;
        }


        /**
         * TODO THIS SECTION REQUIRES CLEANUP AND MODULARIZATION
         * TODO set up hour submission
         * TODO make the calendar scroll left/right
         * TODO save to MongoDB
         */
        $scope.newHoursRecord;
        //default open status of hours entry form
        $scope.entryFormOpen = false;
        $scope.lastSelectedDay = {};
        $scope.openHoursEntry = function (day) {


            //console.log($scope.selected)

            if ($scope.entryFormOpen && day === $scope.selected) {
                $scope.entryFormOpen = false
                delete $scope.selected;
            } else {
                $scope.selected = day;
                $scope.entryFormOpen = true;
            }


        };

        //keep track of which day is selected
//        $scope.isSelected = function (day) {
//
//           $scope.selected === day;
//        }


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
                //$scope.myProjects = myProjects;
                //console.log($scope.myProjects)
                $scope.hoursProjects = myProjects.concat(otherProjects);
                //console.log($scope.hoursProjects);
            });
        });


        //MOVE THIS TO FORM CONTROLLER WHEN READY
        $scope.addNewHours = function () {
            //console.log('clicked addNewHours');
            //console.log($scope.selected);


            //match date with current hours
            var displayedHoursLength = $scope.displayedHours.length;
            for (var i = 0; i < displayedHoursLength; i++) {
                if ($scope.selected.date === $scope.displayedHours[i].date) {
                    // $scope.activeAddition = $scope.displayedHours[i];
                    $scope.newHoursRecord = {
                        date: $scope.selected.date,
                        description: "",
                        hours: "",
                        person: $scope.me,
                        project: {}
                    };
                    //push the new hours record to the appropriate hoursEntries array
                    //this will cause the UI to update and show a blank field
                    $scope.displayedHours[i].hoursEntries.unshift($scope.newHoursRecord);
                }
            }
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
            var dayFormat = yyyy + '-' + mm + '-' + dd;
            return dayFormat

        }


        var me = $scope.me.about;
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


        //Doc Brown - time travel.
        $scope.dateIndex = 0;
        $scope.backInTime = function () {
            $scope.dateIndex = $scope.dateIndex + 7;
            $scope.entryFormOpen = false;
            delete $scope.selected;
            $scope.hoursRequest();

        }
        $scope.forwardInTime = function () {
            $scope.dateIndex = $scope.dateIndex - 7;
            $scope.entryFormOpen = false;
            delete $scope.selected;
            $scope.hoursRequest();

        }
        $scope.thisWeek = function () {
            $scope.dateIndex = 0;
            $scope.entryFormOpen = false;
            delete $scope.selected;
            $scope.hoursRequest();
        }


        //TODO task: get this week of dates
        $scope.showWeekDates = function (callback) {
            //get the number of days since monday
            var day = $scope.startDate.getDay();
            //console.log($scope.startDate);


            var monday = ((day - 1) + $scope.dateIndex);

            var d = new Date();
            $scope.todaysDate = $scope.formatTheDate(d);
            //console.log($scope.todaysDate);

            //array to hold the dates
            $scope.thisWeekDates = [];


            //run through and build out the array of the week's dates
            for (var i = 0; i < 8; i++) {
                var d = new Date();
                d.setDate((d.getDate() - monday) + i);
                $scope.formatTheDate(d);
                $scope.thisWeekDates.push($scope.theDayFormatted);
            }
            $scope.prettyCalendarFormats($scope.thisWeekDates[0], $scope.thisWeekDates[6]);
            callback($scope.thisWeekDates);
            //console.log($scope.thisWeekDates);
        }

        $scope.months = ['Janurary', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        $scope.prettyCalendarFormats = function (firstDay, lastDay) {
            $scope.prettyCalendarDates = {}
            var d1 = new Date(firstDay);
            d1.setDate(d1.getDate() + 1);
            var day1 = d1.getDate();
            var month1 = $scope.months[d1.getMonth()]
            var month1Short = month1.substring(0, 3)
            $scope.prettyCalendarDates.firstDate = month1Short + ' ' + day1;

            var d2 = new Date(lastDay);
            d2.setDate(d2.getDate() + 1);
            var day2 = d2.getDate();
            var month2 = $scope.months[d2.getMonth()]
            var month2Short = month2.substring(0, 3)
            var year = d2.getFullYear();
            $scope.prettyCalendarDates.lastDate = month2Short + ' ' + day2 + ', ' + year;
            return $scope.prettyCalendarDates;
        }

        $scope.hoursRequest = function () {
            $scope.showWeekDates(function (result) {
                HoursService.getHoursRecordsBetweenDates($scope.me, $scope.thisWeekDates[0], $scope.thisWeekDates[7]).then(function (result) {
                    //console.warn(result);
                    $scope.displayedHours = result;
                    for (var i = 0; i < $scope.displayedHours.length; i++) {
                        $scope.displayedHours[i].totalHours = 0;


                        var futureness = $scope.checkForFutureness($scope.displayedHours[i].date);
                        $scope.displayedHours[i].futureness = futureness;
                        for (var j = 0; j < $scope.displayedHours[i].hoursEntries.length; j++) {
                            if ($scope.displayedHours[i].hoursEntries[j].hoursRecord) {
                                $scope.displayedHours[i].totalHours = $scope.displayedHours[i].totalHours + $scope.displayedHours[i].hoursEntries[j].hoursRecord.hours
                            }
                        }
                    }
                  // console.warn($scope.displayedHours);
                });
            });
        }

        $scope.hoursRequest();

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
            var entries = $scope.selected.hoursEntries;
            var hoursRecords = [];

            for (var i = 0; i < entries.length; i++) {
                //console.log(entries[i].hoursRecord);

                var entry = entries[i];
                if (entry.hoursRecord) {
                    hoursRecords.push(entry.hoursRecord);
                    if (!entry.hoursRecord.person) {
                        entry.hoursRecord.person = {resource: $scope.me.about};
                    }
                    if (!entry.hoursRecord.date) {
                        entry.hoursRecord.date = $scope.selected.date;
                    }
                }
            }

            HoursService.updateHours(hoursRecords).then(function () {
                $scope.entryFormOpen = false;
                delete $scope.selected;

                $scope.hoursRequest();
            });
        };

    }
]);

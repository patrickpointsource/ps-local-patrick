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



		var today = moment();
		var oneWeekAgo = moment().subtract(1, 'weeks');
		HoursService.getHoursRecordsBetweenDates($scope.me, oneWeekAgo.format('YYYY-MM-DD'), today.format('YYYY-MM-DD')).then(function(result){
			//alert('Success!');
		});
	
	
        /**
         * TODO THIS SECTION REQUIRES CLEANUP AND MODULARIZATION
         * TODO set up hour submission
         * TODO make the calendar scroll left/right
         * TODO save to MongoDB
         */
        $scope.newHoursRecord;
        $scope.entryFormOpen = true; //default open status of hours entry form

        $scope.lastSelectedDay = {};
        $scope.openHoursEntry = function (day) {

            $scope.selected = day;
            console.log($scope.selected)

//            if($scope.selected === $scope.lastSelectedDay) {
////                console.log('matched');
////                $scope.selected.length = 0;
////                delete $scope.selected;
////                console.log($scope.selected)
//               //close the panel
//                console.log('matched');
//                $scope.lastSelectedDay.length = {}
//               // $scope.entryForm = false;
//                delete $scope.lastSelectedDay;
//
//
//            } else if($scope.selected !== $scope.lastSelectedDay){
//
//                console.log('no match');
//                $scope.selected = day;
//                $scope.lastSelectedDay = $scope.selected;
////                if ($scope.entryFormOpen) {
////                    $scope.entryForm = false;
////                } else {
////                    $scope.entryFormOpen = true;
////                }
//                $scope.entryFormOpen = true;
//                //create array to hold all assignments and their properties for use if user hasn't entered anything for assigned projects
//
//
//
//
//            }





            //set value of hidden date field in form to selected date value
            $scope.newHoursRecord.date = day.date;
           // console.log($scope.newHoursRecord.date);

        };

        //keep track of which day is selected
//        $scope.isSelected = function (day) {
//
//           $scope.selected === day;
//        }

        $scope.mergeRecursive = function (obj1, obj2, callback) {

            for (var p in obj2) {
                try {
                    // Property in destination object set; update its value.
                    if (obj2[p].constructor == Object) {
                        obj1[p] = $scope.mergeRecursive(obj1[p], obj2[p]);

                    } else {
                        obj1[p] = obj2[p];

                    }

                } catch (e) {
                    // Property in destination object not set; create it and set its value.
                    obj1[p] = obj2[p];

                }
            }
            //return obj1;
            callback(obj1);
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
                //$scope.myProjects = myProjects;
                //console.log($scope.myProjects)
                $scope.hoursProjects = myProjects.concat(otherProjects);
                //console.log($scope.hoursProjects);
            });
        });


        //MOVE THIS TO FORM CONTROLLER WHEN READY
        $scope.addNewHours = function () {
            console.log('clicked addNewHours');
            console.log($scope.selected);

            //match date with current hours
            var allHoursLength = $scope.allHours.length;
            for (var i = 0; i < allHoursLength; i++) {
                if ($scope.selected.date === $scope.allHours[i].date) {
                    $scope.activeAddition = $scope.allHours[i];
                    $scope.newHoursRecord = {
                        customerName: "",
                        date: $scope.selected.date,
                        description: "",
                        hours: "",
                        name: "",
                        project: {
                            resource: ""
                        }
                    };
                    //push the new hours record to the appropriate hoursEntries array
                    //this will cause the UI to update and show a blank field
                    $scope.allHours[i].hoursEntries.push($scope.newHoursRecord);
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
        //$scope.getHours();

        //control time
        $scope.dateIndex = 0;
        $scope.backInTime = function () {
            $scope.dateIndex = $scope.dateIndex + 7;
            $scope.getDisplayedHours();

        }
        $scope.forwardInTime = function () {
            $scope.dateIndex = $scope.dateIndex - 7;
            $scope.getDisplayedHours();

        }
        $scope.thisWeek = function () {
            $scope.dateIndex = 0;
            $scope.getDisplayedHours();
        }


        //TODO task: get this week of dates
        $scope.showWeekDates = function (callback) {
            //get the number of days since monday
            var day = $scope.startDate.getDay();
            console.log($scope.startDate);


            var monday = ((day - 1) + $scope.dateIndex);


            //array to hold the dates
            $scope.thisWeekDates = [];


            //run through and build out the array of the week's dates
            for (var i = 0; i < 8; i++) {
                var d = new Date();
                d.setDate((d.getDate() - monday) + i);
                $scope.formatTheDate(d);
                $scope.thisWeekDates.push($scope.theDayFormatted);
            }
            $scope.prettyCalendarFormats($scope.thisWeekDates[0], $scope.thisWeekDates[6] );
            callback($scope.thisWeekDates);
            //console.log($scope.thisWeekDates);
        }

        $scope.months = ['Janurary', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        $scope.prettyCalendarFormats = function(firstDay, lastDay) {
            $scope.prettyCalendarDates = {}
            var d1 = new Date(firstDay);
            d1.setDate(d1.getDate() + 1);
            var day1 = d1.getDate();
            var month1 = $scope.months[d1.getMonth()]
            var month1Short = month1.substring(0,3)
            $scope.prettyCalendarDates.firstDate = month1Short + ' ' + day1;

            var d2 = new Date(lastDay);
            d2.setDate(d2.getDate() + 1);
            var day2 = d2.getDate();
            var month2 = $scope.months[d2.getMonth()]
            var month2Short = month2.substring(0,3)
            var year = d2.getFullYear();
            $scope.prettyCalendarDates.lastDate = month2Short + ' ' + day2 + ', ' + year;
            return $scope.prettyCalendarDates;
        }

        $scope.showWeekDates(function(result) {
            HoursService.getHoursRecordsBetweenDates($scope.me, $scope.thisWeekDates[0], $scope.thisWeekDates[7]).then(function(result){
                console.warn(result);
                $scope.displayedHours = result;
            });
        });



        //TODO Build hours array for entire shown week


        $scope.getDisplayedHours = function (callback) {
            $scope.allHours = [];
            var user = $scope.me.about;
            var thisWeekDates = $scope.thisWeekDates;

            $scope.showWeekDates(function (datesArray) {
                //console.log(datesArray);

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

                //get the hours records
                Resources.query('hours', query, fields, function (result) {
                    //add hour entries to each date
                    for (var i = 0; i < dateLength; i++) {
                        for (var j = 0; j < result.members.length; j++) {
                            if (result.members[j].date === datesArray[i]) {
                                var hourEntryObj = result.members[j]
//                                hourEntryObj.date = result.members[j].date;
//                                hourEntryObj.hours = result.members[j].hours;
//                                hourEntryObj.project = result.members[j].project;
//                                hourEntryObj.description = result.members[j].description;
                                //console.log(hourEntryObj);
                                //TODO these will be place in hoursEntries.hoursRecord
                                $scope.allHours[i].hoursEntries.push(hourEntryObj);
                            }
                        }
                    }

                    //sum the total hours for each date and grab project IDs for use in retrieving project names
                    $scope.requestedProjectsIds = [];
                    $scope.requestedProjects = [];
                    for (var i = 0; i < $scope.allHours.length; i++) {
                        var hoursEntryLength = $scope.allHours[i].hoursEntries.length;
                        for (var j = 0; j < hoursEntryLength; j++) {
                            //build array of project IDs for project name retrieval next
                            //console.log($scope.allHours[i].hoursEntries[j].project.resource);
                            var resourceID = $scope.allHours[i].hoursEntries[j].project.resource;
                            var resourceIDStripped = resourceID.substring(resourceID.lastIndexOf('/') + 1)
                            var oid = {$oid: resourceIDStripped};


                            $scope.requestedProjects.push(oid);

                            //sum the hours
                            if ($scope.allHours[i].date === $scope.allHours[i].hoursEntries[j].date) {
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
                        $scope.requestedProjectNames = result.data;
                        //console.log($scope.requestedProjectNames);
                        var projectsLength = result.data.length;
                        for (var i = 0; i < $scope.allHours.length; i++) {
                            var hoursEntryLength = $scope.allHours[i].hoursEntries.length;
                            //go through each hoursEntry
                            for (var j = 0; j < hoursEntryLength; j++) {
                                for (var k = 0; k < projectsLength; k++) {
//                                    if ($scope.allHours[i].hoursEntries[j].project.resource === result.data[k].resource) {
//                                        $scope.allHours[i].hoursEntries[j].name = result.data[k].name;
//                                        $scope.allHours[i].hoursEntries[j].customerName = result.data[k].customerName;
//                                    }
                                }
                            }
                        }

                    });
                    $scope.getUserAssignments($scope.me.about, function (result) {
                        //console.log(result)
                        var resultLength = result.length;
                        for (var i = 0; i < resultLength; i++) {

                            var allHoursLength = $scope.allHours.length;
                            for (var j = 0; j < allHoursLength; j++) {

                                var entriesLength = $scope.allHours[j].hoursEntries.length;
                                for (var k = 0; k < entriesLength; k++) {
                                    //console.log($scope.allHours[j].hoursEntries[k].project.resource);
//                                    if ($scope.allHours[j].hoursEntries[k].project.resource === result[i].project.resource) {
//                                        $scope.allHours[j].hoursEntries[k].endDate = result[i].endDate;
//                                        $scope.allHours[j].hoursEntries[k].about = result[i].about;
//                                        $scope.allHours[j].hoursEntries[k].hoursPerWeek = result[i].hoursPerWeek;
//                                        $scope.allHours[j].hoursEntries[k].role = result[i].role;
//                                        $scope.allHours[j].hoursEntries[k].startDate = result[i].startDate;
//                                        $scope.allHours[j].hoursEntries[k].currentlyAssigned = true;
//                                    } else {
//
//                                    }
                                }
                            }
                        }
                    })


                    //console.log(result.members);
                    //console.warn($scope.allHours);
                })
            })
        }

        //$scope.getDisplayedHours();


        //TODO set up assignments query
        //retrieve user assignments (projects) within the date range
        //compare those projects to hours logged for matches

        $scope.getUserAssignments = function (me, callback) {
            var monday = $scope.thisWeekDates[0];
            var sunday = $scope.thisWeekDates[6];
            //console.log('looking for records for: ' + me);
            var query =
            {
                members: {
                    $elemMatch: {
                        "person.resource": me
                    },
                    $elemMatch: {
                        startDate: {
                            $lte: monday
                        },
                        $or: [
                            {
                                endDate: {$exists: false}
                            },
                            {
                                endDate: {$gt: sunday}
                            }
                        ]
                    }
                }
            };

            var fields = {

            }
            $scope.userAssignments = []
            Resources.query('assignments', query, fields, function (result) {
                //console.log(result.data);
                var dataLength = result.data.length;
                for (var i = 0; i < dataLength; i++) {
                    var memberLength = result.data[i].members.length;
                    for (var j = 0; j < memberLength; j++) {
                        //console.log(result.data[i].members[j].person.resource)
                        if (result.data[i].members[j].person.resource === me) {
                            var obj = result.data[i].members[j];
                            obj.project = result.data[i].project;
                            $scope.userAssignments.push(obj);
                        }
                    }
                }
                callback($scope.userAssignments);
            });

        }


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
            //console.log(day);

            $scope.newHoursRecord.project = {resource: $scope.newHoursRecord.project.resource};
            //Set the person context
            $scope.newHoursRecord.person = {resource: $scope.me.about};

            Resources.create('hours', $scope.newHoursRecord).then(function () {
                console.log('saved')

//                $scope.initHours();
//                $scope.newHoursRecord = {};
//                $scope.openHoursEntry($scope.selected);
                $scope.activeAddition.hourEntries.push($scope.newHoursRecord);
            });
        };

    }
]);

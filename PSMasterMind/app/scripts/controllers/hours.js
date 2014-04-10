/**
 * Created by kenhoes on 4/1/14.
 */
angular.module('Mastermind').controller('HoursCtrl', ['$scope', '$state', '$rootScope', 'Resources', 'HoursService', 'ProjectsService',
    function ($scope, $state, $rootScope, Resources, HoursService, ProjectsService) {

		//EXAMPLE of fetch the hours entries for 7 days
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
        $scope.entryFormOpen = false; //default open status of hours entry form


        $scope.openHoursEntry = function (day) {
            $scope.entryFormOpen = true;

            //create array to hold all assignments and their properties for use if user hasn't entered anything for assigned projects
            $scope.zeroHoursAssigned = [];
            $scope.emptyHours = [];

            $scope.selected = day;
            //console.log(day);
            //$scope.selected.hoursEntries.length=0

            //merge the assigned hours and project names together to place an empty hours entry later
            //console.log($scope.emptyHours);
            for (var i = 0; i < $scope.requestedProjectNames.length; i++) {
                for (var j = 0; j < $scope.userAssignments.length; j++) {
                    if ($scope.requestedProjectNames[i].resource === $scope.userAssignments[j].project.resource) {
                        $scope.mergeRecursive($scope.requestedProjectNames[i], $scope.userAssignments[j], function (result) {
                            result.hours = 0;
                            $scope.zeroHoursAssigned.push(result);
                        })

                    }
                }
            }




            //go through hours entries in the selected day and create an array of existing projects that are needed.
            for (var i = 0; i < $scope.selected.hoursEntries.length; i++) {
                for (var j = 0; j < $scope.zeroHoursAssigned.length; j++) {
                    if ($scope.selected.hoursEntries[i].project.resource === $scope.zeroHoursAssigned[j].resource) {
                        //$scope.selected.hoursEntries.unshift($scope.zeroHoursAssigned[j]);
                        //console.log($scope.selected.hoursEntries[i].project.resource)
                        //console.log($scope.zeroHoursAssigned[j].resource)
                        if (jQuery.inArray(j, $scope.emptyHours) === -1) {
                            $scope.emptyHours.push(j);
                        }
                    }
                }
            }

            //remove the existing entries from the assigned list.
            for (var i = 0; i < $scope.emptyHours.length; i++) {
                $scope.zeroHoursAssigned.splice($scope.emptyHours[i], 1);
            }
            //add an empty record for display for each of the missing assigned projects in the hours entries of the day
            for (i = 0; i < $scope.zeroHoursAssigned.length; i++) {
                $scope.selected.hoursEntries.unshift($scope.zeroHoursAssigned[i]);
            }





            //set value of hidden date field in form to selected date value
            $scope.newHoursRecord.date = day.date;
           // console.log($scope.newHoursRecord.date);

        };

        //keep track of which day is selected
        $scope.isSelected = function (day) {
            return $scope.selected === day;
        }

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
            console.log($)

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
                    }
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

            var monday = ((day - 1) + $scope.dateIndex);


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

                Resources.query('hours', query, fields, function (result) {
                    //add hour entries to each date
                    for (var i = 0; i < dateLength; i++) {
                        for (var j = 0; j < result.members.length; j++) {
                            if (result.members[j].date === datesArray[i]) {
                                var hourEntryObj = {};
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
                                    if ($scope.allHours[i].hoursEntries[j].project.resource === result.data[k].resource) {
                                        $scope.allHours[i].hoursEntries[j].name = result.data[k].name;
                                        $scope.allHours[i].hoursEntries[j].customerName = result.data[k].customerName;
                                    }
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
                                    if ($scope.allHours[j].hoursEntries[k].project.resource === result[i].project.resource) {
                                        $scope.allHours[j].hoursEntries[k].endDate = result[i].endDate;
                                        $scope.allHours[j].hoursEntries[k].about = result[i].about;
                                        $scope.allHours[j].hoursEntries[k].hoursPerWeek = result[i].hoursPerWeek;
                                        $scope.allHours[j].hoursEntries[k].role = result[i].role;
                                        $scope.allHours[j].hoursEntries[k].startDate = result[i].startDate;
                                        $scope.allHours[j].hoursEntries[k].currentlyAssigned = true;
                                    } else {

                                    }
                                }
                            }
                        }
                    })


                    //console.log(result.members);
                    //console.warn($scope.allHours);
                })
            })
        }

        $scope.getDisplayedHours();


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
//        	var hoursRecords = [];
//        	for(var i = 0; i < $scope.selected.hoursEntries.length; i++){
//        		var entry = $scope.selected.hoursEntries[i];
//        		var newRecord = {
//        			project: entry.project,
//        			person: entry.person,
//        			hours: entry.hours,
//        			date: entry.date,
//        			description: entry.description
//        		};
//        		if(entry['_id']) newRecord['_id'] = entry['_id'];
//        		if(entry.etag) newRecord.etag = entry.etag;
//        		if(entry.created) newRecord.created = entry.created;
//        		hoursRecords.push(newRecord);
//        	}
        	
        	HoursService.updateHours(hoursRecords).then(function (results) {
        		alert('success!');
        		//$scope.activeAddition.hourEntries.push($scope.newHoursRecord);
        	});
        };

    }
]);

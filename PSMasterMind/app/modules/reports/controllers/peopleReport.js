'use strict';

/**
 * Controller for people report.
 */

angular.module('Mastermind.controllers.reports').controller('PeopleReportCtrl', ['$scope', '$rootScope', '$q', '$state', '$stateParams', '$filter', '$location', '$anchorScroll', 'People', 'ReportExportService', 'Resources',
    function ($scope, $rootScope, $q, $state, $stateParams, $filter, $location, $anchorScroll, People, ReportExportService, Resources) {

        var months = [];

        for (var i = 0; i < 12; i++)
            months.push({index: i, name: moment().month(i).format("MMM")});

        $scope.months = months;

        var years = [];
        var currentYear = moment().year();

        for (var i = 5; i >= 0; i--)
            years.push(currentYear - i);

        for (var i = 1; i <= 5; i++)
            years.push(currentYear + i);

        $scope.years = years;

        $scope.CSVSplitter = ',';

        $scope.choiceLocationLabel = "Select one or more location";

        $scope.reportServicePingInterval = 5000;
        $scope.projectionsGraphData = [];


        $scope.output = {};

        // Summary Section
        var created = moment();

        $scope.output.summary = {};

        $scope.output.reportData = {};

        $scope.exportOptions = {
            allRoles: false,
            csvOnly: false,
            graphsOnly: false
        };

        $scope.scrollTo = function (id, needToScrollUp) {
            $location.hash(id);
            $anchorScroll();
            if (needToScrollUp) {
                setTimeout(function () {
                    window.scrollBy(0, -85);
                }, 10);
            }
        };

        var groupToRolesMap = People.getPeopleGroupMapping();

        $scope.getPersonName = function (person, isSimply, isFirst) {
            return Util.getPersonName(person, isSimply, isFirst);
        };

        $scope.filterRolesByGroup = function (groups) {
            return function (role) {
                if (!$scope.roles)
                    return false;

                if (groups.all)
                    return true;

                for (var group in groups)
                    if (groups[group] && groupToRolesMap[group] && groupToRolesMap[group].indexOf(role.abbreviation) != -1)
                        return true;

                return false;
            };
        };

        Resources.get("roles").then(function (result) {
            if (!result)
                return;

            $scope.roles = _.sortBy(result.members, function (item) {
                return item.title;
            });
        });

        $scope.params = {
            date: {
                range: "week",
                start: moment().format("YYYY-MM-DD"),
                month: $scope.months[moment().month()],
                year: moment().year()
            },
            departments: {},
            fields: {
                peopleHours: {},
                projectionHours: {},
                graphs: {
                    percent: {}
                },
                projectHours: {}
            },
            locations: {},
            output: "none",
            roles: {}
        };

        $scope.selectRoleToExport = function (role) {
            role.isSelected = !role.isSelected;
            var allSelected = true;
            for (var i in $scope.output.peopleDetails.utilizationDetails) {
                if (!$scope.output.peopleDetails.utilizationDetails[i].role.isSelected) {
                    allSelected = false;
                    break;
                }
            }
            $scope.exportOptions.allRoles = allSelected;
        };

        $scope.selectAllRolesToExport = function () {
            var selected = !$scope.exportOptions.allRoles;
            if ($scope.output.peopleDetails) {
                for (var i in $scope.output.peopleDetails.utilizationDetails) {
                    $scope.output.peopleDetails.utilizationDetails[i].role.isSelected = selected;
                }
            }
            $scope.exportOptions.allRoles = selected;
        };

        $scope.selectLocationParent = function (location) {
            if (!$scope.params.locations[location])
                $scope.params.locations.all = false;
        };

        $scope.selectDepartmentParent = function (department) {
            if (!$scope.params.departments[department])
                $scope.params.departments.all = false;

            // Enforces data bind.
            $scope.roles = $scope.roles;
        };

        $scope.selectAllDepartments = function () {
            var selected = $scope.params.departments.all;

            $scope.params.departments.administration =
                $scope.params.departments.architects =
                    $scope.params.departments.clientexperiencemgmt =
                        $scope.params.departments.development =
                            $scope.params.departments.digitalexperience =
                                $scope.params.departments.executivemgmt =
                                    $scope.params.departments.marketing =
                                        $scope.params.departments.sales = selected;

            // Enforces data bind.
            $scope.roles = $scope.roles;
        };

        $scope.selectAllLocations = function () {
            var selected = $scope.params.locations.all;

            $scope.params.locations.onshore =
                $scope.params.locations.chicago =
                    $scope.params.locations.offshore = selected;
        };

        $scope.selectAllProjectHours = function (selected) {
            $scope.params.fields.projectHours.all =
                $scope.params.fields.projectHours.projectedClientHrs =
                    $scope.params.fields.projectHours.projectedInvestHrs =
                        $scope.params.fields.projectHours.actualClientHrs =
                            $scope.params.fields.projectHours.actualInvestmentHrs =
                                $scope.params.fields.projectHours.outOfOffice =
                                    $scope.params.fields.projectHours.overhead =
                                        $scope.params.fields.projectHours.projectedClientUtilization =
                                            $scope.params.fields.projectHours.projectedInvestUtilization =
                                                $scope.params.fields.projectHours.actualClientUtilization =
                                                    $scope.params.fields.projectHours.actualInvestUtilization =
                                                        $scope.params.fields.projectHours.outOfOfficeUtilization =
                                                            $scope.params.fields.projectHours.overheadUtilization = selected;
        };

        $scope.selectAllPeopleHours = function (selected) {
            $scope.params.fields.peopleHours.peopleOnClient =
                $scope.params.fields.peopleHours.peopleOnInvest =
                    $scope.params.fields.peopleHours.utilizationByRole = selected;
        };

        $scope.selectAllProjectionHours = function (selected) {
            $scope.params.fields.projectionHours.clientHrs =
                $scope.params.fields.projectionHours.investHrs =
                    $scope.params.fields.projectionHours.outOfOffice =
                        $scope.params.fields.projectionHours.overhead = selected;
        };

        $scope.selectAllGraphPercentHours = function (selected) {
            $scope.params.fields.graphs.percent.all =
                $scope.params.fields.graphs.percent.overhead =
                    $scope.params.fields.graphs.percent.out = selected;
        };

        $scope.selectAllFields = function () {
            var selected = $scope.params.fields.all;

            $scope.selectAllProjectHours(selected);
            $scope.selectAllPeopleHours(selected);
            $scope.selectAllProjectionHours(selected);
            $scope.selectAllGraphPercentHours(selected);

            $scope.params.fields.graphs.trendHrs =
                $scope.params.fields.graphs.trendGoals =
                    $scope.params.fields.graphs.graph = selected;
        };

        $scope.reportHandler = {
            stringify: function (str) {
                return '"' + str.replace(/^\s\s*/, '').replace(/\s*\s$/, '')// trim spaces
                        .replace(/"/g, '""') + // replace quotes with double quotes
                    '"';
            },

            generate: function (e) {
                if ($scope.output && $scope.output.type == "people") {
                    $rootScope.modalDialog = {
                        title: "Generate report",
                        text: "Report already generated. Would you like to generate new report?",
                        ok: "Yes",
                        no: "No",
                        okHandler: function () {
                            $(".modalYesNoCancel").modal('hide');
                            $scope.generateReport();
                        },
                        noHandler: function () {
                            $(".modalYesNoCancel").modal('hide');
                            $location.path('/reports/people/output');
                        }
                    };
                    $(".modalYesNoCancel").modal('show');
                } else {
                    $scope.generateReport();
                }
            },

            exportPeopleReport: function (e) {
                $scope.csvData = $scope.getPeopleReportCSVData($scope.output);
                prepareDocumentDownloadLink(e, $scope.csvData);
            },

            exportPeopleIndividualReport: function (e) {
                var rolesToExport = [];
                _.each($scope.output.peopleDetails.utilizationDetails, function (record) {
                    if (record.role.isSelected)
                        rolesToExport.push(record.role.resource);
                });
                $scope.csvData = $scope.getPeopleIndividualReportCSVData($scope.output, rolesToExport);
                prepareDocumentDownloadLink(e, $scope.csvData);
            },

            cancel: function (e) {
                Resources.refresh("/reports/people/cancel").then(function (result) {
                    $scope.cancelReportGeneration();
                }).catch(function (err) {
                    $scope.cancelReportGeneration();
                });
            },

            link: function () {
                return {};
            }
        };

        $scope.generateReport = function (params) {

            if ($scope.isGenerationInProgress)
                return;

            var input = params;

            if (!input) {
                input = $scope.prepareInputParams();
            }

            //console.log(JSON.stringify(input));

            $scope.startGenerationTimers();

            //console.log( 'Report generation started' );

            Resources.refresh("/reports/people/generate", input, {});
        };

        $scope.prepareInputParams = function () {
            var input = {
                reportName: $scope.params.reportName,
                locations: [],
                fields: $scope.params.fields,
                output: $scope.params.output,
                dateRange: $scope.params.date.range,
                roles: []
            };

            switch ($scope.params.date.range) {
                case "week":

                    input.startDate = moment.utc($scope.params.date.start);
                    input.endDate = moment.utc($scope.params.date.start).add(1, "week");
                    break;

                case "weeks":

                    input.startDate = moment.utc($scope.params.date.start);
                    input.endDate = moment.utc($scope.params.date.start).add(2, "week");
                    break;

                case "month":

                    input.startDate = moment(Date.UTC($scope.params.date.year, $scope.params.date.month.index));
                    input.endDate = moment(input.startDate).endOf("month");
                    break;

                case "previousMonth":

                    input.startDate = moment.utc().startOf("month").subtract(1, "month");
                    input.endDate = moment(input.startDate).endOf("month");
                    break;

                case "currentMonth":

                    input.startDate = moment.utc().startOf("month");
                    input.endDate = moment.utc().subtract(1, "day");
                    break;

                case "custom":

                    input.startDate = moment.utc($scope.params.date.start);
                    input.endDate = moment.utc($scope.params.date.end);
                    break;
            }

            for (var prop in $scope.params.locations)
                if ($scope.params.locations[prop])
                    input.locations.push(prop);

            for (var prop in $scope.params.roles)
                if ($scope.params.roles[prop])
                    input.roles.push(prop);

            return input;
        };

        $scope.getProjectionsStackedAreaChartData = function () {
            var data = [{
                "key": "Projected Out of Office",
                "values": []
            },
                {
                    "key": "Projected Client",
                    "values": []
                },
                {
                    "key": "Projected Invest",
                    "values": []
                },

                {
                    "key": "Capacity Ceilling as of todays date",
                    "values": []
                }];

            var dataOOO = {
                "key": "Projected Out of Office",
                "values": []
            };
            var dataClient = {
                "key": "Projected Client",
                "values": []
            };

            var dataInvest = {
                "key": "Projected Invest",
                "values": []
            };

            var dataCeiling = {
                "key": "Capacity Ceilling as of todays date",
                "values": []
            };

            for (var i = 0; i < $scope.projectionsGraphData.length; i++) {
                dataOOO.values.push({
                    x: moment($scope.projectionsGraphData[i].date, "MM/DD/YYYY").format('YYYY-MM-DD'),
                    y: $scope.projectionsGraphData[i].actualOOO
                });

                dataClient.values.push({
                    x: moment($scope.projectionsGraphData[i].date, "MM/DD/YYYY").format('YYYY-MM-DD'),
                    y: $scope.projectionsGraphData[i].projectedClient
                });

                dataInvest.values.push({
                    x: moment($scope.projectionsGraphData[i].date, "MM/DD/YYYY").format('YYYY-MM-DD'),
                    y: $scope.projectionsGraphData[i].projectedInvest
                });

                dataCeiling.values.push({
                    x: moment($scope.projectionsGraphData[i].date, "MM/DD/YYYY").format('YYYY-MM-DD'),
                    y: $scope.projectionsGraphData[i].capacity
                });
            }

            return [dataOOO, dataClient, dataInvest, dataCeiling];

            /*
             data = [ {
             "key" : "Projected Out of Office" ,
             "values" : [ { x:'2014-10-01' , y:20} , {x: '2014-10-10' , y:30},{x: '2014-10-20' , y:80}, { x:'2014-10-30' , y:98},
             { x:'2014-11-01' , y:25} , { x:'2014-11-10' , y:10}, { x:'2014-11-20' , y:30}, { x:'2014-11-30' , y:30},
             { x:'2014-12-01' ,y: 55} , { x:'2014-12-10' , y:60}, { x:'2014-12-20' , y:70}, { x:'2014-12-31' , y:50}]
             },
             {
             "key" : "Projected Client" ,
             "values" : [ { x:'2014-10-01' , y:120} , {x: '2014-10-10' , y:130},{x: '2014-10-20' , y:180}, { x:'2014-10-30' , y:198},
             { x:'2014-11-01' , y:125} , { x:'2014-11-10' , y:110}, { x:'2014-11-20' , y:130}, { x:'2014-11-30' , y:130},
             { x:'2014-12-01' ,y: 155} , { x:'2014-12-10' , y:160}, { x:'2014-12-20' , y:170}, { x:'2014-12-31' , y:170}]
             },
             {
             "key" : "Projected Invest" ,
             "values" : [ { x:'2014-10-01' , y:200} , {x: '2014-10-10' , y:230},{x: '2014-10-20' , y:280}, { x:'2014-10-30' , y:280},
             { x:'2014-11-01' , y:225} , { x:'2014-11-10' , y:220}, { x:'2014-11-20' , y:230}, { x:'2014-11-30' , y:230},
             { x:'2014-12-01' ,y: 215} , { x:'2014-12-10' , y:260}, { x:'2014-12-20' , y:270}, { x:'2014-12-31' , y:270}]
             },

             {
             "key" : "Capacity Ceilling as of todays date" ,
             "values" : [ { x:'2014-10-01' , y:300} , {x: '2014-10-10' , y:300},{x: '2014-10-20' , y:300}, { x:'2014-10-30' , y:300},
             { x:'2014-11-01' , y:300} , { x:'2014-11-10' , y:300}, { x:'2014-11-20' , y:300}, { x:'2014-11-30' , y:300},
             { x:'2014-12-01' ,y: 300} , { x:'2014-12-10' , y:300}, { x:'2014-12-20' , y:300}, { x:'2014-12-31' , y:300}]
             }];
             */

        };

        $scope.onReportGenerated = function (report) {

            //console.log( 'Report generation completed' );

            $scope.output = report;

            if (report.projections)
                $scope.projectionsGraphData = report.projections.graphData;

            $scope.setPeopleDetailsVerticalbarChartData(report);
            $scope.selectAllRolesToExport();

            if ($scope.isGenerationInProgress)
                $location.path('/reports/people/output');
        };

        $scope.checkGenerationStatus = function () {
            return Resources.refresh("/reports/people/status").then(function (result) {
                if (result.status != "Running" && result.status != "Completed") {
                    $scope.cancelReportGeneration();
                }
                if (result.status == "Completed") {
                    Resources.refresh("/reports/people/get").then(function (result) {
                        //console.log("Generated report type: " + result.data.type);
                        if (result && result.data && result.data.type) {
                            $scope.onReportGenerated(result.data);
                        } else {
                            console.log("Server returned broken data for report.");
                        }
                        $scope.cancelReportGeneration();
                    });
                }
                return result;
            }).catch(function (err) {
                $scope.cancelReportGeneration();
                return err.data;
            });
        };

        $scope.startGenerationTimers = function () {

            if ($scope.isGenerationInProgress)
                return;

            if (!$rootScope.peopleReportGenerationStartTime)
                $rootScope.peopleReportGenerationStartTime = new moment();

            $scope.generationTimer = setInterval(function () {
                    var timer = $("#lblTimer")[0];
                    if (timer) {
                        var now = new moment();
                        var spentTime = moment.utc(moment(now, "DD/MM/YYYY HH:mm:ss")
                            .diff(moment($rootScope.peopleReportGenerationStartTime, "DD/MM/YYYY HH:mm:ss")))
                            .format("HH:mm:ss");
                        timer.textContent = spentTime;
                    }
                },
                1000);

            $scope.generationPing = setInterval(function () {
                    $scope.checkGenerationStatus();
                },
                $scope.reportServicePingInterval);

            $scope.isGenerationInProgress = true;
        };

        $scope.stopGenerationTimers = function () {
            if ($scope.generationTimer) {
                clearInterval($scope.generationTimer);
            }
            if ($scope.generationPing) {
                clearInterval($scope.generationPing);
            }
        };

        $scope.cancelReportGeneration = function () {
            $scope.stopGenerationTimers();
            $scope.isGenerationInProgress = false;
            $rootScope.peopleReportGenerationStartTime = null;
            //console.log( 'Report generation aborted' );
        };

        $scope.cancel = function (e) {
            Resources.refresh("/reports/people/cancel").then(function (result) {
                $scope.cancelReportGeneration();
            }).catch(function (err) {
                $scope.cancelReportGeneration();
            });
        };

        $scope.$on("$destroy", function () {
            $scope.stopGenerationTimers();
        });

        $scope.init = function () {
            $scope.isGenerationInProgress = false;
            $scope.checkGenerationStatus().then(function (state) {
                if (state.status == "Running") {
                    if (state.type == "people") {
                        $scope.startGenerationTimers();
                    } else {
                        $scope.cancel();
                    }
                }
            });
        };

        $scope.init();

        $scope.getPeopleReportCSVData = function (reportData, rolesToExport) {
            return ReportExportService.preparePeopleReportCSV(reportData, rolesToExport);
        };

        $scope.getPeopleIndividualReportCSVData = function (reportData, rolesToExport) {
            return ReportExportService.preparePeopleIndividualReportCSV(reportData, rolesToExport);
        };

        var prepareDocumentDownloadLink = function (controlEvent, data) {

            /*Only called when our custom event fired*/
            var onInnerReportLink = function (e) {
                e = e ? e : window.event;
                e.stopPropagation();
                $(e.target).closest('a').unbind('click');
            };

            var e = controlEvent ? controlEvent : window.event;
            var btn = $(e.target).closest('.btn-report').find('a');
            e.preventDefault();
            e.stopPropagation();
            var evt = document.createEvent("MouseEvents");
            evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            btn.attr('href', 'data:text/csv;charset=UTF-8,' + encodeURIComponent($scope.csvData));
            btn.click(onInnerReportLink);
            btn.get(0).dispatchEvent(evt);
        };

        $scope.setPeopleDetailsVerticalbarChartData = function (data) {
            var tmpData = {"expected utilization": [], "actual utilization": [], "estimated utilization": []};

            if (data.peopleDetails && data.peopleDetails.utilizationDetails) {
                var stats = data.peopleDetails.utilizationDetails;
                for (var k = 0; k < stats.length; k++) {
                    var role = stats[k].role;
                    var expectedUtilization = role.expectedUtilization;
                    var actualUtilization = role.actualUtilization;
                    var estimatedUtilization = role.tdUtilization;
                    tmpData["expected utilization"].push({label: role.abbreviation, value: actualUtilization});
                    tmpData["actual utilization"].push({label: role.abbreviation, value: expectedUtilization});
                    tmpData["estimated utilization"].push({label: role.abbreviation, value: estimatedUtilization});
                }
            }

            $scope.verticalbarChartData = tmpData;
        };

        $scope.getPeopleDetailsVerticalbarChartData = function () {
            return $scope.verticalbarChartData;
        };

        $scope.getPersonProjectedHoursVerticalbarChartData = function (person) {
            var tmpData = {"expected hours for period": [], "actual hours": [], "expected hours to date": []};
            if (person.projectsHours && person.projectsHours.length > 0) {
                for (var i in person.projectsHours) {
                    var projectHours = person.projectsHours[i];
                    var lbl = projectHours.project.name;
                    tmpData["expected hours for period"].push({label: lbl, value: projectHours.assignedHours});
                    tmpData["actual hours"].push({label: lbl, value: projectHours.spentHours});
                    tmpData["expected hours to date"].push({label: lbl, value: projectHours.assignedTDHours});
                }
            } else {
                tmpData = {
                    "expected hours for period": [{label: "", value: 0}],
                    "actual hours": [{label: "", value: 0}],
                    "expected hours to date": [{label: "", value: 0}]
                };
            }
            return tmpData;
        };

        $scope.getPersonCategoriesHoursPieChartData = function (person) {
            var personHours = person.hours;
            var unaccountedHours = person.capacity
                - personHours.projectedClient
                - personHours.projectedInvest
                - personHours.OH
                - personHours.OOO;
            return [{key: "Client Hours", value: personHours.projectedClient},
                {key: "Investment Hours", value: personHours.projectedInvest},
                {key: "OH", value: personHours.OH},
                {key: "OOO", value: personHours.OOO},
                {key: "unaccounted for", value: unaccountedHours}];
        };

        $scope.getProjectHoursPieChartData = function () {
            var client = $scope.output.projectHours.actualClient;
            var ooo = $scope.output.projectHours.outOfOfficeUtilization;
            var oh = $scope.output.projectHours.overheadUtilization;
            var invest = $scope.output.projectHours.actualInvest;
            var unaccounted = 100 - client - ooo - oh - invest;
            return [{key: "Client Hours", value: client},
                {key: "Investment Hours", value: invest},
                {key: "OH", value: oh},
                {key: "OOO", value: ooo},
                {key: "unaccounted for", value: unaccounted}];
        };

        $scope.showPeopleDetailsLargerReport = false;
        $scope.popupHandler = {
            openPeopleDetailsVerticalReport: function () {
                $scope.showPeopleDetailsLargerReport = true;
            },
            closePeopleDetailsVerticalReport: function () {
                $scope.showPeopleDetailsLargerReport = false;
            }
        };

        $scope.messageForFavorites = "";

        $scope.save = function () {
            var params = $scope.prepareInputParams();
            var person = {resource: $scope.me.resource, name: $scope.getPersonName($scope.me)};

            var favotiteReport = {
                person: person,
                params: params,
                type: "people"
            };

            Resources.create("reports/favorites", favotiteReport).then(function (result) {
                $scope.messageForFavorites = "Report saved";
                $scope.$parent.getFavorites();
            });
        };

        $scope.saveAndCreate = function () {
            $scope.save();
            $scope.reportHandler.generate();
        };

        $scope.clearMessage = function () {
            $scope.messageForFavorites = "";
        };

    }]);

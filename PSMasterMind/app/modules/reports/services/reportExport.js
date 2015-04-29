'use strict';

angular.module('Mastermind.services.reports').service('ReportExportService', ['$q', 'People',
    function ($q, People) {

        var csvHandler = {
            splitter: ',',
            stringify: function (str) {
                if (str) {
                    return '"' + str.replace(/^\s\s*/, '').replace(/\s*\s$/, '')// trim spaces
                            .replace(/"/g, '""') + // replace quotes with double quotes
                        '"';
                } else {
                    return '';
                }
            },
            getLine: function (str) {
                if (str && (!_.isString(str) || str.indexOf('undefined') == -1)) {
                    return str + ',';
                } else {
                    return 'N/A,';
                }
            }
        };

        var roleDepartementMapping = People.getPeopleGroupMapping();

        var getPersonName = function (person, isSimply, isFirst) {
            return Util.getPersonName(person, isSimply, isFirst);
        };

        var getDepartment = function (role) {
            var group;
            var result = [];

            for (group in roleDepartementMapping) {
                if (_.find(roleDepartementMapping[group], function (r) {
                        return r == role;
                    })) {
                    result.push(group);
                }
            }

            return result.join(csvHandler.splitter);
        };

        this.preparePeopleReportCSV = function (reportData) {

            if (!reportData.summary)
                return '';

            var str = '';
            var line = '\r\n';

            str += ',#Report Details' + '\r\n';
            var header = ['Report Start Date', 'Number Working Days in Report period', 'Working Hours for Team'];
            line += csvHandler.getLine(csvHandler.stringify(reportData.summary.reportStartDate));
            line += csvHandler.getLine(reportData.summary.workingDays);
            line += csvHandler.getLine(reportData.summary.workingHoursForTeam);
            str += header.join(csvHandler.splitter) + line + '\r\n';
            header = ['Report End Date', 'Number Working Hours in Report period per person'];
            line = '\r\n';
            line += csvHandler.getLine(csvHandler.stringify(reportData.summary.reportEndDate));
            line += csvHandler.getLine(reportData.summary.workingHoursPerPerson);
            str += header.join(csvHandler.splitter) + line + '\r\n' + '\r\n';

            str += ',#Project Hours Details' + '\r\n';
            str += 'Actual Capacity' + '\r\n' + csvHandler.getLine(reportData.projectHours.capacity) + '\r\n';
            header = ['Projected Client Hours', 'Projected Invest Hours'];
            line = '\r\n';
            line += csvHandler.getLine(reportData.projectHours.projectedClient);
            line += csvHandler.getLine(reportData.projectHours.projectedInvest);
            str += header.join(csvHandler.splitter) + line + '\r\n';
            header = ['Actual Client Hours', 'Actual Invest Hours'];
            line = '\r\n';
            line += csvHandler.getLine(reportData.projectHours.actualClientHours);
            line += csvHandler.getLine(reportData.projectHours.actualInvestHours);
            str += header.join(csvHandler.splitter) + line + '\r\n';
            header = ['Out Of Office Hours', 'Overhead Hours'];
            line = '\r\n';
            line += csvHandler.getLine(reportData.projectHours.outOfOfficeHours);
            line += csvHandler.getLine(reportData.projectHours.overheadHours);
            str += header.join(csvHandler.splitter) + line + '\r\n';
            header = ['Total Client/Invest Hours Projected', 'Total Client/Invest Hours Spent'];
            line = '\r\n';
            line += csvHandler.getLine(reportData.projectHours.totalProjectedHours);
            line += csvHandler.getLine(reportData.projectHours.totalActualHours);
            str += header.join(csvHandler.splitter) + line + '\r\n' + '\r\n';

            str += ',#Utilization Details' + '\r\n';
            header = ['Projected Client', 'Projected Invest'];
            line = '\r\n';
            line += csvHandler.getLine(reportData.projectHours.projectedClient + '%');
            line += csvHandler.getLine(reportData.projectHours.projectedInvest + '%');
            str += header.join(csvHandler.splitter) + line + '\r\n';
            header = ['Actual Clients', 'Actual Invest', 'Out Of Office', 'Overhead'];
            line = '\r\n';
            line += csvHandler.getLine(reportData.projectHours.actualClient + '%');
            line += csvHandler.getLine(reportData.projectHours.actualInvest + '%');
            line += csvHandler.getLine(reportData.projectHours.outOfOfficeUtilization + '%');
            line += csvHandler.getLine(reportData.projectHours.overheadUtilization + '%');
            str += header.join(csvHandler.splitter) + line + '\r\n';
            header = ['Estimated All Utilization', 'Actual All Utilization'];
            line = '\r\n';
            line += csvHandler.getLine(reportData.projectHours.estimatedAllUtilization + '%');
            line += csvHandler.getLine(reportData.projectHours.actualAllUtilization + '%');
            str += header.join(csvHandler.splitter) + line + '\r\n' + '\r\n';

            str += ',#People Details' + '\r\n';
            header = ['People on Client', 'People on Investment', 'Total # People'];
            line = '\r\n';
            line += csvHandler.getLine(reportData.peopleDetails.peopleOnClient);
            line += csvHandler.getLine(reportData.peopleDetails.peopleOnInvestment);
            line += csvHandler.getLine(reportData.peopleDetails.totalPeople);
            str += header.join(csvHandler.splitter) + line + '\r\n';

            if (reportData.peopleDetails.utilizationDetails) {
                line = '';
                str += 'Utilization by Role' + '\r\n';
                header = ['Role', 'Actual Utilization'];
                str += header.join(csvHandler.splitter) + '\r\n';
                for (var i = 0; i < reportData.peopleDetails.utilizationDetails.length; i++) {
                    var record = reportData.peopleDetails.utilizationDetails[i];
                    line += csvHandler.getLine(csvHandler.stringify(record.role.abbreviation));
                    line += csvHandler.getLine(record.role.actualUtilization + '%');
                    line += '\r\n';
                }
                if (line && line.length > 0)
                    str += line;
            }

            var line = this.preparePeopleHoursReportCSV(reportData.dataForCSV);
            if (line && line.length > 0)
                str += '\r\n' + line;

            return str;
        };

        this.prepareProjectReportCSV = function (reportData) {

            if (!reportData.reportDetails)
                return '';

            var str = '';
            var line = '\r\n';

            str += ',#Report Details' + '\r\n' + '\r\n';
            var header = ['Report Start Date', 'Number Working Days in Report period', 'Working Hours for Project'];
            line += csvHandler.getLine(csvHandler.stringify(reportData.reportDetails.reportStartDate));
            line += csvHandler.getLine(reportData.reportDetails.workingDays);
            line += csvHandler.getLine(reportData.reportDetails.workingHoursForProject);
            str += header.join(csvHandler.splitter) + line + '\r\n';
            header = ['Report End Date', 'Number Working Hours in Report period per person'];
            line = '\r\n';
            line += csvHandler.getLine(csvHandler.stringify(reportData.reportDetails.reportEndDate));
            line += csvHandler.getLine(reportData.reportDetails.workingHoursPerPerson);
            str += header.join(csvHandler.splitter) + line + '\r\n' + '\r\n';

            str += ',#Assignments Hours' + '\r\n' + '\r\n';
            header = ['Projected Hours', 'Actual Hours', 'Hours OOO', 'Overall Utilization Rate'];
            line = '\r\n';
            line += csvHandler.getLine(reportData.assignmentsHours.projectedHours);
            line += csvHandler.getLine(reportData.assignmentsHours.actualHours);
            line += csvHandler.getLine(reportData.assignmentsHours.hoursOOO);
            line += csvHandler.getLine(reportData.assignmentsHours.overallUtilizationRate);
            str += header.join(csvHandler.splitter) + line + '\r\n' + '\r\n';

            if (reportData.assignmentsHours) {
                line = '';
                header = ['Full Name', 'Role', 'Projected Hours', 'Actual Hours', 'Utilization Rate', 'Out of Office Hours'];
                str += header.join(csvHandler.splitter) + '\r\n';
                for (var i = 0; i < reportData.assignmentsHours.people.length; i++) {
                    var person = reportData.assignmentsHours.people[i];
                    line += csvHandler.getLine(csvHandler.stringify(getPersonName(person, true)));
                    line += csvHandler.getLine(csvHandler.stringify(person.role));
                    line += csvHandler.getLine(person.projectedHours);
                    line += csvHandler.getLine(person.actualHours);
                    line += csvHandler.getLine(person.utilizationRate + '%');
                    line += csvHandler.getLine(person.utilizationRate);
                    line += '\r\n';
                }
                if (line && line.length > 0)
                    str += line;
            }

            return str;
        };

        this.preparePeopleIndividualReportCSV = function (reportData, rolesToExport) {

            if (!reportData.peopleDetails)
                return '';

            var str = '';
            var line = '\r\n';

            var header = ['Report Start Date', 'Report End Date'];
            line += csvHandler.getLine(csvHandler.stringify(reportData.summary.reportStartDate));
            line += csvHandler.getLine(csvHandler.stringify(reportData.summary.reportEndDate));
            str += header.join(csvHandler.splitter) + line + '\r\n' + '\r\n';

            header = ['Availiable Hours', 'Total Client/Invest Hours Spent', 'Total OOO/OH Hours Spent'];
            line = '\r\n';
            line += csvHandler.getLine(reportData.peopleDetails.availableHours);
            line += csvHandler.getLine(reportData.peopleDetails.totalClientInvestHours);
            line += csvHandler.getLine(reportData.peopleDetails.totalTasksHours);
            str += header.join(csvHandler.splitter) + line + '\r\n' + '\r\n';

            header = ['Utilization Client', 'Utilization Invest', 'Utilization Total'];
            line = '\r\n';
            line += csvHandler.getLine(reportData.peopleDetails.utilizationClient);
            line += csvHandler.getLine(reportData.peopleDetails.utilizationInvest);
            line += csvHandler.getLine(reportData.peopleDetails.utilizationTotal);
            str += header.join(csvHandler.splitter) + line + '\r\n' + '\r\n';

            if (rolesToExport && rolesToExport.length > 0) {
                header = ['Full Name', 'Role', 'Capacity', 'Hours assigned', 'Hours Spent', 'Total OOO', 'Total OH', 'Utilization', 'Goal'];
                str += '\r\n' + header.join(csvHandler.splitter) + '\r\n';
                for (var i = 0; i < reportData.peopleDetails.utilizationDetails.length; i++) {
                    line = '';
                    var record = reportData.peopleDetails.utilizationDetails[i];
                    for (var j = 0; record.members && j < record.members.length; j++) {
                        if (!rolesToExport || _.contains(rolesToExport, record.role.resource)) {
                            var member = record.members[j];
                            line += csvHandler.getLine(csvHandler.stringify(getPersonName(member, true)));
                            line += csvHandler.getLine(csvHandler.stringify(record.role.abbreviation));
                            line += csvHandler.getLine(member.capacity);
                            line += csvHandler.getLine(member.hours.assigned);
                            line += csvHandler.getLine(member.hours.spent);
                            line += csvHandler.getLine(member.hours.OOO);
                            line += csvHandler.getLine(member.hours.OH);
                            line += csvHandler.getLine(member.utilization + '%');
                            line += csvHandler.getLine(member.goal + '%');
                            line += '\r\n';
                        }
                    }

                    if (line && line.length > 0)
                        str += line + '\r\n';
                }
            }

            return str;
        };

        this.preparePeopleHoursReportCSV = function (reportData) {
            var str = '';
            var line = '';

            if (reportData || reportData.length == 0)
                return str;

            //Print the header

            var head = ['Project/Task', 'Person', 'Role', 'Department', 'Date', 'Hours', 'Description'];
            var i = 0;

            line += head.join(csvHandler.splitter);
            str += line + '\r\n';

            for (var i = 0; i < reportData.length; i++) {
                line = '';

                var record = reportData[i];

                var getDepartment = function (role) {
                    var group;
                    var result = [];

                    for (group in roleDepartementMapping) {
                        if (_.find(roleDepartementMapping[group], function (r) {
                                return r == role;
                            })) {
                            result.push(group);
                        }
                    }

                    return result.join(csvHandler.splitter);
                };

                for (var j = 0; record.roles && j < record.roles.length; j++) {
                    // for hours report
                    for (var k = 0; record.roles[j].persons && k < record.roles[j].persons.length; k++) {
                        //line += [ '--', '--' ].join( ',' );

                        if (!record.roles[j].persons[k].hours || record.roles[j].persons[k].hours.length == 0) {
                            //line += [ '--' ].join( ',' );
                            line += csvHandler.stringify(record.name) + csvHandler.splitter;
                            line += csvHandler.stringify(record.roles[j].persons[k].name) + csvHandler.splitter;
                            line += (record.roles[j].abbreviation == CONSTS.UNKNOWN_ROLE ? 'Currently Unassigned' : csvHandler.stringify(record.roles[j].type.id)) + csvHandler.splitter;
                            line += csvHandler.stringify(getDepartment(record.roles[j].type.id)) + csvHandler.splitter;
                            line += ['--', '--', '--', '--'].join(csvHandler.splitter);
                            line += '\r\n';
                        }

                        for (var l = 0; record.roles[j].persons[k].hours && l < record.roles[j].persons[k].hours.length; l++) {
                            //line += [ '--' ].join( ',' );
                            line += csvHandler.stringify(record.name) + csvHandler.splitter;
                            line += csvHandler.stringify(record.roles[j].persons[k].name) + csvHandler.splitter;

                            if (record.roles[j].persons[k].abbreviation)
                                line += record.roles[j].persons[k].abbreviation + csvHandler.splitter;
                            else
                                line += (record.roles[j].abbreviation == CONSTS.UNKNOWN_ROLE ? 'Currently Unassigned' : csvHandler.stringify(record.roles[j].type.id)) + csvHandler.splitter;

                            line += csvHandler.stringify(getDepartment(record.roles[j].type.id)) + csvHandler.splitter;

                            line += record.roles[j].persons[k].hours[l].date + csvHandler.splitter;
                            line += record.roles[j].persons[k].hours[l].hours + csvHandler.splitter;
                            line += csvHandler.stringify(record.roles[j].persons[k].hours[l].description) + csvHandler.splitter;
                            line += '\r\n';
                        }
                    }
                }

                // in case of tasks
                if (!record.roles) {
                    for (var k = 0; record.persons && k < record.persons.length; k++) {
                        for (var l = 0; record.persons[k].hours && l < record.persons[k].hours.length; l++) {
                            //line += [ '--' ].join( ',' );
                            line += csvHandler.stringify(record.name) + csvHandler.splitter;
                            line += '--' + csvHandler.splitter;
                            line += csvHandler.stringify(record.persons[k].name) + csvHandler.splitter;
                            line += record.persons[k].hours[l].date + csvHandler.splitter;
                            line += record.persons[k].hours[l].hours + csvHandler.splitter;
                            line += csvHandler.stringify(record.persons[k].hours[l].description) + csvHandler.splitter;
                            line += '\r\n';
                        }
                    }
                }

                if (line)
                    str += line + '\r\n';
            }

            return str;
        };

        this.prepareProjectHoursReportCSV = function (reportData) {
            return this.prepareProjectHoursReportCSV(reportData);
        };

    }]);

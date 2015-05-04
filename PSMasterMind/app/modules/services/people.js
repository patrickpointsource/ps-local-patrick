'use strict';

/**
 * People Service
 */
angular.module('Mastermind').factory('People', ['$q', 'Restangular', 'Resources', 'ProjectsService',
    function ($q, Restangular, Resources, ProjectsService) {

        /*
         * Create a reference to a server side resource for People.
         *
         * The query method returns an object with a property 'data' containing
         * the list of projects.
         */
        var Resource = Restangular.withConfig(Util.fixRestAngularPathMethod()).all('people');

        var roles = [];
        Resources.get('roles').then(function (result) {
            roles = result.members;
        });

        /**
         * Service function for retrieving all people.
         *
         * @returns {*}
         */
        function query(query, fields, includeInactive) {
            var deferred = $q.defer();
            var updFields = [];
            for (var attr in fields) {
                if (fields.hasOwnProperty(attr) && fields[attr] == 1) {
                    updFields.push(attr);
                }
            }
            var params = {fields: updFields};
            params.t = (new Date()).getMilliseconds();
            Resources.get('people/byTypes/active', params).then(function (res) {
                _.map(res.members, function (person) {
                    person.isActive = true;
                });
                if (includeInactive) {
                    Resources.get('people/byTypes/inactive', params).then(function (inactive) {
                        _.map(inactive.members, function (person) {
                            person.isActive = false;
                        });
                        res.members = res.members.concat(inactive.members);
                        deferred.resolve(res);
                    });
                } else {
                    deferred.resolve(res);
                }
            });
            return deferred.promise;
        }

        function get(id) {
            return Resource.get(id);
        }

        /**
         * Function declaration getPerson(personResource)
         * Returns a role abbreviation corresponding to a resource reference
         *
         * @param project
         * @param newRole
         */
        function getPerson(personResource) {

            var peoplePromise;
            //console.log("getPerson() called with", personResource);

            var peopleWithResourceQuery = {
                'resource': personResource
            };
            var pepInRolesFields = {
                resource: 1,
                name: 1,
                familyName: 1,
                givenName: 1,
                primaryRole: 1,
                thumbnail: 1
            };
            var returnVar = Resources.query('people', peopleWithResourceQuery, pepInRolesFields);
            //console.log("getPerson() returning with", returnVar);

            return returnVar;

        };

        var getToday = function () {
            //Get todays date formatted as yyyy-MM-dd
            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth() + 1;
            //January is 0!
            var yyyy = today.getFullYear();
            if (dd < 10) {
                dd = '0' + dd;
            }
            if (mm < 10) {
                mm = '0' + mm;
            }
            today = yyyy + '-' + mm + '-' + dd;
            return today;
        };

        var getQueryDate = function (date) {
            //Get todays date formatted as yyyy-MM-dd
            var dd = date.getDate();
            var mm = date.getMonth() + 1;
            //January is 0!
            var yyyy = date.getFullYear();
            if (dd < 10) {
                dd = '0' + dd;
            }
            if (mm < 10) {
                mm = '0' + mm;
            }
            date = yyyy + '-' + mm + '-' + dd;
            return date;
        };

        var getQueryDateSixMonthsFromNow = function (date) {
            var sixMontsFromNow = new Date(date);
            sixMontsFromNow.setMonth(date.getMonth() + 6);
            var dd6 = sixMontsFromNow.getDate();
            var mm6 = sixMontsFromNow.getMonth() + 1;
            //January is 0!
            var yyyy6 = sixMontsFromNow.getFullYear();
            if (dd6 < 10) {
                dd6 = '0' + dd6;
            }
            if (mm6 < 10) {
                mm6 = '0' + mm6;
            }
            var sixMontsFromNowQuery = yyyy6 + '-' + mm6 + '-' + dd6;

            return sixMontsFromNowQuery;
        }

        var getIDfromResource = function (resource) {

            var ind = resource.lastIndexOf("/");
            if (ind != -1) {
                var id = resource.substring(ind + 1, resource.length);
                return id;
            }
            return;
        };

        /**
         * Query to get the list of people working on
         * active projects.
         */
        function getActivePeople() {
            return Resources.get('people/bytypes/activeAssignments');
        }

        /**
         * Loads the list of all active people
         */
        function getAllActivePeople() {
            return Resources.get('people/bytypes/active');
        }


        /**
         * Gets the next six months of assignments mapped per person URI starting form a
         * given date
         *
         * Resolves some of the data for the people and projects represented
         */
        function getPeoleAssignments(fromDate) {
            var deferred = $q.defer();
            var startQueryDate = getQueryDate(fromDate);
            var stopQueryDate = getQueryDateSixMonthsFromNow(fromDate);
            var stopDate = new Date(stopQueryDate);

            var apQuery = {
                members: {
                    '$elemMatch': {
                        startDate: {
                            $lte: stopQueryDate
                        },
                        $or: [{
                            endDate: {
                                $exists: false
                            }
                        }, {
                            endDate: {
                                $gt: startQueryDate
                            }
                        }]
                    }
                }
            };
            var apFields = {};
            Resources.query('assignments', apQuery, apFields, function (result) {
                var projectAssignments = result.data;
                //Map to return
                var ret = {};
                var today = new Date();
                var projectURIs = [];

                for (var i = 0; i < projectAssignments.length; i++) {
                    var projectAssignment = projectAssignments[i];
                    //Loop through all the assignments in for a project
                    for (var j = 0; j < projectAssignment.members.length; j++) {
                        var assignment = projectAssignment.members[j];

                        //Reference the project directly in the assignment
                        assignment.project = projectAssignment.project;
                        if (projectURIs.indexOf(assignment.project.resource) == -1) {
                            projectURIs.push(assignment.project.resource);
                        }

                        var startDate = new Date(assignment.startDate);
                        var endDate = assignment.endDate ? new Date(assignment.endDate) : null;
                        //Only include current assignments
                        if (assignment.person && startDate <= stopDate && ( !endDate || endDate > fromDate )) {
                            var personURI = assignment.person.resource;

                            if (ret.hasOwnProperty(personURI)) {
                                ret[personURI].push(assignment);
                            } else {
                                ret[personURI] = [assignment];
                                projectURIs.push(personURI);
                            }
                        }
                    }
                }

                var projectIds = [];
                for (var i = 0; i < projectURIs.length; i++) {
                    var projectURI = projectURIs[i];
                    var oid = {
                        $oid: projectURI.substring(projectURI.lastIndexOf('/') + 1)
                    };
                    projectIds.push(oid);
                }

                var projectQuery = {
                    _id: {
                        $in: projectIds
                    }
                };
                var projectFields = {
                    resource: 1,
                    name: 1,
                    customerName: 1,
                    committed: 1,
                    type: 1,
                    startDate: 1,
                    endDate: 1
                };
                Resources.query('projects', projectQuery, projectFields, function (result) {
                    var projects = result.data;
                    //Collate resolved projects with the list of assignments
                    for (var personURI in ret) {
                        var assignments = ret[personURI];
                        for (var i = 0; i < assignments.length; i++) {
                            var assignment = assignments[i];
                            var projectURI = assignment.project.resource;
                            for (var j = 0; j < projects.length; j++) {
                                var project = projects[j];
                                if (projectURI == project.resource) {
                                    assignment.project = project;
                                    break;
                                }
                            }
                        }
                    }

                    deferred.resolve(ret);
                });
            });

            return deferred.promise;
        }


        /**
         * Get a map per user with all of there current assignment records
         */

        function getPeopleCurrentAssignments() {
            return Resources.refresh('assignments/bytypes/currentAssignments');
        }


        /**
         * Returns a list of people per role for display
         *
         * role: is the URI for a role i.e. 'roles/{roleid}'
         * fields: if the mongo filter to limit the fields returned for each person
         */
        function getPeoplePerRole(role, fields) {
            var updFields = [];
            for (var attr in fields) {
                if (fields.hasOwnProperty(attr) && fields[attr] == 1) {
                    updFields.push(attr);
                }
            }
            return Resources.get("people/byroleid/" + getIDfromResource(role), {field: fields});
        }


        /**
         * Return the list of people you work with
         */
        function getMyPeople(me) {
            var deferred = $q.defer();
            Resources.get("people/bytypes/myPeople", {t: (new Date()).getMilliseconds()}).then(function (result) {
                deferred.resolve(result.members);
            });
            return deferred.promise;
        }

        function getPeopleGroupMapping() {
            return {
                "development": ['SE', 'SSE', 'SEO', 'SSEO', 'ST', 'SI'],
                "architects": ['SSA', 'SA', 'ESA', 'SSAO'],
                "administration": ['ADMIN'],
                "clientexperiencemgmt": ["SBA", "BA", "PM", "CxD"],
                "digitalexperience": ["UXD", "SUXD", "DxM", "CD"],
                "executivemgmt": ["EXEC", "DD", "CxD", "CD", "DMDE"],
                "marketing": ["MKT", "DMDE", "MS"],
                "sales": ["SALES"]
            };
        }

        function mapPeopleFilterToUI(filterPeople) {
            if (filterPeople == 'businessdevelopment') {
                return 'Business Development';
            }
            if (filterPeople == 'clientexperiencemgmt') {
                return 'Client Experience Mgmt';
            }
            if (filterPeople == 'digitalexperience') {
                return 'Digital Experience';
            }
            if (filterPeople == 'executivemgmt') {
                return 'Executive Mgmt';
            }

            var role = _.findWhere(roles, {about: filterPeople});
            if (role) {
                return role.title;
            }

            var bigLetter = filterPeople[0].toUpperCase();
            var endPart = filterPeople.slice(1, filterPeople.length);
            return bigLetter + endPart;
        };

        var resultAPI = {
            query: query,
            get: get,
            getActivePeople: getActivePeople,
            getAllActivePeople: getAllActivePeople,
            getPeoplePerRole: getPeoplePerRole,
            getMyPeople: getMyPeople,
            getPeoleAssignments: getPeoleAssignments,
            getPeopleCurrentAssignments: getPeopleCurrentAssignments,
            getPerson: getPerson,
            getPeopleGroupMapping: getPeopleGroupMapping,
            mapPeopleFilterToUI: mapPeopleFilterToUI
        };

        return resultAPI;
    }]);

'use strict';

/*
 * Handles application state in regards to the currently accessed Projects.
 */
angular.module('PSMasterMindApp')
  .service('Projects', [ '$resource', function ($resource) {
    /*
     * Create a reference to a server side resource for Projects.
     *
     * The query method returns an object with a property 'data' containing
     * the list of projects.
     *
     * TODO: Change the hardcoded address to localhost:8080/MasterMindServer
     * TODO: Change the hardcoded access_token query parameter
     */
    var ProjectResource = $resource('http://localhost:8080/MasterMindServer/rest/projects/:projectId?access_token=xxx', {
      projectId: '@projectId'
    }, {
      query: {
        method: 'GET',
        isArray: false
      },
      update: {
        method: 'PUT'
      }
    });

    /*
     * Defines the default values for a newly created Project.
     */
    var projectDefaults = {
      customerName: '',
      name: '',
      type: '',
      primaryContact: '',
      description: '',
      startDate: null,
      endDate: null,
      state: 'planning',
      terms: {
        totalEstValue: 0,
        includesProjectManagementOverhead: false,
        type: 'timeAndMaterials'
      },
      executiveSponsor: null,
      salesSponsor: null,
      roles: []
    };

    /**
     * Constructs a new instance of a Project. A Project is a time-bound
     * goal for which various employee roles may be assigned.
     *
     * @constructor
     */
    function Project() {
      angular.extend(this, projectDefaults);
    }

    /*
     * Provide a function for adding a role to a Project.
     *
     * TODO: Add validation logic so invalid roles may not be added
     */
    Project.prototype.addRole = function (role) {
      this.roles.push(role);
    };

    /**
     * Service function for retrieving all projects.
     *
     * @returns {*}
     */
    function list() {
      return ProjectResource.query();
    }

    /**
     * Service function for retrieving a project by its ID.
     *
     * @param projectId
     * @returns {*|Object}
     */
    function get(projectId) {
      return ProjectResource.get({ projectId: projectId });
    }

    /**
     * Service function for persisting a project, new or previously
     * existing.
     *
     * @param project
     */
    function save(project) {
      var resource = new ProjectResource(project);

      if (typeof project.id === 'undefined') {
        resource.$save();
      } else {
        resource.$update({
          projectId: project.id
        });
      }
    }

    /**
     * Service function for creating a new project.
     *
     * @returns {Project}
     */
    function create() {
      return new Project();
    }

    return {
      create: create,
      save: save,
      list: list,
      get: get
    };
  }]);
'use strict';

/*
 * Handles application state in regards to the currently accessed Projects.
 */
angular.module('PSMasterMindApp')
  .service('ProjectsService', ['Restangular', function (Restangular) {
      /**
       * Create a reference to a server side resource for Projects.
       *
       * The query method returns an object with a property 'data' containing
       * the list of projects.
       */
    var Resource,
      /*
       * Defines the default values for a newly created Project.
       */
      projectDefaults = {
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
    function Project(options) {
      var properties = options || projectDefaults;
      angular.extend(this, angular.copy(properties));
    }

    /**
     * Adds a role to the Project.
     *
     * @param role
     */
    Project.prototype.addRole = function (role) {
      this.roles.push(role);
    };

    /**
     * Configure Restangular for projects. The 'getList' method returns an object
     * with metadata, so for now just grab its data element so we have an array
     * of objects.
     *
     * Then, when fetching projects, we need to transform them by adding Project
     * prototype functions to them.
     */
    var ProjectsRestangular = Restangular.withConfig(function (RestangularConfigurer) {
      RestangularConfigurer.setResponseInterceptor(function (data, operation, what) {
        var newData = data;

        if (what === 'projects') {
          if (operation === 'getList') {
            newData = data.data;
          }
        }

        return newData;
      }).addElementTransformer('projects', false, function (element) {
        angular.extend(element, Project.prototype);

        if (element.startDate !== null) {
          element.startDate = new Date(element.startDate);
        }

        if (element.endDate !== null) {
          element.endDate = new Date(element.endDate);
        }

        return element;
      });
    });

    Resource = ProjectsRestangular.all('projects');

    /**
     * Service function for retrieving all projects.
     *
     * @returns {*}
     */
    function list() {
      return Resource.getList();
    }

    /**
     * Service function for retrieving a project by its ID.
     *
     * @param projectId
     * @returns {*|Object}
     */
    function get(projectId) {
      return Resource.get(projectId);
    }

    /**
     * Service function for persisting a project, new or previously
     * existing.
     *
     * @param project
     */
    function save(project) {
      var val;

      if (typeof project.id === 'undefined') {
        val = Resource.post(project);
      } else {
        val = project.put();
      }

      return val;
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
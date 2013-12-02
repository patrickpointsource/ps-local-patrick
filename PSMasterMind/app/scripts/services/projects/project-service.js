'use strict';

/*
 * Handles application state in regards to the currently accessed Projects.
 */
angular.module('Mastermind.services.projects')
  .service('ProjectsService', ['Restangular', 'Project', function (Restangular, Project) {
      /**
       * Create a reference to a server side resource for Projects.
       *
       * The query method returns an object with a property 'data' containing
       * the list of projects.
       */
    var Resource,

      /**
       * Configure Restangular for projects. The 'getList' method returns an object
       * with metadata, so for now just grab its data element so we have an array
       * of objects.
       *
       * Then, when fetching projects, we need to transform them by adding Project
       * prototype functions to them.
       */
      ProjectsRestangular;

    /**
     * Configure a specific instance of Restangular for dealing with the #getList
     * need for mapping its data.
     *
     * Also, transform each returned object into a Project.
     * @type {*}
     */
    ProjectsRestangular = Restangular.withConfig(function (RestangularConfigurer) {
      RestangularConfigurer.setResponseInterceptor(function (data, operation, what) {
        var newData = data;

        if (what === 'projects') {
          if (operation === 'getList') {
            newData = data.data;
          }
        }

        return newData;
      }).addElementTransformer('projects', false, function (element) {
        return new Project(element);
      });
    });

    Resource = ProjectsRestangular.all('projects');

    /**
     * Service function for retrieving all projects.
     *
     * @returns {*}
     */
    this.list = function () {
      return Resource.getList();
    };

    /**
     * Service function for retrieving a project by its ID.
     *
     * @param projectId
     * @returns {*|Object}
     */
    this.get = function (projectId) {
      return Resource.get(projectId);
    };

    /**
     * Service function for persisting a project, new or previously
     * existing.
     *
     * @param project
     */
    this.save = function (project) {
      var val;

      if (this.isTransient(project)) {
        val = Resource.post(project);
      } else {
        // Add properties for the server.
        project._id = project.$meta._id;
        project.etag = project.$meta.etag;

        val = Resource.customPUT(project, project.id);
      }

      return val;
    };

    this.isTransient = function (project) {
      return typeof project.id === 'undefined';
    };

    /**
     * Service function for creating a new project.
     *
     * @returns {Project}
     */
    this.create = function () {
      return new Project();
    };
  }]);
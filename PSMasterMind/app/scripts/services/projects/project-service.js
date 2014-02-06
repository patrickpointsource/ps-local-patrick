'use strict';

/*
 * Handles application state in regards to the currently accessed Projects.
 */
angular.module('Mastermind.services.projects')
  .service('ProjectsService', ['$q', 'Restangular', 'Resources', 'Project', function ($q, Restangular, Resources, Project) {
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
     * Service function for persisting a project, new or previously
     * existing.
     *
     * @param project
     */
    this.save = function (project) {
      var val;

      // fix datepicker making dates = '' when clearing them out
      if (project.startDate === null || project.startDate === '') {
        project.startDate = undefined;
      }
      if (project.endDate === null || project.endDate === '') {
        project.endDate = undefined;
      }

      for (var i=0; i<project.roles.length; i++) {
        if (project.roles[i].startDate === null || project.startDate === '') {
          project.startDate = undefined;
        }
        if (project.roles[i].endDate === null || project.endDate === '') {
          project.endDate = undefined;
        }
      }

      if (this.isTransient(project)) {
        val = Resource.post(project);
      } else {
        // Add properties for the server.
        project._id = project.$meta._id;
        project.etag = project.$meta.etag;

        val = Resources.update(project);
      }

      return val;
    };

    /**
     * Delete a project from the server.
     *
     * @param project
     * @returns {*}
     */
    this.destroy = function (project) {
      var url = project.about?project.about:project.resource;
      return Resources.remove(url);
    };

    /**
     * Determine whether a project has not been saved to the server yet.
     *
     * @param project
     * @returns {boolean}
     */
    this.isTransient = function (project) {
      return typeof project.about === 'undefined';
    };

    /**
     * Return a defered operation that fetches a project for edit
     */
    this.getForEdit = function(projectId){
      var deferred = $q.defer();

      setTimeout(function() {
        Resources.refresh('projects/'+projectId).then(function(project){
          var proj = new Project(project);
          deferred.resolve(proj);
        });
      }, 10);

      return deferred.promise;
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
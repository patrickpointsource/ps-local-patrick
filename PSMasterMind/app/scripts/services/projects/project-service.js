'use strict';

angular.module('PSMasterMindApp')
  .service('Projects', [ '$resource', function ($resource) {
    var PROJECTS_KEY = "PS_PROJECTS";
    var LAST_PROJECT_INDEX_KEY = "PS_LAST_PROJECT_INDEX";
    var ProjectResource = $resource('http://localhost:8080/MasterMindServer/rest/projects/:projectId?access_token=xxx', {
      projectId: '@projectId'
    }, {

    });

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

    function Project() {
      angular.extend(this, projectDefaults);
    }

    Project.prototype.addRole = function (role) {
      this.roles.push(role);
    };

    function list() {
      return ProjectResource.query();
    }

    var editProject;
    function get(projectId) {
      if(typeof editProject === 'undefined') {
        editProject = ProjectResource.get({ projectId: projectId });
      }

      return editProject;
    }

    function save(project) {
      var newProject = new ProjectResource(project);
      newProject.$save();
    }

    var newProject = new Project();

    return {
      current: function () {
        return newProject;
      },
      create: function () {
        newProject = new Project();

        return newProject;
      },
      save: save,
      list: list,
      get: get
    };
  }]);
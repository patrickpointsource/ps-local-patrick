'use strict';

angular.module('Mastermind.models.projects')
  .factory('Terms', function () {
    var defaults = {
        totalEstimatedValue: 0,
        includesProjectManagementOverhead: false,
        type: 'timeAndMaterials'
      };

    function Terms(options) {
      options = options || {};

      this.totalEstimatedValue = options.totalEstimatedValue || defaults.totalEstimatedValue;
      this.includesProjectManagementOverhead = options.includesProjectManagementOverhead || defaults.includesProjectManagementOverhead;
      this.type = options.type || defaults.type;
    }

    return Terms;
  })
  .factory('Project', function (Terms) {
    /*
     * Defines the default values for a newly created Project.
     */
    var defaults = {
      customerName: '',
      name: '',
      type: '',
      primaryContact: '',
      description: '',
      startDate: null,
      endDate: null,
      state: 'planning',
      terms: new Terms(),
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
      options = options || {};

      this.id = options.id;
      this.customerName = options.customerName || defaults.customerName;
      this.name = options.name || defaults.name;
      this.type = options.type || defaults.type;
      this.primaryContact = options.primaryContact || defaults.primaryContact;
      this.description = options.description || defaults.description;
      this.startDate = options.startDate ? new Date(options.startDate) : defaults.startDate;
      this.endDate = options.endDate ? new Date(options.endDate) : defaults.endDate;
      this.state = options.state || defaults.state;
      this.terms = new Terms(options.terms);
      this.executiveSponsor = options.executiveSponsor || defaults.executiveSponsor;
      this.roles = options.roles || defaults.roles;

      // Add meta info from MongoDB.
      this.$meta = {};
      this.$meta._id = options._id;
      this.$meta.etag = options.etag;
    }

    /**
     * The rules for a valid project.
     *
     * Required fields:
     *  - Customer Name
     *  - Project Name
     *  - Start Date
     *  - Executive Sponsor
     *
     * One or more of the following has to be true
     *  - Project has a Project Manager role
     *  - Project has a Business Analyst role
     *  - Project terms include 10% project management overhead
     *
     * @type {Array}
     */
    Project.prototype.rules = [{
      description: 'Must have a customer name.',
      check: function () {
        return !_.isEmpty(this.customerName);
      }
    }, {
      description: 'Must have a project name.',
      check: function () {
        return !_.isEmpty(this.name);
      }
    }, {
      description: 'Must have a start date.',
      check: function () {
        return _.isDate(this.startDate);
      }
    }, {
      description: 'Must have an executive sponsor.',
      check: function () {
        return !_.isEmpty(this.executiveSponsor);
      }
    }, {
      description: 'Must have added a Business Analyst or Project Management role or checked that the terms of the project includes project management overhead.',
      check: function () {
        var roleIds = _(this.roles).pluck('type').pluck('id');

        return roleIds.contains('BA') || roleIds.contains('PM') || this.terms.includesProjectManagementOverhead;
      }
    }];

    /**
     * Adds a role to the Project.
     *
     * @param role
     */
    Project.prototype.addRole = function (role) {
      this.roles.push(role);
    };

    /**
     * Validate the project according to its rules.
     *
     * @returns {{valid: Boolean, messages: String[]}}
     */
    Project.prototype.validate = function () {
      var self = this,

        messages = _(this.rules).filter(function (validator) {
          return !validator.check.call(self);
        }).map(function (validator) {
            return validator.description;
          }).value();

      return {
        valid: _.isEmpty(messages),
        messages: messages
      };
    };

    return Project;
  });
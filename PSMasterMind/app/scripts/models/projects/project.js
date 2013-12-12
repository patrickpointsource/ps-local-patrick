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
  .factory('Role', function (Rates, RateFactory) {
    /**
     * The defaults for a newly created role.
     *
     * @type {{rate: HourlyRate, shore: string}}
     */
    var defaults = {
      type: undefined,
      rate: RateFactory.build(Rates.HOURLY),
      shore: 'on',
      startDate: undefined,
      endDate: undefined,
      assignee: undefined
    };

    /**
     * Creates a new Role with default properties.
     *
     * @constructor
     */
    function Role(options) {
      options = options || {};

      this.type = options.type || defaults.type;
      this.rate = RateFactory.build(options.rate) || angular.copy(defaults.rate);
      this.shore = options.shore || defaults.shore;
      this.startDate = options.startDate ? new Date(options.startDate) : defaults.startDate;
      this.endDate = options.endDate ? new Date(options.endDate) : defaults.endDate;
      this.assignee = options.assignee || defaults.assignee;
    }

    return Role;
  })
  .factory('Project', function (Terms, Role) {
    /*
     * Defines the default values for a newly created Project.
     */
    var defaults = {
      customerName: '',
      name: '',
      type: undefined,
      primaryContact: undefined,
      description: undefined,
      startDate: undefined,
      endDate: undefined,
      state: 'planning',
      terms: new Terms(),
      executiveSponsor: undefined,
      salesSponsor: undefined,
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
      this.startDate = options.startDate ? formatDate(options.startDate) : defaults.startDate;
      this.endDate = options.endDate ? formatDate(options.endDate) : defaults.endDate;
      this.state = options.state || defaults.state;
      this.terms = new Terms(options.terms);
      this.executiveSponsor = options.executiveSponsor || defaults.executiveSponsor;
      this.salesSponsor = options.salesSponsor || defaults.salesSponsor;
      this.roles = _.map(options.roles, function (role) {
        return new Role(role);
      });

      /**
       * Creates a fluent interface for accessing a subset of roles on this Project.
       *
       * @param startIndex
       * @returns {{to: function(this: Project): Role[]}}
       */
      this.roles.from = function (startIndex) {
        return {
          to: _.bind(function (endIndex) {
            return this.slice(startIndex, endIndex);
          }, this)
        };
      };

      // Add meta info from MongoDB.
      this.$meta._id = options._id;
      this.$meta.etag = options.etag;
    }

    function formatDate(date) {
      if (date.indexOf('T') !== -1) {
        date = date.substr(0, date.indexOf('T'));
      }
      return date;
      // var year = dateArray[0];
      // var month = dateArray[1];
      // var day = dateArray[2].substr(0,2);
      // return month + '/' + day + '/' + year;

    }

    Project.prototype.$meta = {};

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
     * The Project must have at least one role.
     *
     * @type {Array}
     */
    Project.prototype.$meta.rules = [{
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
    }, {
      description: 'Must have at least one role',
      check: function () {
        return _.size(this.roles) > 0;
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
     * Changes a role in the Project.
     *
     * @param role
     */
    Project.prototype.changeRole = function (index, role) {
      this.roles[index] = role;
    };

    /**
     * Removes a role from the Project.
     *
     * @param role
     */
    Project.prototype.removeRole = function (role) {
      var roles = this.roles,
        roleIndex = roles.indexOf(role);

      roles.splice(roleIndex, 1);
    };

    /**
     * Validate the project according to its rules.
     *
     * @returns {{valid: Boolean, messages: String[]}}
     */
    Project.prototype.validate = function () {
      var self = this,

        messages = _(this.$meta.rules).filter(function (validator) {
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
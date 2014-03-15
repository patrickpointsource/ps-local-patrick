/* global _ */
'use strict';

angular.module('Mastermind.models.projects')
  .factory('Terms', function () {
    var defaults = {
      includesProjectManagementOverhead: false,
      type: 'timeAndMaterials'
    };

    function Terms(options) {
      options = options || {};

      this.servicesEstimate = options.servicesEstimate || defaults.servicesEstimate;
      this.softwareEstimate = options.softwareEstimate || defaults.softwareEstimate;
      this.includesProjectManagementOverhead = options.includesProjectManagementOverhead || defaults.includesProjectManagementOverhead;
      this.type = options.type || defaults.type;
    }

    return Terms;
  })
  .factory('Role', ['Rates','RateFactory', 'Assignment', function (Rates, RateFactory, Assignment) {
    /**
     * The defaults for a newly created role.
     *
     * @type {{rate: HourlyRate, shore: string}}
     */
    var defaults = {
    	_id: undefined,
    about: undefined,
      type: undefined,
      rate: RateFactory.build(Rates.HOURLY),
      shore: 'on',
      startDate: undefined,
      endDate: undefined,
      assignee: undefined
    };

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

    Role.prototype.formatMoney = function(num, c, d, t){
    	var n = num, 
    	    c = isNaN(c = Math.abs(c)) ? 2 : c, 
    	    d = d == undefined ? "." : d, 
    	    t = t == undefined ? "," : t, 
    	    s = n < 0 ? "-" : "", 
    	    i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", 
    	    j = (j = i.length) > 3 ? j % 3 : 0;
    	   return '$' + s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
	 };
    
    /**
     * Creates a new Role with default properties.
     *
     * @constructor
     */
    function Role(options) {
      options = options || {};

      this.about = options.about || defaults.about;
      this._id = options._id || defaults._id;
      this.type = options.type || defaults.type;
      this.rate = RateFactory.build(options.rate) || angular.copy(defaults.rate);
      this.shore = options.shore || defaults.shore;
      this.startDate = options.startDate ? formatDate(options.startDate) : defaults.startDate;
      this.endDate = options.endDate ? formatDate(options.endDate) : defaults.endDate;
      
      this.assignees = [];
      
      if (options.assignees) {
    	  
    	  
    	  for (var i = 0; i < options.assignees.length; i ++)
    		  this.assignees.push(new Assignment( options.assignees[i] ))
      } else if (options.assignee)
    	  this.assignees = [new Assignment( options.assignee )];
      
      this.assignee = options.assignee || defaults.assignee;
    }

    return Role;
  }])
  .factory('Assignment', ['Rates','RateFactory',function (Rates, RateFactory) {
    /**
     * The defaults for a newly created role.
     *
     * @type {{rate: HourlyRate, shore: string}}
     */
    var defaults = {
      about: undefined,
      type: undefined,
      startDate: undefined,
      endDate: undefined,
      person: undefined
    };

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
 
    /**
     * Creates a new Role with default properties.
     *
     * @constructor
     */
    function Assignment(options) {
      options = options || {};
      
      this.about = options.about || defaults.about;
      this.percentage = options.percentage || defaults.percentage;
      this.startDate = options.startDate ? formatDate(options.startDate) : defaults.startDate;
      this.endDate = options.endDate ? formatDate(options.endDate) : defaults.endDate;
      this.person = options.person || defaults.person;
    }

    return Assignment;
  }])
  .factory('Project', ['Terms','Role',function (Terms, Role) {
    /*
     * Defines the default values for a newly created Project.
     */
    var defaults = {
      about: undefined,
      customerName: '',
      name: '',
      type: undefined,
      primaryContact: undefined,
      description: '',
      startDate: undefined,
      endDate: undefined,
      state: 'planning',
      terms: new Terms(),
      executiveSponsor: undefined,
      salesSponsor: undefined,
      roles: [],
      created: undefined,
      modified: undefined,
      committed: false
    };

    /**
     * Constructs a new instance of a Project. A Project is a time-bound
     * goal for which various employee roles may be assigned.
     *
     * @constructor
     */
    function Project(options) {
      options = options || {};

      this.about = options.about || defaults.about;
      this.resource = options.resource || defaults.resource;
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
      this.created = options.created || defaults.created;
      this.modified = options.modified || defaults.modified;
      this.committed = options.committed || defaults.committed;
      
      //Items to cache to check against inital value onto
      this.initStartDate = this.startDate;

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
  }]);
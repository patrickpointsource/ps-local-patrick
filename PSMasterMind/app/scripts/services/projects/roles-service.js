'use strict';

angular.module('PSMasterMindApp')
  .factory('RolesService', function () {

    /**
     * The defaults for newly created monthly rates.
     *
     * @type {{type: string, fullyUtilized: boolean, hours: number, amount: number}}
     */
    var monthlyRateDefaults,
      /**
       * The defaults for a newly created role.
       *
       * @type {{rate: HourlyRate, shore: string}}
       */
      roleDefaults,
      /**
       * Defines the defaults for a new hourly rate.
       *
       * @type {{type: string, fullyUtilized: boolean, hoursPerMonth: number, amount: number}}
       */
      hourlyRateDefaults,
      /**
       * The default values for a newly created weekly rate.
       *
       * @type {{type: string, fullyUtilized: boolean, hoursPerWeek: number, amount: number}}
       */
      weeklyRateDefaults;

    /**
     * Removes any entries from an object where the value is
     * undefined. Other falsy values like false and null are
     * not removed. Does not modify the passed in object, but
     * instead returns a new object just with entries which
     * have a value.
     */
    function removeUndefinedValues(object) {
      var objectWithOnlyValues = {};

      angular.forEach(object, function (value, key) {
        if (typeof value !== 'undefined') {
          objectWithOnlyValues[key] = value;
        }
      });

      return objectWithOnlyValues;
    }

    hourlyRateDefaults = {
      type: 'hourly',
      fullyUtilized: false,
      hoursPerMonth: 0,
      amount: 0
    };

    /**
     * Creates a new HourlyRate with optional values for hours per
     * month and full utilization.
     *
     * @param fullyUtilized whether this role is fully utilized over a month.
     * @param hoursPerMonth the number of hours this role is required each month.
     * @constructor
     */
    function HourlyRate(fullyUtilized, hoursPerMonth) {
      var userEnteredRate = {
        fullyUtilized: fullyUtilized,
        hoursPerMonth: hoursPerMonth
      };

      angular.extend(this, hourlyRateDefaults, removeUndefinedValues(userEnteredRate));
    }

    weeklyRateDefaults = {
      type: 'weekly',
      fullyUtilized: false,
      hoursPerWeek: 0,
      amount: 0
    };

    /**
     * Creates a new WeeklyRate with optional values for hours per
     * week and full utilization.
     *
     * @param fullyUtilized whether this role is fully utilized over the month.
     * @param hoursPerWeek the number of hours this role is required per week.
     * @constructor
     */
    function WeeklyRate(fullyUtilized, hoursPerWeek) {
      var userEnteredRate = {
        fullyUtilized: fullyUtilized,
        hoursPerWeek: hoursPerWeek
      };

      angular.extend(this, weeklyRateDefaults, removeUndefinedValues(userEnteredRate));
    }

    monthlyRateDefaults = {
      type: 'monthly',
      fullyUtilized: true,
      hours: 180,
      amount: 0
    };

    /**
     * Creates a new MonthlyRate. It is considered fully utilized and the
     * hours are set at 180.
     *
     * @constructor
     */
    function MonthlyRate() {
      angular.extend(this, monthlyRateDefaults);
    }

    roleDefaults = {
      rate: new HourlyRate(),
      shore: 'on'
    };

    /**
     * Creates a new Role with default properties.
     *
     * @constructor
     */
    function Role() {
      angular.extend(this, roleDefaults);
    }

    /**
     * Change a Role's rate type between hourly, weekly, and monthly.
     *
     * @param newType 'hourly', 'weekly', or 'monthly'
     */
    Role.prototype.changeType = function (newType) {
      var rate;

      switch (newType) {
        case 'hourly':
          rate = new HourlyRate();
          break;
        case 'weekly':
          rate = new WeeklyRate();
          break;
        case 'monthly':
          rate = new MonthlyRate();
          break;
      }

      this.rate = rate;
    };

    return {
      create: function () {
        return new Role();
      }
    };
  });
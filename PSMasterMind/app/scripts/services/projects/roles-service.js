'use strict';

angular.module('PSMasterMindApp')
  .factory('Roles', function () {

    /*
     * Removes any entries from an object where the value is
     * undefined. Other falsy values like false and null are
     * not removed. Does not modify the passed in object, but
     * instead returns a new object just with entries which
     * have a value.
     */
    var removeUndefinedValues = function (object) {
      var objectWithOnlyValues = {};

      angular.forEach(object, function (value, key) {
        if (typeof value !== 'undefined') {
          objectWithOnlyValues[key] = value;
        }
      });

      return objectWithOnlyValues;
    };

    var hourlyRateDefaults = {
      type: 'hourly',
      fullyUtilized: false,
      hoursPerMonth: 0,
      amount: 0
    };

    /*
     * Creates a new HourlyRate with optional values for hours per
     * month and full utilization.
     */
    function HourlyRate(fullyUtilized, hoursPerMonth) {
      var userEnteredRate = {
        fullyUtilized: fullyUtilized,
        hoursPerMonth: hoursPerMonth
      };

      angular.extend(this, hourlyRateDefaults, removeUndefinedValues(userEnteredRate));
    }

    var weeklyRateDefaults = {
      type: 'weekly',
      fullyUtilized: false,
      hoursPerWeek: 0,
      amount: 0
    };

    /*
     * Creates a new WeeklyRate with optional values for hours per
     * week and full utilization.
     */
    function WeeklyRate(fullyUtilized, hoursPerWeek) {
      var userEnteredRate = {
        fullyUtilized: fullyUtilized,
        hoursPerWeek: hoursPerWeek
      };

      angular.extend(this, weeklyRateDefaults, removeUndefinedValues(userEnteredRate));
    }

    var monthlyRateDefaults = {
      type: 'monthly',
      fullyUtilized: true,
      hours: 180,
      amount: 0
    };

    /*
     * Creates a new MonthlyRate. It is considered fully utilized and the
     * hours are set at 180.
     */
    function MonthlyRate() {
      angular.extend(this, monthlyRateDefaults);
    }

    var defaults = {
      rate: new HourlyRate(),
      shore: 'on'
    };

    function Role(options) {
      angular.extend(this, defaults, options);
    }

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

    var newRole = new Role();

    return {
      current: function () {
        return newRole;
      },
      create: function () {
        newRole = new Role();

        return newRole;
      }
    };
  });
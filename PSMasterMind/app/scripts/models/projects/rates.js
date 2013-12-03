'use strict';

/**
 * Create a factory for defining and building rates.
 *
 * @type {{rates: {}, define: Function, build: Function}}
 */
angular.module('Mastermind.models.projects').constant('RateFactory', {
  rates: {},

  /**
   * Define a rate of rateType with the specified default values.
   *
   * @param rateType
   * @param rate
   */
  define: function (rateType, rate) {
    this.rates[rateType] = rate;
  },

  /**
   * Build a rate of rateType as previously defined using the #define function.
   */
  build: function (rateType) {
    var Rate = this.rates[rateType];

    return (Rate ? new Rate() : null);
  }
})
  .constant('Rates', {
    HOURLY: 'hourly',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly'
  })
  .factory('HourlyRate', function (Rates) {
    /**
     * Defines the defaults for a new hourly rate.
     *
     * @type {{type: string, fullyUtilized: boolean, hoursPerMonth: number, amount: number}}
     */
    var defaults = {
      fullyUtilized: false,
      hours: 0,
      amount: 0
    };

    function HourlyRate(options) {
      options = options || {};

      this.type = Rates.HOURLY;
      this.fullyUtilized = options.fullyUtilized || defaults.fullyUtilized;
      this.hours = options.hours || defaults.hours;
      this.amount = options.amount || defaults.amount;
    }

    return HourlyRate;
  })
  .factory('WeeklyRate', function (Rates) {
    /**
     * The default values for a newly created weekly rate.
     *
     * @type {{type: string, fullyUtilized: boolean, hoursPerWeek: number, amount: number}}
     */
    var defaults = {
      fullyUtilized: false,
      hours: 0,
      amount: 0
    };

    function WeeklyRate(options) {
      options = options || {};

      this.type = Rates.WEEKLY;
      this.fullyUtilized = options.fullyUtilized || defaults.fullyUtilized;
      this.hours = options.hours || defaults.hours;
      this.amount = options.amount || defaults.amount;
    }

    WeeklyRate.prototype.rules = [{
      description: 'Hours per week must be a positive number.',
      check: function () {
        var hours = this.hoursPerWeek;

        return _.isNumber(hours) && hours > 0;
      }
    }, {
      description: 'Hours per week cannot exceed 50 hours.',
      check: function () {
        var hours = this.hoursPerWeek;

        return _.isNumber(hours) && hours <= 50;
      }
    }];

    /**
     * Validate the weekly rate according to its rules.
     *
     * @returns {{valid: Boolean, messages: String[]}}
     */
    WeeklyRate.prototype.validate = function () {
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

    return WeeklyRate;
  })
  .factory('MonthlyRate', function (Rates) {
    /**
     * Monthly rates are considered fully utilized and the hours are set to 180.
     *
     * @type {{fullyUtilized: boolean, hours: number, amount: number}}
     */
    var defaults = {
      fullyUtilized: true,
      amount: 0
    };

    function MonthlyRate(options) {
      options = options || {};

      this.type = Rates.MONTHLY;
      this.fullyUtilized = defaults.fullyUtilized;
      this.amount = options.amount || defaults.amount;
    }

    return MonthlyRate;
  })
  .run(function (RateFactory, Rates, HourlyRate, WeeklyRate, MonthlyRate) {
    RateFactory.define(Rates.HOURLY, HourlyRate);
    RateFactory.define(Rates.WEEKLY, WeeklyRate);
    RateFactory.define(Rates.MONTHLY, MonthlyRate);
  });
/* global _ */
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
   *
   * If passed an object, grab the type property and construct the appropriate
   * object with the supplied properties.
   *
   * If passed a string, build a Rate for the specified type.
   *
   * @param {object|string} rateParam
   * @returns {Rate}
   */
  build: function (rateParam) {
    var rateType, config;

    if (_.isObject(rateParam) && _.has(rateParam, 'type')) {
      rateType = rateParam.type;
      config = rateParam;
    } else {
      rateType = rateParam;
    }

    var Rate = this.rates[rateType];

    return (Rate ? new Rate(config) : null);
  }
})
  .constant('Rates', {
    HOURLY: 'hourly',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly'
  })
  .factory('HourlyRate', ['Rates', function (Rates) {
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

    HourlyRate.prototype.isFullyUtilized = function () {
      return this.fullyUtilized;
    };

    HourlyRate.prototype.hoursPerMonth = function () {
      return parseFloat(this.hours).toFixed(1);
    };

    return HourlyRate;
  }])
  .factory('WeeklyRate', ['Rates', function (Rates) {
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

    WeeklyRate.prototype.isFullyUtilized = function () {
      return this.fullyUtilized;
    };

    WeeklyRate.prototype.hoursPerMonth = function () {
      // Weekly rate is currently hours per week. There are 5 working days per week
      // and 22.5 per month.
      return parseFloat(this.hours * 22.5 / 5).toFixed(1);
    };

    return WeeklyRate;
  }])
  .factory('MonthlyRate', ['Rates', function (Rates) {
    /**
     * Monthly rates are considered fully utilized and the hours are set to 180.
     *
     * @type {{fullyUtilized: boolean, hours: number, amount: number}}
     */
    var defaults = {
      amount: 0
    };

    function MonthlyRate(options) {
      options = options || {};

      this.fullyUtilized = true;
      this.type = Rates.MONTHLY;
      this.amount = options.amount || defaults.amount;
    }

    MonthlyRate.prototype.isFullyUtilized = function () {
      return true;
    };

    MonthlyRate.prototype.hoursPerMonth = function () {
      return parseFloat(180).toFixed(1);
    };

    return MonthlyRate;
  }])
  .run(['RateFactory','Rates','HourlyRate','WeeklyRate','MonthlyRate',function (RateFactory, Rates, HourlyRate, WeeklyRate, MonthlyRate) {
    RateFactory.define(Rates.HOURLY, HourlyRate);
    RateFactory.define(Rates.WEEKLY, WeeklyRate);
    RateFactory.define(Rates.MONTHLY, MonthlyRate);
  }]);
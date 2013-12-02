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
      hoursPerMonth: 0,
      amount: 0
    };

    function HourlyRate(options) {
      options = options || {};

      this.type = Rates.HOURLY;
      this.fullyUtilized = options.fullyUtilized || defaults.fullyUtilized;
      this.hoursPerMonth = options.hoursPerMonth || defaults.hoursPerMonth;
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
      hoursPerWeek: 0,
      amount: 0
    };

    function WeeklyRate(options) {
      options = options || {};

      this.type = Rates.WEEKLY;
      this.fullyUtilized = options.fullyUtilized || defaults.fullyUtilized;
      this.hoursPerWeek = options.hoursPerWeek || defaults.hoursPerWeek;
      this.amount = options.amount || defaults.amount;
    }

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
      hours: 180,
      amount: 0
    };

    function MonthlyRate(options) {
      options = options || {};

      this.type = Rates.MONTHLY;
      this.fullyUtilized = defaults.fullyUtilized;
      this.hours = defaults.hours;
      this.amount = options.amount || defaults.amount;
    }

    return MonthlyRate;
  })
  .run(function (RateFactory, Rates, HourlyRate, WeeklyRate, MonthlyRate) {
    RateFactory.define(Rates.HOURLY, HourlyRate);
    RateFactory.define(Rates.WEEKLY, WeeklyRate);
    RateFactory.define(Rates.MONTHLY, MonthlyRate);
  });
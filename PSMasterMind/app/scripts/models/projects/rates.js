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
  .constant('RateUnits', {
    HOURS: '$/hr',
    WEEKS: '$/hr',
    MONTHS: '$/month'
  })
  .factory('HourlyRate', ['Rates', 'RateUnits', function (Rates, RateUnits) {
    /**
     * Defines the defaults for a new hourly rate.
     *
     * @type {{type: string, fullyUtilized: boolean, hoursPerMonth: number, amount: number}}
     */
    var defaults = {
      fullyUtilized: false,
      hoursPerMth: 0,
      amount: 0,
      advAmount: 0,
      estimatedTotal: 0
    };

    function HourlyRate(options) {
      options = options || {};

      this.type = Rates.HOURLY;
      this.rateUnits = RateUnits.HOURS;
      this.fullyUtilized = options.fullyUtilized || defaults.fullyUtilized;
      this.hoursPerMth = options.hoursPerMth || defaults.hoursPerMth;
      this.amount = options.amount || defaults.amount;
      this.advAmount = options.advAmount || defaults.advAmount;
      this.estimatedTotal = options.estimatedTotal || defaults.estimatedTotal;
    }

    HourlyRate.prototype.isFullyUtilized = function () {
      return this.fullyUtilized;
    };

    HourlyRate.prototype.hoursPerMonth = function () {
      if(this.fullyUtilized) return 180;
      return parseFloat(this.hoursPerMth).toFixed(1);
    };
    
    HourlyRate.prototype.getNumberOfTUs = function () {
    	var num = 180;
        if(this.fullyUtilized) return num.toString().concat(" hours/ month");
        return parseFloat(this.hoursPerMth).toFixed(0).toString().concat(" hours/ month");
      };

    HourlyRate.prototype.getNumPeriods = function (startD, endD) {
    	var startDate = new Date(startD);
    	var endDate = new Date(endD);
      	var numMonths = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
        return numMonths.toString().concat(" months");
    };      
    
    HourlyRate.prototype.getEstimatedTotal = function (startD, endD) {
    	var startDate = new Date(startD);
    	var endDate = new Date(endD);
      	var numMonths = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
      	
      	//This should default to 0 is the other values are not set
      	if(numMonths && this.amount){
	      	if(this.fullyUtilized) {
	      		this.estimatedTotal = numMonths * 180 * this.amount;
	      	}
	      	else if(this.hoursPerMth){
	      		this.estimatedTotal = numMonths * this.hoursPerMth * this.amount;
	      	}
      	}
    	
      	return this.estimatedTotal;

    }; 
    
    return HourlyRate;
  }])
  .factory('WeeklyRate', ['Rates', 'RateUnits', function (Rates, RateUnits) {
    /**
     * The default values for a newly created weekly rate.
     *
     * @type {{type: string, fullyUtilized: boolean, hoursPerWeek: number, amount: number}}
     */
    var defaults = {
      fullyUtilized: false,
      hoursPerWeek: 0,
      amount: 0,
      advAmount: 0,
      estimatedTotal: 0
    };

    function WeeklyRate(options) {
      options = options || {};

      this.type = Rates.WEEKLY;
      this.rateUnits = RateUnits.WEEKS;
      this.fullyUtilized = options.fullyUtilized || defaults.fullyUtilized;
      this.hoursPerWeek = options.hoursPerWeek || defaults.hoursPerWeek;
      this.amount = options.amount || defaults.amount;
      this.advAmount = options.advAmount || defaults.advAmount;
      this.estimatedTotal = options.estimatedTotal || defaults.estimatedTotal;
    }

    WeeklyRate.prototype.isFullyUtilized = function () {
      return this.fullyUtilized;
    };

    WeeklyRate.prototype.hoursPerMonth = function () {
      if(this.fullyUtilized) return 180;
      // Weekly rate is currently hours per week. There are 5 working days per week
      // and 22.5 per month.
      return parseFloat(this.hoursPerWeek * 22.5 / 5).toFixed(1);
    };

    WeeklyRate.prototype.getNumberOfTUs = function () {
    	var num=40;
        if(this.fullyUtilized) return num.toString().concat(" hours/ week");
        return parseFloat(this.hoursPerWeek).toFixed(0).toString().concat(" hours/ week");
    };

    WeeklyRate.prototype.getNumPeriods = function (startD, endD) {
    	var startDate = new Date(startD);
    	var endDate = new Date(endD);
      	var numWeeks = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 4.5));
        return numWeeks.toString().concat(" weeks");
    }; 
    
    WeeklyRate.prototype.getEstimatedTotal = function (startD, endD) {
    	var startDate = new Date(startD);
    	var endDate = new Date(endD);
      	var numWeeks = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 4.5));
      	//This should default to 0 is the other values are not set
      	if(numWeeks && this.hoursPerWeek && this.amount){
      		this.estimatedTotal = numWeeks * this.hoursPerWeek * this.amount;
      	}
        return this.estimatedTotal;
    }; 
    return WeeklyRate;
  }])
  .factory('MonthlyRate', ['Rates', 'RateUnits', function (Rates, RateUnits) {
    /**
     * Monthly rates are considered fully utilized and the hours are set to 180.
     *
     * @type {{fullyUtilized: boolean, hours: number, amount: number}}
     */
    var defaults = {
      amount: 0,
      advAmount: 0,
      estimatedTotal: 0
    };

    function MonthlyRate(options) {
      options = options || {};

      this.fullyUtilized = true;
      this.type = Rates.MONTHLY;
      this.rateUnits = RateUnits.MONTHS;
      this.amount = options.amount || defaults.amount;
      this.advAmount = options.advAmount || defaults.advAmount;
      this.estimatedTotal = options.estimatedTotal || defaults.estimatedTotal;
    }

    MonthlyRate.prototype.isFullyUtilized = function () {
      return true;
    };

    MonthlyRate.prototype.hoursPerMonth = function () {
      if(this.fullyUtilized) return 180;
      return parseFloat(180).toFixed(1);
    };

    MonthlyRate.prototype.getNumberOfTUs = function () {
    	
        if(this.fullyUtilized) return parseFloat(180).toFixed(0).toString().concat(" hours/ month");
        return parseFloat(180).toFixed(0).toString().concat(" hours/ month");
    };

    MonthlyRate.prototype.getNumPeriods = function (startD, endD) {
    	var startDate = new Date(startD);
    	var endDate = new Date(endD);
      	var numMonths = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
        return numMonths.toString().concat(" months");
    }; 

    MonthlyRate.prototype.getEstimatedTotal = function (startD, endD) {
		var startDate = new Date(startD);
		var endDate = new Date(endD);
		var numMonths = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
		//This should default to 0 is the other values are not set
		if(numMonths && this.amount){
			this.estimatedTotal = numMonths * this.amount;
		}
        return this.estimatedTotal;
    }; 
    
    return MonthlyRate;
  }])
  
  .run(['RateFactory','Rates','HourlyRate','WeeklyRate','MonthlyRate',function (RateFactory, Rates, HourlyRate, WeeklyRate, MonthlyRate) {
    RateFactory.define(Rates.HOURLY, HourlyRate);
    RateFactory.define(Rates.WEEKLY, WeeklyRate);
    RateFactory.define(Rates.MONTHLY, MonthlyRate);
  }]);

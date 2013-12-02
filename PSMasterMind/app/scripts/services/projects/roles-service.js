'use strict';

angular.module('Mastermind.services.projects')
  .service('RolesService', [ 'RateFactory', 'Rates', function (RateFactory, Rates) {

      /**
       * The defaults for a newly created role.
       *
       * @type {{rate: HourlyRate, shore: string}}
       */
    var roleDefaults = {
      rate: RateFactory.build(Rates.HOURLY),
      shore: 'on'
    };

    /**
     * Creates a new Role with default properties.
     *
     * @constructor
     */
    function Role(rateType) {
      rateType = rateType || Rates.HOURLY;

      angular.extend(this, roleDefaults, {rate: RateFactory.build(rateType)});
    }

    /**
     * Change a Role's rate type between hourly, weekly, and monthly.
     *
     * @param newType 'hourly', 'weekly', or 'monthly'
     */
    Role.prototype.changeType = function (newType) {
      this.rate = RateFactory.build(newType);
    };

    this.create = function (rateType) {
      return new Role(rateType);
    };
  }]);
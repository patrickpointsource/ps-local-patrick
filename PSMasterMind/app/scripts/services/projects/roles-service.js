'use strict';

angular.module('Mastermind.services.projects')
  .service('RolesService', function (RateFactory, Role) {
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
  });
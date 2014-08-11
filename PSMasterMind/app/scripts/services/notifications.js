'use strict';

/**
 * Notifications Service
 */
angular.module('Mastermind.services.projects')
  .service( 'NotificationsService', [ '$q', 'Restangular', 'Resources', function( $q, Restangular, Resources ) {
    /**
     * Service function for retrieving all notifications.
     *
     * @returns {*}
     */
    this.query = function( query, fields ) {
        var deferred = $q.defer( );

        Resources.query( 'notifications', query, fields, function( result ) {
            deferred.resolve( result );
        } );

        return deferred.promise;
    }
    
    this.add = function(notification) {
      return Resources.create('notifications', notification);
    }
    
    this.getPersonsNotifications = function(personResource) {
      var query = {
        person: {
            resource: personResource
        }
      };
      
      return this.query(query);
    }
} ] );

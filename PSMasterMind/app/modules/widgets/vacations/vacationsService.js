'use strict';

/*
 * Services dealing with the vacations service
 */
angular.module( 'Mastermind' ).service( 'VacationsService', [ '$q', 'Resources',
function( $q, Resources ) {

  this.getVacations = function(person) {
	var deferred = $q.defer( );
	
	var query = {
		person: {
			resource: person.about
		}
	};
	
	Resources.query('vacations', query, {}).then(function(result) {
	  deferred.resolve( result.members );
	});
	
	return deferred.promise;
  }
  
  this.addNewVacation = function(vacation) {
	var deferred = $q.defer( );
	
	Resources.create( 'vacations', vacation ).then(function(result) {
	  deferred.resolve( result );
	});
	
	return deferred.promise;
  }
} ] );
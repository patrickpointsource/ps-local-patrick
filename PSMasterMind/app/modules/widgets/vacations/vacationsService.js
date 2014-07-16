'use strict';

/*
 * Services dealing with the vacations service
 */
angular.module( 'Mastermind' ).service( 'VacationsService', [ '$q', 'Resources',
function( $q, Resources ) {

  this.STATUS = {
    Pending: "Pending",
    Approved: "Approved",
    Denied: "Denied"
  }
  
  this.VACATION_TYPES = {
    Appointment: "Appointment",
    Vacation: "Vacation",
    Travel: "Customer Travel",
    Training: "Conference/Training"
  }
  
  this.getVacations = function(profileId) {
	var deferred = $q.defer( );
	
	var query = {
		person: {
			resource: 'people/' + profileId
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
  
  this.getRequests = function(manager) {
    var deferred = $q.defer( );
    
    var query = { 
      $and: [ 
        {
          vacationManager: {
            resource: manager.about
          }
        },
        {
          status: "Pending"
        }
      ]
    };
    
    Resources.query('vacations', query, {}).then(function(result) {
      deferred.resolve( result.members );
    });
    
    return deferred.promise;
  }
  
  this.getOtherRequestsThisPeriod = function(manager, request) {
    var deferred = $q.defer( );
    
    //var today = moment().format("YYYY-MM-DD");
    
    var query = { 
      $and: [ 
        {
          vacationManager: {
            resource: manager.about
          }
        },
        {
          startDate: {$lte: request.endDate}
        },
        {
          endDate: {$gte: request.startDate}
        }
      ]
    };
    
    Resources.query('vacations', query, {}).then(function(result) {
      deferred.resolve( result.members );
    });
    
    return deferred.promise;
  }
  
  this.getDays = function(start, end) {
    if(!start || !end) {
      return "";
    }
    var actualDays = this.getActualDays(start, end);
    
    var days = "days";
    
    if(actualDays == 1) {
      days = "day";
      
      var diff = moment(end).diff(start, 'hours');
      if(diff < 8) {
        days = "hours";
        
        if(diff == 4) {
          return "0.5 day"
        }
        if(diff <= 1) {
          days = "hour";
        }
        
        actualDays = diff;
      }
    }
    
    return actualDays + " " + days;
  }
  
  this.getActualDays = function(startDate, endDate) {
    var start = moment(startDate);
    var end = moment(endDate);
    var allDays = end.diff(start ,'days');
    var actualDays = 0;
    
    for(var d = 0; d <= allDays; d++) {
      if(d != 0) {
        start.add('days', 1);
      }
      
      if(start.day() != 0 && start.day() != 6) {
        actualDays++;
      }
    }
    
    return actualDays;
  }
  
  this.getTypeText = function(type) {
    if(type == this.VACATION_TYPES.Appointment) {
      return this.VACATION_TYPES.Appointment;
    }
    if(type == this.VACATION_TYPES.Vacation) {
      return this.VACATION_TYPES.Vacation;
    }
    if(type == this.VACATION_TYPES.Travel) {
      return "Travel";
    }
    if(type == this.VACATION_TYPES.Training) {
      return "Conf./Training";
    }
  }
  
  this.getStatusText = function(status) {
    if(status == this.STATUS.Pending) {
      return "PENDING";
    }
    if(status == this.STATUS.Approved) {
      return "APPROVED";
    }
    if(status == this.STATUS.Denied) {
      return "DENIED";
    }
  }
} ] );
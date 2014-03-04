'use strict';

angular.module('Mastermind.services.projects')
  .service('AssignmentService', ['RateFactory','Assignment','Resources', function (RateFactory, Assignment, Resources) {
    /**
     * Change a Assignment's rate type between hourly, weekly, and monthly.
     *
     * @param newType 'hourly', 'weekly', or 'monthly'
     */
	Assignment.prototype.changeType = function (newType) {
      this.rate = RateFactory.build(newType);
    };

    /**
     * Create a new role
     *
     * @param rateType 'hourly', 'weekly', or 'monthly'
     */
    this.create = function (props) {
      return new Assignment(props);
    };

    /**
     * Validate a new Role being created on a project.
     *
     * @param project
     * @param newRole
     */
    this.validateAssignments = function(project, newRole, assignments){
      var errors = [];
      //Must select a type
      if(!newRole){
        errors.push('New Role is null');
      }
      else{
        //Assignee for each entry is Required
    	  var anyResourceUnassigned = false;
    	  var anyPercentageMissed = false;
    	  
    	  for (var i = 0; i < assignments.length; i ++) {
    		  if (!assignments[i].resource) 
    			  anyResourceUnassigned = true;
    		  
    		  if (!assignments[i].percentage)
    			  anyPercentageMissed = true;
    	  }

        if(anyResourceUnassigned){
          errors.push('For each assignee entry person is required');
        }
        
        if(anyPercentageMissed){
            errors.push('For each assignee entry percentage is required');
          }
      }
      
      return errors;
    }
    
    /**
     * Service function for persisting a project, new or previously
     * existing.
     *
     * @param project
     */
    this.save = function (project, role, assignments) {
      var val;

      for (var  i = 0; i < assignments.length; i ++) {
	      // fix datepicker making dates = '' when clearing them out
	      if (assignments[i].startDate === null || assignments[i].startDate === '') {
	    	  assignments[i].startDate = undefined;
	      }
	      if (assignments[i].endDate === null || assignments[i].endDate === '') {
	    	  assignments[i].endDate = undefined;
	      }
	
	     
      }
      
      var roleId = -1;
      var projectId = -1;
      /*
      val = Resources.update({
    	  about: assignments[0].about + '/' + projectId, 
    	  assignments: assignments
	  });
	  */
      
      Resources.create('assignments', assignments[0]).then(function(){
         
        });
      
      return val;
     // return null;
    }
    
  }])
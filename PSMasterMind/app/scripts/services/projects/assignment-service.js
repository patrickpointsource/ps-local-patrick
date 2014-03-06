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
     * Validate an assignments collection for specified role.
     *
     * @param project
     * @param assignments
     */
    this.validateAssignments = function(project, assignments){
      var errors = [];
     
    //Assignee for each entry is Required
	  var anyResourceUnassigned = false;
	  var anyPercentageMissed = false;
	  var countEmptyPersons = 0;
	  
	  for (var i = 0; i < assignments.length; i ++) {
		  if (!(assignments[i].person && assignments[i].person.resource)) 
			  anyResourceUnassigned = true;
		  
		  if (!assignments[i].percentage)
			  anyPercentageMissed = true;
		  
		  if (!assignments[i].percentage && !(assignments[i].person && assignments[i].person.resource))
			  countEmptyPersons ++;
	  }

	  // allow one entry assignment to keep role unassigned
    if(anyResourceUnassigned && anyPercentageMissed && (countEmptyPersons >= 1 && assignments.length > 1)){
      errors.push('For each assignee entry can\'t be empty');
    } else if(anyPercentageMissed && !anyResourceUnassigned){
        errors.push('For each assignee entry percentage is required');
    } else if(!anyPercentageMissed && anyResourceUnassigned){
        errors.push('For each assignee entry person is required');
    }
      
      
      return errors;
    }
    
    /**
     * Service function for persisting a project, new or previously
     * existing.
     *
     * @param project
     */
    this.save = function (project, projectAssignment) {
      var val;

      for (var  i = 0; i < projectAssignment.members.length; i ++) {
	      // fix datepicker making dates = '' when clearing them out
	      if (projectAssignment.members[i].startDate === null || projectAssignment.members[i].startDate === '') {
	    	  projectAssignment.members[i].startDate = undefined;
	      }
	      if (projectAssignment.members[i].endDate === null || projectAssignment.members[i].endDate === '') {
	    	  projectAssignment.members[i].endDate = undefined;
	      }
	
	     
      }
      
      
      val = Resources.update(projectAssignment);
	  
      
      /*
      Resources.create(project.about + '/assignments/', assignments).then(function(res){
    	  var res = res;
      })
      */
      return val;
     // return null;
    }
    
  }])
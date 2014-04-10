'use strict';

/*
 * Services dealing with the hours service
 */
angular.module('Mastermind')
  .service('HoursService', ['$q', 'Resources', function ($q, Resources) {
	  
	  /**
	   * Pushes a set of hours records out to the server
	   * 
	   * If a record has an _id property push it out at an update
	   * else process it as a create
	   */
	  this.updateHours = function (hoursRecords) {
		  var requests = [];
		  for(var i = 0; i < hoursRecords.length; i++){
			  var record = hoursRecords;
			  var id = record['_id'];
			  if(id){
				  requests.push(Resources.update(record));
			  }
			  else{
				  requests.push(Resources.create('hours', record));
			  }
		  }
	      
		  return $q.all(requests);
	  };
	  
	  /**
	   * Get today for queries
	   */
	  this.getToday = function(){
		  //Get todays date formatted as yyyy-MM-dd
		  var today = new Date();
		  var dd = today.getDate();
		  var mm = today.getMonth()+1; //January is 0!
		  var yyyy = today.getFullYear();
		  if (dd<10){
			  dd='0'+dd;
		  }
		  if (mm<10){
			  mm='0'+mm;
		  }
		  today = yyyy+'-'+mm+'-'+dd;
        
		  return today;
	  };
	  
	  /**
	   * Returns a set of hours entries for all day between 2 dates for a given user
	   */
	  this.getHoursRecordsBetweenDates = function(person, startDate, endDate){
		  var deferred = $q.defer();
		  
		  //Start by getting all assignments for a person between two dates
		  var personURI = person.about?person.about:person.resource;
		  var startDateMoment = moment(startDate);
		  var endDateMoment = moment(endDate);
		  var numDays = endDateMoment.diff(startDateMoment, 'days');
		  
		  var personURI = person.about?person.about:person.resource;
		  
		  var query = {
    			members:{
    				'$elemMatch':{
    					person:{
    						resource:person.about
    					},
    					startDate:{
    						$lte:endDate
    					},
    					$or:[
    					     {
    					    	 endDate:{
    					    		 $exists:false
    					    	}
    					     },
    					     {
    					    	 endDate:{
    					    		 $gte:startDate
    					    	 }
    					     }
    					     ]
    					}
    			}
		  };
		  var fields = {};
		  Resources.query('assignments', query, fields, function(result){
	        	var projectAssignments = result.data;
	        	
	        	//Fetch all hours entries between these two dates
	        	var hoursQuery = {
	        	    person:{
    						resource:person.about
    				},
    				$and:[
    				      {
    				    	  date:{
    				    		  $lte:endDate
    				    	  }
    				      },
    				      {
    				    	  date:{
    				    			$gte:startDate
    				    		}  
    				      }
    				]
    				
	        	};
    		  var hoursFields = {};
    		  Resources.query('hours', hoursQuery, hoursFields, function(result){
    			  var hoursResults = result.members;
    			  var ret = [];
    			  //Go through all the hours results and add them to the return array
    			  for(var i = 0; i < hoursResults.length;i++){
    				  var hoursRecord = hoursResults[i];
    				  var hoursMoment = moment(hoursRecord.date);
    				  
    				  //Get the difference in days
    				  var diff = hoursMoment.diff(startDateMoment, 'days');
    				  var entries = ret[diff];
    				  //Create the new entry if it does not exist
    				  if(!entries){
    					  entries = {
    							date: hoursRecord.date,
    							hoursEntries:[]
    					  };
    					  ret[diff] = entries;
    				  }
    				  
    				  entries.hoursEntries.push({
    					  project: hoursRecord.project,
    					  hoursRecord: hoursRecord
    				  });
    			  }
    			  
    			  
    			  //Go through all the assignments and add them to the return array
    			  for(var i = 0; i < projectAssignments.length;i++){
    				  var assignments = projectAssignments[i].members;
    				  var assignmentProjectURI = projectAssignments[i].project.resource;
    				  var assignmentRecord = null;
    				  for(var p = 0; p < assignments.length; p++){
    					  var assignment = assignments[p];
    					  if(assignment.person && assignment.person.resource && personURI == assignment.person.resource){
    						  //TODO make sure it is a current assignment
    						  assignmentRecord = assignment;
    						  break;
    						  
    					  }
    				  }
    				  
    				  //if we found a matching assignment
    				  if(assignmentRecord){
    					  var assignmentStartDate = moment(assignmentRecord.startDate);
        				  var assignmentEndDate = moment(assignmentRecord.endDate);
        				  
        				  
        				  //Loop through all the days
        				  for(var j = 0; j < numDays; j++){
        					  var entries = ret[j];
            				  //Create the new entry if it does not exist
            				  if(!entries){
            					  var date = moment(startDate).add('days',j).format('YYYY-MM-DD');
            					  entries = {
            							date: date,
            							hoursEntries:[]
            					  };
            					  ret[j] = entries;
            				  }
            				  
            				  //TODO Look through the hours records to see if there is one for this assignments project
            				  var existingEntry = null;
            				  for(var k = 0; k < entries.hoursEntries.length; k++){
            					  var entry = entries.hoursEntries[k];
            					  var hoursProjectURI = entry.project.resource;
            					  if(hoursProjectURI == assignmentProjectURI){
            						  existingEntry = entry.assignment = assignmentRecord;
            						  break;
            					  }
            					  
            				  }
            				  
            				  //Not Found
            				  if(!existingEntry){
	            				  entries.hoursEntries.push({
          							   project: {resource:assignmentProjectURI},
	            					  assignment: assignmentRecord
	            				  });
            				  }

        				 }
    				  }
    				  
    			  }
    			  //TODO Fetch all the projects associated with these assignments
    			  deferred.resolve(ret);
    		  });
    		 });
		  
		  return deferred.promise;
	  }
}]);
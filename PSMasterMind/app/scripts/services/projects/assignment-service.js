'use strict';

angular.module('Mastermind.services.projects')
  .service('AssignmentService', ['$q', 'RateFactory','Assignment','Resources', 'ProjectsService', function ($q, RateFactory, Assignment, Resources, ProjectsService) {
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
     * Get the assignment records for a set of projects
     * 
     * project records that include the about or resource properties set
     */
    this.getAssignments = function(projects){
    	var deferred = $q.defer();
    	var projectURIs = [];
    	for(var i = 0; i < projects.length; i++){
    		var project = projects[i];
    		var uri = project.about?project.about:project.resource;
    		
    		if(uri && projectURIs.indexOf(uri) == -1){
    			projectURIs.push(uri);
    		}
    	}
    	
    	var query = {'project.resource':{$in:projectURIs}};
    	Resources.query('assignments',query,null,function(result){
    		deferred.resolve(result);
    	});
    	
    	return deferred.promise;
    };
    
    /**
     * Get A person's Current Assignments 
     */
    this.getMyCurrentAssignments = function(person){
    	var deferred = $q.defer();
    	var startDateQuery = this.getToday();
    	var personURI = person.about?person.about:person.resource;
    	
    	var apQuery = {
    			members:{
    				'$elemMatch':{
    					person:{
    						resource:person.about
    					},
    					startDate:{
    						$lte:startDateQuery
    					},
    					$or:[
    					     {
    					    	 endDate:{
    					    		 $exists:false
    					    	}
    					     },
    					     {
    					    	 endDate:{
    					    		 $gt:startDateQuery
    					    	 }
    					     }
    					     ]
    					}
    			}
    	};
        var apFields = {};
        Resources.query('assignments', apQuery, apFields, function(result){
        	var projectAssignments = result.data;
        	var myProjects = [];
        	var assignments = [];
        	
        	//Loop through all the project level assignment documents that this person has an assignment in
        	for(var i = 0; i < projectAssignments.length;i++){
        		//Add the project to the list of projects to resolve
        		var projectAssignment = projectAssignments[i];
        		if (projectAssignment.project && projectAssignment.project.resource &&
        				myProjects.indexOf(projectAssignment.project.resource) === -1){
    				 //Push the assignee onto the active list
                    var resource = projectAssignment.project.resource;
                    //{_id:{$nin:[{$oid:'52a1eeec30044a209c47646b'},{$oid:'52a1eeec30044a209c476452'}]}}
                    var oid = {$oid:resource.substring(resource.lastIndexOf('/')+1)};
                    myProjects.push(oid);
    			}
        		
        		//Find all the assignments for this person
        		for(var j = 0; j < projectAssignment.members.length;j++){
        			var assignment = projectAssignment.members[j];
        			if(personURI == assignment.person.resource){
        				//Associate the project directly with the an assignment
        				assignment.project = projectAssignment.project;
        				assignments.push(assignment);
        			}
        		}
        	}
        	
        	var projectsQuery = {_id:{$in:myProjects}};
	        var projectsFields = {resource:1,name:1,customerName:1,startDate:1,endDate:1,type:1,committed:1};
	        Resources.query('projects',projectsQuery,projectsFields,function(result){
	        	var projects = result.data;
	        	
	        	//Collate projects with assignments
	        	for(var i = 0; i < assignments.length; i++){
	        		var assignment = assignments[i];
	        		//Find the matching project
	        		for(var j = 0; j < projects.length; j++){
	        			var project = projects[j];
	        			if(project.resource == assignment.project.resource){
	        				assignment.project = project;
	        				break;
	        			}
	        		}
	        	}
	        	
	        	deferred.resolve(assignments);
	        });
        });
        return deferred.promise;
    };
    
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
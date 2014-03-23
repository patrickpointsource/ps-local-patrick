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
		  
		  if (!assignments[i].percentage || !(assignments[i].person && assignments[i].person.resource))
			  countEmptyPersons ++;
	  }

	  // allow one entry assignment to keep role unassigned
    if(anyResourceUnassigned && anyPercentageMissed && (countEmptyPersons >= 1 && assignments.length > 1)){
      errors.push('For each assignee entry can\'t be empty');
    } else if(anyPercentageMissed && !anyResourceUnassigned){
        errors.push('For each assignee entry percentage is required');
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
     * Get today for js objects
     */
    this.getTodayDate = function(){
    	//Get todays date formatted as yyyy-MM-dd
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth(); //January is 0!
        var yyyy = today.getFullYear();
       
        
        return new Date(yyyy, mm, dd);
    };
    
    /**
     * Get the assignment records for a set of projects
     * 
     * project records that include the about or resource properties set
     */
    this.getAssignments = function(projects, timePeriod){
    	var deferred = $q.defer();
    	var projectURIs = [];

    	timePeriod = timePeriod ? timePeriod: "all";
    	
    	for(var i = 0; i < projects.length; i++){
    		var project = projects[i];
    		var uri = project.about?project.about:project.resource;
    		
    		if(uri && projectURIs.indexOf(uri) == -1){
    			projectURIs.push(uri);
    		}
    	}
    	
    	var query = {'project.resource':{$in:projectURIs}};
    	var _this = this;
    	
    	Resources.query('assignments',query,null,function(result){
    		//Get todays date formatted as yyyy-MM-dd
            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth(); //January is 0!
            var yyyy = today.getFullYear();
            today = new Date(yyyy, mm, dd);
    		
    		for (var i = 0;  result.data && i < result.data.length; i ++){
    			var assignmentsObject = result.data[i];
    			
    			if (assignmentsObject && assignmentsObject.members) {
    	    		var excluded = [];
    	    		var included = [];
    	    		
    	    		_.each(assignmentsObject.members, function(m) {
    	    			if (timePeriod == "current") {
    	    				if (new Date(m.startDate) <= today && (!m.endDate || new Date(m.endDate) > today) )
    	    					included.push(m)
    						else
    							excluded.push(m)
    	    			} else if (timePeriod == "future") {
    	    				if (new Date(m.startDate) >= today && (!m.endDate || new Date(m.endDate) > today) )
    	    					included.push(m)
    						else
    							excluded.push(m)
    	    			} else if (timePeriod == "past") {
    	    				if (new Date(m.startDate) < today && (!m.endDate || new Date(m.endDate) < today) )
    	    					included.push(m)
    						else
    							excluded.push(m)
    	    			} else if (timePeriod == "all") 
    	    				included.push(m)
    	    		})
    	    		
    	    		assignmentsObject.members = included;
    	    		assignmentsObject.excludedMembers = excluded;
    	    	}
       		 	result.data[i] = assignmentsObject;
    		}
    		deferred.resolve(result.data);
    	});
    	
    	return deferred.promise;
    };
    
    /**
     * Get A person's Assignments today and going forward
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
        			var endDate = assignment.endDate?assignment.endDate:null;
        			if(personURI == assignment.person.resource && (!endDate || endDate > startDateQuery)){
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
     * Filters out a set of assignments based on time period
     * 
     * 'current' == all active project
     * 'future' == all assignments that have not yet started
     * 'past' == all assignments that have already ends
     * 
     */
    this.getAssignmentsByPeriod = function(timePeriod, projectQuery) {
    	var deferred = $q.defer();
    	var apQuery = {};
    	var apFields = {};
    	
    	_.extend(apQuery, projectQuery);
    	
    	var _this = this;
    	
    	  Resources.query('assignments', apQuery, apFields).then(function(result){
    	    	var role;
    	    	
		      if(result && result.data && result.data.length > 0)
		    	    deferred.resolve(_this.filterAssignmentsByPeriod(result.data[0], timePeriod));
	    	  	else
		    	  deferred.resolve(null);
		    	  
    	    });
    	
    	 return deferred.promise;
    }
    
    
    this.filterAssignmentsByPeriod = function(assignmentsObject, period) {
    	
    	if (assignmentsObject && assignmentsObject.members) {
    		var today = this.getTodayDate();
    		var excluded = [];
    		var included = [];
    		
    		_.each(assignmentsObject.members, function(m) {
    			if (period == "current") {
    				if (new Date(m.startDate) <= today && (!m.endDate || new Date(m.endDate) > today) )
    					included.push(m)
					else
						excluded.push(m)
    			} else if (period == "future") {
    				if (new Date(m.startDate) >= today && (!m.endDate || new Date(m.endDate) > today) )
    					included.push(m)
					else
						excluded.push(m)
    			} else if (period == "past") {
    				if (new Date(m.startDate) < today && (!m.endDate || new Date(m.endDate) < today) )
    					included.push(m)
					else
						excluded.push(m)
    			} else if (period == "all") 
    				included.push(m)
    		})
    		
    		assignmentsObject.members = included;
    		assignmentsObject.excludedMembers = excluded;
    	}
    	
    	return assignmentsObject;
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
	  
      return val;
    }
    
    this.getRoles = function(project) {
    	return Resources.get(project.about + '/roles');
    }
    
    /**
     * Return the set of staffing deficits assignments for active projects
     */
    this.getActiveProjectStaffingDeficits = function(){
    	var deferred = $q.defer();
    	var getAssignments = this.getAssignments;
    	
    	/**
    	 * Get all the active projects
    	 */
    	ProjectsService.getActiveClientProjects(function(result){
    		var activeProjects = result.data;
    	    var activeProjectsWithUnassignedPeople = [];
    	    var unassignedIndex = 0;
    	    
    	    /**
    	     * Get all assigment records for each active project
    	     */
    	    getAssignments(activeProjects).then(function (assignments) {

	    	    for(var i = 0; i < activeProjects.length; i++){
	    	    	var proj = activeProjects[i];
	    	    	var roles = activeProjects[i].roles;

	    	    	var projAssignments = undefined;
	    	    	
	    			for(var l=0; l<assignments.count; l++) {
	    				projAssignments = assignments.data[l];
	    				if(projAssignments.project.resource == proj.resource) {
	    					if(projAssignments.members && projAssignments.members.length > 0) {
	    						var assignees = projAssignments.members;
	    				        if(roles){
				                      	/*
				                       	* Loop through all the roles in the active projects
				                       	*/
	    				               	for(var b = 0; b < roles.length; b++){
	    				            	   var activeRole = roles[b];		
	    				                   var foundRoleMatch = false;
	    				                   
					                        /*
					                         * Loop through assignees to find a match
					                         */
					                        for (var c=0; c<assignees.length; c++) {
					                        	//if(activeRole.about == assignees[c].role.resource) {
					                        	if(assignees[c].role.resource && assignees[c].role.resource.indexOf(activeRole._id) > -1) {
					                        		foundRoleMatch = true;
					                        	}
					                        }
	    				                        
					                        if(!foundRoleMatch) {
					                        	activeProjectsWithUnassignedPeople.push(activeRole);
					                        }
	    				               }
	    				        }
	    					}
	    				}
	    			}
	    			
	    			//If there were no assignments add all the roles to the list
	    	    	if(assignments.count == 0 || !projAssignments ){
	    	    		for(var b = 0; b < roles.length; b++){
			            	   var activeRole = roles[b];
			            	   activeProjectsWithUnassignedPeople.push(activeRole);
	    	    		}
	    	    	}
    	    }
    	    
    	    deferred.resolve(activeProjectsWithUnassignedPeople);
    	 });
    });
    	
    return deferred.promise;
  };
    
  }]);
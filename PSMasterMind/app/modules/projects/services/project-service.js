'use strict';

/*
 * Handles application state in regards to the currently accessed Projects.
 */
angular.module('Mastermind.services.projects')
  .service('ProjectsService', ['$q', '$sanitize', 'Restangular', 'Resources', 'Project', 'HoursService', '$injector', function ($q, $sanitize, Restangular, Resources, Project, HoursService, $injector) {
      /**
       * Create a reference to a server side resource for Projects.
       *
       * The query method returns an object with a property 'data' containing
       * the list of projects.
       */
    var People;
    
    var Resource,

      /**
       * Configure Restangular for projects. The 'getList' method returns an object
       * with metadata, so for now just grab its data element so we have an array
       * of objects.
       *
       * Then, when fetching projects, we need to transform them by adding Project
       * prototype functions to them.
       */
      ProjectsRestangular;

    /**
     * Configure a specific instance of Restangular for dealing with the #getList
     * need for mapping its data.
     *
     * Also, transform each returned object into a Project.
     * @type {*}
     */
    
    ProjectsRestangular = Restangular.withConfig( Util.fixRestAngularPathMethod(function (RestangularConfigurer) {
      RestangularConfigurer.setResponseInterceptor(function (data, operation, what,url,response) {
        var newData = data;

        if (what === 'projects') {
          if (operation === 'getList') {
            newData = data.data;
          }
        }
        
        return newData;
      }).addElementTransformer('projects', false, function (element) {
        return new Project(element);
      });
    }) );
    
    /*
    ProjectsRestangular = Restangular.withConfig(function (RestangularConfigurer) {
      RestangularConfigurer.setResponseInterceptor(function (data, operation, what,url,response) {
        var newData = data;

        if (what === 'projects') {
          if (operation === 'getList') {
            newData = data.data;
          }
        }
        
        return newData;
      }).addElementTransformer('projects', false, function (element) {
        return new Project(element);
      });
    });
*/
    Resource = ProjectsRestangular.all('projects');

    var _this = this;
    
    var projectsQueryMap = function(key) {
    	var today = _this.getToday();
    	
    	var map = {
	    	"active": {$and: [
	    	                    { $and: [
	    	                             {startDate:{$lte:today}},
	    	                             { $or:[
	    	                                    {endDate:{$exists:false}},
	    	                                    {endDate:{$gte:today}}
	    	                                    ]},
	    	                             ]},
	    	                    { $and: [
	    	                             {type:'paid'}, 
	    	            	             {'committed': true}
	    	            	            ]
	    	                    },
	    	                    ]
	    	            },
	          "backlog": { $and: [
	                              {startDate:{$gt:today}},
	                              { $and: [
	                                       {type:'paid'}, 
	                                       {'committed': true}
	                                       ]
	                              },
	                              ]
	       				},
   			  "pipeline": { $and: [
   	                             { $or:[{'endDate':{$exists:false}}, {endDate:{$gte:today}}] },
   	                             { $and: [
   	                                      {type:'paid'}, 
   	                                      { $or:[
   	                                           {'committed':{$exists:false}},	
   	                                           {'committed':false}
   	                                           ]
   	                                      }
   	                                      ]
   	                             },
   	                             ]
   	      				},
			  "investment":  {$and: [{$or:[
			            	               {endDate:{$exists:false}},
			            	               {endDate:{$gte:today}}
			            	               ]}
			                	  ,
			                		{$or:[
			                		     {type: 'invest'},
			            	             {type: 'poc'}
			                		  ]}]},
    		  "complete": { $and: [
    	                             {endDate:{$lt:today}},
    	                             { $and: [
    	                                      {'committed': true}
    	                                     ]
    	                             },
    	                             ]
    	      				},
    	      "deallost": { $and: [
                                   {endDate:{$lt:today}},
                                   { $and: [
                                            {'committed': false}
                                           ]
                                   },
                                   ]
            				}
	    	          
	    };
    	
    	if (key)
    		return map[ key.toLowerCase() ];
    	
    	return map;
    };
    /**
     * Service function for retrieving all projects.
     *
     * @returns {*}
     */
    this.list = function () {
      return Resource.getList();
    };

    /**
     * Service function for persisting a project, new or previously
     * existing.
     *
     * @param project
     */
    this.save = function (project) {
      //var deferred = $q.defer();
      var resultPromise;
      
      //Fix project description 
      if(project.description){
    	  project.description = $sanitize(project.description);
    	  //Encode description
    	  project.description = encodeURIComponent(project.description); 
      }

      // fix datepicker making dates = '' when clearing them out
      if (project.startDate === null || project.startDate === '') {
        project.startDate = undefined;
      }
      if (project.endDate === null || project.endDate === '') {
        project.endDate = undefined;
      }

      for (var k=0; k<project.roles.length; k++) {
        if (project.roles[k].startDate === null || project.startDate === '') {
          project.startDate = undefined;
        }
        if (project.roles[k].endDate === null || project.endDate === '') {
          project.endDate = undefined;
        }
        
        if (project.roles[k].assignees && project.roles[k].assignees.length > 0) {
        	//project.roles[k].assignees = null;
        	var proj;
        	var person;
        	
        	for (var l = 0; l < project.roles[k].assignees.length; l ++) {
        		if (project.roles[k].assignees[l].project)
        			project.roles[k].assignees[l].project = {
        				resource: project.roles[k].assignees[l].project.resource
        			}
        		
        		if (project.roles[k].assignees[l].person)
        			project.roles[k].assignees[l].person = {
        				resource: project.roles[k].assignees[l].person.resource
        			}
        	}
        	//delete project.roles[k].assignees;
        }
        		
      }

      if (this.isTransient(project)) {
    	 resultPromise = Resources.create('projects', project);/*.then(function(result) {
          deferred.resolve(result);
        });*/
      } else {
        // Add properties for the server.
        project._id = project.$meta._id;
        project.etag = project.$meta.etag;

        resultPromise = Resources.update(project);/*.then(function(result) {
          deferred.resolve(result);
        });*/
      }

      //return deferred.promise;
      return resultPromise;
    };

    /**
     * Delete a project from the server.
     *
     * @param project
     * @returns {*}
     */
    this.destroy = function (project) {
      var url = project.about?project.about:project.resource;
      return Resources.remove(url);
    };

    /**
     * Determine whether a project has not been saved to the server yet.
     *
     * @param project
     * @returns {boolean}
     */
    this.isTransient = function (project) {
      return typeof project.about === 'undefined';
    };

    /**
     * Return a defered operation that fetches a project for edit
     */
    this.getForEdit = function(projectId){
    	return this.getForEditByURI('projects/'+projectId);
    };
    
	/**
     * Return a defered operation that fetches a project for edit
     */
    this.getForEditByURI = function(projectURI){
      var deferred = $q.defer();

      setTimeout(function() {
        Resources.refresh(projectURI).then(function(project){
        	//Fix project description 
	        if(project.description){
	        	try{
	        		project.description = decodeURIComponent(project.description); 
	        	}
	        	catch(err){
	        	  console.warn('Failed to decode project description: ' + project.description + '\n' + err);
	        	}
	        }
          var proj = new Project(project);
          
          deferred.resolve(proj);
        });
      }, 10);

      return deferred.promise;
    };

    /**
     * Service function for creating a new project.
     *
     * @returns {Project}
     */
    this.create = function () {
      return new Project();
    };
    
    
    /**
     * Query to get the list of all projects
     */
    this.getAllProjects = function (onSuccess){
		return this.getProjectsByStatuses(["active", "backlog", "pipeline", "investment"], onSuccess);
    };


    /**
     * Service function for querying projects
     *
     * @returns {*}
     */
    function query(query,fields) {
    	var deferred = $q.defer();
    	
    	Resources.query('projects',query,fields,function(result){
    		deferred.resolve(result);
    	});
      
    	return deferred.promise;
    }


    /**
     * Service function for querying projects
     *
     * @returns {*}
     */
    function filter(queryParams,fields) {
    	var deferred = $q.defer();
    	
    	Resources.get('projects/filter',queryParams,fields,function(result){
    		deferred.resolve(result);
    	});
      
    	return deferred.promise;
    }

    
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
    
    this.getQueryDateSixMonthsFromNow = function(){
    	var sixMontsFromNow = new Date();
    	sixMontsFromNow.setMonth(sixMontsFromNow.getMonth() + 6);
	      var dd6 = sixMontsFromNow.getDate();
	      var mm6 = sixMontsFromNow.getMonth()+1; //January is 0!
	      var yyyy6 = sixMontsFromNow.getFullYear();
	      if (dd6<10){
	        dd6='0'+dd6;
	      }
	      if (mm6<10){
	        mm6='0'+mm6;
	      }
	      var sixMontsFromNowQuery = yyyy6+'-'+mm6+'-'+dd6;
	     
	     return sixMontsFromNowQuery;
    };


    /**
     * Query to get the list of projects by statuses (using filter)
     */
    this.getProjectsByStatuses = function (statuses, onSuccess){
    	var statusString = (statuses instanceof Array) ? statuses.join(',') : statuses;
        var fields = {resource:1,name:1,startDate:1,endDate:1,'roles':1,customerName:1,committed:1,type:1,description: 1};
        
        if (onSuccess) {
			Resources.refresh( 'projects/bystatus/' + statusString).then(onSuccess);
  		}
  		else {
			return Resources.refresh( 'projects/bystatus/' + statusString);
	  		
  		}
    };


    /**
     * Query to get the list of active+backlog projects
     */
    this.getActiveAndBacklogProjects = function (onSuccess){
		return this.getProjectsByStatuses(["active","backlog"], onSuccess);
	};
	

    /**
     * Query to get the list of active+pipeline projects
     */
    this.getActiveBacklogAndPipelineProjects = function (onSuccess){
		return this.getProjectsByStatuses(["active", "backlog", "pipeline"], onSuccess);
	};
	

    /**
     * Get Projects that will be in progress over the next six months
     */
     
    this.getQickViewProjects = function(){
		return this.getProjectsByStatuses(["quickview"]);
	};
	    
    
    /**
     * Get Projects wich I am an exec sponsor
     */
    
    this.getMyExecSponsoredProjects = function(person) {
        return Resources.refresh('projects/' + person._id + '/executiveSponsor');
	};


	/**
     * Get My Current Projects (projects I have a current role on)
     */
    this.getMyCurrentProjects = function(person) {
        return Resources.refresh('projects/' + person._id + '/current');
	};
	
    
    /**
     * Query to get the list of active projects
     */

    this.getProjectsByStatusFilter = function (filter, onSuccess){
  		return this.getProjectsByStatuses(filter.split(','), onSuccess);
	};
 

    /**
     * Query to get the list of active projects
     */
    this.getActiveClientProjects = function (onSuccess){
		return this.getProjectsByStatuses("active", onSuccess);
    };

 
    /**
     * Query to get the list of backlogged projects
     */
    this.getBacklogProjects = function (onSuccess){
		return this.getProjectsByStatuses("backlog", onSuccess);
	};
	
    
    /**
     * Query to get the list of pipeline projects
     */

    this.getPipelineProjects = function (onSuccess){
		return this.getProjectsByStatuses("pipeline", onSuccess);
	};


    /**
     * Query to get the list of active+backlog projects
     */
    this.getOngoingProjects = function (onSuccess){
		return this.getProjectsByStatuses("ongoing", onSuccess);
	};


    /**
     * Query to get the list of unfinished projects
     */
    this.getUnfinishedProjects = function (onSuccess){
		return this.getProjectsByStatuses("unfinished", onSuccess);
	};


    /**
     * Query to get the list of investment projects
     */
    this.getInvestmentProjects = function (onSuccess){
		return this.getProjectsByStatuses("investment", onSuccess);
	};


    /**
     * Query to get the list of completed projects
     */
    this.getCompletedProjects = function (onSuccess){
		return this.getProjectsByStatuses("complete", onSuccess);
	};


    /**
     * Query to get the list of deallost projects
     */
    this.getDealLostProjects = function (onSuccess){
		return this.getProjectsByStatuses("deallost", onSuccess);
	};

    
    var getSixMonthsOfDates = function(monthInc){
    	var ret = [];
    	var today = new Date();
    	var date = new Date();
        for(var inc = 0; inc < 6;inc++){
        	date.setMonth(today.getMonth() + inc);
        	var dd = date.getDate();
        	var mm = date.getMonth()+1; //January is 0!
        	var yyyy = date.getFullYear();
             
	        if (dd<10){
	          dd='0'+dd;
	        }
	        if (mm<10){
	          mm='0'+mm;
	        }
	        var dateStr = yyyy+'-'+mm+'-'+dd;
	        
	        ret.push(dateStr);
        }
        return ret;
    };
    
    /**
     * Retiurns the state of a project
     */
    this.getProjectState = function(project){
    	var ret = null;
    	if(project){
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
			
    		var startDate = project.startDate;
    		var endDate = project.endDate;
    		var type = project.type;
    		var committed = project.committed;
    		
    		if(endDate && endDate < today){
    			if(!committed && (type != "invest")) {
    				ret = 'Deal Lost';
    			}
    			else {
    				ret = 'Done';
    			}
    		}
    		else if(type && type!="paid"){
    			ret = 'Investment';
    		}
    		else if(!committed){
    			ret = 'Pipeline';
    		}
    		else if(today < startDate){
    			ret = 'Backlog';
    		} 
    		else{
    			ret = 'Active';
    		}
    	}
    	return ret;
    };
    
    
    /**
     * Returns the counts for active, backlog, pipeline and investment projects
     */
    this.getProjectCounts = function(){
    	var deferred = $q.defer();
    	var getProjectState = this.getProjectState;
 
 		var queryParams = {};
 		var statusString = "active,backlog,pipeline,investment,deallost";   	
        var fields = {resource:1,startDate:1,endDate:1,committed:1,type:1};

        Resources.get('projects/bystatus/' + statusString, queryParams, fields).then( function(results){
        	var projects = results.data;
        	var ret = {active:0,backlog:0,pipeline:0,investment:0,deallost:0};
        	for(var i = 0; i < projects.length;i++){
        		var project = projects[i];
        		var state = getProjectState(project);
        		
        		if(state == 'Active')ret.active++;
        		if(state == 'Backlog')ret.backlog++;
        		if(state == 'Pipeline')ret.pipeline++;
        		if(state == 'Investment')ret.investment++;
        		if(state == 'Deal Lost')ret.deallost++;
        	}
        	
        	deferred.resolve(ret);
        });
    	
    	return deferred.promise;
	};
	

    /**
     * Get a list of projects about to kick off
     */
    this.getProjectsKickingOff = function (onSuccess){
		return this.getProjectsByStatuses("kick-off", onSuccess);
	};


    /**
     * For a given set of projects cerate a data set of roles versus aviable billable hours to be used for the
     * booking forecast widget
     */
    
    this.getBookingForecastData = function(projects, showPipeline){
    	var deferred = $q.defer();
		Resources.get( "roles").then( function( roles ) {

			var nonBillableRolesArray = [];
    		var memberLength = roles.members.length;
    		
    		for(var i=0; i< memberLength; i++) {
    			if (roles.members[i].isNonBillable)
    				nonBillableRolesArray.push(roles.members[i].resource);
    		}
    		
    		var roleList = roles.members;
    		Resources.get( "people/bytypes/active", {
    			  t: (new Date()).getMilliseconds()
    		  }).then( function( result ) {

        		var total = 0;
        		var roleType = null;
				var utilizationRate = 100;
        		var currentValue = 1;
        		
        		for (var k = 0; k < result.members.length; k ++) {
        			utilizationRate = 100;
        			roleType = _.find(roleList, function(r) {return result.members[k].primaryRole && result.members[k].primaryRole.resource && result.members[k].primaryRole.resource.indexOf(r.resource) > -1;});
        			
        			currentValue = 1;
        			
        			if (roleType && roleType.utilizationRate)
                        currentValue = Math.round(roleType.utilizationRate * 10 / 100) / 10;
                    
                        
        			if (result.members[k].partTimeHours && !isNaN(parseFloat(result.members[k].partTimeHours)))
        			     currentValue = Math.round(currentValue * 100 * parseFloat(result.members[k].partTimeHours) / CONSTS.HOURS_PER_WEEK) / 100;
        			
        			
    				total += currentValue;
        		};
        		
        		// align floating point arithmetic
        		total = parseFloat(total.toFixed(1));
        		
        		//total = result.members.length;
        		
        		var comitments = [0,0,0,0,0,0];
        		var dateChecks = getSixMonthsOfDates();
        		for(var i = 0; i < projects.length; i++){
        			var project = projects[i];
        			if(project.committed || showPipeline){
    	    			var roles = project.roles;
    	    			for(var j = 0; j < roles.length; j++){
    	    				var role = roles[j];
    	    				var hoursPerMonth = 0;
    	    				
    	    				if(role.rate.fullyUtilized){
    	    					hoursPerMonth = 180;
    	    				}
    	    				else if(role.rate.hoursPerMth){
    	    					hoursPerMonth = role.rate.hoursPerMth;
    	    				}
    	    				else if(role.rate.hoursPerWeek){
    	    					hoursPerMonth = role.rate.hoursPerWeek*4;
    	    				}
    	    				
    	    				//hoursPerMonth  = Math.round(hoursPerMonth * utilizationRate / 100);
    	    				
    	    				//Check if roles if now active
    	    				if(role.startDate <= dateChecks[0] && (!role.endDate || role.endDate >= dateChecks[0])){
    	    					comitments[0]+=hoursPerMonth;
    	    				}
    	    				if(role.startDate <= dateChecks[1] && (!role.endDate || role.endDate >= dateChecks[1])){
    	    					comitments[1]+=hoursPerMonth;
    	    				}
    	    				if(role.startDate <= dateChecks[2] && (!role.endDate || role.endDate >= dateChecks[2])){
    	    					comitments[2]+=hoursPerMonth;
    	    				}
    	    				if(role.startDate <= dateChecks[3] && (!role.endDate || role.endDate >= dateChecks[3])){
    	    					comitments[3]+=hoursPerMonth;
    	    				}
    	    				if(role.startDate <= dateChecks[4] && (!role.endDate || role.endDate >= dateChecks[4])){
    	    					comitments[4]+=hoursPerMonth;
    	    				}
    	    				if(role.startDate <= dateChecks[5] && (!role.endDate || role.endDate >= dateChecks[5])){
    	    					comitments[5]+=hoursPerMonth;
    	    				}
    	    			}
        			}
        		}
        	
        		var peopleInMonth1 = Math.ceil(comitments[0]/180);
        		var peopleInMonth2 = Math.ceil(comitments[1]/180);
        		var peopleInMonth3 = Math.ceil(comitments[2]/180);
        		var peopleInMonth4 = Math.ceil(comitments[3]/180);
        		var peopleInMonth5 = Math.ceil(comitments[4]/180);
        		var peopleInMonth6 = Math.ceil(comitments[5]/180);
        		
        		var ret = [
    		          {x: new Date(dateChecks[0]), value: peopleInMonth1, otherValue: total},
    		          {x: new Date(dateChecks[1]), value: peopleInMonth2, otherValue: total},
    		          {x: new Date(dateChecks[2]), value: peopleInMonth3, otherValue: total},
    		          {x: new Date(dateChecks[3]), value: peopleInMonth4, otherValue: total},
    		          {x: new Date(dateChecks[4]), value: peopleInMonth5, otherValue: total},
    		          {x: new Date(dateChecks[5]), value: peopleInMonth6, otherValue: total}
        		];
        		
        		deferred.resolve(ret);
    			
    		});

		});
		
    	return deferred.promise;
    };
    
    
    this.getProjectsByIds = function(projectIds) {
    	
    	for (var k = 0; k < projectIds.length; k ++)
    		projectIds[k] = projectIds[k].replace('projects/', '');
    	
    	return Resources.get( "projects/byids/" + projectIds.join(','), {
		  t: (new Date()).getMilliseconds()
    	});
    };
	  
    
    this.getProjectsStatus = function(projects) {
        var type = {};
        var i = 0;
        var project;
        var today = this.getToday();
        
        for (i = 0; i < projects.length; i ++) {
            project = projects[i];
            
            if (project.committed && project.committed.toString() == 'true' && project.type == 'paid' 
                    && project.startDate <= today && (!project.endDate || project.endDate >= today))
                type[project.resource] = 'active';
            else if (project.committed && project.committed.toString() == 'true' && project.type == 'paid' 
                    && project.startDate > today )
                type[project.resource] = 'backlog';
            else if ((!project.committed || project.committed.toString() == 'false') && project.type == 'paid' 
                    && project.startDate <= today && (!project.endDate || project.endDate >= today))
                type[project.resource] = 'pipeline';
            else if ((project.type == 'poc' || project.type == 'invest')  &&  (!project.endDate || project.endDate >= today))
                type[project.resource] = 'investment';
            else if (project.committed && project.committed.toString() == 'true' && project.endDate < today)
                type[project.resource] = 'complete';
            else if ((!project.committed || project.committed.toString() == 'false') && project.endDate < today)
                type[project.resource] = 'deallost';
            
        }
        return type;
    };
    
    
  }]);
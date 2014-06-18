'use strict';

/*
 * Handles application state in regards to the currently accessed Projects.
 */
angular.module('Mastermind.services.projects')
  .service('ProjectsService', ['$q', '$sanitize', 'Restangular', 'Resources', 'Project', function ($q, $sanitize, Restangular, Resources, Project) {
      /**
       * Create a reference to a server side resource for Projects.
       *
       * The query method returns an object with a property 'data' containing
       * the list of projects.
       */
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
	    	          
	    }
    	
    	if (key)
    		return map[ key.toLowerCase() ]
    	
    	return map;
    }
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
      var val;
      
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

      for (var i=0; i<project.roles.length; i++) {
        if (project.roles[i].startDate === null || project.startDate === '') {
          project.startDate = undefined;
        }
        if (project.roles[i].endDate === null || project.endDate === '') {
          project.endDate = undefined;
        }
      }

      if (this.isTransient(project)) {
        val = Resource.post(project);
      } else {
        // Add properties for the server.
        project._id = project.$meta._id;
        project.etag = project.$meta.etag;

        val = Resources.update(project);
      }

      return val;
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
        var apQuery = {};
        var apFields = {resource:1,name:1,startDate:1,endDate:1,'roles':1,customerName:1,committed:1,type:1,description:1};

        return Resources.query('projects', apQuery, apFields, onSuccess);
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
    }

    /**
     * Query to get the list of active+backlog projects
     */
    this.getActiveAndBacklogProjects = function (onSuccess){
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

        var apQuery = 
            {$and: [
                    { $or:[
                           {endDate:{$exists:false}},	
                           {endDate:{$gt:today}}
                           ]
                    },
          	        { $and: [
        	                {type:'paid'}, 
        	                {'committed': true}
        	                ]
                    } 
                    ]
            };
        var apFields = {resource:1,name:1,startDate:1,endDate:1,'roles':1,customerName:1,committed:1,type:1,description: 1};

        return Resources.query('projects', apQuery, apFields, onSuccess);
    }
    
    /**
     * Query to get the list of active+backlog projects
     */
    this.getActiveBacklogAndPipelineProjects = function (onSuccess){
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

        var apQuery = 
            {$and: [
                    { $or:[
                           {endDate:{$exists:false}},	
                           {endDate:{$gt:today}}
                           ]
                    }
                   ]
            };
        var apFields = {resource:1,name:1,startDate:1,endDate:1,'roles':1,customerName:1,committed:1,type:1,description: 1};

        return Resources.query('projects', apQuery, apFields, onSuccess);
    }
    
    
    /**
     * Get Projects that will be in progress over the next six months
     */
    this.getQickViewProjects = function(){
    	var deferred = $q.defer();
    	var today = this.getToday();
    	var sixMonthsFromNow = this.getQueryDateSixMonthsFromNow();

        /*
         * AAD Feb 26,2014
         * Changing active project Query to use the committed flag and the project type.
         */
        var qvQuery = 
        	{
        		startDate:{$lte:sixMonthsFromNow},
        		$or:[
        		     {endDate:{$exists:false}},
        		     {endDate:{$gt:today}}
        		]
        	};
        var apFields = {resource:1,name:1,startDate:1,endDate:1,customerName:1,committed:1,type:1,description: 1};

        Resources.query('projects', qvQuery, apFields, function(result){
        	deferred.resolve(result);
        });
        
        return deferred.promise;
    };
    
    /**
     * Get Projects wich I am an exec sponsor
     */
    
    this.getMyExecSponsoredProjects = function(me) {
      var deferred = $q.defer();
      var query = {
    	  executiveSponsor:{
    		resource:me.about
    	}
      }
      var projectsFields = {resource:1,name:1,customerName:1,startDate:1,endDate:1,type:1,committed:1,roles:1,executiveSponsor:1,salesSponsor:1};
      
      Resources.query('projects',query,projectsFields,function(result){
        deferred.resolve(result);
      });
      
      return deferred.promise;
    }
    
    /**
     * Get My Current Projects (projects I have a current role on)
     */
    this.getMyCurrentProjects = function(me){
    	var deferred = $q.defer();
    	var startDateQuery = this.getToday();
    	
    	var query = {
    			members:{
    				'$elemMatch':{
    					person:{
    						resource:me.about
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
        var fields = {project:1, members:1};
        Resources.query('assignments', query, fields, function(result){
        	var assignments = result.data;
        	var myProjects = [];
        	for(var i = 0; i < assignments.length;i++){
        		var assignment = assignments[i];
        		if (assignment.project && assignment.project.resource){
    				 //Push the assignee onto the active list
                    var resource = assignment.project.resource;
                    //{_id:{$nin:[{$oid:'52a1eeec30044a209c47646b'},{$oid:'52a1eeec30044a209c476452'}]}}
                    var oid = {$oid:resource.substring(resource.lastIndexOf('/')+1)};
                    myProjects.push(oid);
    			}
        	}
        	var projectsQuery = {
//        			'_id':{
//        				$in:myProjects
//        			},
        			'$and':
        				[
        				 {
        					 '$or':
        						 [
        						  {
        							  salesSponsor:{
        								  resource:me.about
        							  }
        						  },
        						  {
        							  executiveSponsor:{
        								  resource:me.about
        							  }
        						  },
        						  {
        							 '_id':{
        			        				$in:myProjects
        							 },
        						  }
        				]
        					 
        				 },
        				 {
        				 '$or':
        					 [
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
					]
				};
	        var projectsFields = {resource:1,name:1,customerName:1,startDate:1,endDate:1,type:1,committed:1,roles:1,executiveSponsor:1,salesSponsor:1};
	        Resources.query('projects',projectsQuery,projectsFields,function(result){
	        	var projects = result.data;
	        	var ret = result;
	        	for(var i = 0; i < projects.length; i++){
	        		var project = projects[i];
        			
        			/**
    	        	 * For each project we will create a staus object with some information about your assignment on the project and hours you have logged against the project
    	        	 */
    	        	project.status = {};
    	        	var execSponsor = project.executiveSponsor;
    	        	var slaesSponsor = project.salesSponsor;
    	        	
    	        	if(execSponsor && execSponsor.resource && execSponsor.resource == me.about){
    	        		project.status.isExecutiveSponsor = true;
    	        	}
    	        	
    	        	if(slaesSponsor && slaesSponsor.resource && slaesSponsor.resource == me.about){
    	        		project.status.isSalesSponsor = true;
    	        	}
    	        	
    	        	//Match up the assignments record for this project
    	        	var assignmentsRecord = null;
    	        	for(var j = 0; j < assignments.length;j++){
    	        		var assignment = assignments[j];
    	        		if (assignment.project && assignment.project.resource 
    	        				&& assignment.project.resource == project.resource){
    	        			assignmentsRecord = assignment;
    	        			break;
    	    			}
    	        	}
    	        	
    	        	//Find the current roles 
    	        	project.status.assignments = [];
    	        	if(assignmentsRecord){
    	        		var members = assignmentsRecord.members;
	    	        	for(var j = 0; j < members.length;j++){
	    	        		var assignment = members[j];
	    	        		if (assignment.person && assignment.person.resource
	    	        				&& assignment.person.resource == me.about){
	    	        			project.status.assignments.push(assignment);
	    	        			var assignmentRoleResourceURI = assignment.role.resource;
	    	        			//Match the assignment up with a role on the project
	    	        			for(var k = 0; k < project.roles.length; k++){
	    	        				var role = project.roles[k];
	    	        				var id = role['_id'];
	    	        				//If the role URI ends with the _id of the role replace the reference to the role
	    	        				//with the role object
	    	        				if(assignmentRoleResourceURI.indexOf(id, assignmentRoleResourceURI.length - id.length) !== -1){
	    	        					assignment.role = role;
	    	        					
	    	        					//Mark that you have an assignment on the project
	    	        					project.status.hasAssignment = true;
	    	        				}
	    	        			}
	    	    			}
	    	        	}
    	        	}
    	        	
    	        	
	        	}
	        	
	        	/**
	        	 * Fetch all the Hours Records for this project to count hours logged against my projects
	        	 */
	        	var hoursQuery = {
	        		  person:{
						  resource:me.about
					  }
				};
	        	var hoursFields = {hours:1,project:1,date:1};
	        	Resources.query('hours',hoursQuery,hoursFields,function(result){
	        		//Iterate through all the hours records and append the hours to total hours logged
	        		var members = result.members;
	        		for(var i = 0; i < members.length;i++){
	        			var hoursRecord = members[i];
	        			
	        			if (hoursRecord.project) {
		        			var projectURI = hoursRecord.project.resource;
		        			
		        			//Find the associated project
		        			for(var j = 0; j < projects.length; j++){
		    	        		var project = projects[j];
		    	        		if(project.resource == projectURI){
		    	        			var projectStatus = project.status;
		    	        			if(!projectStatus.hoursLogged){
		    	        				projectStatus.hoursLogged = hoursRecord.hours;
		    	        			}
		    	        			else{
		    	        				projectStatus.hoursLogged += hoursRecord.hours;
		    	        			}
		    	        			
		    	        			break;
		    	        		}
		        			}
	        			}
	        		}
	        	
	        		deferred.resolve(ret);
	        	});
	        	
	        });
        });
        return deferred.promise;
    };
    
    /**
     * Query to get the list of active projects
     */
    this.getProjectsByStatusFilter = function (filter, onSuccess){
      var apQuery = {$or: []};
      var tmp = filter.split(',')
      
      for (var i = 0; i < tmp.length; i ++) 
    	  apQuery["$or"].push(projectsQueryMap( tmp[i].trim()))
      
      var apFields = {resource:1,name:1,startDate:1,endDate:1,'roles':1,customerName:1,committed:1,type:1,description: 1};

      return Resources.query('projects', apQuery, apFields, onSuccess);
    }
    
    /**
     * Query to get the list of active projects
     */
    this.getActiveClientProjects = function (onSuccess){
      var today = this.getToday();

      /*
       * AAD Feb 26,2014
       * Changing active project Query to use the committed flag and the project type.
       */
      var apQuery = projectsQueryMap("active");
      var apFields = {resource:1,name:1,startDate:1,endDate:1,'roles':1,customerName:1,committed:1,type:1,description: 1};

      return Resources.query('projects', apQuery, apFields, onSuccess);
    }

    /**
     * Query to get the list of backlogged projects
     */
    this.getBacklogProjects = function (onSuccess){
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
      
      /*
       * Changing backlog project Query to use the committed flag and the project type.
       */
      var apQuery = projectsQueryMap("backlog");
      var apFields = {resource:1,name:1,startDate:1,endDate:1,'roles':1,customerName:1,committed:1,description: 1};
      //console.log("Project-service.getBacklogProjects() apQuery=", apQuery);

      return Resources.query('projects', apQuery, apFields, onSuccess);
    }
    
    /**
     * Query to get the list of pipeline projects
     */
    this.getPipelineProjects = function (onSuccess){
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
      
      /*
       * Pipeline query based on the committed flag and the project type.
       */      
      var apQuery = projectsQueryMap("pipeline");
      var apFields = {resource:1,name:1,startDate:1,endDate:1,'roles':1,customerName:1,committed:1,type:1,description: 1};
      //console.log("Project-service.getPipeline() apQuery=", apQuery);

      return Resources.query('projects', apQuery, apFields, onSuccess);
    }
    
    /**
     * Query to get the list of active+backlog projects
     */
    this.getOngoingProjects = function (onSuccess){
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

        var apQuery = 
            {$and: [
                    { $or:[
                           {endDate:{$exists:false}},	
                           {endDate:{$gt:today}}
                           ]
                    },
          	        { $or:[
          	               { $and: [
          	                        {type:'paid'}, 
          	                        {'committed': true}
          	                        ]
          	               },
          	               {type:'invest'},
          	               {type:'poc'}
         	              ]
                    } 
                    ]
            };
        var apFields = {resource:1,name:1,startDate:1,endDate:1,'roles':1,customerName:1,committed:1,type:1,description: 1};

        return Resources.query('projects', apQuery, apFields, onSuccess);
    }

    /**
     * Query to get the list of investment projects
     */
    this.getInvestmentProjects = function (onSuccess){
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

      /*
       * Changing active project Query to use the committed flag and the project type.
       */
      var apQuery = projectsQueryMap("investment");
      var apFields = {resource:1,name:1,startDate:1,endDate:1,'roles':1,customerName:1,committed:1,type:1,description: 1};

      return Resources.query('projects', apQuery, apFields, onSuccess);
    };

    /**
     * Query to get the list of investment projects
     */
    this.getCompletedProjects = function (onSuccess){
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

      /*
       * Changing active project Query to use the committed flag and the project type.
       */
      var apQuery = projectsQueryMap("complete");
      var apFields = {resource:1,name:1,startDate:1,endDate:1,'roles':1,customerName:1,committed:1,type:1,description: 1};

      return Resources.query('projects', apQuery, apFields, onSuccess);
    };
    
    this.getDealLostProjects = function (onSuccess){
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
        
        var apQuery = projectsQueryMap("deallost");

        var apFields = {resource:1,name:1,startDate:1,endDate:1,'roles':1,customerName:1,committed:1,description: 1};

        return Resources.query('projects', apQuery, apFields, onSuccess);
    }
    
    
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
    }
    
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
    			if(!committed){
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

        var query = 
            {$and: [
                    { $or:[
                           {endDate:{$exists:false}},	
                           {endDate:{$gt:today}}
                           ]
                    }
                   ]
            };
        var fields = {resource:1,startDate:1,endDate:1,committed:1,type:1};

        Resources.query('projects', query, fields, function(results){
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
    this.getProjectsKickingOff = function (){
    	var deferred = $q.defer();
    	
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

        var query = 
            {
        		startDate:{$gte:today},
                'committed': true
            };
        var fields = {resource:1,name:1,startDate:1,endDate:1,customerName:1,committed:1,type:1};

        Resources.query('projects', query, fields, function(result){
        	deferred.resolve(result);
        });
        
        return deferred.promise;
    }
    
    /**
     * For a given set of projects cerate a data set of roles versus aviable billable hours to be used for the
     * booking forecast widget
     */
    this.getBookingForecastData = function(projects, showPipeline){
    	
    	//First get the total nuber of billable hours per month
    	var deferred = $q.defer();
    	
    	//find people who aren't billable
    	//and then check
    	//Resources.query('roles', {isNonBillable:true},{title:1},function(result) {
    	Resources.query('roles', {},{title:1, utilizationRate:1, isNonBillable: 1},function(result) {
    		
    		var nonBillableRolesArray = [];
    		var memberLength = result.members.length;
    		
    		for(var i=0; i< memberLength; i++) {
    			if (result.members[i].isNonBillable)
    				nonBillableRolesArray.push(result.members[i].resource);
    		}
    		
    		var roleList = result.members;
    		
    		var query = {
    			'primaryRole.resource': {
    				$nin : nonBillableRolesArray
    			},
    			primaryRole : {
    				'$exists' : true
    			}
    		}
    		var fields = {name : 1, primaryRole: 1}
        	
        	Resources.query('people',query,fields,function(result){
        		var total = 0;
        		var roleType = null;
				var utilizationRate = 100;
        		
        		for (var k = 0; k < result.members.length; k ++) {
        			utilizationRate = 100;
        			roleType = _.find(roleList, function(r) {return result.members[k].primaryRole && result.members[k].primaryRole.resource && result.members[k].primaryRole.resource.indexOf(r.resource) > -1})
        			
        			if (roleType && roleType.utilizationRate)
    					total += Math.round(roleType.utilizationRate * 10 / 100) / 10;
        			else
        				total += 1;
        		}
        		
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
    		
    		
    	})

    	
    	return deferred.promise;
    };
  }]);
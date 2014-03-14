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
	      	  project.description = decodeURIComponent(project.description); 
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
     * Get My Current Projects (projects I have a current role on)
     */
    this.getMyCurrentProjects = function(me){
    	var deferred = $q.defer();
    	var startDateQuery = this.getToday();
    	
    	var apQuery = {
    			members:{
    				'$elemMatch':{
    					person:{
    						resource:me.about
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
        var apFields = {project:1};
        Resources.query('assignments', apQuery, apFields, function(result){
        	var assignments = result.data;
        	var myProjects = [];
        	for(var i = 0; i < assignments.length;i++){
        		var assignment = assignments[i];
        		if (assignment.project && assignment.project.resource &&
        				myProjects.indexOf(assignment.project.resource) === -1){
    				 //Push the assignee onto the active list
                    var resource = assignment.project.resource;
                    //{_id:{$nin:[{$oid:'52a1eeec30044a209c47646b'},{$oid:'52a1eeec30044a209c476452'}]}}
                    var oid = {$oid:resource.substring(resource.lastIndexOf('/')+1)};
                    myProjects.push(oid);
    			}
        	}
        	
        	var projectsQuery = {_id:{$in:myProjects}};
	        var projectsFields = {resource:1,name:1,customerName:1,startDate:1,endDate:1,type:1,committed:1};
	        Resources.query('projects',projectsQuery,projectsFields,function(result){
	        	deferred.resolve(result);
	        });
        });
        return deferred.promise;
    };
    
    
    /**
     * Query to get the list of active projects
     */
    this.getActiveClientProjects = function (onSuccess){
      var today = this.getToday();

      /*
       * AAD Feb 26,2014
       * Changing active project Query to use the committed flag and the project type.
       */
      var apQuery = 
            {$and: [
                    { $and: [
                             {startDate:{$lte:today}},
                             { $or:[
                                    {endDate:{$exists:false}},
                                    {endDate:{$gt:today}}
                                    ]},
                             ]},
                    { $and: [
                             {type:'paid'}, 
            	             {'committed': true}
            	            ]
                    },
                    ]
            };
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
      var apQuery = { $and: [
                             {startDate:{$gt:today}},
                             { $and: [
                                      {type:'paid'}, 
                                      {'committed': true}
                                      ]
                             },
                             ]
      				};
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
      var apQuery = { $and: [
                             { endDate:{$gt:today} },
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
      				};
      var apFields = {resource:1,name:1,startDate:1,endDate:1,'roles':1,customerName:1,committed:1,type:1,description: 1};
      console.log("Project-service.getPipeline() apQuery=", apQuery);

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
      var apQuery = 
            {$and: [
                    { $and: [
                             {startDate:{$lte:today}},
                             { $or:[
                                    {endDate:{$exists:false}},
                                    {endDate:{$gt:today}}
                                    ]
                             },
                            ]
                    },
                    { type: 'invest'
                    }
                   ]
            };
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
      var apQuery = 
            { $and: [
                     {startDate:{$lte:today}},
                     { $or:[
                            {endDate:{$exists:false}},
                            {endDate:{$lt:today}}
                            ]
                     }
                     ]
            };
      var apFields = {resource:1,name:1,startDate:1,endDate:1,'roles':1,customerName:1,committed:1,type:1,description: 1};

      return Resources.query('projects', apQuery, apFields, onSuccess);
    };
    
  }]);
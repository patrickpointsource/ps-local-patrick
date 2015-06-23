/*jshint camelcase: false */
(function() {
	'use strict';
	angular
	    .module('hoursappsprout.home')
	    .factory('HomeService', HomeService);

	    HomeService.$inject = ['$rootScope', '$q', '$http', 'CONFIG', 'psafLogger', '$window'];

	    function HomeService ($rootScope, $q, $http, CONFIG, psafLogger, $window) {

	    	console.log('calling from home service');
	    	//var logger = psafLogger.getInstance('hoursappsprout.home.HomeService');
	    	
	    	var BaseRequestURL = CONFIG.BaseRequestURL;

	    	var uid, userData, hours, tasks, projects;

	    	var today = new Date();
            var startDate = new Date(today);
            var endDate = new Date(today);

            endDate.setDate(today.getDate()+5);
            startDate.setDate(today.getDate()-6);

            var startDateFinal = formatDate(startDate);
            var endDateFinal = formatDate(endDate);


	    	return {


	    	downloadUserData: function() {
	    		var deferred = $q.defer();

	    		$http.get(CONFIG.BaseRequestURL + 'people/me', {
	    				    withCredentials: true
	    		})
	    		.success(function(data) {
	    			
	    			userData = data;
	    			uid = data.id;
	    			
	    			deferred.resolve();
	    		});

	    		return deferred.promise;
	    	},


	    	getUserData: function() {
	    		return userData;
	    	},

	    	downloadHoursData: function() {
	    		var deferred = $q.defer();

	    		$http.get(CONFIG.BaseRequestURL + 'hours?person='+uid+'&startDate=' +
	    		    startDateFinal + '&endDate=' + endDateFinal,{
	    				withCredentials: true
	    	    })
	    	    .success(function(data) {
	    			
	    			hours = data;
	    			
	    		    deferred.resolve();
	    		});
	    		return deferred.promise;

	    	},

	    	getHoursData: function() {
	    		return hours;
	    	},
	    	
	    	downloadProjectData: function() {
	    		var deferred = $q.defer();

	    		$http.get(CONFIG.BaseRequestURL + 'projects',{
			    	withCredentials: true
			    })
			     .success(function(data) {
	    			
	    			projects = data;
	    		   
	    		    deferred.resolve();
	    		   });     	
	    		return deferred.promise;
			    
	    	},

	    	getProjectData: function() {
	    		return projects;
	    	},

	    	downloadTaskData: function() {
	    		var deferred = $q.defer();
	    		$http.get(CONFIG.BaseRequestURL + 'tasks',{
				    		withCredentials: true
				})
				 .success(function(data) {
	    			tasks = data;
	    		    
	    		    deferred.resolve();
	    		    });
	    		return deferred.promise;
	    	},

	    	getTaskData: function() {
	    		return tasks;

	    	},

	    	constructHoursArray: function() {

    			for(var x = 0; x < hours.length; x++)
    			{
    		 		var hour = hours[x];

    			   if(hour.project === null || hour.project === '')
    			   {
    				    for(var t = 0; t < tasks.length; t++)
    				    {

    					    var task = tasks[t];

    					    if(hour.task === task.id)
    					    {
    						    hour['name'] = task.name;
    					     }

    				    }
    				    console.log('hour is now: ', hour);
    			    }
    			    else
    			    {
    			        for(var p = 0; p < projects.length; p++)
    			        {
    				        var project = projects[p];

    				        if(hour.project === project.id)
    				        {
    					         hour['name'] = project.name;
    				        }
    			        }
    			        console.log('hour is now: ', hour);
    		        }
    	        }
	    	},

	    	constructDateArray: function() {

	        	console.log('constructDateArrayCalled and startDate is: ', startDate);
            	var DateArray = [];
            	var x = 0;

            	for(x = 0; x < 12; x++)
            	{
                	var date = new Date();
                	date.setDate(startDate.getDate()+x);
                	var formattedDate = formatDate(date);
                	DateArray[x] = formattedDate;

           		}
           		return DateArray;
           	}


        };
	}

	function formatDate(date)
	{
	    	var day = date.getDate();
	    	var month = date.getMonth() + 1;
	    	if(day <= 9)
	    	{
	    		day = '0' + day;
	    	}
	    	if(month <=9)
	    	{
	    		month = '0'+ month;
	    	}
	    	return date.getFullYear()+'-'+month +'-'+day;	
	}

	function constructDateArray(startDate)
    {
    	console.log('constructDateArrayCalled and startDate is: ', startDate);
         var DateArray = [];
         var x = 0;

        for(x = 0; x < 12; x++)
        {
            var date = new Date();
            date.setDate(startDate.getDate()+x);
            var formattedDate = formatDate(date);
            DateArray[x] = formattedDate;

        }

        localStorage.setItem('DateArray', DateArray);
    }

    function constructHoursArray(hours, projects, tasks)
    {
    	var recentlyUsed = [];
    	for(var x = 0; x < hours.length; x++)
    	{
    		 var hour = hours[x];

    		if(hour.project === null || hour.project === '')
    		{
    			for(var t = 0; t < tasks.length; t++)
    			{

    				var task = tasks[t];

    				if(hour.task === task.id)
    				{
    					hour['taskName'] = task.name;
    				}

    			}
    			console.log('hour is now: ', hour);
    		}
    		else
    		{
    			for(var p = 0; p < projects.length; p++)
    			{
    				var project = projects[p];
    				if(hour.project === project.id)
    				{
    					hour['projectName'] = project.name;
    				}
    			}
    			console.log('hour is now: ', hour);
    		}
    	}
    }



})();
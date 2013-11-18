/**
 * Projects Service
 */
angular.module('PSMasterMindApp').factory('Projects', function() {
	var newProjectIndex = 0;
	var PROJECTS_KEY = "PS_PROJECTS";
	var LAST_PROJECT_INDEX_KEY = "PS_LAST_PROJECT_INDEX";

	/**
	 * Get the list of project
	 */
	function getProjects() {
		var raw = localStorage[PROJECTS_KEY];
		var projects = [];
		try {
			// If still empty default to []
			if (raw) projects = JSON.parse(raw);
		} catch (e) {
			console.warn('Error reading projects:' + e);
		}
		return projects;
	};

	/**
	 * Create a new empty project template
	 */
	function newProject() {
		var newProject = {
			id : '_new_',
			nextRoleId : 3,
			"roles" : [ {
				"id" : 0,
				"rate" : {
					"type" : "hourly",
					"hourlyRate" : 200,
					"hoursPerMonth" : 40
				},
				"title" : "SSA",
				"startDate" : "2013-11-1",
				"endDate" : "2013-12-1"
			}, {
				"id" : 1,
				"rate" : {
					"type" : "hourly",
					"hourlyRate" : 200,
					"hoursPerMonth" : 20
				},
				"title" : "PM",
				"startDate" : "2013-11-1",
				"endDate" : "2013-12-1"
			}, {
				"id" : 2,
				"rate" : {
					"type" : "monthly"
				},
				"title" : "SSE",
				"startDate" : "2013-11-1",
				"endDate" : "2013-12-1",
				"hourly" : {
					"rate" : 2000
				}
			} ],
			terms : {
				type : 'timeAndMaterials'
			}
		};
		
		return newProject;
	};

	/**
	 * Create a new project
	 */
	function createProject(project) {
		//Get the last index
		var lastId = Number(localStorage[LAST_PROJECT_INDEX_KEY]);
		var id = 0;
		if(lastId){
			id = lastId+1;
		}
		
		//Save it to local storage
		localStorage[LAST_PROJECT_INDEX_KEY] = id;
		project.id = id;
		
		var projects = getProjects();
		projects.push(project)
		
		localStorage[PROJECTS_KEY] = JSON.stringify(projects);
	};
	
	/**
	 * Update a project
	 */
	function updateProject(project){
		var projects = getProjects();
		var ret = null;
		var id = project.id;
		
		for(var i = 0; i < projects.length; i++){
			var curId = String(projects[i].id);
			if(curId == id){
				projects[i] = project;
				break;
			}
		}
		
		return ret;
	};
	
	/**
	 * Get a project by id
	 */
	function getById(id){
		var projects = getProjects();
		var ret = null;
		
		for(var i = 0; i < projects.length; i++){
			var curId = String(projects[i].id);
			if(curId == id){
				ret = projects[i];
				break;
			}
		}
		
		return ret;
	};

	return {
		start : newProject,
		list : getProjects,
		get : getById, 
		create : createProject,
		update: updateProject
	};
});
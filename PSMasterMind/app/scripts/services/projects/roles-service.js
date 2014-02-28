'use strict';

angular.module('Mastermind.services.projects')
  .service('RolesService', ['RateFactory','Role','Resources', function (RateFactory, Role, Resources) {
    /**
     * Change a Role's rate type between hourly, weekly, and monthly.
     *
     * @param newType 'hourly', 'weekly', or 'monthly'
     */
    Role.prototype.changeType = function (newType) {
      this.rate = RateFactory.build(newType);
    };

    /**
     * Create a new role
     *
     * @param rateType 'hourly', 'weekly', or 'monthly'
     */
    this.create = function (rateType) {
      return new Role(rateType);
    };

    /**
     * Validate a new Role being created on a project.
     *
     * @param project
     * @param newRole
     */
    this.validateNewRole = function(project, newRole){
      var errors = [];
      //Must select a type
      if(!newRole){
        errors.push('New Role is null');
      }
      else{
        //Role Type is Required
        if(!newRole.type || !newRole.type.resource){
          errors.push('Role Type is required');
        }
        //Start Date is required
        if(!newRole.startDate){
          errors.push('Start Date is required');
        }
        //Role cannot start before the project starts
        else if(project.startDate && newRole.startDate < project.startDate){
          errors.push('Role Start Date cannot be before Project Start Date');
        }
        //Role cannot start after the project ends
        else if(project.endDate && newRole.startDate > project.endDate){
          errors.push('Role Start Date cannot be before Project End Date');
        }

        //Role cannot end after the project is over
        if(newRole.endDate && project.endDate && newRole.endDate > project.endDate){
          errors.push('Role End Date cannot be after Project End Date');
        }

        //Role cannot start before the project is starts
        else if(newRole.endDate && project.startDate && newRole.endDate < project.startDate){
          errors.push('Role End Date cannot be before Project Start Date');
        }

        //End Date cannot be before start date
        else if(newRole.startDate && newRole.endDate && newRole.startDate > newRole.endDate){
          errors.push('Role Start Date cannot be after Role End Date');
        }

        // a. Hourly
      // i. 100% Utilization = Yes/No
      // ii. hours per month BR: cannot exceed 220
      // hours
        //BR: Senior UX Designers must have a minimum of 40 hours in a project or no hours.
        if(newRole.rate.type === 'hourly'){
          if(!newRole.rate.fullyUtilized){
            if(!newRole.rate.hours){
              errors.push('An Hourly Role must specify the number hours per month');
            }
            else if(newRole.type.resource === 'roles/SUXD' && newRole.rate.hours < 40){
              errors.push('Senior UX Designers must have a minimum of 40 hours/month in a project');
            }
            else if(newRole.rate.hours > 220){
              errors.push('An Hourly Role cannot exceed 220 hours per month');
            }
          }
        }

        // b. Weekly
      // i. 100% Utilization = Yes/No
      // ii. hours per week BR: Cannot exceed 50
      // hours
        //BR: Senior UX Designers must have a minimum of 40 hours in a project or no hours.
        else if(newRole.rate.type === 'weekly'){
          if(!newRole.rate.fullyUtilized){
            if(!newRole.rate.hours){
              errors.push('A Weekly Role must specify the number hours per week');
            }
            else if(newRole.type.resource === 'roles/SUXD' && newRole.rate.hours < 10){
              errors.push('Senior UX Designers must have a minimum of 40 hours/month in a project');
            }
            else if(!newRole.rate.fullyUtilized && newRole.rate.hours > 220){
              errors.push('A Weekly Role cannot exceed 50 hours per week');
            }
          }
        }

         //Business Rule: Monthly Rate Assumes 100% utilization
        if (newRole.rate.type === 'monthly') {
          newRole.rate.fullyUtilized = true;
        }
      }
      return errors;
    };
    
    /**
     * Function declaration getRoleName()
     * Returns a role name corresponding to a resource reference
     *
     * @param project
     * @param newRole
     */
    this.getRoleName = function(resource){
    	
	
        /**
         * Load Role definitions to display Role names and/or Role abbreviations
         */
        Resources.get('roles').then(function(result){
        	var ret = 'Unspecified';
        	var members = result.members;
            //$scope.allRoles = members;
            var rolesMap = {};
            for(var i = 0; i < members.length;i++){
              rolesMap[members[i].resource] = members[i];
            }
            
            if(resource && rolesMap[resource]){
                ret = rolesMap[resource].title;
            }
            return ret;
        });
    };

    /**
     * Function declaration getRoleAbbr()
     * Returns a role abbreviation corresponding to a resource reference
     *
     * @param project
     * @param newRole
     */
    this.getRoleAbbr = function(resource){
    	
    	//console.log("getRoleAbbr() called with resource:", resource);
        /**
         * Load Role definitions to display Role names and/or Role abbreviations
         */
        Resources.get('roles').then(function(result){
        	var ret = 'Unspecified';
            var members = result.members;
            //console.log("getRoleAbbr() Fetching roles returned members:", members);
            //$scope.allRoles = members;
            var rolesMap = {};
            for(var i = 0; i < members.length;i++){
              rolesMap[members[i].resource] = members[i];
            }
            //console.log("getRoleAbbr() rolesMap:", rolesMap)
            if(resource && rolesMap[resource]){
                ret = rolesMap[resource].abbreviation;
            }
            //console.log("getRoleAbbr() returning:",ret);
            return ret;
        });
    };
    
    /**
     * Function declaration getRoleAbbr()
     * Returns a role abbreviation corresponding to a resource reference
     *
     * @param project
     * @param newRole
     */
    this.getRolesMapByResource = function(){
    	
    	var rolesPromise;
    	//console.log("getRolesMapByResource() called.");
        /**
         * Load Role definitions to display Role names and/or Role abbreviations
         */
        rolesPromise = Resources.get('roles').then(function(result){
        	var ret = 'Unspecified';
            var members = result.members;
            //console.log("getRolesMapByResource() Fetching roles returned members:", members);
            //$scope.allRoles = members;
            var rolesMap = {};
            for(var i = 0; i < members.length;i++){
              rolesMap[members[i].resource] = members[i];
            }

            //console.log("getRolesMapByResource() returning:",rolesMap);
            return rolesMap;
        });
        
        return rolesPromise;
    };
  }]);
'use strict';

/**
 * Controller for Reports.
 */
angular.module( 'Mastermind' ).controller( 'ReportsCtrl', [ '$scope', '$q', '$state', '$stateParams', '$filter', 'Resources', 'AssignmentService', 'ProjectsService', 'TasksService', 'RolesService', 'ngTableParams',
function( $scope, $q, $state, $stateParams, $filter, Resources, AssignmentService, ProjectsService, TasksService, RolesService, TableParams ) {

    $scope.activeTab = {
        'hours': true
    };
    
    $scope.reportTypes = {
        'custom': true
    };
    
    $scope.reportTerms = {
        'week': true
    };
    
    $scope.reportClick = function( item ) {
        alert( item.name );
    };

    $scope.tabSelected = function(tabName) {
        var prop;
        
        for (prop in $scope.activeTab) {
            $scope.activeTab[prop] = false;
        }
        
        $scope.activeTab[tabName] = true;
    };
    
    $scope.userRoles = {};
    $scope.arrangedRoles = [[{abbreviation: "Select all roles", value: "all"}], [], []];
    
    $scope.loadRoles = function() {
        Resources.get( 'roles' ).then( function( result ) {
           
            
            var countInRow = Math.floor((result.members.length + 1) / 3);
            var ind = 0;
            var nestedInd = 0;
            
            var i = 0;
            //Get list of roles to query members
            for(i = 0; i < result.members.length; i++ ) {
                var role = result.members[ i ];
                var resource = role.resource;
                
                
                ind = Math.floor(i / countInRow);
                nestedInd = ind > 0 ? i % countInRow: (i % countInRow + 1);
                
                if (ind == 2 )
                    nestedInd = i - 2 * countInRow;
                    
                $scope.arrangedRoles[ind][nestedInd] = role;
                role.value = role.abbreviation.toLowerCase();
                
                $scope.userRoles[role.value] = false;
            }

        });
    };
    
    $scope.selectReportTerms = function(e, term) {
        var prop;
        
        for (prop in $scope.reportTerms) {
            $scope.reportTerms[prop] = false;
        }
        
        $scope.reportTerms[term] = true;
    };
    
    $scope.init = function() {
        $scope.loadRoles();
    };
    
    $scope.selectReportType = function(e, report) {
        for (var prop in $scope.reportTypes) {
            $scope.reportTypes[prop] = false;
        }
        
        $scope.reportTypes[report] = true;
    };
    
    $scope.init();
} ] ); 
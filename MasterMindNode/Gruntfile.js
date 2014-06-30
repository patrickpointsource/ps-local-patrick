'use strict';

module.exports = function (grunt) {
  // Show elapsed time at the end
  require('time-grunt')(grunt);
  // Load all grunt tasks
  require('load-grunt-tasks')(grunt);

  // Project configuration.
  grunt.initConfig({
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      app: {
        src: 'app.js'
      },
      server: {
        src: ['server/**/*.js']
      },
      pubjs: {
        src: ['public/js/*.js']
      }
    },
    jasmine_node: {
        options: {
            forceExit: true,
            match: '.',
            matchall: false,
            extensions: 'js',
            specNameMatcher: 'spec',
            jUnit: {
                report: true,
                savePath : './build/reports/jasmine/',
                useDotNotation: true,
                consolidate: true
            }
        },
        all: ['test/specs/']
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      app: {
        files: '<%= jshint.app.src %>',
        tasks: ['jshint:app']
      },
      server: {
        files: '<%= jshint.server.src %>',
        tasks: ['jshint:server']
      },
      pubjs: {
        files: '<%= jshint.pubjs.src %>',
        tasks: ['jshint:pubjs']
      }
    }
  });
  
  grunt.loadNpmTasks('grunt-jasmine-node');

  // Default task.
  grunt.registerTask('default', ['jshint', 'jasmine_node']);

};

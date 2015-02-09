// Generated on 2013-11-12 using generator-angular 0.5.1
'use strict';

module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: ['src/**/*.js'],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },
    qunit: {
      files: ['test/**/*.html']
    },
    jshint: {
      files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
      options: {
        // options here to override JSHint defaults
        globals: {
          jQuery: true,
          console: true,
          module: true,
          document: true
        }
      }
    },
    /*
     * Build a WAR (web archive) without Maven or the JVM installed.
     */
    war: {
      target: {
        options: {
          war_dist_folder: 'dist',
          war_verbose: true,
          war_name: 'webmagic',
          webxml_welcome: 'index.html',
          webxml_display_name: 'Web Magic',
          webxml_mime_mapping: [ { extension: 'woff', mime_type: 'application/font-woff' } ]
        },
        files: [
          {
            expand: true,
            cwd: '.',
            src: ['**','!node_modules/**'],
            dest: ''
          }
        ]
      }
    },

    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint', 'qunit']
    }
  });

  grunt.loadNpmTasks('grunt-war');


  //grunt.registerTask('test', ['jshint', 'qunit']);
  grunt.registerTask('build', ['war']);
  
};


// Generated on 2013-11-12 using generator-angular 0.5.1
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    grunt.initConfig({
        yeoman: {
            // configurable paths
            app: require('./bower.json').appPath || 'app',
            dist: 'dist'
        },
        watch: {
            coffee: {
                files: ['<%= yeoman.app %>/scripts/{,*/}*.coffee'],
                tasks: ['coffee:dist']
            },
            coffeeTest: {
                files: ['test/spec/{,*/}*.coffee'],
                tasks: ['coffee:test']
            },
            styles: {
                files: ['<%= yeoman.app %>/styles/{,*/}*.css'],
                tasks: ['copy:styles', 'autoprefixer']
            },
            less: {
                files: ['<%= yeoman.app %>/styles/{,*/}*.less', '<%= yeoman.app %>/modules/{,*/}*.less', '<%= yeoman.app %>/modules/widgets/{,*/}*.less'],
                tasks: ['less']
            },
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
                    '<%= yeoman.app %>/{,*/}*.html',
                    '<%= yeoman.app %>/views/{,*/}*.html',
                    '<%= yeoman.app %>/views/{,*/}*/{,*/}*.html',
                    '<%= yeoman.app %>/modules/{,*/}*/{,*/}*.html',
                    '<%= yeoman.app %>/modules/{,*/}*.html',
                    '.tmp/styles/{,*/}*.css',
                    '{.tmp,<%= yeoman.app %>}/scripts/{,*/}*.js',
                    '{.tmp,<%= yeoman.app %>}/scripts/*/{,*/}*.js',
                    '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
                    '{.tmp,<%= yeoman.app %>}/modules/*/{,*/}*.*',
                    '{.tmp,<%= yeoman.app %>}/modules/*/*.*',
                    '{.tmp,<%= yeoman.app %>}/modules/widgets/*/{,*/}*.*',
                ]
            }
        },
        less: {
            development: {
                options: {
                    paths: ['<%= yeoman.app %>/styles']
                },
                files: {
                    '<%= yeoman.app %>/styles/main.css': '<%= yeoman.app %>/styles/less/screen.less'
                }
            }
        },
        autoprefixer: {
            options: ['last 1 version'],
            dist: {
                files: [{
                    expand: true,
                    cwd: '.tmp/styles/',
                    src: '{,*/}*.css',
                    dest: '.tmp/styles/'
                }]
            }
        },
        connect: {
            options: {
                port: 9000,
                // Change this to '0.0.0.0' to access the server from outside.
                hostname: '0.0.0.0',
                livereload: 35729
            },
            livereload: {
                options: {
                    open: true,
                    base: [
                        '.tmp',
                        '<%= yeoman.app %>'
                    ]
                }
            },
            test: {
                options: {
                    port: 9001,
                    base: [
                        '.tmp',
                        'test',
                        '<%= yeoman.app %>'
                    ]
                }
            },
            dist: {
                options: {
                    base: '<%= yeoman.dist %>'
                }
            }
        },
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= yeoman.dist %>/*',
                        '!<%= yeoman.dist %>/.git*'
                    ]
                }]
            },
            server: '.tmp'
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: [
                'Gruntfile.js',
                '<%= yeoman.app %>/scripts/{,*/}*.js',
                '<%= yeoman.app %>/scripts/**/{,*/}*.js',
                '<%= yeoman.app %>/scripts/**/**/{,*/}*.js'
            ]
        },
        coffee: {
            options: {
                sourceMap: true,
                sourceRoot: ''
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/scripts',
                    src: '{,*/}*.coffee',
                    dest: '.tmp/scripts',
                    ext: '.js'
                }]
            },
            test: {
                files: [{
                    expand: true,
                    cwd: 'test/spec',
                    src: '{,*/}*.coffee',
                    dest: '.tmp/spec',
                    ext: '.js'
                }]
            }
        },
        // not used since Uglify task does concat,
        // but still available if needed
        concat: {
            dist: {}
        },
        rev: {
            dist: {
                files: {
                    src: [
                        '<%= yeoman.dist %>/scripts/{,*/}*.js',
                        '<%= yeoman.dist %>/styles/{,*/}*.{css,less}',
                        '<%= yeoman.dist %>/images/**/*.{png,jpg,jpeg,gif,webp,svg}'
                    ]
                }
            }
        },
        useminPrepare: {
            html: ['<%= yeoman.app %>/index.html'],
            options: {
                dest: '<%= yeoman.dist %>'
            }
        },
        usemin: {
            html: ['<%= yeoman.dist %>/**/*.html'],
            css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
            options: {
                dirs: ['<%= yeoman.dist %>'],
                assetsDirs: ['<%= yeoman.dist %>', '<%= yeoman.dist %>/images']

                //    	patterns: {
                //    		// FIXME While usemin won't have full support for revved files we have to put all references manually here
                //    		js: [
                //    		     [/(images\/.*?\.(?:gif|jpeg|jpg|png|webp|svg))/gm, 'Update the JS to reference our revved images']
                //    		     ],
                //			html: [
                //			     [/(images\/.*?\.(?:gif|jpeg|jpg|png|webp|svg))/gm, 'Update the HTML to reference our revved images']
                //			     ],
                //    		css: [
                //    		     [/(images\/.*?\.(?:gif|jpeg|jpg|png|webp|svg))/gm, 'Update the CSS to reference our revved images']
                //  			     ]    		     
                //    	}
            }
        },
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/images',
                    src: '{,*/}*.{png,jpg,jpeg}',
                    dest: '<%= yeoman.dist %>/images'
                }]
            }
        },
        svgmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/images',
                    src: '{,*/}*.svg',
                    dest: '<%= yeoman.dist %>/images'
                }]
            }
        },
        cssmin: {
            // By default, your `index.html` <!-- Usemin Block --> will take care of
            // minification. This option is pre-configured if you do not wish to use
            // Usemin blocks.
            // dist: {
            //   files: {
            //     '<%= yeoman.dist %>/styles/main.css': [
            //       '.tmp/styles/{,*/}*.css',
            //       '<%= yeoman.app %>/styles/{,*/}*.css'
            //     ]
            //   }
            // }
        },
        htmlmin: {
            dist: {
                options: {
                    /*removeCommentsFromCDATA: true,
           // https://github.com/yeoman/grunt-usemin/issues/44
           //collapseWhitespace: true,
           collapseBooleanAttributes: true,
           removeAttributeQuotes: true,
           removeRedundantAttributes: true,
           useShortDoctype: true,
           removeEmptyAttributes: true,
           removeOptionalTags: true*/
                },
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>',
                    src: ['*.html', 'views/**/*.html'],
                    dest: '<%= yeoman.dist %>'
                }]
            }
        },
        // Put files not handled in other tasks here
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= yeoman.app %>',
                    dest: '<%= yeoman.dist %>',
                    src: [
                        '*.{ico,png,txt}',
                        '.htaccess',
                        'bower_components/**/*',
                        'images/{,*/}*.{gif,webp}',
                        'fonts/**/*',
                        'template/{,*/}*',
                        'login/{,*/}*',
                        'modules/{,*/}*.html', 'modules/{,*/}*/{,*/}*.html',
                        '*.html', 'views/{,*/}*.html', 'views/{,*/}*/{,*/}*.html'
                    ]
                }, {
                    expand: true,
                    cwd: 'bower_components',
                    dest: '<%= yeoman.dist %>/bower_components',
                    src: [
                        '**/**'
                    ]
                }, {
                    expand: true,
                    cwd: 'node_modules',
                    dest: '<%= yeoman.dist %>/node_modules',
                    src: [
                        '**/**'
                    ]
                }, {
                    expand: true,
                    cwd: 'public',
                    dest: '<%= yeoman.dist %>/public',
                    src: [
                        '**/**'
                    ]
                }, {
                    expand: true,
                    cwd: '.',
                    dest: '<%= yeoman.dist %>/',
                    src: [
                        'app.js',
                        'config*.json',
                        'ctrl.js'
                    ]
                }, {
                    expand: true,
                    cwd: 'server',
                    dest: '<%= yeoman.dist %>/server',
                    src: [
                        '**/**'
                    ]
                }]
            },
            styles: {
                expand: true,
                cwd: '<%= yeoman.app %>/styles',
                dest: '.tmp/styles/',
                src: '{,*/}*.css'
            }
        },
        concurrent: {
            server: [
                'coffee:dist',
                'copy:styles'
            ],
            test: [
                'coffee',
                'copy:styles'
            ],
            dist: [
                'coffee',
                'copy:styles',
                'imagemin',
                'svgmin',
                'htmlmin'
            ]
        },
        karma: {
            unit: {
                configFile: 'karma-unit.conf.js',
                singleRun: true
            },
            e2e: {
                configFile: 'karma-e2e.conf.js',
                autoWatch: false,
                singleRun: true
            }
        },
        cdnify: {
            dist: {
                html: ['<%= yeoman.dist %>/*.html']
            }
        },
        ngmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.dist %>',
                    src: [
                        'scripts/{,*/}*.js',
                        'modules/{,*/}*.js'
                    ],
                    dest: '<%= yeoman.dist %>'
                }]
            }
        },
        uglify: {
            dist: {
                files: {
                    '<%= yeoman.dist %>/scripts/scripts.js': [
                        '<%= yeoman.dist %>/scripts/scripts.js'
                    ]
                }
            }
        },
        protractor: {
            options: {
                configFile: "node_modules/protractor/referenceConf.js", // Default config file
                keepAlive: true, // If false, the grunt process stops when the test fails.
                noColor: false, // If true, protractor will not use colors in its output.
                args: {
                    // Arguments passed to the command
                }
            },
            your_target: {
                options: {
                    configFile: "protractor.conf.js", // Target-specific config file
                    args: {} // Target-specific arguments
                }
            }
        }
    });

    grunt.registerTask('server', function(target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'connect:dist:keepalive']);
        }

        grunt.task.run([
            'clean:server',
            'concurrent:server',
            'autoprefixer',
            'less',
            'connect:livereload',
            'watch'
        ]);
    });

    grunt.registerTask('test', [
        'clean:server',
        'concurrent:test',
        'autoprefixer',
        'connect:test',
        'karma:unit'
        // 'protractor'
    ]);

    grunt.registerTask('build', [
        'clean:dist',
        'useminPrepare',
        'concurrent:dist',
        'autoprefixer',
        'less',
        'concat',
        'copy:dist',
        //'cdnify',
        'ngmin',
        //'cssmin',
        'uglify',
        'rev',
        'usemin'
    ]);

    grunt.registerTask('default', [
        'jshint',
        'test',
        'build'
    ]);
};
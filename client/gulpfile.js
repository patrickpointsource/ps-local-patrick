/* Copyright © 2015 PointSource, LLC. All rights reserved. */
var gulp = require('gulp'),
    rimraf = require('rimraf'),
    runSequence = require('run-sequence'),
    frontMatter = require('gulp-front-matter'),
    autoprefixer = require('gulp-autoprefixer'),
    sass = require('gulp-ruby-sass'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    chmod = require('gulp-chmod'),
    connect = require('gulp-connect'),
    jshint = require('gulp-jshint'),
    ngConstant = require('gulp-ng-constant'),
    path = require('path'),
    modRewrite = require('connect-modrewrite'),
    spawn = require('child_process').spawn,
    sprouts = require('./sprout-assets.json');


var webContentBaseDir = 'cordova/www';

var makeSproutPaths = function (fileType, filepaths, output) {
    for (var item in filepaths.components) {
        if (filepaths.components[item]) {
            console.log(filepaths.components[item]);
            output.push(filepaths.components[item] + '/**/*.' + fileType);
        }
    }
};

// Clean build directories
gulp.task('clean', ['clean-cordova'], function (cb) {
    rimraf('./dist', cb);
});

gulp.task('clean-cordova', function (cb) {
    rimraf(webContentBaseDir, cb);
});

// Copy static files (but not the Angular templates, Sass, or JS)
gulp.task('copy', function () {
    var dirs = [
        './src/**/*.*',
        '!./src/assets/{scss,js}/**/*.*'
    ];

    gulp.src(dirs, {
            base: './src/'
        })
        .pipe(gulp.dest('dist'));


    gulp.src(dirs, {
            base: './src/'
        })
        .pipe(gulp.dest(webContentBaseDir))
        .pipe(connect.reload());

    return gulp.src('bower_components/foundation-apps/iconic/**/*')
        .pipe(gulp.dest('dist/assets/img/iconic/'))
});

gulp.task('lint', function () {
    var dirs = [
        './src/**/*.js',
        '!./src/assets/{scss,js}/**/*.*',
        '!./src/docs/**/*.*'
    ];

    return gulp.src(dirs)
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(jshint.reporter('fail'));
});

gulp.task('clean-partials', function (cb) {
    rimraf('./dist/partials', cb);
});

gulp.task('copy-partials', ['clean-partials'], function () {
    return gulp.src(['bower_components/foundation-apps/js/angular/partials/**.*'])
        .pipe(gulp.dest('./dist/partials/'));
});
gulp.task('copy-foundation-templates', function () {
    var config = [
        'bower_components/foundation-apps/js/angular/components/**/*.html'
    ];

    return gulp.src(config)
        .pipe(gulp.dest('dist/components'));
});

gulp.task('copy-templates', [
        'copy-foundation-templates',
        'copy-sprout-templates'
    ],
    function () {
        var config = [
            './src/**/*.html'
        ];

        return gulp.src(config)
            .pipe(gulp.dest('dist/'))
            .pipe(connect.reload());
    }
);

gulp.task('copy-sprout-templates', function () {
    var sproutGlobs = [];
    makeSproutPaths('html', sprouts, sproutGlobs);
    gulp.src('./bower_components/' + sproutGlobs)
        .pipe(gulp.dest('./dist/sprout'))
        .pipe(gulp.dest(webContentBaseDir + '/sprout'));
});

gulp.task('copy-config', function () {

    gulp.src('./config/app.config.json')
        .pipe(ngConstant({
            name: 'app.config',
            templatePath: './app.config.ejs'
        }))
        .pipe(gulp.dest('./dist/app'))
        .pipe(gulp.dest(webContentBaseDir + '/app'))
        .pipe(connect.reload());
});

gulp.task('copy-custom-css', ['copy-fonts'], function () {
    return gulp.src(['bower_components/angular-snap/angular-snap.css'])
        .pipe(gulp.dest('./dist/assets/css'))
        .pipe(gulp.dest(webContentBaseDir + '/assets/css'))
        .pipe(connect.reload());
});

gulp.task('copy-sprout-css', [], function () {
    var sproutGlobs = [];
    makeSproutPaths('scss', sprouts, sproutGlobs);
    return gulp.src('./bower_components/' + sproutGlobs)
        .pipe(concat('sprout.scss'))
        .pipe(gulp.dest('./src/assets/scss/'))
        .pipe(gulp.dest(webContentBaseDir + '/assets/scss/'));
});

gulp.task('copy-fonts', ['copy-fa-fonts', 'copy-icomoon-fonts'], function () {
    return gulp.src(['bower_components/font-awesome/css/font-awesome.min.css'])
        .pipe(gulp.dest('./dist/assets/css'))
        .pipe(gulp.dest(webContentBaseDir + '/assets/css'));
});

gulp.task('copy-fa-fonts', [], function () {
    return gulp.src([
            'bower_components/font-awesome/fonts/fontawesome-webfont.eot',
            'bower_components/font-awesome/fonts/fontawesome-webfont.svg',
            'bower_components/font-awesome/fonts/fontawesome-webfont.ttf',
            'bower_components/font-awesome/fonts/fontawesome-webfont.woff'
        ])
        .pipe(gulp.dest('./dist/assets/fonts'))
        .pipe(gulp.dest(webContentBaseDir + '/assets/fonts'));
});
gulp.task('copy-icomoon-fonts', [], function () {
    return gulp.src([
            'src/assets/fonts/icomoon.eot',
            'src/assets/fonts/icomoon.svg',
            'src/assets/fonts/icomoon.ttf',
            'src/assets/fonts/icomoon.woff'
        ])
        .pipe(gulp.dest('./dist/assets/fonts'))
        .pipe(gulp.dest(webContentBaseDir + '/assets/fonts'));
});

gulp.task('sass', function () {
    return gulp.src('src/assets/scss/app.scss')
        .pipe(sass({
            loadPath: [
                'bower_components/foundation-apps/scss',
                'src/assets/scss',
                'src/app/**/*.scss',
                sprouts
            ],
            style: 'nested',
            bundleExec: true
        }))
        .on('error', function (e) {
            console.log(e);
        })
        .pipe(autoprefixer({
            browsers: ['last 2 versions', 'ie 10']
        }))
        .pipe(gulp.dest('./dist/assets/css/'))
        .pipe(gulp.dest(webContentBaseDir + '/assets/css/'))
        .pipe(connect.reload());
});

// Process Foundation JS
gulp.task('uglify', [
        'uglify-angular',
        'uglify-dependencies',
        'uglify-foundation',
        'uglify-sprout',
        'uglify-app'
    ],
    function () {
        console.log('uglifying');
        return;
    }
);

gulp.task('concatjs', [
        'uglify-angular',
        'uglify-dependencies',
        'uglify-foundation',
        'concat-sprout',
        'concat-app'
    ],
    function () {
        console.log('concatenating');
        return;
    }

)

// Process Angular JS
gulp.task('uglify-angular', function () {
    var libs = [
        'bower_components/angular/angular.js',
        'bower_components/angular-animate/angular-animate.js',
        'bower_components/angular-touch/angular-touch.js',
        'bower_components/angular-ui-router/release/angular-ui-router.js'
    ];

    return gulp.src(libs)
        .pipe(uglify({
            beautify: true,
            mangle: false
        }))
        .pipe(concat('angular-libs.js'))
        .pipe(gulp.dest('./dist/assets/js/'))
        .pipe(gulp.dest(webContentBaseDir + '/assets/js/'));
});

gulp.task('uglify-dependencies', function () {
    var libs = [
        'bower_components/jquery/dist/jquery.js',
        'bower_components/fastclick/lib/fastclick.js',
        'bower_components/viewport-units-buggyfill/viewport-units-buggyfill.js',
        'bower_components/notify.js/notify.js',
        'bower_components/tether/tether.js',
        'bower_components/ngCordova/dist/ng-cordova.js',
        'bower_components/iscroll/src/iscroll.js',
        'bower_components/pouchdb/dist/pouchdb.js',
        'bower_components/lodash/lodash.js',
        'bower_components/restangular/dist/restangular.js',
        'bower_components/mm-angular-logger/dist/mm-angular-logger.js',
        'bower_components/psaf-logger/dist/psaf-logger.min.js',
        'bower_components/moment/moment.js',
        'bower_components/swagger-angular-client/dist/swagger-angular-client.js',
        'bower_components/angular-directive.g-signin/google-plus-signin.js'
    ];

    return gulp.src(libs)
        .pipe(uglify({
            beautify: true,
            mangle: false
        }).on('error', function (e) {
            console.log(e);
        }))
        .pipe(concat('dependencies.js'))
        .pipe(gulp.dest('./dist/assets/js/'))
        .pipe(gulp.dest(webContentBaseDir + '/assets/js/'));
});

gulp.task('uglify-app', function () {
    var libs = require('./appFiles.json');
    console.log(libs);
    return gulp.src(libs)
        .pipe(uglify({
            beautify: true,
            mangle: false
        }).on('error', function (e) {
            console.log(e);
        }))
        .pipe(concat('appFiles.js'))
        .pipe(gulp.dest('./dist/assets/js/'))
        .pipe(gulp.dest(webContentBaseDir + '/assets/js/'))
        .pipe(connect.reload());
});

gulp.task('concat-app', function () {
    var libs = require('./appFiles.json');
    console.log(libs);
    return gulp.src(libs)
        .pipe(concat('appFiles.js'))
        .pipe(gulp.dest('./dist/assets/js/'))
        .pipe(gulp.dest(webContentBaseDir + '/assets/js/'))
        .pipe(connect.reload());
});

gulp.task('uglify-foundation', function () {
    var libs = [
        'bower_components/foundation-apps/js/vendor/**/*.js',
        'bower_components/foundation-apps/js/angular/**/*.js'
    ];

    return gulp.src(libs)
        .pipe(uglify({
            beautify: true,
            mangle: false
        }).on('error', function (e) {
            console.log(e);
        }))
        .pipe(concat('foundation-libs.js'))
        .pipe(gulp.dest('./dist/assets/js/'))
        .pipe(gulp.dest(webContentBaseDir + '/assets/js/'));
});

gulp.task('uglify-sprout', function () {
    var sproutGlobs = [];
    makeSproutPaths('js', sprouts, sproutGlobs);
    return gulp.src('./bower_components/' + sproutGlobs)
        .pipe(uglify({
            beautify: true,
            mangle: false
        }).on('error', function (e) {
            console.log(e);
        }))
        .pipe(concat('sprout.js'))
        .pipe(gulp.dest('./dist/assets/js/'))
        .pipe(gulp.dest(webContentBaseDir + '/assets/js/'))
        .pipe(connect.reload());
});

gulp.task('concat-sprout', function () {
    var sproutGlobs = [];
    makeSproutPaths('js', sprouts, sproutGlobs);
    return gulp.src('./bower_components/' + sproutGlobs)
        .pipe(concat('sprout.js'))
        .pipe(gulp.dest('./dist/assets/js/'))
        .pipe(gulp.dest(webContentBaseDir + '/assets/js/'))
        .pipe(connect.reload());
});

gulp.task('cordova:run', function () {
    console.log('Starting cordova run on all installed platforms...');
    var cordovaProcess = spawn('cordova', ['run'], {
        cwd: './cordova'
    });
    cordovaProcess.stdout.on('data', function (data) {
        console.log(data.toString());
    });
    cordovaProcess.stderr.on('data', function (data) {
        console.log('some error:' + data.toString());
    });
    cordovaProcess.on('close', function () {
        console.log('Running on all installed platforms...');
        process.exit();
    });
});

gulp.task('cordova:assets', function () {
    console.log('Cordova Assets Copy...');
    return gulp.src('image_assets/020_resource_files.js')
        .pipe(chmod(755))
        .pipe(gulp.dest('cordova/hooks/after_prepare'));
});

gulp.task('cordova:build', function () {
    var cordovaProcess = spawn('cordova', ['build'], {
        cwd: './cordova'
    });
    cordovaProcess.stdout.on('data', function (data) {
        console.log(data.toString());
    });
    cordovaProcess.stderr.on('data', function (data) {
        console.log('some error:' + data.toString());
    });
    cordovaProcess.on('close', function () {
        console.log('Running the cordova build');
        process.exit();
    });
});

gulp.task('server:start', function () {
    connect.server({
        root: './dist',
        livereload: true,
        middleware: function (connect) {
            return [
                // Route API requests to the node server
                (function () {
                    var url = require('url');
                    var proxy = require('proxy-middleware');
                    var options = url.parse('http://localhost:3000/v3');
                    options.route = '/v3';
                    return proxy(options);
                })(),
                modRewrite(['^[^\\.]*$ /index.html [L]'])
            ];
        }
    });
});


gulp.task('build', ['lint'], function () {
    runSequence('clean', [
            'copy-config',
            'copy',
            'copy-templates',
            'copy-partials',
            'copy-custom-css',
            'copy-sprout-css',
            'sass',
            'uglify'
        ],
        function () {
            console.log('Successfully built.');
        });
});

gulp.task('build-dev', ['lint'], function () {
    runSequence([
            'copy-config',
            'copy',
            'copy-templates',
            'copy-partials',
            'copy-custom-css',
            'copy-sprout-css',
            'sass',
            'concatjs'
        ],
        function () {
            console.log('Successfully built.');
        });
});

gulp.task('dev', ['build-dev', 'server:start'], function () {

    // Watch Sass
    gulp.watch([
        './src/assets/scss/**/*',
        './scss/**/*',
        './src/app/**/*.scss'
    ], ['sass']);

    // Watch JavaScript
    gulp.watch([
        './src/app/**/*.js',
    ], ['concatjs']);

    // Watch static files
    gulp.watch([
        './src/**/*.*',
        '!./src/assets/{scss,js}/**/*.*'
    ], ['copy']);

});

gulp.task('default', ['build',
        'server:start'
    ],
    function () {

        // Watch Sass
        gulp.watch([
            './src/assets/scss/**/*',
            './scss/**/*',
            './src/app/**/*.scss'
        ], ['sass']);

        // Watch JavaScript
        gulp.watch([
            './src/app/**/*.js',
        ], ['uglify']);

        // Watch static files
        gulp.watch([
            './src/**/*.*',
            '!./src/assets/{scss,js}/**/*.*'
        ], ['copy']);

    }
);

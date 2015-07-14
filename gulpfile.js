var gulp = require('gulp');
var coffee = require('gulp-coffee');
var stylus = require('gulp-stylus');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var del = require('del');
var minifycss = require('gulp-minify-css');
var gutil = require('gulp-util');
var plumber = require('gulp-plumber');
var autoprefixer = require('gulp-autoprefixer');
var nib = require('nib');
var changed = require('gulp-changed');
var coffeelint = require('gulp-coffeelint');
var Personium = require('gulp-personium');
var preprocess = require('gulp-preprocess');
var livereload = require('gulp-livereload');

// You'll need to create the credentials.json file for gulp to work
// You can find a sample file at github.com/jackjonesfashion/dmw_static
// Do not commit the credentials to github, as your login will be exposed
var creds = require('./credentials.json');
var config = require('./config.json');

// Update these paths to fit your structure
var paths = {
  scripts: 'src/scripts/**/*.coffee',

  styles: [
    'src/styles/**/*.styl',
    '!src/styles/partials/**/*.styl',
    '!src/styles/modules/**/*.styl'
  ],

  html: [
    'src/html/**/*.html',
    '!src/html/partials/**/*.html'
  ],

  images: 'src/images/**/*',

  copy: [
    'src/**/*',
    '!src/{scripts,scripts/**}',
    '!src/{styles,styles/**}',
    '!src/{images,images/**}',
    '!src/html/**/*.html',
    '!src/html/partials/**/*.html'
  ],

  // Files to upload when deploying
  deployments: [
    'build/'+config.projectinfo.projectname+'/assets/scripts/*.js',
    'build/'+config.projectinfo.projectname+'/assets/styles/*.css'
  ]
};

// Emancipate yourself from build-folder slavery
// None but ourselves can free our project
//    - Bob Marley
gulp.task('clean', function(cb) {
  del(['build'], cb);
});

// Transpile coffee, minify and provide sourcemaps
gulp.task('scripts', function() {
  return gulp.src(paths.scripts)
    .pipe(plumber())
    .pipe(changed('build/'+config.projectinfo.projectname+'/assets/scripts', {extension: '.js'}))
    .pipe(sourcemaps.init())
    .pipe(coffeelint({
      no_tabs: { level: "ignore" },
      indentation: { value: 1 },
      max_line_length: { level: "ignore" }
    }))
    .pipe(coffeelint.reporter())
    .pipe(coffee())
    .pipe(uglify({
      mangle: false,
      beautify: false
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('build/'+config.projectinfo.projectname+'/assets/scripts'))
    .pipe(livereload());
});

// Process styling and minify
gulp.task('styles', function(){
  return gulp.src(paths.styles)
    .pipe(plumber())
    .pipe(changed('build/'+config.projectinfo.projectname+'/assets/styles', {extension: '.css'}))
    .pipe(stylus())
    .pipe(autoprefixer({ browser: 'Last 3 versions' }))
    .pipe(minifycss({
      processImport: false,
      advanced: false
    }))
    .pipe(gulp.dest('build/'+config.projectinfo.projectname+'/assets/styles'))
    .pipe(livereload());
});

// Copy all images
// Todo: Image optimization
gulp.task('images', function() {
  return gulp.src(paths.images)
    .pipe(plumber())
    .pipe(changed('build/'+config.projectinfo.projectname+'/assets/images'))
    .pipe(gulp.dest('build/'+config.projectinfo.projectname+'/assets/images'))
    .pipe(livereload());
});

// Process html
gulp.task('html', function () {
  return gulp.src(paths.html)
    .pipe(plumber())
    .pipe(preprocess())
    .pipe(gulp.dest('build/'+config.projectinfo.projectname+'/assets/html/'))
    .pipe(livereload());
});

// Copy anything that's not transpiled
gulp.task('copy', function() {
  return gulp.src(paths.copy)
    .pipe(gulp.dest('./build/'+config.projectinfo.projectname+'/assets'));
});

// Do a complete build
gulp.task('build', function() {
  gulp.start('scripts', 'styles', 'images', 'html', 'copy')
});

// Rerun the task when a file changes
gulp.task('watch', function() {
  livereload.listen();
  gulp.watch(paths.scripts, ['scripts']);
  gulp.watch(paths.styles, ['styles']);
  gulp.watch(paths.images, ['images']);
  gulp.watch(paths.html, ['html']);
});

gulp.task('watch-live', function() {
  gulp.watch(paths.scripts, ['deploy-sandbox']);
  gulp.watch(paths.styles, ['deploy-sandbox']);
});

// Deployments
// baseUrl = The URL used to connect to the DMW instance
// baseDir = The common shared folder for your assets (Fx '5-lines' or 'css')
gulp.task('deploy-sandbox', ['scripts', 'styles'], function(){
  var personium = new Personium({
    baseUrl: creds.sandbox.baseUrl,
    baseDir: config.projectinfo.projectname,
    user: creds.sandbox.user,
    password: creds.sandbox.password
  });

  return gulp.src(paths.deployments)
    .pipe(personium.upload());
});

gulp.task('deploy-staging', ['scripts', 'styles'], function(){
  var personium = new Personium({
    baseUrl: creds.staging.baseUrl,
    baseDir: config.projectinfo.projectname,
    user: creds.staging.user,
    password: creds.staging.password
  });

  return gulp.src(paths.deployments)
    .pipe(personium.upload())
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', function(){
  gutil.log('No default task, use', gutil.colors.green('gulp <task>'), 'instead');
  gutil.log('Tasks available:');
  gutil.log(gutil.colors.green('gulp clean'), 'to clean the project of previous builds');
  gutil.log(gutil.colors.green('gulp scripts'), 'to build scripts');
  gutil.log(gutil.colors.green('gulp styles'), 'to build styles');
  gutil.log(gutil.colors.green('gulp images'), 'to build images');
  gutil.log(gutil.colors.green('gulp build'), 'to make a complete build without deploying');
  gutil.log(gutil.colors.green('gulp watch'), 'to trigger builds when files are saved');
  gutil.log(gutil.colors.green('gulp deploy-sandbox'), 'to deploy scripts and styles to sandbox');
  gutil.log(gutil.colors.green('gulp deploy-staging'), 'to deploy scripts and styles to staging');
});
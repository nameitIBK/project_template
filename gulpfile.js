var gulp = require('gulp');
require('gulp-run-seq');
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
var findandreplace = require('gulp-replace-task');
var concat = require('gulp-concat');
var rename = require("gulp-rename");
var fs = require('fs');
var parser = require('parse-xlsx');
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
  xml: [
    'src/xml/**/*.xml'
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
  gutil.log('Deleted folder: '+gutil.colors.red('build/'));
  del(['build'],cb);
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
  sheet = new parser(config.xml.translationfile, 'Sheet1');
  pickCountry = 'country'+config.projectinfo.testcountry;
  var transTXT = sheet.values(pickCountry);
  var sheetROWS = []  
  var PPtransTXT = [];
  var counter = 1;
  for (var t = 0; t < transTXT.length; t++) {

    if (transTXT[t] !== undefined){
      PPtransTXT += '\"ROW'+t +'\" : \"'+ transTXT[t].replace(/(\r\n|\\r\\n)(?!$)/g, '<br />')+'\"';
      if(counter < transTXT.length){
        PPtransTXT += ',';
      }
    }
    counter = counter + 1;
  }
  var PPtransJSON = JSON.parse('{'+PPtransTXT+'}');
  return gulp.src(paths.html)
    .pipe(plumber())
    .pipe(preprocess({context:  PPtransJSON }))
    .pipe(gulp.dest('build/'+config.projectinfo.projectname+'/assets/html/'))
    .pipe(livereload());
});
// Process html for DMW
gulp.task('dmw', function () {
  return gulp.src(paths.html)
    .pipe(findandreplace({
      variables: {
          '../../': config.projectinfo.prefix_path + config.projectinfo.projectname+'/assets/',
          '.jpg': '.jpg?$staticlink$',
          '.png': '.png?$staticlink$',
          '.gif': '.gif?$staticlink$',
          '.js': '.js?$staticlink$',
          '.css': '.css?$staticlink$',
    },usePrefix: false}))
    .pipe(plumber())
    .pipe(preprocess())
    .pipe(gulp.dest('build/'+config.projectinfo.projectname+'/assets/DMWhtml/'))
});


gulp.task('xml', function(end) {
  setTimeout(function() {
    var assignedslots = [];
    var slotfiles_path = config.xml.slotfiles_path;
    for (var i = 0; i < config.xml.slotfiles.length; i++) {
      assignedslots.push(config.xml.headfile);
      assignedslots.push(slotfiles_path+config.xml.slotfiles[i]);
          gutil.log('Making '+gutil.colors.yellow(config.xml.slotfiles[i])+' DMW friendly'); 

    }
    gulp.src(assignedslots)
      .pipe(findandreplace({
        variables: {
            '../../': config.projectinfo.prefix_path+config.projectinfo.projectname+'/assets/',
            '.jpg': '.jpg?$staticlink$',
            '.png': '.png?$staticlink$',
            '.gif': '.gif?$staticlink$',
            '.js': '.js?$staticlink$',
            '.css': '.css?$staticlink$',
            '<': '&lt;',
            '>': '&gt;'
        },usePrefix: false}))
      .pipe(plumber())
      .pipe(gulp.dest('src/tempfiles/'))
    gutil.log('Start config of XML..'); 
  }, 500);

  setTimeout(function() {
    var xmlsetup = [];
    for (var y = 0; y < config.xml.slotfiles.length; y++) {
      var xmlsetup = [y];
      for (var j = 0; j < config.xml.slotfiles.length; j++) {
        var rank = (config.xml.rank[j] !== undefined ? config.xml.rank[j] : '');
        var rank = (config.xml.rank[j] !== undefined ? config.xml.rank[j] : '');
        var startdate = (config.xml.start_end_date[j] !== undefined ?  config.xml.start_end_date[j][0] : config.xml.start_end_date[0][0]);
        var enddate = (config.xml.start_end_date[j] !== undefined ?  config.xml.start_end_date[j][1] : config.xml.start_end_date[0][1]);
        var template = (config.xml.template[j] !== undefined ?  config.xml.template[j] : config.xml.template[0]);
        var DMWslotsname = (config.xml.DMWslotsname[j] !== undefined ?  config.xml.DMWslotsname[j] : config.xml.DMWslotsname[0]);
        var contextid = (config.xml.context_id[j] !== undefined ?  config.xml.context_id[j] : config.xml.context_id[0]);
        xmlsetup[j] = {
                    SLOTSID: DMWslotsname,
                    CONTEXTID: contextid,
                    CONFIGID: config.xml.config_id[j],
                    TEMPLATE: template,
                    RANK: rank,
                    STARTDATE: startdate,
                    ENDDATE: enddate,
                    DEBUG: true
                  }
      }
      //gutil.log(xmlsetup[y]);
    }
    for (var i = 0; i < config.xml.slotfiles.length; i++) {
      gulp.src(['src/xml/slot-start.xml','src/tempfiles/html-head.html','src/tempfiles/'+config.xml.slotfiles[i],'src/xml/slot-end.xml'])
      .pipe(concat({ path: 'all-slots-'+config.xml.slotfiles[i]+'.xml', stat: { mode: 0666 }}))
      .pipe(preprocess({context:  xmlsetup[i]}))
      .pipe(rename({
        basename: 'slot-'+i,
        extname: '.xml'
      }))
      .pipe(gulp.dest('src/tempfiles/'));
      gutil.log('From '+gutil.colors.cyan(config.xml.slotfiles[i])+' to '+gutil.colors.green('slot-'+i+'.xml'));
    }
    gutil.log('XML config: '+gutil.colors.green('DONE')); 
  }, 800);

  setTimeout(function() {
    if (fs.existsSync('src/tempfiles/slots.xml')) {
      fs.writeFile('src/tempfiles/slots.xml','');
    }
    gulp.src('src/tempfiles/*.xml')
      .pipe(concat({ path: 'slots.xml', stat: { mode: 0666 }}))
      .pipe(gulp.dest('src/tempfiles/'));
    gutil.log('XML merge: '+gutil.colors.green('DONE'));

    end();
    setTimeout(function() {
      gulp.start('finish-up');
    }, 500);
  }, 1000);
});

// Do the XML import dance
gulp.task('finish-up', function(end) {
  var transCountryArr = config.xml.transcountries;
  var transCountryCount = config.xml.transcountries.length;

if(config.xml.translationfile){
    sheet = new parser(config.xml.translationfile, 'Sheet1');
  
  for (var c = 0; c < transCountryCount; c++) {

    TransSheet(sheet,transCountryArr[c].toUpperCase());

  };
}else{
    gutil.log(gutil.colors.red('missing path to Excel file (.xslx file). NOT translated'));
    return  end();
  }
    gutil.log(gutil.colors.yellow('wait for tempfiles to be deleted..'));
  setTimeout(function() {
    del(['src/tempfiles/']);
    gutil.log('Deleted folder: '+gutil.colors.red('src/tempfiles/'));
    gutil.log('Clean up: '+gutil.colors.green('DONE'));
    end();
  }, 500);
});


function TransSheet (excelFile,country) {
  pickCountry = 'country'+ country;
  var transTXT = excelFile.values(pickCountry);
  var sheetROWS = []  
  var PPtransTXT = [];
  var counter = 1;
  for (var t = 0; t < transTXT.length; t++) {
    if (transTXT[t] !== undefined){
      PPtransTXT += '\"ROW'+t +'\" : \"'+ transTXT[t].replace(/(\r\n|\\r\\n)(?!$)/g, '&lt;br /&gt;')+'\"';
      if(counter < transTXT.length){
        PPtransTXT += ',';
      }
    }
    counter = counter + 1;
  }
  var PPtransJSON = JSON.parse('{'+PPtransTXT+'}');
  gulp.src(['src/xml/config-start.xml','src/tempfiles/slots.xml','src/xml/config-end.xml'])
  .pipe(concat({ path: 'slots.xml', stat: { mode: 0666 }}))
  .pipe(findandreplace({
    variables:{
      '--&gt;' : '-->',
      '&lt;!--' : '<!--'
    }, usePrefix:false}))
  .pipe(preprocess({context:  PPtransJSON }))
  .pipe(gulp.dest('build/'+config.projectinfo.brand+config.projectinfo.projectname+'/sites/'+country))
  gutil.log('Making site import for: '+gutil.colors.gray(country));
};

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
// baseDir = setup in config.json
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
  gutil.log(gutil.colors.green('gulp dmw'), 'to make all html-files with dmw paths');
  gutil.log(gutil.colors.green('gulp xml'), 'to make all html-files to dmw siteimport setup in config and translation');
  gutil.log(gutil.colors.green('gulp watch'), 'to trigger builds when files are saved');
  gutil.log(gutil.colors.green('gulp deploy-sandbox'), 'to deploy scripts and styles to sandbox');
  gutil.log(gutil.colors.green('gulp deploy-staging'), 'to deploy scripts and styles to staging');
});
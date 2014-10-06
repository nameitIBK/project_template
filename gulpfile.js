var CSS_ORDERED_FILES, JS_ORDERED_FILES, changed, clean, coffee, concat, config, debug, guid, gulp, gutil, livereload, lr, minifycss, paths, pkg, rename, replace, server, stylus, uglify;

gulp = require('gulp');

flatten = require('gulp-flatten');

debug = require('gulp-debug');

stylus = require('gulp-stylus');

minifycss = require('gulp-minify-css');

coffee = require('gulp-coffee');

uglify = require('gulp-uglify');

gutil = require('gulp-util');

changed = require('gulp-changed');

rename = require('gulp-rename');

clean = require('gulp-clean');

concat = require('gulp-concat');

replace = require('gulp-replace');

livereload = require('gulp-livereload');

lr = require('tiny-lr');

extreplace = require('gulp-ext-replace')

server = lr();

pkg = require('./package.json');

config = require('./config.json');

JS_ORDERED_FILES = config.jsfiles;

CSS_ORDERED_FILES = config.cssfiles;

paths = {
  coffee: {
    src: 'src/scripts/**/*.coffee',
    dst: 'build/.local/scripts'
  },
  stylus: {
    src: 'src/styles/**/*.styl',
    dst: 'build/.local/styles'
  },
  javascript: {
    src: 'build/.local/scripts/**/*.js',
    dst: 'build/.local/scripts'
  },
  stylesheet: {
    src: 'build/.local/styles/**/*.css',
    dst: 'build/.local/styles'
  },
  images: {
    src: 'src/images/**/*',
    dst: 'build/assets/images'
  },
  production: {
    dst: 'build/assets'
  }
};

gulp.task('template:production', function() {
  var css, cssFileStr, js, jsFileStr, _i, _j, _len, _len1, _ref;
  css = [];
  _ref = config.cssfiles;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    cssFileStr = _ref[_i];
    css.push(cssFileStr.split("src/").join("assets/"));
  }
  js = [];
  for (_j = 0, _len1 = JS_ORDERED_FILES.length; _j < _len1; _j++) {
    jsFileStr = JS_ORDERED_FILES[_j];
    js.push(jsFileStr.split("src/").join("assets/"));
  }
  return gulp.src('src/html/index.php.template', {
    base: './'
  }).pipe(replace("{CSS_FILES_DESKTOP}", css)).pipe(replace("{JS_FILES_DESKTOP}", js)).pipe(replace("{guid}", "main")).pipe(extreplace("")).pipe(flatten()).pipe(gulp.dest('./build'));
});

gulp.task('template:local', function() {
  var css, cssFileStr, js, jsFileStr, _i, _j, _len, _len1;
  css = [];
  for (_i = 0, _len = CSS_ORDERED_FILES.length; _i < _len; _i++) {
    cssFileStr = CSS_ORDERED_FILES[_i];
    css.push(cssFileStr.split("src/").join("build/.local/"));
  }
  js = [];
  for (_j = 0, _len1 = JS_ORDERED_FILES.length; _j < _len1; _j++) {
    jsFileStr = JS_ORDERED_FILES[_j];
    js.push(jsFileStr.split("src/").join("build/.local/"));
  }
  return gulp.src('src/html/*.php.template', {
    base: './'
  }).pipe(replace("{CSS_FILES_DESKTOP}", css)).pipe(replace("{JS_FILES_DESKTOP}", js)).pipe(replace("{guid}", "main")).pipe(extreplace("")).pipe(flatten()).pipe(gulp.dest('./build'));
});

gulp.task('styles', function() {
  return gulp.src(paths.stylus.src)
  .pipe(flatten())
  .pipe(changed(paths.stylus.dst, {
    extension: '.css'
  })).pipe(stylus({
    use: ['nib'],
    errors: true
  })).on('error', gutil.log).on('error', gutil.beep).pipe(gulp.dest(paths.stylus.dst)).pipe(livereload(server));
});

gulp.task('styles-min', ['styles'], function() {
  var css, cssFileStr, _i, _len;
  css = [];
  for (_i = 0, _len = CSS_ORDERED_FILES.length; _i < _len; _i++) {
    cssFileStr = CSS_ORDERED_FILES[_i];
    css.push(cssFileStr.split("src/").join("build/.local/"));
  }
  return gulp.src(css).pipe(concat('main.css')).pipe(rename({
    suffix: '.min'
  })).pipe(minifycss()).pipe(gulp.dest(paths.production.dst + "/styles"));
});

gulp.task('scripts', function() {
  return gulp.src(paths.coffee.src).pipe(changed(paths.coffee.dst, {
    extension: '.js'
  })).pipe(coffee({
    bare: true
  })).on('error', gutil.log).on('error', gutil.beep).pipe(gulp.dest(paths.coffee.dst)).pipe(livereload(server));
});

gulp.task('scripts-min', ['scripts'], function() {
  var js, jsFileStr, _i, _len;
  js = [];
  for (_i = 0, _len = JS_ORDERED_FILES.length; _i < _len; _i++) {
    jsFileStr = JS_ORDERED_FILES[_i];
    js.push(jsFileStr.split("src/").join("build/.local/"));
  }
  return gulp.src(js).pipe(concat('main.js')).pipe(rename({
    suffix: '.min'
  })).pipe(uglify()).pipe(gulp.dest(paths.production.dst + "/scripts"));
});

gulp.task('file-copy', function() {
  gulp.src(['src/scripts/**/*', "!src/scripts/**/*.coffee"], {
    base: 'src/scripts'
  }).pipe(gulp.dest('./build/.local/scripts/'));
  gulp.src('src/php/**/*.php', {
    base: 'src/php'
  }).pipe(gulp.dest('./build/assets/php/'));
  gulp.src('src/images/**/*', {
    base: 'src/images'
  }).pipe(gulp.dest('./build/assets/images/'));
  gulp.src('src/fonts/**/*', {
    base: 'src/fonts'
  }).pipe(gulp.dest('./build/assets/fonts/'));
  return gulp.src('src/svg/**/*.svg', {
    base: 'src/svg'
  }).pipe(gulp.dest('./build/assets/svg/'));
});

gulp.task('images', function() {
  return gulp.src([paths.images.src, '!src/images/{base64,base64/**}']).pipe(changed(paths.images.dst))
  .pipe(livereload(server)).pipe(gulp.dest(paths.images.dst));
});

gulp.task('clean', function() {
  return gulp.src(['build/index.php', 'build/assets/*'], {
    read: false
  }).pipe(clean({
    force: true
  }));
});

gulp.task('default', function() {
  return console.log("no 'default' task, run 'gulp build/deploy/watch'");
});

gulp.task('build', function() {
  return gulp.start('file-copy', 'scripts', 'styles', 'template:local');
});

gulp.task('deploy', function() {
  return gulp.start('styles', 'scripts', 'scripts-min', 'styles-min', 'file-copy', 'scripts-min', 'template:production');
});

gulp.task('watch', function() {
  return server.listen(35729, function(err) {
    if (err) {
      return console.log(err);
    }
    gulp.watch('src/styles/**/*.styl', ['styles']);
    gulp.watch('src/scripts/**/*.coffee', ['scripts']);
    return gulp.watch('src/images/**/*', ['images']);
  });
});

guid = function() {
  var s4;
  s4 = function() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  };
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
};

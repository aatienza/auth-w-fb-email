// necessary for deployment
require('es6-promise').polyfill();

var source = require('vinyl-source-stream');
var gulp = require('gulp');
var gutil = require('gulp-util');
var browserify = require('browserify');
var babelify = require('babelify');
var watchify = require('watchify');
var notify = require('gulp-notify');

var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var buffer = require('vinyl-buffer');

/*
  Styles Task
*/

gulp.task('styles',function() {
  // move over fonts
  gulp.src('client/css/fonts/**.*')
    .pipe(gulp.dest('build/css/fonts'));

  // Compiles CSS
  gulp.src('client/css/main.scss')
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(gulp.dest('./build/css/'));
});

/*
  Images
*/
gulp.task('images',function(){
  gulp.src('css/images/**')
    .pipe(gulp.dest('./build/css/images'))
});


function handleErrors() {
  var args = Array.prototype.slice.call(arguments);
  notify.onError({
    title: 'Compile Error',
    message: '<%= error.message %>'
  }).apply(this, args);
  this.emit('end'); // Keep gulp from hanging on this task
}

function buildScript(file, watch, optimize) {

  var props = {
    entries: ['./client/' + file],
    debug : true,
    transform:  [babelify.configure({stage : 0 })]
  };

  // watchify() if watch requested, otherwise run browserify() once
  var bundler = watch ? watchify(browserify(props)) : browserify(props);

  function rebundle(optimize) {

    var stream = bundler.bundle();

    if( optimize ) {
      return stream
        .on('error', handleErrors)
        .pipe(source(file))
        .pipe(gulp.dest('./build/'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(rename('app.min.js'))
        .pipe(gulp.dest('./build'));
    }

    return stream
      .on('error', handleErrors)
      .pipe(source(file))
      .pipe(gulp.dest('./build/'));
  }

  // listen for an update and run rebundle
  bundler.on('update', function() {
    rebundle();
    gutil.log('Rebundle...');
  });

  // run it once the first time buildScript is called
  return rebundle();
}

gulp.task('scripts', function() {
  return buildScript('app.js', false); // this will once run once because we set watch to false
});

gulp.task('deploy', ['images', 'styles'], function(){
  buildScript('app.js', false, true);
});

// run 'scripts' task first, then watch for future changes
gulp.task('default', ['images','styles','scripts'], function() {
  gulp.watch('client/css/**/*', ['styles']); // gulp watch for stylus changes
  return buildScript('app.js', true); // browserify watch for JS changes
});

var gulp = require('gulp');
var wiredep = require('wiredep').stream;
var bower = require('gulp-bower');
var runSequence = require('run-sequence');

gulp.task('wiredep', function () {
  gulp.src('./index.html')
    .pipe(wiredep({}))
    .pipe(gulp.dest('.'));
});

gulp.task('bower', function() {
  return bower()
    .pipe(gulp.dest('./bower_components'))
});

gulp.task('setup', function(callback) {
  runSequence('bower', 'wiredep', callback);
});

gulp.task('default', function() {
  // place code for your default task here
});

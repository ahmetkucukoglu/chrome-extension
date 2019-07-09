var gulp = require('gulp');
var gulpConcat = require('gulp-concat');
var gulpCopy = require('gulp-copy');

gulp.task('merge', function () {
  return gulp.src(['src/data.js', 'src/logService.js', 'src/orderService.js', 'src/background.js'])
    .pipe(gulpConcat('background.js'))
    .pipe(gulp.dest('dist/'));
});

gulp.task('copy', function () {
  return gulp.src(['src/contentService.js', 'src/popup.js', 'src/popup.html', 'src/manifest.json'])
    .pipe(gulpCopy('dist/', { prefix: 1 }));
});

gulp.task('release', gulp.series('merge', 'copy'));
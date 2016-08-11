const gulp = require('gulp');
const shell = require('gulp-shell');
const eslint = require('gulp-eslint');

gulp.task('default', function () {
  console.log('Default task');
});

gulp.task('lint', function () {
  return gulp.src(['src/*.js', 'src/app/*.js', 'test/**/*.js', 'task/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('update-dep',
  shell.task(['npm  update spred-dev-service', 'npm  update spred-login-service', 'npm  update spred-api-service']));

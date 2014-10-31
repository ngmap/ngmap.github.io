var fs = require('fs');
var gulp = require('gulp');
var rename = require('gulp-rename');
var gutil = require('gulp-util');
var replace = require('gulp-replace');
var tap = require('gulp-tap');
var bump = require('gulp-bump');
var shell = require('gulp-shell');
var runSequence = require('run-sequence');
var rename = require("gulp-rename");
var bumpVersion = function(type) {
  type = type || 'patch';
  var version = '';
  gulp.src(['./bower.json', './package.json'])
    .pipe(bump({type: type}))
    .pipe(gulp.dest('./'))
    .pipe(tap(function(file, t) {
      version = JSON.parse(file.contents.toString()).version;
    })).on('end', function() {
      var color = gutil.colors;
      gulp.src('')
        .pipe(shell([
          'git commit --all --message "Version ' + version + '"',
          (type != 'patch' ? 'git tag --annotate "v' + version + '" --message "Version ' + version + '"' : 'true')
        ], {ignoreErrors: false}))
        .pipe(tap(function() {
          gutil.log(color.green("Version bumped to ") + color.yellow(version) + color.green(", don't forget to push!"));
        }));
    });

};
gulp.task('bump', ['build'], function() { bumpVersion('patch'); });
gulp.task('bump:patch', ['build'], function() { bumpVersion('patch'); });
gulp.task('bump:minor', ['build'], function() { bumpVersion('minor'); });
gulp.task('bump:major', ['build'], function() { bumpVersion('major'); });


gulp.task('build-html', function() {
  return gulp.src([
    './development/basics.html',
    './development/events.html',
    './development/controls.html',
    './development/styles.html',
    './development/drawings.html',
    './development/layers.html',
    './development/maptypes.html'
    ])

    /* replace source files to a single file */
    .pipe(replace(
      /<!-- build:js ([^ ]+) -->[^\!]+<!-- endbuild -->/gm, 
      function(_, $1) {
        return '<script src="' + $1+'"></script>';
      }
    ))

    /* remove development only codes */
    .pipe(replace( /<!-- build:development-only -->[^!]+<!-- endbuild -->/gm, ''))

    /* replace ng-include to the actual contents of a file */
    .pipe(replace(
      /^[ \t]+<[\w-\'\" ]+ ng-include="'([^']+)'"[^>]*><\/[^>]+>/gm,
      function(match, $1) {
        var code = fs.readFileSync("./development/"+$1);
        return "<!-- " + match.replace(/./g, "=")  + " -->\n" +
               "<!-- " + match + " -->\n" +
               "<!-- " + match.replace(/./g, "=")  + " -->\n" +
               code;
      }
    ))

    .pipe(gulp.dest('.'));
});

gulp.task('rename', function() {
  return gulp.src('./basics.html')
    .pipe(rename("index.html"))
    .pipe(gulp.dest(".")); 
});

gulp.task('build', function(callback) {
  runSequence('build-html', 'rename',  callback);
});

var gulp = require("gulp");
var path = require("path");
var fs = require("fs");
var rmdir = require("rmdir");
var ts = require("gulp-typescript");
var uglify = require("gulp-uglify");
//var exec = require('child_process').exec;

gulp.task("clear", function (cb) {
  var p = path.join(__dirname, "buildOutput");
  if (fs.existsSync(p)) {
    rmdir(p, function (err, dirs, files) {
      if (dirs) {
        console.log(dirs);
      }
      if (files) {
        console.log(files);
      }
      cb(err);
    });
  } else {
    cb();
  }
});

/*gulp.task("bundlejs", ["clear"], function (cb) {
  //r.js.cmd -o build-config.js
  var p = path.join(__dirname, "node_modules/requirejs/bin/r.js");
  exec("node " + p + " -o amd-build-config.js", function (err, stdout, stderr) {
    if (stdout) {
      console.log(stdout);
    }
    if (stderr) {
      console.log(stderr);
    }
    cb(err);
  });
});*/

gulp.task("compile", ["clear"], function(){
  var tsResult = gulp.src("src/**/*.ts").pipe(ts({
    "module": "amd",
    "target": "es5",
    "noImplicitAny": true,
    "removeComments": true,
    "preserveConstEnums": true
    //"outDir": "buildOutput/amd"
  }));
  return tsResult.js.pipe(gulp.dest("buildOutput/amd"));
});

gulp.task("bundle", ["clear"], function () {
  var tsResult = gulp.src("src/**/*.ts").pipe(ts({
    "module": "amd",
    "target": "es5",
    "noImplicitAny": true,
    "removeComments": true,
    "preserveConstEnums": true,
    "out": "buildOutput/bundle.js"
  }));
  return tsResult.js.pipe(uglify()).pipe(gulp.dest("."));
});

gulp.task("build", ["compile", "bundle"]);

gulp.task("default", ["build"]);
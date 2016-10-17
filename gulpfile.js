var gulp = require("gulp");
var path = require("path");
var fs = require("fs");
var rmdir = require("rmdir");
var ts = require("gulp-typescript");
var exec = require('child_process').exec;

gulp.task("default", ["build"]);

gulp.task("clear", function(cb){
  var p = path.join(__dirname, "buildOutput");
  if(fs.existsSync(p)){
    rmdir(p, function(err, dirs, files){
      if(dirs){
        console.log(dirs);
      }
      if(files){
        console.log(files);
      }
      cb(err);
    });
  }else{
    cb();
  }
});

gulp.task("build", ["clear"], function(cb){
  //return gulp.src("js/**/*.js").pipe(concat("world.js")).pipe(gulp.dest("build"));
  //r.js.cmd -o build-config.js
  var p = path.join(__dirname, "node_modules/requirejs/bin/r.js");
  exec("node " + p + " -o amd-build-config.js", function(err, stdout, stderr){
    if(stdout){
      console.log(stdout);
    }
    if(stderr){
      console.log(stderr);
    }
    cb(err);
  });
});

gulp.task("tsc", function(){
  gulp.src("ts/**/*.ts");
});
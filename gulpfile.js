var gulp = require("gulp");
var path = require("path");
var fs = require("fs");
var rmdir = require("rmdir");
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
  console.log("execute build task");
  //return gulp.src("js/**/*.js").pipe(concat("world.js")).pipe(gulp.dest("build"));
  //r.js.cmd -o build-config.js
  exec("node node_modules/requirejs/bin/r.js -o build-config.js", function(err, stdout, stderr){
    if(stdout){
      console.log(stdout);
    }
    if(stderr){
      console.log(stderr);
    }
    cb(err);
  });
});
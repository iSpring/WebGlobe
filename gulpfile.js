var gulp = require("gulp");
var concat = require("gulp-concat");
var exec = require('child_process').exec;

gulp.task("default", ["build"]);

gulp.task("clear", function(){
  console.log("execute clear task");
});

gulp.task("build", ["clear"], function(cb){
  console.log("execute build task");
  //return gulp.src("js/**/*.js").pipe(concat("world.js")).pipe(gulp.dest("build"));
  exec("r.js.cmd -o build-config.js", function(err, stdout, stderr){
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
});
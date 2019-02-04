'use strict';

var gulp = require('gulp'), 
    sass = require('gulp-sass'),
    browserSync = require('browser-sync'),
    del = require('del'),
    imagemin = require('gulp-imagemin'),
    uglify = require('gulp-uglify'),
    usemin = require('gulp-usemin'),
    rev = require('gulp-rev'),
    cleanCss = require('gulp-clean-css'),
    flatmap = require('gulp-flatmap'),
    htmlmin = require('gulp-htmlmin');

gulp.task('sass', function() {
    return gulp.src('./css/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./css'));
});

gulp.task('sass:watch'), function() {
    gulp.watch('./css/*.scss', ['sass']);
};

gulp.task('browser-sync', function() {
    var files = [
        './*.html',
        './css/*.css',
        './js/*.js',
        './img/*.{png,jpg,jpeg,gif}'
    ];

    browserSync.init(files, {
        server: {
            baseDir: './'
        }
    });
});

// Default task.  Running 'gulp' from the command line will execute this.
// This will start up the browser and any changes to the css, html, js or image
// files will automatically be reflected in the browser

gulp.task('default', ['browser-sync'], function() {
    gulp.start('sass:watch');
});

// This will delete out the distribution folder 
gulp.task('clean', function() {
    return del(['dist']);
});

// This will copy the fonts
gulp.task('copyfonts', function()
{
    gulp.src('./node_modules/font-awesome/fonts/**/*.{ttf,woff,eof,svg}*')
    .pipe(gulp.dest('./dist/fonts'));
});

// This will run the imagemin by taking the image files and piping them through
// imagemin and then placing them in the dist/img folder
gulp.task('imagemin', function() {
    gulp.src('./img/*.{png,jpg,gif}')
    .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true}))
    .pipe(gulp.dest('dist/img'));
});

// Takes the html files and looks up the css and js blocks and combines, concatenates and minifys them into the 
// distribution folder
// usemin -
// flatmap - takes multiple html files and allows us to process them in parallel. 
// rev - puts revision number on css and js files (ex. main-2309956009.css)
// uglify - concatenates and 
// inlinejs - Any inline javascript it will uglify
// inlinecss - Any inline css it will clean and concatenate
gulp.task('usemin', function() {
    return gulp.src('./*.html')
    .pipe(flatmap(function(stream, file) {
        return stream
        .pipe(usemin({
            css: [rev()],
            html: [ function() { return htmlmin({ collapseWhitespace: true })}],
            js: [ uglify(), rev()],
            inlinejs: [uglify()],
            inlinecss: [ cleanCss(), 'concat']
        }))
    }))
    .pipe(gulp.dest('dist/'));
});

// This will first clean the dist folder and then
// run the copyfonts, imagemin and usemin in parallel
gulp.task('build', ['clean'], function() {
    gulp.start('copyfonts', 'imagemin', 'usemin');
});

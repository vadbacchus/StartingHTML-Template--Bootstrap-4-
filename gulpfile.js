var gulp          = require('gulp'),
		gutil         = require('gulp-util' ),
		sass          = require('gulp-sass'),
		browsersync   = require('browser-sync'),
		concat        = require('gulp-concat'),
		uglify        = require('gulp-uglify'),
		cleancss      = require('gulp-clean-css'),
		rename        = require('gulp-rename'),
		autoprefixer  = require('gulp-autoprefixer'),
		notify        = require("gulp-notify"),
		rsync         = require('gulp-rsync'),
		imagemin      = require('gulp-imagemin'),
		wait          = require('gulp-wait');

gulp.task('browser-sync', function() {
	browsersync({
		server: {
			baseDir: 'src'
		},
		notify: false,
		// open: false,
		// tunnel: true,
		// tunnel: "projectmane", //Demonstration page: http://projectmane.localtunnel.me
		// proxy: // needed for connect gulp and local server
	})
});

gulp.task('sass', function() {
	return gulp.src('src/sass/**/*.sass')
	.pipe(wait(500))
	.pipe(sass({ outputStyle: 'expanded' }).on("error", notify.onError()))
	.pipe(rename({ suffix: '.min', prefix : '' }))
	.pipe(autoprefixer(['last 15 versions']))
	.pipe(cleancss( {level: { 1: { specialComments: 0 } } })) // Opt., comment out when debugging
	.pipe(gulp.dest('src/css'))
	.pipe(browsersync.reload( {stream: true} ))
});

gulp.task('js', function() {
	return gulp.src([
		'src/libs/jquery/dist/jquery.min.js',
		'src/js/common.js', // Always at the end 
		])
	.pipe(concat('scripts.min.js'))
	.pipe(uglify()) // Mifify js (opt.)
	.pipe(gulp.dest('src/js'))
	.pipe(browsersync.reload({ stream: true }))
});

gulp.task ('img', function() {
	return gulp.src('src/img/**/*')
	.pipe(imagemin([
		imagemin.gifsicle({interlaced: true}),
		imagemin.jpegtran({progressive: true}),
		imagemin.optipng({optimizationLevel: 5}),
		imagemin.svgo({
			plugins: [
				{removeViewBox: true},
				{cleanupIDs: false}
			]
		})
	],
	{
		verbose: true
	}))
	.pipe(gulp.dest('src/img'))
});

gulp.task('rsync', function() {
	return gulp.src('src**')
	.pipe(rsync({
		root: 'src/',
		hostname: 'username@yousite.com',
		destination: 'yousite/public_html/',
		// include: ['*.htaccess'], // Includes files to deploy
		exclude: ['**/Thumbs.db', '**/*.DS_Store'], // Excludes files from deploy
		recursive: true,
		archive: true,
		silent: false,
		compress: true
	}))
});

gulp.task('watch', ['sass', 'js', 'browser-sync'], function() {
	gulp.watch('src/sass/**/*.sass', ['sass']);
	gulp.watch(['src/libs/**/*.js', 'src/js/common.js'], ['js']);
	gulp.watch('src/*.html', browsersync.reload);
	// gulp.watch('**/*.php', browserSync.reload); // for wordpress theme
});

gulp.task('default', ['watch']);

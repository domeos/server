var gulp = require('gulp'),
	jade = require('gulp-jade'),
	sass = require('gulp-ruby-sass'),
	jshint = require('gulp-jshint'),
	sourcemaps = require('gulp-sourcemaps'),
	rev = require('gulp-rev'),
	revReplace = require('gulp-rev-replace'),
	copy = require('gulp-file-copy'),
	clean = require('gulp-clean'),
	uglify = require('gulp-uglify'),
	minifyCss = require('gulp-minify-css'),
	filter = require('gulp-filter'),
	sequence = require('gulp-sequence'),
	plumber = require('gulp-plumber'),
	useref = require('gulp-useref'),
	gulpIf = require('gulp-if'),
	rename = require('gulp-rename');


var paths = {
	sass: 'app/**/*.scss',
	jade: ['app/**/*.jade', 'app/*.jade'],
	indexJade: 'app/index/_index.jade',
	js: ['app/**/*.js', '!app/lib/**/*.js', '!app/console/**/*.js'],
	html: ['dist/index.html', 'dist/**/*.html', '!dist/index/_index.html'],
	allNeedCopyFiles: ['app/**/*.*', 'app/*', '!app/**/*.{jade.scss}'],
	src: 'app',
	dest: 'dist'
};
// var getDirectory = function(srcPath) {
// 	return srcPath.substring(0, srcPath.lastIndexOf('/'));
// };
gulp.task('jade', function() {
	return gulp.src(paths.jade)
		.pipe(plumber())
		.pipe(jade({
			pretty: true
		}))
		.pipe(gulp.dest(paths.src));
});
gulp.task('indexJade', function() {
	return gulp.src(paths.indexJade)
		.pipe(plumber())
		.pipe(jade({
			pretty: true
		}))
		.pipe(rename('index.html'))
		.pipe(gulp.dest(paths.src));
});
gulp.task('sass', function() {
	return sass(paths.sass, {
			sourcemap: true,
			stopOnError: true,
			compass: true
		})
		.pipe(plumber())
		.on('error', sass.logError)
		.pipe(sourcemaps.write())
		.pipe(sourcemaps.write('maps', {
			includeContent: false,
			sourceRoot: 'source'
		}))
		.pipe(gulp.dest(paths.src));
});
gulp.task('lint', function() {
	return gulp.src(paths.js)
		.pipe(jshint({
			strict: false,
			laxbreak: true,
			debug: true,
			globals: {
				angular: true,
				$: true,
				_: true
			}
		}))
		.pipe(jshint.reporter('default'))
});
gulp.task('useref', function() {
	return gulp.src(paths.html)
		.pipe(useref())
		.pipe(gulpIf('*.js', uglify()))
		.pipe(gulpIf('*.css', minifyCss()))
		.pipe(gulp.dest(paths.dest));
});
gulp.task('rev', ['useref'], function() {
	return gulp.src(paths.dest + '/**/*.{js,css,png,jpg,jpeg,svg}')
		.pipe(rev())
		.pipe(gulp.dest(paths.dest))
		.pipe(rev.manifest())
		.pipe(gulp.dest(paths.dest));
});
gulp.task('revReplace', ['rev'], function() {
	var manifest = gulp.src(paths.dest + '/rev-manifest.json');
	return gulp.src(paths.dest + '/**/*')
		.pipe(revReplace({
			manifest: manifest
		}))
		.pipe(gulp.dest(paths.dest));
});
gulp.task('copy', ['clean'], function() {
	return gulp.src(paths.allNeedCopyFiles).pipe(copy(paths.dest, {
		start: 'app'
	})).pipe(gulp.dest(paths.dest));
});
gulp.task('clean', function() {
	return gulp.src(paths.dest, {
			reload: false
		})
		.pipe(clean({
			force: true
		}));
});
gulp.task('package', sequence('lint', 'jade', 'indexJade', 'sass', 'copy', 'revReplace'));
gulp.task('watch', ['lint'], function() {
	gulp.watch(paths.sass, ['sass']);
	gulp.watch(paths.jade, ['jade']);
	gulp.watch(paths.indexJade, ['indexJade']);
});
const gulp = require('gulp'),
    jade = require('gulp-jade'),
    sass = require('gulp-ruby-sass'),
    eslint = require('gulp-eslint'),
    // jshint = require('gulp-jshint'),
    sourcemaps = require('gulp-sourcemaps'),
    babel = require('gulp-babel'),
    rev = require('gulp-rev'),
    revReplace = require('gulp-rev-replace'),
    // copy = require('gulp-file-copy'),
    clean = require('gulp-clean'),
    uglify = require('gulp-uglify'),
    minifyCss = require('gulp-minify-css'),
    filter = require('gulp-filter'),
    sequence = require('gulp-sequence'),
    plumber = require('gulp-plumber'),
    useref = require('gulp-useref'),
    gulpIf = require('gulp-if'),
    rename = require('gulp-rename');

const paths = {
    sass: 'app/**/*.scss',
    jade: ['app/**/*.jade', 'app/*.jade'],
    indexJade: 'app/index/_index.jade',
    js: ['app/**/*.js', '!app/lib/**/*.js', '!app/console/**/*.js'],
    es: ['app/**/*.es'],
    html: ['dist/index.html', 'dist/**/*.html', '!dist/index/_index.html'],
    allNeedCopyFiles: ['app/**/*.*', 'app/*', '!app/**/*.{jade,scss,es}'],
    src: 'app',
    dest: 'dist'
};


gulp.task('sass', function () {
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

gulp.task('babel', function () {
    return gulp.src(paths.es)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(paths.src))
});

gulp.task('jade', function () {
    return gulp.src(paths.jade)
        .pipe(plumber())
        .pipe(jade({
            pretty: true
        }))
        .pipe(gulp.dest(paths.src));
});
gulp.task('indexJade', function () {
    return gulp.src(paths.indexJade)
        .pipe(plumber())
        .pipe(jade({
            pretty: true
        }))
        .pipe(rename('index.html'))
        .pipe(gulp.dest(paths.src));
});


gulp.task('lint', function () {
    return gulp.src(paths.js.concat(paths.es))
        .pipe(eslint({
            extends: 'eslint:recommended',
            env: {
                browser: true,
                node: true,
                es6: true
            },
            ecmaFeatures: {
                modules: true,
                jsx: true
            },
            globals: {
                angular: true,
                jQuery: true,
                AmCharts: true,
                domeApp: true,
                logApp: true,
                publicModule: true,
                showdown: true,
                $: true,
                _: true
            },
            rules: {
                semi: 2,
                // quotes: [1, 'single'],
                'space-before-blocks': 1,
                'comma-dangle': 2,
                'no-mixed-spaces-and-tabs': 0,
                'no-console': 0,
                'no-extra-parens': 2, //不必要的括号
                'accessor-pairs': 2, //enforce getter and setter pairs in objects
                'array-callback-return': 1, //enforce return statements in callbacks of array methods
                'guard-for-in': 2, //require for-in loops to include an if statement
                'no-caller': 2, //disallow the use of arguments.caller or arguments.callee
                // 'no-empty-function': 2
                'no-empty-pattern': 2,
                'no-eval': 2,
                'no-extra-bind': 2,
                'no-extra-label': 2,
                'no-lone-blocks': 2, // disallow unnecessary nested blocks
                'no-loop-func': 2,
                'no-new': 2, //disallow new operators outside of assignments or comparisons
                'no-return-assign': 2, //disallow assignment operators in return statements
                'no-self-compare': 2,
                'no-self-assign': 2,
                'no-unused-expressions': 0,
                'no-unused-vars': 0
            }
        }))
        .pipe(eslint.formatEach('compact', process.stderr));
});
gulp.task('useref', function () {
    return gulp.src(paths.html)
        .pipe(useref())
        .pipe(gulpIf('*.js', uglify()))
        .pipe(gulpIf('*.css', minifyCss()))
        .pipe(gulp.dest(paths.dest));
});
gulp.task('rev', ['useref'], function () {
    return gulp.src(paths.dest + '/**/*.{js,css,png,jpg,jpeg,svg}')
        .pipe(rev())
        .pipe(gulp.dest(paths.dest))
        .pipe(rev.manifest())
        .pipe(gulp.dest(paths.dest));
});
gulp.task('revReplace', ['rev'], function () {
    var manifest = gulp.src(paths.dest + '/rev-manifest.json');
    return gulp.src(paths.dest + '/**/*')
        .pipe(revReplace({
            manifest: manifest
        }))
        .pipe(gulp.dest(paths.dest));
});
gulp.task('copy', ['clean'], function () {
    return gulp.src(paths.allNeedCopyFiles).pipe(gulp.dest(paths.dest));
});
gulp.task('clean', function () {
    return gulp.src(paths.dest, {
        reload: false
    })
        .pipe(clean({
            force: true
        }));
});
gulp.task('package', sequence('lint', 'jade', 'indexJade', 'sass', 'copy', 'revReplace'));
gulp.task('watch', ['lint'], function () {
    gulp.watch(paths.sass, ['sass']);
    gulp.watch(paths.jade, ['jade']);
    gulp.watch(paths.es, ['babel']);
    gulp.watch(paths.indexJade, ['indexJade']);
});
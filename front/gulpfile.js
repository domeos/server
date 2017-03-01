/*!
 * Usage:
 *   gulp # same as gulp build
 *   gulp watch --backend <backend_address>:<backend_port> --port <port_to_listen>
 *     # watch changes and start a server for debugging frontend
 *   gulp release # compile to ../src/main/webapp for release
 *   gulp build # compile to app folder for debugging
 */

const gulp = require('gulp');
const gutil = require('gulp-util');

const through = require('through2');
const del = require('del');
const sequence = require('gulp-sequence');
const plumber = require('gulp-plumber');
const cache = require('gulp-cache');
const rename = require('gulp-rename');

const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-ruby-sass');
const babel = require('gulp-babel');
const pug = require('gulp-pug');
const imagemin = require('gulp-imagemin');
const replace = require('gulp-replace');

const connect = require('gulp-connect');
const proxy = require('http-proxy-middleware');

const conf = {
  backend: 'beta.domeos.sohucs.com:80',
  port: 8080
};

var mode = 'debug';
const paths = {
  src: {
    base: 'src',
    all: 'src/*',
    scss: 'src/**/*.scss',
    css: 'src/**/*.css',
    babel: 'src/**/*.es',
    js: 'src/**/*.js',
    pug: 'src/**/*.pug',
    html: 'src/**/*.html',
    img: [
      'src/**/*.png',
      'src/**/*.gif',
      'src/**/*.jpg',
      'src/**/*.jpeg',
      'src/**/*.ico',
    ],
    scssimg: [
      'src/index/images/icon-*.png',
      'src/index/images/lib-*.png',
      'src/index/images/nav-*.png',
      'src/module/images/icon-*.png',
    ],
    font: [
      'src/**/*.svg',
      'src/**/*.TTF',
      'src/**/*.ttf',
      'src/**/*.woff',
      'src/**/*.woff2',
      'src/**/*.eot',
    ],
    plugin: [
      'src/**/*.swf'
    ],
  },
  debug: {
    dst: 'app',
    clean: 'app'
  },
  release: {
    dst: 'dst',
    clean: [
      'dst/**/*',
      '!dst/pages{,/**/*}',
      '!dst/WEB-INF{,/**/*}',
    ]
  },
  releasewebapp: {
    dst: '../src/main/webapp',
    clean: [
      '../src/main/webapp/**/*',
      '!../src/main/webapp/pages{,/**/*}',
      '!../src/main/webapp/WEB-INF{,/**/*}',
    ]
  }
};

const watchs = [
];

gulp.task('scss', function () {
  return sass(paths.src.scss, {
    sourcemap: true,
    stopOnError: true,
    compass: true,
  })
    .pipe(plumber())
    .on('error', sass.logError)
    .pipe(sourcemaps.write())
    .pipe(sourcemaps.write('maps', {
      includeContent: false,
      sourceRoot: 'source'
    }))
    .pipe(gulp.dest(paths[mode].dst));
});

watchs.push([paths.src.css, ['copycss']]);
gulp.task('copycss', function () {
  return gulp.src(paths.src.css)
    .pipe(plumber())
    .pipe(gulp.dest(paths[mode].dst));
});

gulp.task('styles', ['scss', 'copycss'], function () {
});

let esHandler = 'babel';
if (gutil.env.nobabel) {
  esHandler = 'copyes';
  watchs.push([paths.src.babel, ['copyes']]);
  gulp.task('copyes', function () {
  return gulp.src(paths.src.babel)
      .pipe(rename({ extname: '.js' }))
      .pipe(gulp.dest(paths[mode].dst));
  });
} else {
  watchs.push([paths.src.babel, ['babel']]);
  gulp.task('babel', function () {
    return gulp.src(paths.src.babel)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(babel({ presets: ['es2015'] }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths[mode].dst));
  });
}

watchs.push([paths.src.js, ['copyjs']]);
gulp.task('copyjs', function () {
  return gulp.src(paths.src.js)
    .pipe(plumber())
    .pipe(gulp.dest(paths[mode].dst));
});

gulp.task('scripts', [esHandler, 'copyjs'], function () {
});

watchs.push([paths.src.pug, ['pug']]);
gulp.task('pug', function () {
  var hash = [...Array(32)].map(x => Math.random().toString(36)[3] || '0').join('');
  return gulp.src(paths.src.pug)
    .pipe(plumber())
    .pipe(cache(pug({ pretty: mode === 'debug' })))
    .pipe(replace(/##version-hash##/g, hash))
    .pipe(gulp.dest(paths[mode].dst));
});

watchs.push([paths.src.html, ['copyhtml']]);
gulp.task('copyhtml', function () {
  var hash = [...Array(32)].map(x => Math.random().toString(36)[3] || '0').join('');
  return gulp.src(paths.src.html)
    .pipe(plumber())
    .pipe(mode === 'debug' ? gutil.noop() : replace(/##version-hash##/, hash))
    .pipe(gulp.dest(paths[mode].dst));
});

gulp.task('htmls', ['pug', 'copyhtml'], function () {
});

gulp.task('copyimg', function () {
  return gulp.src(paths.src.img)
    .pipe(plumber())
    .pipe(cache(imagemin()))
    .pipe(gulp.dest(paths.src.base))
    .pipe(gulp.dest(paths[mode].dst));
});

watchs.push([[
  paths.src.scss,
  paths.src.img,
  paths.src.scssimg.map(function (x) { return '!' + x; })
], ['img']]);
gulp.task('img', function (callback) {
  sequence('scss', 'copyimg', callback);
});

watchs.push([paths.src.font, ['font']]);
gulp.task('font', function () {
  return gulp.src(paths.src.font)
    .pipe(plumber())
    .pipe(gulp.dest(paths[mode].dst));
});

watchs.push([paths.src.plugin, ['plugin']]);
gulp.task('plugin', function () {
  return gulp.src(paths.src.plugin)
    .pipe(plumber())
    .pipe(gulp.dest(paths[mode].dst));
});

gulp.task('clean', function () {
  return del(paths[mode].clean, { force: true });
});

gulp.task('build', function (callback) {
  sequence('clean', ['styles', 'scripts', 'pug', 'htmls', 'img', 'font', 'plugin'], callback);
});

gulp.task('default', ['build'], function () {
});

gulp.task('connect', ['build'], function () {
  var backend = gutil.env.backend || conf.backend;
  var base = {
    middleware: function (connect, opt) {
      var middlewares = [];
      if (backend) middlewares.push([
        proxy('/api', {
          target: 'http://' + backend,
          changeOrigin: true,
        })
      ]);
      middlewares.push(function (req, res, next) {
        gutil.log(req.method, req.url);
        next();
      });
      return middlewares;
    }
  };
  connect.server(Object.assign({}, base, {
    port: Number(gutil.env.port) || conf.port,
    root: './' + paths[mode].dst,
  }));
});

gulp.task('watch', ['build', 'connect'], function () {
  if (!gutil.env.backend) {
    gutil.log(gutil.colors.yellow('No backend paramter given, `' + conf.backend + '` would be chosen.'));
  }
  if (!gutil.env.port) {
    gutil.log(gutil.colors.yellow('No port paramter given, gulp will listen to port `' + conf.port + '` by default.'));
  }
  watchs.forEach(function (watch) {
    gulp.watch(watch[0], watch[1]);
  });
});

gulp.task('releaseinfo', function () {
  gutil.log(gutil.colors.yellow('All output have been copied to "' + paths.release.dst + '".'));
  gutil.log(gutil.colors.yellow('Do not forget to add new files to git before commit.'));
  gutil.log(gutil.colors.yellow('It is better to run `gulp release` 2 times to make sure everything works fine.'));
  gutil.log(gutil.colors.yellow('Good luck.'));
});

gulp.task('release', function (callback) {
  mode = 'release';
  sequence('build', 'releaseinfo', callback);
});

gulp.task('releasewebappinfo', function () {
  gutil.log(gutil.colors.yellow('All output have been copied to "' + paths.releasewebapp.dst + '".'));
  gutil.log(gutil.colors.yellow('Do not forget to add new files to git before commit.'));
});

gulp.task('webapp', function (callback) {
  mode = 'releasewebapp';
  sequence('build', 'releasewebappinfo', callback);
});

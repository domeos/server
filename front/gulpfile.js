/*!
 * Usage:
 *     use `gulp help` to check out usage introduction!
 */

const path = require('path');
const fs = require('fs');

const lockfile = require('lockfile');
const onexit = require('signal-exit')

const gulp = require('gulp');
const gutil = require('gulp-util');

const cache = require('gulp-cache');
const newer = require('gulp-newer');

const through = require('through2');

const sequence = require('gulp-sequence');
const plumber = require('gulp-plumber');

const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-ruby-sass');
const babel = require('gulp-babel');
const pug = require('gulp-pug');

const imagemin = require('gulp-imagemin');
const replace = require('gulp-replace');
const useref = require('gulp-useref');
const cleancss = require('gulp-clean-css');
const uglify = require('gulp-uglify');

const connect = require('gulp-connect');
const proxy = require('http-proxy-middleware');

const notifier = require('node-notifier');

const conf = {
  backend: 'https://beta.domeos.sohucs.com',
  port: 8080
};

// error reporter
const showNotify = function (name, msg) {
  if (!msg) return;
  notifier.notify({
    title: `Task ${name} Failed`,
    message: msg,
  });
  gutil.log(gutil.colors.red(`[${name}] ${msg}`));
};

const errorNotifier = function (taskName) {
  return function (exception) {
    showNotify(taskName, exception.message);
    this.emit('end');
  };
};

const reporter = function (name, message) {
  return function () {
    return through.obj(function (file, encoding, callback) {
      showNotify(name, message(file));
      callback(null, file);
    });
  };
};

let isPublic = false;
const privateTask = function () {
  if (isPublic) return;
  gutil.log(gutil.colors.red(`You should not use this task directly. "gulp help" for more details.`));
  process.exit(-1);
};
const publicTask = function (_isDebug) {
  isPublic = true;
  if (isDebug === null && _isDebug != null) isDebug = _isDebug;
};

const watchs = [
];

const hash = () =>
  new Buffer([port >>> 8 & 255, port & 255, ...(
    ('0'.repeat(12) + Date.now().toString(16)).slice(-12) +
    (Math.random().toString(16) + '0'.repeat(12)).slice(2).slice(0, 9)
  ).match(/../g).map(x => Number.parseInt(x, 16))]).toString('base64')
    .split('').map(c =>
      '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz'
      ['ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.indexOf(c)]
    ).join('');

let isDebug = gutil.env.debug ? true : (gutil.env.nodebug ? false : null);

const port = Number(gutil.env.port) || conf.port;

let minify = false;
let gulpId = hash();
let sourceFolder = 'src';
let tempFolder = path.join('tmp', gulpId, 'files');
let destFolder = 'app';

const byExtension = function (extension, inDir) {
  return `${inDir}/**/*.${extension}`;
};

gulp.task('clean', function () {
  publicTask();
  const rimraf = require('rimraf');
  let files = null;
  try { files = fs.readdirSync(`tmp`); } catch (e1) { }
  (files || []).forEach(filename => {
    let filepath = path.join('tmp', filename);
    if (fs.statSync(filepath).isDirectory()) {
      let lock = path.join(filepath, 'lock');
      let using = lockfile.checkSync(lock);
      if (using) return;
      try {
        rimraf.sync(filepath);
        gutil.log(`Clean folder '${gutil.colors.red(filename)}'`);
      } catch (e) { }
    } else {
      fs.unlinkSync(filepath);
      gutil.log(`Clean file "${filename}"`);
    }
  });
});

let tempFolderInited = false;
gulp.task('mktemp', function () {
  if (tempFolderInited) return; tempFolderInited = true;
  privateTask();
  const mkdirp = require('mkdirp');
  mkdirp.sync(tempFolder);
  let lock = path.join(tempFolder, '..', 'lock');
  lockfile.lockSync(lock);
  onexit(function () { lockfile.unlockSync(lock); });
  gutil.log(`Create folder '${gutil.colors.green(gulpId)}'`);
});

gulp.task('temp', function (callback) {
  privateTask();
  sequence('clean', 'mktemp', callback);
});

// compile scss
watchs.push({ pattern: [byExtension('scss', sourceFolder)], task: 'scss' });
gulp.task('scss', function () {
  privateTask();
  return sass(byExtension('scss', sourceFolder), {
    sourcemap: true,
    stopOnError: true,
    compass: true,
  })
    .pipe(plumber())
    .on('error', errorNotifier('SCSS'))
    .pipe(sourcemaps.write())
    .pipe(isDebug ? gutil.noop() : cleancss())
    .pipe(gulp.dest(`${tempFolder}`));
});

// copy css
watchs.push({ pattern: [byExtension('css', sourceFolder)], task: 'css' });
gulp.task('css', function () {
  privateTask();
  return gulp.src(byExtension('css', sourceFolder))
    .pipe(isDebug ? gutil.noop() : cleancss())
    .pipe(gulp.dest(`${tempFolder}`));
});

// copy css from temp folder to dest folder
watchs.push({ pattern: [byExtension('css', tempFolder)], task: 'style' });
gulp.task('style', function (callback) {
  privateTask();
  if (!destFolder) return callback();
  return gulp.src(byExtension('css', tempFolder))
    .pipe(gulp.dest(`${destFolder}`));
});

gulp.task('allstyle1', ['scss', 'css'], function () { privateTask(); });
gulp.task('allstyle2', ['style'], function () { privateTask(); });

// javascript task
let jsLib = byExtension('js', `${sourceFolder}/lib`);
let jsPattern = [byExtension('js', sourceFolder), `!${jsLib}`];
watchs.push({ pattern: jsPattern, task: 'js' });
gulp.task('js', function () {
  privateTask();
  let jsTask;
  if (isDebug) {
    return gulp.src(jsPattern)
      .pipe(plumber())
      .pipe(newer(`${tempFolder}`))
      .pipe(gulp.dest(`${tempFolder}`));
  } else {
    return gulp.src(jsPattern)
      .pipe(plumber())
      .pipe(newer(`${tempFolder}`))
      .pipe(sourcemaps.init())
      .pipe(cache(babel({ presets: ['latest'] })))
      .on('error', errorNotifier('BABEL'))
      .pipe(sourcemaps.write())
      .pipe(uglify())
      .on('error', errorNotifier('UGLIFY'))
      .pipe(gulp.dest(`${tempFolder}`));
  }
});

// javascript libraries
watchs.push({ pattern: [jsLib], task: 'jslib' });
gulp.task('jslib', function (callback) {
  privateTask();
  return gulp.src(jsLib)
    .pipe(newer(`${tempFolder}/lib`))
    .pipe(gulp.dest(`${tempFolder}/lib`));
});

// copy script files
watchs.push({ pattern: [byExtension('js', tempFolder)], task: 'script' });
gulp.task('script', function (callback) {
  privateTask();
  if (!destFolder) return callback();
  return gulp.src(byExtension('js', tempFolder))
    .pipe(newer(`${destFolder}`))
    .pipe(gulp.dest(`${destFolder}`));
});

gulp.task('allscript1', ['js', 'jslib'], function () { privateTask(); });
gulp.task('allscript2', ['script'], function () { privateTask(); });

// compile pug file to html
watchs.push({ pattern: [byExtension('pug', sourceFolder)], task: 'pug' });
gulp.task('pug', function () {
  privateTask();
  var id = hash();
  return gulp.src(byExtension('pug', sourceFolder))
    .pipe(newer({ dest: `${tempFolder}`, ext: 'html' }))
    .pipe(plumber())
    .pipe(cache(pug({ pretty: true })))
    .pipe(replace(/##version-hash##/g, id))
    .pipe(gulp.dest(`${tempFolder}`));
});

watchs.push({ pattern: [byExtension('html', sourceFolder)], task: 'html' });
gulp.task('html', function () {
  privateTask();
  var id = hash();
  return gulp.src(byExtension('html', sourceFolder))
    .pipe(plumber())
    .pipe(newer(`${tempFolder}`))
    .pipe(replace(/##version-hash##/, hash))
    .pipe(gulp.dest(`${tempFolder}`));
});

// combine by html file and copy to dest
const pagePattern = folder => 'html,css,js'.split(',').map(ext => byExtension(ext, folder));
watchs.push({ pattern: [pagePattern(tempFolder)], task: 'page' });
gulp.task('page', function () {
  privateTask();
  if (!destFolder) return callback();
  var id = hash();
  return gulp.src(pagePattern(tempFolder))
    .pipe(plumber())
    .pipe(useref())
    .pipe(gulp.dest(`${destFolder}`));
});

gulp.task('allpage1', ['pug', 'html'], function () { privateTask(); });
gulp.task('allpage2', ['page'], function () { privateTask(); });

// image
const imgPattern = folder => 'png,gif,jpg,jpeg,ico'.split(',').map(ext => byExtension(ext, folder));
watchs.push({ pattern: imgPattern(sourceFolder), task: 'img' });
gulp.task('img', function () {
  privateTask();
  return gulp.src(imgPattern(sourceFolder))
    .pipe(plumber())
    .pipe(newer(`${tempFolder}`))
    .pipe(cache(imagemin()))
    .pipe(gulp.dest(`${tempFolder}`));
});

gulp.task('image', function () {
  privateTask();
  if (!destFolder) return callback();
  return gulp.src(imgPattern(tempFolder))
    .pipe(newer(`${destFolder}`))
    .pipe(gulp.dest(`${destFolder}`));
});

gulp.task('allimage1', ['img'], function () { privateTask(); });
gulp.task('allimage2', ['image'], function () { privateTask(); });

// other file copy
const otherPattern = folder =>
  'svg,ttf,TTF,woff,woff2,eot,swf'.split(',').map(ext => byExtension(ext, folder));
watchs.push({ pattern: otherPattern(sourceFolder), task: 'resource' });
gulp.task('resource', function () {
  privateTask();
  return gulp.src(otherPattern(sourceFolder))
    .pipe(newer(`${tempFolder}`))
    .pipe(gulp.dest(`${tempFolder}`))
    .pipe(destFolder ? gulp.dest(`${destFolder}`) : gutil.noop());
});

gulp.task('build', function (callback) {
  privateTask();
  sequence('clean', 'mktemp',
    ['allstyle1', 'allscript1', 'allpage1', 'allimage1', 'resource'],
    ['allstyle2', 'allscript2', 'allpage2', 'allimage2'],
    callback);
});

// listen a port for debug
gulp.task('connect', ['build'], function () {
  privateTask();
  var backend = gutil.env.backend || conf.backend;
  var base = {
    middleware: function (connect, opt) {
      var middlewares = [];
      if (backend) middlewares.push([
        proxy('/api', {
          target: backend,
          secure: false,
          changeOrigin: true,
          autoRewrite: true,
          protocolRewrite: 'http',
        })
      ]);
      middlewares.push(function (req, res, next) {
        gutil.log(`${req.method} ${req.url}`);
        next();
      });
      return middlewares;
    }
  };
  let port = Number(gutil.env.port) || conf.port;
  try {
    let folder = isDebug ? tempFolder : destFolder;
    connect.server(Object.assign({}, base, {
      port: port,
      root: './' + folder,
    }));
    gutil.log(`File are served from ./${folder}`);
  } catch (e) {
    if (e.message.indexOf('EADDRINUSE') !== -1) {
      gutil.log(gutil.colors.red('port ' + port + ' is currently in use; try another port or kill the process using it'));
    } else {
      gutil.log(gutil.colors.red('failed to listen on port ' + port + ': ' + e.message));
    }
    process.exit(-1);
  }
});

// regist watch
gulp.task('auto', function () {
  privateTask();
  watchs.forEach(function ({ pattern, task }) {
    gutil.log(`Watching '${gutil.colors.cyan(task)}'...`);
    gulp.watch(pattern, [task]);
  });
});

// entrance of watch
gulp.task('watch', function (callback) {
  publicTask(true);
  if (!gutil.env.backend) {
    gutil.log(gutil.colors.yellow('No backend paramter given, `' + conf.backend + '` would be chosen.'));
  }
  if (!gutil.env.port) {
    gutil.log(gutil.colors.yellow('No port paramter given, gulp will listen to port `' + conf.port + '` by default.'));
  }
  sequence('build', 'connect', 'auto', callback);
});

// show release info
gulp.task('releaseinfo', function () {
  privateTask();
  gutil.log(gutil.colors.yellow(`All output have been copied to ${destFolder}.`));
  gutil.log(gutil.colors.yellow('Do not forget to add new files to git before commit.'));
  gutil.log(gutil.colors.yellow('It is better to run `gulp release` 2 times to make sure everything works fine.'));
  gutil.log(gutil.colors.yellow('Good luck.'));
});

// entrance of release
gulp.task('release', function (callback) {
  publicTask(false);
  destFolder = '../src/main/webapp';
  sequence('build', 'releaseinfo', callback);
});

gulp.task('webapp', ['release'], function () { });
gulp.task('default', ['watch'], function () { });

// show help message and exit
gulp.task('help', function () {
  console.log('    gulp clean             ; clean old temp files');
  console.log('    gulp release           ; build and copy to webapp folder');
  console.log('    gulp watch [options]   ; build, watch, and listen');
  console.log('      options: --port      ; listen port')
  console.log('               --backend   ; targeted backend')
  console.log('               --nodebug   ; serve app instead on tmp resource')
  console.log('    gulp help              ; show this message');
});

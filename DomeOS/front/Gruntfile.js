module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);
  var config = {
    appUrl: 'app',
    libUrl: 'app/lib'
  };
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    config: config,
    connect: {
      //这里为插件子刷新方式
      options: {
        port: 9000,
        hostname: 'localhost',
        livereload: 35729
      },
      server: {
        options: {
          open: true,
          base: [
            './app'
          ]
        }
      }
    },
    jade: {
      compile: {
        options: {
          data: {
            debug: false
          },
          pretty: true
        },
        // index.html
        files: [{
          src: '<%= config.appUrl %>/index/_index.jade',
          dest: '<%= config.appUrl %>/index.html'
        }, {
          expand: true,
          cwd: '<%= config.appUrl %>/',
          src: ['{,*/,*/*/,*/*/*/,*/*/*/*/}*.jade'],
          dest: '<%= config.appUrl %>/',
          ext: ".html"
        }]
      }
    },
    jshint: {
      options: {
        strict: false,
        laxbreak: true,
        debug: true,
        globals: {
          angular: true,
          $: true,
          _: true
        }
      },
      all: ['<%= config.appUrl %>/index/{,*/,*/*/,*/*/*/}*.js', '<%= config.appUrl %>/common/{,*/,*/*/,*/*/*/}*.js']
    },
    watch: {
      sass: {
        files: ['<%= config.appUrl %>/{,*/,*/*/,*/*/*/}*.{scss,sass}'],
        tasks: ['compass:dist']
      },
      jade: {
        files: ['<%= config.appUrl %>/{,*/,*/*/,*/*/*/}*.jade'],
        tasks: ['jade:compile']
      },
      livereload: {
        options: {
          livereload: '<%=connect.options.livereload%>'
        },
        files: [
          '<%= config.appUrl %>/{,*/,**/**/,**/**/**/}*.*'
        ]
      }
    },
    copy: {
      // move lib files to dome project;
      package: {
        nonull: true,
        files: [{
          src: 'bower_components/bootstrap/dist/css/bootstrap.css',
          dest: '<%= config.libUrl %>/css/bootstrap.css'
        },  {
          src: 'bower_components/ng-scrollbar/dist/ng-scrollbar.css',
          dest: '<%= config.libUrl %>/css/ng-scrollbar.css'
        },{
          expand: true,
          cwd: 'bower_components/amcharts3/amcharts/images',
          src: '*.{png,jpg,gif,jpeg,svg}',
          dest: '<%= config.libUrl %>/images/amcharts'
        }, {
          src: 'bower_components/jquery/dist/jquery.min.js',
          dest: '<%= config.libUrl %>/js/jquery.min.js'
        }, {
          src: 'bower_components/showdown/dist/showdown.min.js',
          dest: '<%= config.libUrl %>/js/showdown.min.js'
        }, {
          src: 'bower_components/angular/angular.min.js',
          dest: '<%= config.libUrl %>/js/angular.min.js'
        }, {
          src: 'bower_components/angular-ui-router/release/angular-ui-router.min.js',
          dest: '<%= config.libUrl %>/js/angular-ui-router.min.js'
        }, {
          src: 'bower_components/angular-translate/angular-translate.min.js',
          dest: '<%= config.libUrl %>/js/angular-translate.min.js'
        }, {
          src: 'bower_components/angular-breadcrumb/dist/angular-breadcrumb.min.js',
          dest: '<%= config.libUrl %>/js/angular-breadcrumb.min.js'
        }, {
          src: 'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
          dest: '<%= config.libUrl %>/js/ui-bootstrap-tpls.min.js'
        }, {
          src: 'bower_components/angular-i18n/angular-locale_zh-cn.js',
          dest: '<%= config.libUrl %>/js/angular-locale_zh-cn.js'
        }, {
          src: 'bower_components/angular-animate/angular-animate.min.js',
          dest: '<%= config.libUrl %>/js/angular-animate.min.js'
        }, {
          src: 'bower_components/angular-bindonce/bindonce.min.js',
          dest: '<%= config.libUrl %>/js/bindonce.min.js'
        }, {
          src: 'bower_components/angular-slider/slider.js',
          dest: '<%= config.libUrl %>/js/slider.js'
        }, {
          src: 'bower_components/ng-table/dist/ng-table.min.js',
          dest: '<%= config.libUrl %>/js/ng-table.min.js'
        }, {
          src: 'bower_components/ngscrollbar/ngscrollbar.js',
          dest: '<%= config.libUrl %>/js/ngscrollbar.js'
        }, {
          src: 'bower_components/angular-translate-loader-url/angular-translate-loader-url.min.js',
          dest: '<%= config.libUrl %>/js/angular-translate-loader-url.min.js'
        }, {
          src: 'bower_components/angular-translate-loader-static-files/angular-translate-loader-static-files.min.js',
          dest: '<%= config.libUrl %>/js/angular-translate-loader-static-files.min.js'
        }, {
          src: 'bower_components/angular-translate-loader-partial/angular-translate-loader-partial.min.js',
          dest: '<%= config.libUrl %>/js/angular-translate-loader-partial.min.js'
        }, {
          src: 'bower_components/jquery-zclip/jquery.zclip.js',
          dest: '<%= config.libUrl %>/js/jquery.zclip.js'
        }, {
          src: 'bower_components/jquery-zclip/ZeroClipboard.swf',
          dest: '<%= config.libUrl %>/media/ZeroClipboard.swf'
        }, {
          src: 'bower_components/angular-file-upload/dist/angular-file-upload.min.js',
          dest: '<%= config.libUrl %>/js/angular-file-upload.min.js'
        }, {
          src: 'bower_components/angular-mocks/angular-mocks.js',
          dest: '<%= config.libUrl %>/js/angular-mocks.js'
        }, {
          src: 'bower_components/angular-amchart/angular-amchart/amchart.js',
          dest: '<%= config.libUrl %>/js/angular-amchart.js'
        }, {
          expand: true,
          cwd: 'bower_components/amcharts3/amcharts',
          src: ['amcharts.js', 'serial.js', 'pie.js', 'xy.js'],
          dest: '<%= config.libUrl %>/js/amcharts'
        }, {
          src: 'bower_components/ng-scrollbar/dist/ng-scrollbar.js',
          dest: '<%= config.libUrl %>/js/ng-scrollbar.js'
        }]
      }
    },
    compass: {
      dist: {
        options: {
          config: 'config.rb'
        }
      }
    }
  });

  grunt.registerTask('package', ['compass', 'jshint', 'jade', 'copy:package', 'replace:pkg']);
  grunt.registerTask('live', ['compass', 'jshint', 'jade', 'watch']);
};
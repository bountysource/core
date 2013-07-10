'use strict';
var modRewrite = require('connect-modrewrite');
var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};

module.exports = function (grunt) {
  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.initConfig({
    watch: {
      options: {
        livereload: true
      },
//      coffee: {
//        files: ['app/pages/**/*.coffee'],
//        tasks: ['coffee:dist']
//      },
//      coffeeTest: {
//        files: ['test/spec/**/*.coffee'],
//        tasks: ['coffee:test']
//      },
//      compass: {
//        files: ['app/styles/**/*.{scss,sass}'],
//        tasks: ['compass']
//      },
      jshint: {
        files: ['gruntfile.js', 'app/pages/**/*.js', 'test/**/*.js'],
        tasks: ['jshint']
      },
      html_src: {
        files: ['gruntfile.js', 'app/pages/**/*.js', 'app/index.html'],
        tasks: ['html_src']
      },
      livereload: {
        files: [
          'app/**/*.html',
          '{.tmp,app}/styles/**/*.css',
          '{.tmp,app}/pages/**/*.js',
          'app/images/**/*.{png,jpg,jpeg,gif,webp,svg}'
        ],
        tasks: []//['jshint']
      }
    },
    connect: {
      app: {
        options: {
          port: 9000,
          middleware: function (connect) {
            return [
              modRewrite(['!\\.html|\\.png|\\.jpg|\\.gif|\\.jpeg|\\.ico|\\.js|\\.css|\\swf$ /index.html']),
              mountFolder(connect, '.tmp'),
              mountFolder(connect, 'app'),
              mountFolder(connect, 'test/e2e')
            ];
          }
        }
      },
      dist: {
        options: {
          keepalive: true,
          port: 9000,
          middleware: function (connect) {
            return [
              modRewrite(['!\\.html|\\.png|\\.jpg|\\.gif|\\.jpeg|\\.ico|\\.js|\\.css|\\.swf$ /index.html']),
              mountFolder(connect, 'dist')
            ];
          }
        }
      }
    },
    open: {
      app: {
        url: 'http://localhost:<%= connect.app.options.port %>'
      },
      e2e: {
        url: 'http://localhost:<%= connect.app.options.port %>/test.html'
      }
    },
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            'dist/*',
            '!dist/.git*'
          ]
        }]
      },
      server: '.tmp',
      templates: ['dist/templates.js', 'dist/pages']
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },

      all: [
        'gruntfile.js',
        'app/pages/**/*.js',
        'test/**/*.js'
      ]
    },
    karma: {
      unit: {
        configFile: 'karma-unit.conf.js'
      },
      e2e: {
        configFile: 'karma-e2e.conf.js'
      }
    },
//    coffee: {
//      dist: {
//        files: [{
//          expand: true,
//          cwd: 'app/pages',
//          src: '**/*.coffee',
//          dest: '.tmp/pages',
//          ext: '.js'
//        }]
//      },
//      test: {
//        files: [{
//          expand: true,
//          cwd: 'test/spec',
//          src: '**/*.coffee',
//          dest: '.tmp/spec',
//          ext: '.js'
//        }]
//      }
//    },
//    compass: {
//      options: {
//        sassDir: 'app/styles',
//        cssDir: '.tmp/styles',
//        imagesDir: 'app/images',
//        javascriptsDir: 'app/pages',
//        fontsDir: 'app/styles/fonts',
//        importPath: 'app/components',
//        relativeAssets: true
//      },
//      dist: {},
//      server: {
//        options: {
//          debugInfo: true
//        }
//      }
//    },
    html_src: {
      dist: {
        files: {
          'app/index.html': ['app/pages/app.js','app/pages/**/*.js']
        }
      }
    },
    useminPrepare: {
      html: 'app/index.html',
      options: {
        dest: 'dist'
      }
    },
    usemin: {
      html: ['dist/**/*.html'],
      css: ['dist/assets/**/*.css'],
      options: {
        dirs: ['dist']
      }
    },
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: 'app/images',
          src: '**/*.{png,jpg,jpeg}',
          dest: 'dist/assets'
        }]
      }
    },
    htmlmin: {
      index: {
        files: [{
          expand: true,
          cwd: 'app',
          src: ['*.html'],
          dest: 'dist'
        }]
      },
      pages: {
        options: {
          // NOTE: this saves 20kb or so but we rely on whitespace in some places to add horizontal spacing between elements
          //collapseWhitespace: true
        },
        files: [{
          expand: true,
          cwd: 'app',
          src: ['pages/**/*.html'],
          dest: 'dist'
        }]
      }
    },
    ngtemplates: {
      app: {
        options: {
          concat: 'dist/assets/app.js',
          base: 'dist'
        },
        src: 'dist/pages/**/*.html',
        dest: 'dist/templates.js'
      }
    },
    ngmin: {
      dist: {
        files: [{
          expand: true,
          cwd: 'dist/assets',
          src: '*.js',
          dest: 'dist/assets'
        }]
      }
    },
    rev: {
      dist: {
        files: {
          src: [
            'dist/assets/*'
          ]
        }
      }
    },
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: 'app',
          dest: 'dist',
          src: [
            'favicon.ico',
            'robots.txt'
          ]
        }]
      }
    }
  });


//    'coffee:dist',
//    'compass:server',
//    'coffee',
//    'compass',
//    'coffee',
//    'compass',
//    'coffee',
//    'compass',
//    'coffee',
//    'compass:dist',
//    'connect:test',


//  grunt.registerTask('test-unit', [
//    'clean:server',
//    'connect:test',
//    'jshint',
//    'karma'
//  ]);
//  grunt.registerTask('test-e2e', [
//    'clean:server',
//    'connect:e2e',
//    'karma:e2e'
//  ]);
/////////////////////////////////////



  grunt.registerTask('server', [
    'clean:server',
    'html_src',
    'connect:app',
    'open:app',
    'watch'
  ]);

  grunt.registerTask('dist', [
    'open:app',
    'connect:dist'
  ]);

  grunt.registerTask('test', [
    'html_src',
    'clean:server',
    'jshint',
    'connect:app',
    'karma'
  ]);

  grunt.registerTask('e2e', [
    'html_src',
    'clean:server',
    'jshint',
    'connect:app',
    'open:e2e',
    'watch'
  ]);

  grunt.registerTask('build', [
    //'test',
    'clean:dist',
    'useminPrepare',
    'imagemin',
    'cssmin',
    'htmlmin',
    'ngtemplates',
    'concat',
    'clean:templates',
    'copy',
    'ngmin',
    'uglify',
    'rev',
    'usemin'
  ]);

  grunt.registerTask('default', ['build']);

  // automatically put javascript tags into index.html
  grunt.registerMultiTask('html_src', 'Rebuild static HTML files with file paths', function() {
    this.files.forEach(function(f) {
      var orig_src = grunt.file.read(f.dest);
      var src = ''+orig_src;
      var relative_path = f.dest.replace(/[^/]*?$/,'');

      // add our own script references
      var script_tags = "<!-- html_src start -->\n";
      f.src.map(function(filepath) {
        script_tags += "    <script src=\"" + filepath.replace(relative_path,"") + "\" type=\"text\/javascript\"></script>\n";
      });
      script_tags += "    <!-- html_src end -->";

      // remove existing tags
      src = src.replace(/<!-- html_src start -->[\s\S]+?<!-- html_src end -->/,script_tags);

      if (src !== orig_src) {
        grunt.log.writeln('File "' + f.dest + '" updated.');
        grunt.file.write(f.dest, src);
      }

    });
  });

};

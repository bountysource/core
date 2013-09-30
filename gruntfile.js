'use strict';
var modRewrite = require('connect-modrewrite');
var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};

module.exports = function (grunt) {
  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  var cloudfile_config;
  try {
    cloudfile_config = grunt.file.readJSON('cloudfiles.json');
  } catch (e) {
    cloudfile_config = grunt.file.readJSON('cloudfiles.example.json');
  }

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
          hostname: '*',
          middleware: function (connect) {
            return [
              modRewrite(['!(\\.html|\\.png|\\.jpg|\\.gif|\\.jpeg|\\.ico|\\.js|\\.css|\\.swf|\\.txt)$ /index.html']),
              mountFolder(connect, '.tmp'),
              mountFolder(connect, 'app')
            ];
          }
        }
      },
      test: {
        options: {
          port: 9001,
          hostname: '*',
          middleware: function (connect) {
            return [
              modRewrite(['!(\\.html|\\.png|\\.jpg|\\.gif|\\.jpeg|\\.ico|\\.js|\\.css|\\.swf|\\.txt)$ /index.html']),
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
          hostname: '*',
          middleware: function (connect) {
            return [
              modRewrite(['!(\\.html|\\.png|\\.jpg|\\.gif|\\.jpeg|\\.ico|\\.js|\\.css|\\.swf|\\.txt)$ /index.html']),
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
      dist_assets: ['dist/assets', 'dist/compiled'],
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
      },
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
      html: ['dist/*.html'],
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
          src: '*.{png,jpg,jpeg,gif}',
          dest: 'dist/assets'
        },{
          expand: true,
          cwd: 'app/components/bootstrap/docs/assets/img',
          src: 'glyph*.png',
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
      templates: {
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
    uglify: {
      options: {
        mangle: false
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
    },
    md5: {
      options: {
        encoding: null,
        keepBasename: false,
        keepExtension: true,
        afterEach: function(changes) {
          var hash_map = grunt.config('md5_hash') || {};
          hash_map[changes.oldPath.split('/').pop()] = changes.newPath.split('/').pop();
          grunt.config('md5_hash', hash_map);
        }
      },

      binary: {
        files: {
          'dist/compiled/': ['dist/assets/*.{png,jpg,jpeg,gif,woff}']
        }
      },

      css_js: {
        files: {
          'dist/compiled/': ['dist/assets/*.{css,js}']
        }
      }
    },
    md5cdn: {
      options: {
        base_url: cloudfile_config.base_url
      },
      css: {
        src: 'dist/assets/*.css'
      },
      js: {
        src: 'dist/assets/*.js'
      },
      html: {
        src: 'dist/*.html'
      }
    },
    cloudfiles: {
      prod: {
        'user': cloudfile_config.user,
        'key': cloudfile_config.key,
        'upload': [{
          'container': cloudfile_config.container,
          'src': 'dist/compiled/*',
          stripcomponents: 2
        }]
      }
    },
    coveralls: {
      options: {
        coverage_dir: 'coverage/'
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
    'test:unit',
    'test:e2e'
  ]);

  grunt.registerTask('test:unit', [
    'html_src',
    'clean:server',
    'jshint',
    'karma:unit'
  ]);

  grunt.registerTask('test:e2e', [
    'html_src',
    'clean:server',
    'jshint',
    'connect:test',
    'karma:e2e'
  ]);

  grunt.registerTask('test:travis', [
    'test:unit',
    'test:e2e',
    'coveralls'
  ]);

  grunt.registerTask('build', [
    'test',
    'compile',
    'deploy'
  ]);

  grunt.registerTask('compile', [
    'clean:dist',        // start off with empty folder
    'html_src',          // make sure all our html_srcs are included correctly
    'copy',              // copy in static files like favicon.ico and robots.txt
    'imagemin',          // copy in minified version of images
    'md5:binary',        // create md5-named copies of binary files (images, fonts, etc)
    'htmlmin:index',     // copy index.html, 404.html, etc
    'useminPrepare',     // update in-memory configs for concat/cssmin/uglify based on "build blocks"
    'usemin',            // replace "build blocks" in html files with path to "compiled" version
    'htmlmin:templates', // copy in angular templates
    'ngtemplates',       // compile angular templates into templates.js and add to list of files to concat
    'concat',            // concat css/js files from usemin and angular templates
    'clean:templates',   // remove angular templates as they're now compiled and included in JS
    'ngmin',             // tweak JS files so uglify works with angular dependencies. specifically: function($scope)... becomes ['$scope', function(a)...]
    'uglify',            // compress JS files
    'cssmin'             // compress CSS files
  ]);

  grunt.registerTask('deploy', [
    'md5cdn:js',         // update angular templates with CDN urls to md5:binary files
    'md5cdn:css',        // update compiled css with CDN urls
    'md5:css_js',        // create md5 copies of css/js in dist/compiled
    'md5cdn:html',       // update root HTML with CDN'd css/js
    'cloudfiles',        // copy all of compiled/ up to CDN
    'clean:dist_assets'  // clean up assets now that they're all up on CDN
  ]);


  grunt.registerTask('default', ['test']);

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

  grunt.registerMultiTask('md5cdn', 'Replace relative links with absolute CDN md5 urls', function() {
    var base_url = this.options().base_url;

    this.files.forEach(function(f) {
      f.src.forEach(function(filepath) {
        console.log("Processing", filepath);
        var contents = grunt.file.read(filepath);

        var md5_hash = grunt.config('md5_hash');
        for (var k in md5_hash) {
          var matcher = new RegExp('([\'"(])[./a-z_]*'+k+'([\'")])', 'g');
          var cdn_url = base_url + md5_hash[k];
          contents = contents.replace(matcher, '$1'+cdn_url+'$2');
        }
        grunt.file.write(filepath, contents);
      });
    });
  });
};

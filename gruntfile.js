'use strict';

var modRewrite = require('connect-modrewrite');
var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};

module.exports = function (grunt) {
  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.initConfig({
    aws: (function() { try { return grunt.file.readYAML('../../config/aws-s3.yml'); } catch(e) { return {}; }})(),

    distdir: 'dist',

    gruntfile: 'gruntfile.js',

    favicon: 'src/favicon.ico',

    robots: 'src/robots.txt',

    src: {
      js: ['src/app/app.js', 'src/**/*.js', '!src/vendor/**'],
      jsTpl: {
        app: ['src/app/**/*.html'],
        common: ['src/common/**/*.html']
      },
      specs: ['test/**/*.spec.js'],
      scenarios: ['test/**/*.scenario.js'],
      html: ['src/index.html'],
      less: ['src/less/stylesheet.less'], // recess:build doesn't accept ** in its file patterns
      lessWatch: ['src/less/**/*.less']
    },

    watch: {
      options: { livereload: true },
      all: {
        files: ['<%= src.js %>', '<%= src.jsTpl.app %>', '<%= src.jsTpl.common %>', '<%= src.specs %>', '<%= src.scenarios %>'],
        tasks: ['html_src'] // 'jshint'
      },

      livereload: {
        files: [
          'app/**/*.html',
          'app/pages/**/templates/*.html',
          '{.tmp,app}/styles/**/*.css',
          '{.tmp,app}/pages/**/*.js',
          '{.tmp,app}/common/*.js',
          '{.tmp,app}/common/**/*.js',
          '{.tmp,app}/common/**/**/*.js',
          'app/images/**/*.{png,jpg,jpeg,gif,webp,svg}'
        ],
        tasks: []
      }
    },

    connect: {
      app: {
        options: {
          port: 9000,
          hostname: '*',
          middleware: function (connect) {
            return [
              modRewrite(['!\\.(html|png|jpg|gif|jpeg|ico|js|css|eot|ttf|svg|woff|swf|txt)$ /index.html']),
              mountFolder(connect, '.tmp'),
              mountFolder(connect, 'src')
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
              modRewrite(['!\\\.(html|png|jpg|gif|jpeg|ico|js|css|eot|ttf|svg|woff|swf|txt)$ /index.html']),
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
              modRewrite(['!\\.(html|png|jpg|gif|jpeg|ico|js|css|eot|ttf|svg|woff|swf|txt)$ /index.html']),
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
      templates: [
        'dist/templates.js'
      ]
    },

    jshint: {
      options: { jshintrc: '.jshintrc' },
      all: ['<%= gruntfile %>', '<%= src.js %>', '<%= src.specs %>', '<%= src.scenarios %>']
    },

    karma: {
      unit: { configFile: 'test/config/unit.js' },
      e2e: { configFile: 'test/config/e2e.js' }
    },

    html_src: {
      dist: {
        files: {
          'src/index.html': ['<%= src.js %>']
        }
      }
    },

    useminPrepare: {
      html: '<%= src.html %>',
      options: {
        dest: '<%= distdir %>'
      }
    },

    usemin: {
      html: ['dist/*.html'],
      css: ['dist/assets/**/*.css'],
      options: {
        dirs: ['<%= distdir %>']
      }
    },

    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: 'src/images',
          src: '*.{png,jpg,jpeg,gif}',
          dest: 'dist/assets'
        }]
      }
    },

    htmlmin: {
      index: {
        files: [{
          expand: true,
          cwd: 'src',
          src: ['*.html'],
          dest: 'dist'
        }]
      },
      templates: {
        options: {
          // NOTE: this saves 20kb or so but we rely on whitespace in
          // some places to add horizontal spacing between elements
          // collapseWhitespace: true
        },
        files: [{
          expand: true,
          src: ['<%= src.jsTpl.app %>', '<%= src.jsTpl.common %>'],
          dest: 'dist'
        }]
      }
    },

    ngtemplates: {
      app: {
        options: { htmlmin: '<%= htmlmin.templates %>' },
        src: ['dist/src/app/**/*.html', 'dist/src/common/**/*.html'],
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
      options: { mangle: false }
    },

    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: 'src',
          dest: 'dist',
          src: ['favicon.ico', 'robots.txt']
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
          hash_map[changes.oldPath.replace('dist/assets/','')] = changes.newPath.split('/').pop();
          hash_map['compiled/' + changes.newPath.split('/').pop()] = changes.newPath.split('/').pop();
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

    md5_path: {
      css_js_local: {
        options: { base_url: '/compiled/' },
        src: ['dist/assets/*.css', 'dist/assets/*.js']
      },

      css_js_cdn: {
        options: { base_url: '<%= aws.base_url %>' },
        src: ['dist/assets/*.css', 'dist/assets/*.js']
      },

      html_cdn: {
        options: { base_url: '<%= aws.base_url %>' },
        src: 'dist/*.html'
      }
    },

    s3: {
      prod: {
        options: {
          key: '<%= aws.key %>',
          secret: '<%= aws.secret %>',
          bucket: '<%= aws.bucket %>',
          access: 'public-read',
          region: '<%= aws.region %>',
          headers: {
            // Two Year cache policy (1000 * 60 * 60 * 24 * 730)
            "Cache-Control": "max-age=630720000, public",
            "Expires": new Date(Date.now() + 63072000000).toUTCString()
          }
        },
        upload: [{
          src: 'dist/compiled/*',
          dest: ''
        }]
      }
    },

    protractor: {
      config: 'test/config/protractor.js',
      options: {
        configFile: '<%= protractor.config %>', // Default config file
        keepAlive: true, // If false, the grunt process stops when the test fails.
        noColor: false, // If true, protractor will not use colors in its output.
        args: {
          // Arguments passed to the command
        }
      },
      e2e: {
        options: {
          configFile: '<%= protractor.config %>', // Target-specific config file
          args: {} // Target-specific arguments
        }
      }
    }
  });

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
    'htmlmin:index',     // copy index.html, 404.html, etc
    'useminPrepare',     // update in-memory configs for concat/cssmin/uglify based on "build blocks"
    'usemin',            // replace "build blocks" in html files with path to "compiled" version
    'htmlmin:templates', // copy in angular templates
    'ngtemplates',       // compile angular templates into templates.js and add to list of files to concat
    'concat',            // concat css/js files from usemin and angular templates
    'clean:templates',   // remove angular templates as they're now compiled and included in JS
    'ngmin',             // tweak JS files so uglify works with angular dependencies. specifically: function($scope)... becomes ['$scope', function(a)...]
    'uglify',            // compress JS files
    'cssmin',            // compress CSS files
    'md5:binary',        // create md5-named copies of binary files (images, fonts, etc)
    'md5_path:css_js_local' // update css/js files with better paths
  ]);

  grunt.registerTask('deploy', [
    'md5_path:css_js_cdn', // update angular templates with CDN urls to md5:binary files
    'md5:css_js',        // create md5 copies of css/js in dist/compiled
    'md5_path:html_cdn', // update root HTML with CDN'd css/js
    's3:prod',           // copy all of compiled/ up to CDN
    'clean:dist_assets'  // clean up images now that they're all up on CDN
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

  grunt.registerMultiTask('md5_path', 'Replace relative links with absolute CDN md5 urls', function() {
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

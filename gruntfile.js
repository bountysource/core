module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: ['javascripts/**/*.js'],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    html_src: {
      dist: {
        files: {
          'index.html': ['<%= concat.dist.src %>'],
          'test/test.html': ['<%= concat.dist.src %>', 'test/**/*.js']
        }
      }
    },
    uglify: {
      options: {
        banner: '/*! bountysource.js <%=pkg.version%> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      dist: {
        files: {
          'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },
    qunit: {
      files: ['test/**/*.html']
    },
    jshint: {
      files: ['gruntfile.js', 'javascripts/**/*.js', 'test/**/*.js'],
      options: {
        // options here to override JSHint defaults
        globals: {
          jQuery: true,
          console: true,
          module: true,
          document: true
        },
        withstmt: true
      }
    },
    watch: {
      files: ['<%= jshint.files %>', 'test/**/*.html'],
      tasks: ['jshint', 'concat', 'html_src', 'uglify', 'qunit']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerTask('test', ['jshint', 'qunit']);

  grunt.registerTask('default', ['jshint', 'concat', 'html_src', 'uglify', 'qunit']);


  // automatically put javascript tags into index.html
  grunt.registerMultiTask('html_src', 'Rebuild static HTML files with file paths', function() {
      this.files.forEach(function(f) {
        var orig_src = grunt.file.read(f.dest);
        var src = ''+orig_src;

        // remove existing tags
        src = src.replace(/[\n\r\t ]+<!-- html_src start -->[\s\S]+?<!-- html_src end -->/,'');

        // add our own script references
        var script_tags = "\n\n    <!-- html_src start -->\n";
        f.src.map(function(filepath) {
          script_tags += "    <script src=\"" + filepath + "\" type=\"text\/javascript\"></script>\n";
        });
        script_tags += "    <!-- html_src end -->\n";
        src = src.replace(/[\n\r\t ]*<\/head>/, script_tags + "  </head>");

        if (src != orig_src) {
          grunt.log.writeln('File "' + f.dest + '" updated.');
          grunt.file.write(f.dest, src);
        }

      });
  });

};

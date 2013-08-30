
module.exports = function(grunt){

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      beforeConcat: {
        src: ['src/*.js'],
        options: {
          ignores: ['src/stepIn.js', 'src/stepOut.js']
        }
      },
      afterConcat: {
        src: ['lib/fork.js'],
        options: {
          curly: true
        }
      }
    },

    concat: {
      dist: {
        src: [
          'src/stepIn.js',
          'src/fork.js',
          'src/util.js',
          'src/status.js',
          'src/event.js',
          'src/path.js',
          'src/request.js',
          'src/module.js',
          'src/stepOut.js'
        ],
        dest: 'lib/fork.js'
      }
    },

    uglify: {
      options: {
        banner: '/* fork.js <%= pkg.version%> \n Copyright (c) 2013 Allen Heavey\n*/'
      },
      dist: {
        src: 'lib/fork.js',
        dest: 'lib/fork.min.js'
      }
    }

  });

  grunt.registerTask('updateVersion', function(){
    var filepath = 'lib/fork.js';
    var version = grunt.config('pkg.version');

    var code = grunt.file.read(filepath);
    code = code.replace(/#@VERSION/g, version);
    
    grunt.file.write(filepath, code);
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', [
      'jshint:beforeConcat',
      'concat',
      'jshint:afterConcat',
      'updateVersion',
      'uglify'
  ]);

};




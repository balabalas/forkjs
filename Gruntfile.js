
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
        src: ['lib/module.js'],
        options: {
          curly: true
        }
      }
    },

    concat: {
      dist: {
        src: [
          'src/stepIn.js',
          'src/module.js',
          'src/global.js',
          'src/event.js',
          'src/stepOut.js'
        ],
        dest: 'lib/module.js'
      }
    },

    uglify: {
      options: {
        banner: '/* module.js <%= pkg.version%> \n Copyright (c) 2013 Allen Heavey\n*/'
      },
      dist: {
        src: 'lib/module.js',
        dest: 'lib/module.min.js'
      }
    }

  });

  grunt.registerTask('updateVersion', function(){
    var filepath = 'lib/module.js';
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




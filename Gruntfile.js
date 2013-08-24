
module.exports = function(grunt){

  grunt.initConfig({
    
    jshint: {
      files: ['src/*.js'],
      options: {
        ignores: ['src/stepIn.js', 'src/stepOut.js']
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('default', ['jshint']);

};




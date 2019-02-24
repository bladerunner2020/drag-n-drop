module.exports = function(grunt) {
    var IridiumGrunt = require('iridium-grunt');
    new IridiumGrunt(grunt);
    grunt.registerTask('build', [
        'clean:all', 'fileExists','copy:irpz', 'unzip', 'clean:prepare', 'copy:noConcat', 
        'incbld', 'readpkg', 'string-replace:version', 'compress', 'rename']);

};

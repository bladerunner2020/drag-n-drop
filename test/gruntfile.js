module.exports = function(grunt) {
    var IridiumGrunt = require('iridium-grunt');
    var ig = new IridiumGrunt(grunt);
    ig.buildTasks = [
        'clean:all', 'fileExists','copy:irpz', 'unzip', 'clean:prepare', 'copy:noConcat', 
        'string-replace:version', 'compress', 'rename'];
};

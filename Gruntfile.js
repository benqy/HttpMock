'use strict';

module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        nodewebkit: {
            options: {
                version: '0.8.2',
                app_name: 'httpmock',
                app_version: '<%= pkg.version %>',
                build_dir: './build', // Where the build version of my node-webkit app is saved
                mac: true, // We want to build it for mac
                win: true, // We want to build it for win
                linux32: false, // We don't need linux32
                linux64: false, // We don't need linux64,
                mac_icns: 'img/logo.icns',
                credits: 'index.html'
            },
            src: ['./app/**/*'] // Your node-wekit app
        }
    })

    grunt.registerTask('build', [
        'nodewebkit'
    ]);

    grunt.registerTask('default', [
        //'jshint',
        //'test',
        'build'
    ]);
};
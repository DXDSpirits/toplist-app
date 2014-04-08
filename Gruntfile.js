module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        cfg: grunt.file.readJSON('config.json'),
        concat: {
            mwapp: {
                src: [
                    'assets/js/app/_open.js',
                    'assets/js/app/app.js',
                    'assets/js/app/app-local.js',
                    'assets/js/app/utils.js',
                    'assets/js/app/model.js',
                    'assets/js/app/models/*.js',
                    'assets/js/app/view.js',
                    'assets/js/app/router.js',
                    'assets/js/app/event.js',
                    'assets/js/app/_close.js',
                    'assets/js/app/views/*.js',
                ],
                dest: '<%= cfg.path.dest %>/assets/js/app.js'
            }
        },
        uglify: {
            mwapp: {
                src: '<%= cfg.path.dest %>/assets/js/app.js',
                dest: '<%= cfg.path.dest %>/assets/js/app.min.js'
            },
            plugins: {
                src: [
                    'assets/js/plugin/helper.js',
                    'assets/js/plugin/plugins.js',
                    'assets/js/plugin/qrcode.js',
                    'assets/js/plugin/jquery.qrcode.js',
                    'assets/js/plugin/fastclick.js',
                    'assets/js/plugin/moment.js',
                    'assets/js/plugin/moment.zh-cn.js',
                    'assets/js/plugin/iscroll.js'
                ],
                dest: '<%= cfg.path.dest %>/assets/js/plugins.js'
            }
        },
        sass: {
            bootstrap: {
                options: { style: 'compressed' },
                src: 'assets/scss/bootstrap.scss',
                dest: '<%= cfg.path.dest %>/assets/css/bootstrap.min.css'
            },
            mobile: {
                options: { style: 'compressed' },
                src: 'assets/scss/mobile.scss',
                dest: '<%= cfg.path.dest %>/assets/css/mobile.min.css'
            }
        },
        includes: {
            files: {
                src: ['mobile/index.html', 'mobile/index-request-driver.html'],
                dest: '<%= cfg.path.dest %>',
                flatten: true,
                cwd: '.'
            }
        },
        templates: {
            all: {
                src: ['assets/template/*.html', 'assets/template/*/*.html'],
                dest: '<%= cfg.path.dest %>/assets/js/templates.js'
            }
        },
        copy: {
            staticfiles: {
                expand: true,
                src: [
                    'assets/css/**/*',
                    'assets/img/**/*',
                    'assets/fonts/**/*',
                    'assets/js/vendor/**/*',
                    '.htaccess'
                ],
                dest: '<%= cfg.path.dest %>'
            }
        },
        watch: {
            scripts_mwapp: {
                files: ['assets/js/app/*.js', 'assets/js/app/models/*.js', 'assets/js/app/views/*.js'],
                tasks: ['concat:mwapp', 'uglify:mwapp']
            },
            scripts_plugins: {
                files: ['assets/js/plugin/*.js'],
                tasks: ['uglify:plugins']
            },
            staticfiles: {
                files: ['assets/css/**/*', 'assets/img/**/*', 'assets/fonts/**/*', 'assets/js/vendor/**/*', '.htaccess'],
                tasks: ['copy']
            },
            stylesheets_all: {
                files: ['assets/scss/bootstrap/*.scss', 'assets/scss/_*.scss', 'assets/scss/bootstrap.scss'],
                tasks: ['sass']
            },
            stylesheets_mobile: {
                files: ['assets/scss/font-awesome/*.scss', 'assets/scss/pages/*.scss', 'assets/scss/mobile.scss'],
                tasks: ['sass:mobile']
            },
            templates: {
                files: ['assets/template/*.html', 'assets/template/*/*.html'],
                tasks: ['templates']
            },
            html: {
                files: ['mobile/*.html'],
                tasks: ['includes']
            }
        },
        connect: {
            server: {
                options: {
                    port: 8081,
                    base: '<%= cfg.path.dest %>',
                    keepalive: true,
                    hostname: null,
                    middleware: function(connect, options){
                        var appcache = grunt.option('appcache');
                        return [
                            function(req, res, next){
                                if (req.url == '/manifest.appcache' && !appcache){
                                    res.writeHead(404);
                                    res.end();
                                } else {
                                    next();
                                }
                            },
                            connect.static(options.base),
                            connect.directory(options.base)
                        ];
                    }
                }
            }
        },
        concurrent: {
            dist: {
                tasks: ['concat', 'sass', 'includes', 'templates', 'uglify', 'copy'],
                options: { logConcurrentOutput: true }
            },
            server: {
                tasks: ['watch', 'connect'],
                options: {
                    logConcurrentOutput: true
                }
            }
        }
    });
    
    grunt.loadTasks('tasks');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-includes');
    grunt.loadNpmTasks('grunt-gettext');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-shell');
    
    // Configurable port number
    var port = grunt.option('port');
    if (port) grunt.config('connect.server.options.port', port);
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.registerTask('server', 'concurrent:server');
    grunt.registerTask('dist', 'concurrent:dist');
};

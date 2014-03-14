
window.TopApp = new (Backbone.View.extend({
    
    Version: 2.2,
    
    Models: {},
    Views: {},
    Collections: {},
    
    Templates: {},
    Pages: {},
    
    configs: {
        APIHost: localStorage.getItem('api-host') || "http://api.clubmeiwei.com",
        ajaxTimeout: 10000
    },
    
    start: function() {
        TopApp.initDevice();
        TopApp.initAPI();
        TopApp.initVersion();
        TopApp.showSplash();
        TopApp.initAjaxEvents();
        TopApp.initLanguage();
        TopApp.initGeolocation();
        TopApp.initSync();
        TopApp.initGa();
        Backbone.history.start();
        TopApp.fixViewport();
    }
}))({el: document.body});

TopApp.showSplash = function() {
    if (navigator.splashscreen) {
        navigator.splashscreen.show();
        setTimeout(function() {
            navigator.splashscreen.hide();
        }, 1000);
    }
};

TopApp.initDevice = function() {
    if (window.device) {
        // Just Fine
    } else if(/MicroMessenger/i.test(navigator.userAgent)) {
        window.device = { platform: 'Weixin' };
        $('title').append(' ' + $('meta[name=description]').attr('content'));
    } else {
        window.device = { platform: 'WebApp' };
    }
};

TopApp.fixViewport = function() {
    var wrapperOffset = 44;
    if (window.device.platform === 'iOS' && parseFloat(window.device.version) === 7.0) {
        wrapperOffset += 20;
    }
    var fixWrapperHeight = function() {
        $('body>.view>.wrapper').css('height', $(window).height() - wrapperOffset);
    };
    fixWrapperHeight();
    $(window).resize(fixWrapperHeight);
    if (window.device) {
        $('meta[name=viewport]').attr('content', 'width=device-width, height=device-height, initial-scale=1, maximum-scale=1, user-scalable=0');
    } else {
        $('meta[name=viewport]').attr('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0');
    }
};

TopApp.initAPI = function() {
    var PrimaryAPI = "http://api.clubmeiwei.com";
    var SecondaryAPI = "http://api.meiwei.oatpie.com";
    (new TopApp.Model()).fetch({
        global: false,
        url: PrimaryAPI + '/clients/app/',
        success: function() {
            localStorage.removeItem('api-host');
            if (TopApp.configs.APIHost == SecondaryAPI) {
                window.location.reload();
            }
        },
        error: function() {
            if (TopApp.configs.APIHost == PrimaryAPI) {
                localStorage.setItem('api-host', SecondaryAPI);
                window.location.reload();
            }
        },
    });
};

TopApp.initVersion = function() {
    var pVersion = parseFloat(localStorage.getItem('version-code')) || 1.0;
    if (TopApp.Version != pVersion) {
        var authToken = localStorage.getItem('auth-token');
        localStorage.clear();
        localStorage.setItem('version-code', TopApp.Version);
        if (authToken) localStorage.setItem('auth-token', authToken);
    }
    if (!TopApp.isCordova()) return;
    var app = new TopApp.Models.App();
    app.fetch({
        global: false,
        success: function(model, response, options) {
            var version = parseFloat(model.get('version'));
            var onConfirm = function() {
                if (device.platform == 'iOS') {
                    var ref = window.open('https://itunes.apple.com/app/id689668571' ,'_blank', 'location=no');
                } else {
                    var ref = window.open('http://web.clubmeiwei.com/ad/apppromo' ,'_blank', 'location=no');
                }
            };
            if (version && version > TopApp.Version) {
                TopApp.showConfirmDialog(
                    TopApp._('Update Available'),
                    TopApp._('New version is available, go to update?'),
                    onConfirm
                );
            }
        }
    });
};

TopApp.initLanguage = function() {
    var langCode = localStorage.getItem('lang-code') || 'zh';
    TopApp._ = function(msgId) {
        var msg = TopApp.i18n[msgId];
        return msg ? msg[langCode] : msgId;
    };
    TopApp.initLang = function(context) {
        context = context || document;
        $(context).find('[data-i18n]').each(function() {
            $(this).html(TopApp._($(this).attr('data-i18n')));
        });
        $(context).find('[data-placeholder-i18n]').each(function() {
            $(this).attr('placeholder', TopApp._($(this).attr('data-placeholder-i18n')));
        });
        moment.lang(langCode == 'en' ? 'en' : 'zh-cn');
    };
    TopApp.setLang = function(lang) {
        localStorage.setItem('lang-code', (langCode = lang));
        TopApp.initLang();
    };
    TopApp.getLang = function() { return langCode; };
    TopApp.initLang();
};

TopApp.initGeolocation = function(callback) {
    var onSuccess = function(position) {
        TopApp.coords.latitude = position.coords.latitude;
        TopApp.coords.longitude = position.coords.longitude;
        if (callback) callback();
    };
    var onError = function() {
        if (callback) callback();
    };
    TopApp.coords = { longitude: 121.491, latitude: 31.233 };
    navigator.geolocation.getCurrentPosition(onSuccess, onError);
};

TopApp.initSync = function() {
    var authToken = localStorage.getItem('auth-token');
    var originalSync = Backbone.sync;
    Backbone.sync = function(method, model, options) {
        options.timeout = options.timeout || TopApp.configs.ajaxTimeout;
        _.extend((options.headers || (options.headers = {})), { 'Accept-Language': TopApp.getLang() });
        if (authToken) {
            _.extend(options.headers, { 'Authorization': 'Token ' + authToken });
        }
        if (options.nocache) {
            _.extend(options.headers, { 'Cache-Control': 'no-cache' });
        }
        if (options.url) {
            options.url = options.url.replace(/^(?:http|https)\:\/{2}[a-zA-Z0-9\-_\.]+(?:\:[0-9]{1,4})?(.*)/,
                TopApp.configs.APIHost + '$1');
        }
        return originalSync.call(model, method, model, options);
    };
    TopApp.TokenAuth = {
        get: function() {
            return _.clone(authToken);
        },
        set: function(token) {
            authToken = _.clone(token);
            localStorage.setItem('auth-token', authToken);
        },
        clear: function() {
            authToken = null;
            localStorage.removeItem('auth-token');
        }
    };
};

TopApp.initAjaxEvents = function() {
    var timeout = 1000;
    var xhrPool = [];
    $(document).ajaxStart(function() {
        $('#apploader').removeClass('invisible');
    });
    $(document).ajaxStop(function() {
        setTimeout(function() {
            $('#apploader').addClass('invisible');
            timeout = 1000;
        }, timeout);
    });
    $(document).ajaxError(function(event, jqxhr, settings, exception) {
        var response = jqxhr.responseJSON || {};
        if (jqxhr.status == 401 || jqxhr.status == 403 || jqxhr.status == 499) {
            if (response.detail != 'Authentication credentials were not provided.') {
                var text = $('#apploader .ajax-error').html();
                $('#apploader .ajax-error').html(response.detail).removeClass('hidden');
                setTimeout(function() {
                    $('#apploader .ajax-error').html(text).addClass('hidden');
                }, (timeout = 2000)/* + 500*/);
            }
            TopApp.TokenAuth.clear();
            TopApp.Pages.MemberLogin.go({ ref: TopApp.history.active });
        } else if (settings.type == 'GET' && jqxhr.statusText != 'abort') {
            $('#apploader .ajax-error').removeClass('hidden');
            setTimeout(function() {
                $('#apploader .ajax-error').addClass('hidden');
            }, (timeout = 2500)/* + 500*/);
        }
    });
    $.ajaxSetup({
        beforeSend: function(jqXHR) {
            if (xhrPool.length >= 7) {
                xhrPool[0].abort();
                xhrPool.splice(0, 1);
            }
            xhrPool.push(jqXHR);
        },
        complete: function(jqXHR) {
            var index = xhrPool.indexOf(jqXHR);
            if (index > -1) xhrPool.splice(index, 1);
        }
    });
    TopApp.abortAllAjax = function() {
        _.each(xhrPool, function(jqXHR) { jqXHR.abort(); });
        xhrPool.length = 0;
        setTimeout(function() {
            $('#apploader').addClass('invisible');
            timeout = 0;
        }, timeout);
    };
};

TopApp.initGa = function() {
    var clientId = TopApp.TokenAuth.get() ? TopApp.TokenAuth.get() : window.device.uuid;
    if (clientId) {
        ga('create', 'UA-40624648-3', { 'storage': 'none', 'clientId': clientId });
    } else {
        ga('create', 'UA-40624648-3', { 'cookieDomain': 'none' });
    }
};

TopApp.handleError = function(err) {
    try {
        var error = new TopApp.Models.ClientError();
        error.save({message: err.message, detail: err.stack}, {global: false});
        console.error(err.message);
    } catch (e) {}
};

window.onerror = function(message, file, line, column, errorObj) {
    try {
        TopApp.abortAllAjax();
        var detail = errorObj && errorObj.stack ? errorObj.stack : [file, line, column].join(':');
        var error = new TopApp.Models.ClientError();
        error.save({message: message, detail: detail}, {global: false});
        console.error(message, detail);
    } catch (e) {}
};

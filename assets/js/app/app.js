
window.App = new (Backbone.View.extend({
    
    Version: 1.0,
    
    Models: {},
    Data: {},
    Views: {},
    Collections: {},
    
    Templates: {},
    Pages: {},
    
    configs: {
        APIHost: "http://192.168.1.7:8001",
        ajaxTimeout: 120000
    },
    
    start: function() {
        App.initDevice();
        App.initAjaxEvents();
        //App.initGeolocation();
        App.initSync();
        App.initGa();
        Backbone.history.start();
        App.fixViewport();
    }
}))({el: document.body});

App.initDevice = function() {
    if (window.device) {
        // Just Fine
    } else if(/MicroMessenger/i.test(navigator.userAgent)) {
        window.device = { platform: 'Weixin' };
    } else {
        window.device = { platform: 'WebApp' };
    }
    /*
     * Emulate click events on body. Remove 300ms delay.
     */
    FastClick.attach(document.body);
};

App.fixViewport = function() {
    var wrapperOffset = 44;
    if (window.device.platform === 'iOS' && parseFloat(window.device.version) >= 7.0) {
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

App.initGeolocation = function(callback) {
    var onSuccess = function(position) {
        App.coords.latitude = position.coords.latitude;
        App.coords.longitude = position.coords.longitude;
        if (callback) callback();
    };
    var onError = function() {
        if (callback) callback();
    };
    App.coords = { longitude: 121.491, latitude: 31.233 };
    navigator.geolocation.getCurrentPosition(onSuccess, onError);
};

App.initSync = function() {
    var authToken = localStorage.getItem('auth-token');
    var originalSync = Backbone.sync;
    Backbone.sync = function(method, model, options) {
        options.timeout = options.timeout || App.configs.ajaxTimeout;
        options.headers = options.headers || {};
        if (authToken) {
            _.extend(options.headers, { 'Authorization': 'Token ' + authToken });
        }
        if (options.nocache) {
            _.extend(options.headers, { 'Cache-Control': 'no-cache' });
        }
        return originalSync.call(model, method, model, options);
    };
    App.TokenAuth = {
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

App.initAjaxEvents = function() {
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
            App.TokenAuth.clear();
            App.Pages.MemberLogin.go({ ref: App.history.active });
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
    App.abortAllAjax = function() {
        _.each(xhrPool, function(jqXHR) { jqXHR.abort(); });
        xhrPool.length = 0;
        setTimeout(function() {
            $('#apploader').addClass('invisible');
            timeout = 0;
        }, timeout);
    };
};

App.initGa = function() {
    var clientId = App.TokenAuth.get() ? App.TokenAuth.get() : window.device.uuid;
    if (clientId) {
        ga('create', 'UA-49749641-1', { 'storage': 'none', 'clientId': clientId });
    } else {
        ga('create', 'UA-49749641-1', { 'cookieDomain': 'none' });
    }
};

App.handleError = function(err) {
    try {
        var error = new App.Models.ClientError();
        error.save({message: err.message, detail: err.stack}, {global: false});
        console.error(err.message);
    } catch (e) {}
};

window.onerror = function(message, file, line, column, errorObj) {
    try {
        App.abortAllAjax();
        var detail = errorObj && errorObj.stack ? errorObj.stack : [file, line, column].join(':');
        var error = new App.Models.ClientError();
        error.save({message: message, detail: detail}, {global: false});
        console.error(message, detail);
    } catch (e) {}
};

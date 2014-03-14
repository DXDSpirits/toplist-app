// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function noop() {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

// This script prevents links from opening in Mobile Safari. https://gist.github.com/1042026
(function(a, b, c) {
    if ( c in b && b[c]) {
        var d, e = a.location, f = /^(a|html)$/i;
        a.addEventListener("click", function(a) {
            d = a.target;
            while (!f.test(d.nodeName))
            d = d.parentNode;
            "href" in d && (d.href.indexOf("http") || ~d.href.indexOf(e.host)) && (a.preventDefault(), e.href = d.href)
        }, !1)
    }
})(document, window.navigator, "standalone");

// Place any Zepto/helper plugins in here.
(function(document) {
	window.MWA = window.MWA || {};
	MWA.fixBlurScroll = function(context) {
		var inputs = $(context).find('input,textarea');
		inputs.on('blur', function() {
			window.scrollTo(0, 0);
		});
	};
	MWA.preventWindowScroll = function() {
		$(window).bind('touchmove', function(ev) { ev.preventDefault(); });
	};
})(document);

! function($) {
    "use strict";
    $.fn['switchControl'] = function(method) {
        var methods = {
            init : function() {
                return this.each(function() {
                    "off: 0; on : 1"
                    var $element = $(this), 
                        onLabel = $(this).find('.label-on').text() || 'ON',
                        offLabel = $(this).find('.label-off').text() || 'OFF';
                    var switchGender = function(gender) {
                        var switchOff = function() {
                            $element.removeClass('on').addClass('off');
                            $element.find('input').val(0);
                            $element.find('.label-text').html(offLabel);
                        };
                        var switchOn = function() {
                            $element.removeClass('off').addClass('on');
                            $element.find('input').val(1);
                            $element.find('.label-text').html(onLabel);
                        }
                        if (gender == 0) {
                            switchOff();
                        } else if (gender == 1) {
                            switchOn();
                        } else {
                            if ($element.hasClass('on')) switchOff(); else switchOn();
                        }
                    };
                    switchGender(0);
                    var btn = new MBP.fastButton($element[0], switchGender);
                    btn.onTouchMove = function(event) {
                        if (Math.abs(event.touches[0].clientY - this.startY) > 10) btn.reset(event);
                        if ($element.hasClass('on') && event.touches[0].clientX - btn.startX > 10) btn.reset(event);
                        if ($element.hasClass('off') && event.touches[0].clientX - btn.startX < -10) btn.reset(event);
                    };
                    $element.on('change', function(e, status) {
                        switchGender(status);
                    });
                });
            },
            toggle: function() {
                $(this).trigger('change', arguments[0]);
            },
            destroy : function() {  }
        };
        if (methods[method])
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        else if ( typeof method === 'object' || !method)
            return methods.init.apply(this, arguments);
        else
            $.error('Method ' + method + ' does not exist!');
    };
}(jQuery);

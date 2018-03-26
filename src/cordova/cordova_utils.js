var $c = $c || function(callback, delay) {
	var fn;
	if(delay > 0) {
		fn = function(){ setTimeout(callback, delay); }
	}
	else {
		fn = callback;
	}
	
	$(document).on("on-device-ready", fn);
};

var $cb = $cb || function(callback) {
	$(document).on("on-device-ready-before", callback);
};

var $cl = $cl || function(callback) {
	$(document).on("on-device-ready-after", callback);
};

var Cordova = {
	
	currentApp: null,
	
	startApp: function(callback) {
		
		var app = {
	
			initialize: function() {
				if(Cordova.isMobile()) {
					document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);	
				}
				else {
					$(app.onDeviceReady.bind(app));
				}
				
			},
			
			onDeviceReady: function() {
				
				try {
					if(typeof callback === 'function')
						callback();
					
				}
				catch(e) {
					alert(e);
					console.log(e);
				}
				
				$(document).trigger("on-device-ready-before");
				$(document).trigger("on-device-ready");
				
				setTimeout(function(){
					$(document).trigger("on-device-ready-after");
				}, 500);
				
			}
		};
		
		Cordova.currentApp = app

		app.initialize();
		
	},
	
	isMobile: function() {
		return (window.cordova || window.PhoneGap || window.phonegap) 
			&& /^file:\/{3}[^\/]/i.test(window.location.href) 
			&& /ios|iphone|ipod|ipad|android/i.test(navigator.userAgent);
	},
	
	isBrowser: function() {
		return !Cordova.isMobile();
	},
	
	exitApp: function() {
		if (navigator.app) {
            navigator.app.exitApp();
        }
        else if (navigator.device) {
            navigator.device.exitApp();
        }
        else if (window.opener) {
            window.close();
        }
		else {
			location.href = 'about:blank';
		}
	}
};
var $c = $c || function(callback, delay) {
    var fn;
    if (delay > 0) {
        fn = function() {
            setTimeout(callback, delay);
        };
    } else {
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
                if (Cordova.isMobile()) {
                    document.addEventListener("deviceready", this.onDeviceReady.bind(this), false);
                } else {
                    $(app.onDeviceReady.bind(app));
                }
            },
            onDeviceReady: function() {
                try {
                    if (typeof callback === "function") callback();
                } catch (e) {
                    alert(e);
                    console.log(e);
                }
                $(document).trigger("on-device-ready-before");
                $(document).trigger("on-device-ready");
                setTimeout(function() {
                    $(document).trigger("on-device-ready-after");
                }, 500);
            }
        };
        Cordova.currentApp = app;
        app.initialize();
    },
    isMobile: function() {
        return (window.cordova || window.PhoneGap || window.phonegap) && /^file:\/{3}[^\/]/i.test(window.location.href) && /ios|iphone|ipod|ipad|android/i.test(navigator.userAgent);
    },
    isBrowser: function() {
        return !Cordova.isMobile();
    },
    exitApp: function() {
        if (navigator.app) {
            navigator.app.exitApp();
        } else if (navigator.device) {
            navigator.device.exitApp();
        } else if (window.opener) {
            window.close();
        } else {
            location.href = "about:blank";
        }
    }
};

var round = function(n, places) {
    return +(Math.round(n + "e+" + places) + "e-" + places);
};

var getType = function(obj) {
    return Object.prototype.toString.call(obj);
};

var isDate = function(obj) {
    return getType(obj).indexOf("Date") !== -1;
};

var isArray = function(obj) {
    return getType(obj).indexOf("Array") !== -1;
};

var capitalize = function(str) {
    if (!str || str == "") return str;
    return str[0].toUpperCase() + str.substring(1);
};

var getNumericString = function(v) {
    var m = v.match(/\d+([.,]\d*)?/g);
    if (!m || m.length === 0) return "";
    return m[0].replace(",", ".");
};

$c(function() {
    var load = function(e, id) {
        var p = e.data(typeof id === "undefined" ? "autoload" : "autoload-" + id), mode = e.data("mode"), style = e.data("style") || "", _class = e.data("class") || "";
        $.ajax({
            url: p,
            type: "GET",
            cache: false,
            async: false
        }).done(function(html) {
            e.html(html);
            if (mode === "replace") {
                var c = e.children().insertBefore(e);
                e.remove();
                e = c;
            }
            if (e.attr("style") != "") {
                style = e.attr("style") + ";" + style;
            }
            e.attr("style", style).addClass("class", _class);
        }).fail(function(a, b, c) {
            alert("Error: " + c);
            console.log([ a, b, c ]);
        });
    };
    var autoload = function() {
        var again = false;
        $("[data-autoload]").each(function() {
            var e = $(this);
            if (e.data("autoloaded")) return;
            e.data("autoloaded", true);
            load(e);
        });
        if (Cordova.isMobile()) {
            $("[data-autoload-mobile]").each(function() {
                var e = $(this);
                if (e.data("autoloaded")) return;
                e.data("autoloaded", true);
                load(e, "mobile");
                again = true;
            });
        } else {
            $("[data-autoload-browser]").each(function() {
                var e = $(this);
                if (e.data("autoloaded")) return;
                e.data("autoloaded", true);
                load(e, "browser");
                again = true;
            });
        }
        if (again) setTimeout(autoload, 50); else $(document).trigger("template-load");
    };
    autoload();
});

var CacheManager = function(cacheStorage) {
    var storage = {};
    this.load = function() {
        var st = cacheStorage.getStorage();
        if (!st || st == "") {
            storage = {};
        } else {
            storage = JSON.parse(st);
        }
        return this;
    };
    this.save = function() {
        cacheStorage.setStorage(JSON.stringify(storage));
    };
    this.getAsync = function(callback, key, gen, exp) {
        if (!storage[key] || this.isExpired(key)) {
            get(function(success, data) {
                if (success) {
                    this.set(key, data, exp);
                    callback(true, storage[key].value);
                } else {
                    callback(false, null);
                }
            }.bind(this));
        } else {
            callback(true, storage[key].value);
        }
        return this;
    };
    this.get = function(key, gen, exp) {
        if (!storage[key] || this.isExpired(key)) {
            if (!gen) return storage[key];
            this.set(key, gen(), exp);
        }
        return storage[key].value;
    };
    this.set = function(key, val, exp) {
        storage[key] = {
            value: val,
            expiration: exp
        };
        return this.save();
    };
    this.remove = function(key) {
        delete storage[key];
        return this.save();
    };
    this.clear = function() {
        storage = {};
        return this.save();
    };
    this.isExpired = function(k) {
        return storage[k].expiration && storage[k].expiration <= new Date();
    };
    this.refresh = function() {
        var newStorage = {};
        for (var k in storage) {
            if (!this.isExpired(k)) {
                newStorage[k] = storage[k];
            }
        }
        storage = newStorage;
        return this;
    };
};

(function() {
    window.StorageCache = new CacheManager({
        getStorage: function() {
            return localStorage.getItem("hnf-cache");
        },
        setStorage: function(str) {
            localStorage.setItem("hnf-cache", str);
        }
    }).load();
    window.globalVarCacheStorage = "{}";
    window.GlobalCache = new CacheManager({
        getStorage: function() {
            return window.globalVarCacheStorage;
        },
        setStorage: function(str) {
            window.globalVarCacheStorage = str;
        }
    }).load();
})();

/**
 *	JobQueue
 *	
 *	Queue that processes a certain amount of simultaneous asynchronous functions.
 *
 *	@constructor	
 *
 *	@param {Number} [maxJobs=3] - Limit of simultaneous jobs.
 *
 */
var JobQueue = function(maxJobs) {
    var currentJobs = 0;
    var queue = [];
    var tout = 0;
    var self = this;
    var inactive = true;
    this.activeEvent = [];
    this.inactiveEvent = [];
    this.maxJobs = maxJobs || 3;
    /**
	 * 	Adds an async function.
	 *	@param {Function} work - Working function.
	 */    this.add = function(work) {
        queue.push(work);
    };
    this.stop = function() {
        if (tout) {
            clearTimeout(tout);
            tout = 0;
        }
    };
    this.process = function() {
        if (queue.length > 0 && currentJobs < this.maxJobs) {
            inactive = false;
            for (var i = 0; i < this.activeEvent.length; i++) {
                this.activeEvent[i]();
            }
            while (queue.length > 0 && currentJobs < this.maxJobs) {
                currentJobs++;
                var fn = queue.shift();
                fn(function() {
                    currentJobs--;
                    self.process();
                });
            }
        } else {
            if (tout) {
                clearTimeout(tout);
                tout = 0;
            }
            tout = setTimeout(function() {
                self.process();
            }, 1e3);
            if (queue.length === 0) {
                for (var i = 0; i < this.inactiveEvent.length; i++) {
                    this.inactiveEvent[i]();
                }
            }
        }
    };
    this.process();
};

$c(function() {
    var delay = 500;
    var hash = null;
    var check = function() {
        if (hash == null) {
            hash = location.hash;
        } else if (location.hash != hash) {
            $(document).trigger("navigation-go", [ hash ]);
        }
        setTimeout(check, delay);
    };
    setTimeout(check, delay);
});

(function() {
    var _lastPage = "";
    var _lastPageDom = null;
    var _container = null;
    var _method = "";
    var getPage = function(name) {
        if (!name || name == "") return null;
        return $("[data-page='" + name + "']");
    };
    var Navigator = {
        initialize: function(container, method) {
            _container = container;
            if (typeof _container === "string") {
                if (_container[0] != "#") _container = "#" + _container;
                _container = $(_container);
            }
            _method = method;
        },
        go: function(page) {
            if (_lastPage === page) return;
            this.hideCurrent(function() {
                this.show(page, function(pageDom) {
                    _lastPage = page;
                    _lastPageDom = pageDom;
                });
            });
        },
        show: function(page, callback) {
            var pageDom = getPage(page);
            if (!pageDom) {
                callback(null);
            }
            if (_method === "clone") {
                throw "Not implemented";
            } else if (_method === "show-hide") {
                pageDom.hide("fade", 500, function() {
                    callback(pageDom);
                });
            } else if (_method === "move") {
                throw "Not implemented";
            }
        },
        hideCurrent: function(callback) {
            if (_method === "clone") {
                throw "Not implemented";
            } else if (_method === "show-hide") {
                _lastPageDom.hide("fade", 500, callback);
            } else if (_method === "move") {
                throw "Not implemented";
            }
        }
    };
})();

/**
 *	Waits until a condition.
 *
 *	@param {Function} condition - Condition for the loop.
 *	@param {Number} [delay=50] - Delay between condition checks.
 *	@callback callback
 */
function waitUntil(condition, callback, delay) {
    delay = delay || 50;
    if (!condition()) {
        setTimeout(function() {
            waitUntil(condition, callback, delay);
        }, delay);
    } else {
        callback();
    }
}

/**
 *	Waits while a condition.
 *
 *	@param {Function} condition - Condition for the loop.
 *	@param {Number} [delay=50] - Delay between condition checks.
 *	@callback callback
 */ function waitWhile(condition, callback, delay) {
    delay = delay || 50;
    if (condition()) {
        setTimeout(function() {
            waitWhile(condition, callback, delay);
        }, delay);
    } else {
        callback();
    }
}

var encrypt = function(text) {
    return text;
};

var decrypt = function(text) {
    return text;
};

if (typeof atob === "function" && typeof btoa === "function" && "test" === atob(btoa("test"))) {
    encrypt = function(text) {
        return btoa(text);
    };
    decrypt = function(text) {
        return atob(text);
    };
}

if (typeof CryptoJS !== "undefined") {
    encrypt = function(text) {
        return CryptoJS.AES.encrypt(text, "HNF_134679");
    };
    decrypt = function(text) {
        return CryptoJS.AES.decrypt(text, "HNF_134679");
    };
}

var Facebook = function() {
    var fb = typeof FB !== "undefined" ? FB : facebookConnectPlugin;
    if (!fb) {
        throw "Cannot find Facebook SDK.";
    }
    var mobile = typeof facebookConnectPlugin !== "undefined";
    var permissions = [ "public_profile", "user_birthday", "email", "user_friends" ];
    this.login = function(callback) {
        fb.login(permissions, function(a) {
            if (callback) callback(true, a);
        }, function(a) {
            if (callback) callback(false, a);
        });
    };
    var fbApi = function(url, apiPermissions, callback) {
        if (mobile) {
            fb.api(url, apiPermissions, function(res) {
                callback({
                    success: true,
                    response: res
                });
            }, function(err) {
                callback({
                    success: false,
                    response: err
                });
            });
        } else {
            fb.api(url, function(res) {
                callback({
                    success: !!res && !res.error,
                    response: res
                });
            });
        }
    };
    this.getLoggedAccount = function(callback) {
        var success = function(response) {
            if (response.status === "connected") {
                fbApi("/me", [ "public_profile", "user_birthday", "email" ], function(dataResponse) {
                    if (dataResponse.success) {
                        dataResponse = dataResponse.response;
                        console.log("Successful login for: " + dataResponse.name);
                        console.log(dataResponse);
                        var onResponse = function(friendsResponse) {
                            if (friendsResponse.success) {
                                friendsResponse = friendsResponse.response;
                                var account = new Account({
                                    id: dataResponse.id,
                                    fullname: dataResponse.name || "unknown",
                                    email: dataResponse.email,
                                    friends: friendsResponse.data,
                                    photograph: "http://graph.facebook.com/" + dataResponse.id + "/picture?type=normal"
                                });
                                callback({
                                    success: true,
                                    account: account,
                                    status: response.status
                                });
                            } else {
                                callback({
                                    success: false,
                                    account: null,
                                    status: friendsResponse.response.status,
                                    message: friendsResponse.response
                                });
                            }
                        };
                        fbApi("/me/friends", [ "public_profile", "user_friends" ], onResponse);
                    } else {
                        callback({
                            success: false,
                            account: null,
                            status: dataResponse.response.status,
                            message: dataResponse.response
                        });
                    }
                });
            } else {
                callback({
                    success: false,
                    account: null,
                    status: response.status,
                    message: "Conexión perdida"
                });
            }
        };
        if (mobile) {
            fb.getLoginStatus(success, function(err) {
                callback({
                    success: false,
                    account: null,
                    status: response.status,
                    message: err
                });
            });
        } else {
            fb.getLoginStatus(success, true);
        }
    };
    this.publishPhoto = function() {
        fb.showDialog({
            method: "feed",
            picture: "https://www.google.co.jp/logos/doodles/2014/doodle-4-google-2014-japan-winner-5109465267306496.2-hp.png",
            name: "Test Post",
            message: "First photo post",
            caption: "Testing using phonegap plugin",
            description: "Posting photo using phonegap facebook plugin"
        }, function(response) {
            alert(JSON.stringify(response));
        }, function(response) {
            alert(JSON.stringify(response));
        });
    };
    this.logout = function() {};
};
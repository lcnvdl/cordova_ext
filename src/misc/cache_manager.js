var CacheManager = function(cacheStorage) {

    var storage = {};

    this.load = function() {
        var st = cacheStorage.getStorage();
        if(!st || st == "") {
            storage = {};
        }
        else {
            storage = JSON.parse(st);
        }
        return this;
    };

    this.save = function() {
        cacheStorage.setStorage(JSON.stringify(storage));
    };

    this.getAsync = function(callback, key, gen, exp) {
        if(!storage[key] || this.isExpired(key)) {
            get(function(success, data){
                if(success) {
                    this.set(key, data, exp);
                    callback(true, storage[key].value);
                }
                else {
                    callback(false, null);
                }
            }.bind(this));
        }
        else {
            callback(true, storage[key].value);
        }

        return this;
    };

    this.get = function(key, gen, exp) {
        if(!storage[key] || this.isExpired(key)) {
            if(!gen)
                return storage[key];
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

    this.clear = function(){
        storage = {};
        return this.save();
    };

    this.isExpired = function(k){
        return storage[k].expiration && storage[k].expiration <= new Date();
    };

    this.refresh = function() {
        var newStorage = {};
        for(var k in storage) {
            if(!this.isExpired(k)) {
                newStorage[k] = storage[k];
            }
        }

        storage = newStorage;
        return this;
    };

};

(function(){

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

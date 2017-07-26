var getType = function(obj) {
    return Object.prototype.toString.call(obj);
};

var isDate = function(obj) {
    return getType(obj).indexOf("Date") !== -1;
};

var isArray = function(obj) {
    return getType(obj).indexOf("Array") !== -1;
};
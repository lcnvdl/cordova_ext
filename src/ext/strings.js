var capitalize = function(str) {
    if(!str || str == "")
        return str;
    return str[0].toUpperCase() + str.substring(1);
};

var getNumericString = function(v) {
    var m = v.match(/\d+([.,]\d*)?/g);
    if(!m || m.length === 0)
        return "";

    return m[0].replace(",", ".");
};
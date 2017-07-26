var encrypt = function(text) {
    return text;
};

var decrypt = function(text) {
    return text;
};

if((typeof atob === 'function') && (typeof btoa === 'function') && ("test" === atob(btoa("test"))))
{
    encrypt = function(text) {
        return btoa(text);
    };

    decrypt = function(text) {
        return atob(text);
    };
}

if(typeof CryptoJS !== 'undefined') {

    encrypt = function(text) {
        return CryptoJS.AES.encrypt(text, "HNF_134679");
    };

    decrypt = function(text) {
        return CryptoJS.AES.decrypt(text, "HNF_134679");
    };

}
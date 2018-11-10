define('km/lang', ['KMLang', 'km/cache'], function (KMLang, cache) {
    var exports = {};
    var cacheKey = "KMLANG";
    var defaultType='zh-cn'

    exports.set = function (key) {
        var lang = KMLang[key];
        if (!lang) {
            lang = KMLang[defaultType];
        }
        cache.set(lang);
        window.KMLang = lang;
    }

    exports.get = function () {
        if (!window.KMLang) {
            window.KMLang = KMLang[defaultType];
        }
        return window.KMLang;
    }

    exports.init = function () {
        var lang = cache.get(cacheKey);
        if (!lang) {
            lang = KMLang[defaultType];
            window.KMLang = lang;
        }
    }

    exports.init();

    return exports;
});
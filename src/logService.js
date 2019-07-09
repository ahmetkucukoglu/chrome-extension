var logService = (function () {
    return {
        info: function (key, message) {
            console.info(key, message);
        },
        success: function (key, message) {
            console.info(key, message);
        },
        error: function (key, message) {
            console.error(key, message);
        }
    };
})();
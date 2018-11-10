define('component/popover', ['jquery'], function ($) {

    var exports = {}

    exports.init = function (selector, options) {
        var self = this;
        self.options = $.extend(true, {
            backdrop: true,
        }, options);
        self.$selector = $(selector);
        exports._show();
        exports._watch();
    }
    exports._show = function () {
        var self = this;
        self.$selector.show().addClass('animate-tip-down');
        exports._appendHtml();
    }
    exports._watch = function () {
        var self = this;
        self.$selector.off('click.apply.layout')
        .on('click.apply.layout', function () {
            exports._close(self.$selector);
        }).on('click.apply.layout', '.dialog-layer,.reminder,#btnSubmit', function (e) {
            e.stopPropagation();
        });
        if (self.options.backdrop) {
            $('.mask-layout').one('click.apply.layout', function () {
                exports._close(self.$selector);
            });
        }
    }
    exports._appendHtml = function () {
        var layerHtml = '<div class="mask-layout"></div>';
        $('body').append(layerHtml);
    }
    exports._close = function () {
        var self = this;
        self.$selector.hide();
        exports._hideLayout();
    }
    exports._hideLayout = function () {
        $('body .mask-layout').remove();
    }
    return exports;
});
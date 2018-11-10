define('component/textarea', ['jquery'], function ($) {
    var TextArea = function (selector, option) { 
        var self = this;
        self.selector = selector;
        self.$container = $(selector);
        self.option = $.extend(true, {
            maxHeight: 100
        }, option);
        self.$container.each(function(){
            self.init(this,0,option.maxHeight);
        })
    };
    TextArea.prototype.init = function (elem, extra, maxHeight) {
        extra = extra || 0;
        var isFirefox = !!document.getBoxObjectFor || 'mozInnerScreenX' in window,
            isOpera = !!window.opera && !!window.opera.toString().indexOf('Opera'),
            
            getStyle = elem.currentStyle ? function (name) {
                var val = elem.currentStyle[name];

                if (name === 'height' && val.search(/px/i) !== 1) {
                    var rect = elem.getBoundingClientRect();
                    return rect.bottom - rect.top -
                            parseFloat(getStyle('paddingTop')) -
                            parseFloat(getStyle('paddingBottom')) + 'px';        
                };

                return val;
            } : function (name) {
                return getComputedStyle(elem, null)[name];
            },
            minHeight = parseFloat(getStyle('height'));
 
        elem.style.resize = 'none';
 
        var change = function () {
            var scrollTop, 
                height,
                padding = 0,
                style = elem.style;
 
            if (elem._length === elem.value.length) return;
            elem._length = elem.value.length;
 
            if (!isFirefox && !isOpera) {
                padding = parseInt(getStyle('paddingTop')) + parseInt(getStyle('paddingBottom'));
            };
            scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
 
            elem.style.height = minHeight + 'px';
            if (elem.scrollHeight > minHeight) {
                if (maxHeight && elem.scrollHeight > maxHeight) {
                    height = maxHeight - padding;
                    style.overflowY = 'auto';
                } else {
                    height = elem.scrollHeight - padding;
                    style.overflowY = 'hidden';
                };
                style.height = height + extra + 'px';
                scrollTop += parseInt(style.height) - elem.currHeight;
                document.body.scrollTop = scrollTop;
                document.documentElement.scrollTop = scrollTop;
                elem.currHeight = parseInt(style.height);
            };
        };
        $(elem).on('propertychange input',function(){
            change();
        });
        // ie9
        if(navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.match(/9./i)=="9."){
            $(elem).on('keyup',function(){
                change();
            });
        }
    };
    return TextArea;
});
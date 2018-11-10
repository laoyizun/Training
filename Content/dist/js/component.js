define('component/imgUpload', ['jquery', 'KM', 'weui'], function ($, KM, Weui) {
    var exports = {};

    //初始化
    exports.init = function (selector, options) {
        var self = this;
        self.options = options;
        self.$imgWraps = $(selector);
        this.$imgWraps.find(".upload-img").append('<form action="' + this.options.uploadUrl + '" enctype="multipart/form-data" method="post"><input name="file" type="file" data-role="uploadFile"></form>');
        self._imgPreviewInit();
        self._watch();
    }

    exports._imgPreviewInit = function (relationType) {
        var self = this;
        var $imgs = self.$imgWraps.find('img');
        if (self.imgPreview) {
            self.imgPreview.destory();
            self.imgPreview = null;
        }
        if ($imgs.length > 0) {
            self.imgPreview = KM.imgPreview($imgs);
        }
    }

    exports._watch = function () {
        var self = this;
        self.$imgWraps.on('change', '.upload-img [data-role="uploadFile"]', function () {
            self._upload($(this));
        }).on('click', '.show-img .fa-remove,.show-img .icon-close', function () {
            self._remove($(this));
        });
    };

    exports._upload = function ($el) {
        var self = this;
        if (self.isLoading) {
            return;
        }
        self.isLoading = true;
        KM.Loading.show();
        var $form = $el.parent();

        $form.ajaxSubmit({
            url: $form.attr('action'),
            cache: false,
            success: function (ret) {
                if (typeof ret === 'string') {
                    ret = JSON.parse(ret);
                }
                self._createImg(ret, $el);
            },
            error: function () {
                KM.popTips.error('上传失败');
            },
            complete: function () {
                self.isLoading = false;
                KM.Loading.hide();
                $el.remove();
                $form.append('<input name="file" type="file" data-role="uploadFile">');
            }
        });
    };

    //创建图片
    exports._createImg = function (ret, $el) {
        var self = this;
        if (ret.Status) {
            var fileId = ret.Data.Fileld,
                imgUrl = self.options.imgUrlPrex + "?fileId=" + fileId,

                $uploadBox = $el.closest('.upload-img'),
                id = $uploadBox.attr('data-id'),
                isPdf = ret.Data.IsPDf;
            var html = '<a href="' + (ret.Data.IsPDf ? imgUrl : 'javascript:void(0);') + '" ' + (ret.Data.IsPDf ? 'target="_blank"' : '') + '>' +
                            (ret.Data.IsPDf ? '附件PDF下载' : '<img src="' + imgUrl + '" />') +
                        '</a>' +
                        '<span class="iconfont icon-close" data-fileid="' + fileId + '"></span>';
            $uploadBox.hide().removeClass('k-error')
                .prev().show().html(html).addClass(ret.Data.IsPDf ? 'no-img' : '');
            $(id).val(fileId);
            self.options.validate.hideError($(id));
            self._imgPreviewInit();
        } else {
            KM.popTips.error(ret.ErrorMessage, 800);
        }
    };

    //删除
    exports._remove = function ($el) {
        var self = this;
        Weui.confirm('', {
            title: '您确认要删除该图片吗?',
            buttons: [{
                label: '取消',
                type: 'default',
                onClick: function () {

                }
            }, {
                label: '确认',
                type: 'success',
                onClick: function () {
                    KM.ajax.post(self.options.removeUrl, { id: $el.attr('data-fileid') }).done(function (ret) {
                        if (ret.Status) {
                            var $uploadBox = $el.closest('.show-img').next();
                            $uploadBox.show()
                                .prev().hide().html('');
                            $($uploadBox.attr('data-id')).val('');
                            self._imgPreviewInit();
                        }
                    });
                }
            }]
        });
    };

    return exports;
});define('component/popover', ['jquery'], function ($) {

    var exports = {}

    exports.init = function (selector, options) {
        var self = this;
        self.options = $.extend(true, {
            backdrop: true,
            closeBtn: ''
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
            exports.close(self.$selector);
        }).on('click.apply.layout', '.dialog-layer,.reminder,#btnSubmit', function (e) {
            e.stopPropagation();
        });
        if (self.options.backdrop) {
            $('.mask-layout').one('click.apply.layout', function () {
                exports.close(self.$selector);
            });
        }
    }
    exports._appendHtml = function () {
        var layerHtml = '<div class="mask-layout"></div>';
        $('body').append(layerHtml);
    }
    exports.close = function () {
        var self = this;
        self.$selector.hide();
        exports._hideLayout();
    }
    exports._hideLayout = function () {
        $('body .mask-layout').remove();
    }
    return exports;
});define('component/textarea', ['jquery'], function ($) {
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
});define("js/component",["component/imgUpload","component/popover","component/textarea"],function(_imgUpload,_popover,_textarea){return{imgUpload:_imgUpload,popover:_popover,textarea:_textarea}});
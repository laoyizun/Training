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
                var s = $form.attr('action');
                console.log(s);
                if (typeof ret === 'string') {
                    ret = JSON.parse(ret);
                }
                self._createImg(ret, $el);
            },
            error: function (a, b, c) {
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
});
/**
 * 自动完成模块
 * @date :2014-09-23
 * @author kotenei (kotenei@qq.com)
 */
define('km/autoComplete', ['jquery'], function ($) {

    (function () {

        var fieldSelection = {
            getSelection: function () {

                var e = (this.jquery) ? this[0] : this;

                return (

                    /* mozilla / dom 3.0 */
                    ('selectionStart' in e && function () {
                        var l = e.selectionEnd - e.selectionStart;
                        return { start: e.selectionStart, end: e.selectionEnd, length: l, text: e.value.substr(e.selectionStart, l) };
                    }) ||

                    /* exploder */
                    (document.selection && function () {

                        e.focus();

                        var r = document.selection.createRange();
                        if (r === null) {
                            return { start: 0, end: e.value.length, length: 0 }
                        }

                        var re = e.createTextRange();
                        var rc = re.duplicate();
                        re.moveToBookmark(r.getBookmark());
                        rc.setEndPoint('EndToStart', re);

                        return { start: rc.text.length, end: rc.text.length + r.text.length, length: r.text.length, text: r.text };
                    }) ||

                    /* browser not supported */
                    function () { return null; }

                )();

            },

            replaceSelection: function () {

                var e = (typeof this.id == 'function') ? this.get(0) : this;
                var text = arguments[0] || '';

                return (

                    /* mozilla / dom 3.0 */
                    ('selectionStart' in e && function () {
                        e.value = e.value.substr(0, e.selectionStart) + text + e.value.substr(e.selectionEnd, e.value.length);
                        return this;
                    }) ||

                    /* exploder */
                    (document.selection && function () {
                        e.focus();
                        document.selection.createRange().text = text;
                        return this;
                    }) ||

                    /* browser not supported */
                    function () {
                        e.value += text;
                        return jQuery(e);
                    }

                )();

            }

        };

        jQuery.each(fieldSelection, function (i) { jQuery.fn[i] = this; });

    })();


    var kingwolfofsky = {
        /**  
        * 获取输入光标在页面中的坐标  
        * @param        {HTMLElement}   输入框元素          
        * @return       {Object}        返回left和top,bottom  
        */
        getInputPositon: function (elem) {
            if (document.selection) {   //IE Support  
                elem.focus();
                var Sel = document.selection.createRange();
                var docElm = document.documentElement;
                return {
                    left: Sel.boundingLeft + docElm.scrollLeft,
                    top: Sel.boundingTop + docElm.scrollTop,
                    bottom: Sel.boundingTop + Sel.boundingHeight + docElm.scrollTop,
                    boxHeight: Sel.boundingHeight
                };
            } else {
                var that = this;
                var cloneDiv = '{$clone_div}', cloneLeft = '{$cloneLeft}', cloneFocus = '{$cloneFocus}', cloneRight = '{$cloneRight}';
                var none = '<span style="white-space:pre-wrap;"> </span>';
                var div = elem[cloneDiv] || document.createElement('div'), focus = elem[cloneFocus] || document.createElement('span');
                var text = elem[cloneLeft] || document.createElement('span');
                var offset = that._offset(elem), index = this._getFocus(elem), focusOffset = { left: 0, top: 0 };

                if (!elem[cloneDiv]) {
                    elem[cloneDiv] = div, elem[cloneFocus] = focus;
                    elem[cloneLeft] = text;
                    div.appendChild(text);
                    div.appendChild(focus);
                    document.body.appendChild(div);
                    focus.innerHTML = '|';
                    focus.style.cssText = 'display:inline-block;width:0px;overflow:hidden;z-index:-100;word-wrap:break-word;word-break:break-all;';
                    div.className = this._cloneStyle(elem);
                    div.style.cssText = 'visibility:hidden;display:inline-block;position:absolute;z-index:-100;word-wrap:break-word;word-break:break-all;overflow:hidden;';
                };

                div.style.left = this._offset(elem).left + "px";
                div.style.top = this._offset(elem).top + "px";
                var strTmp = elem.value.substring(0, index).replace(/</g, '<').replace(/>/g, '>').replace(/\n/g, '<br/>').replace(/\s/g, none);
                text.innerHTML = strTmp;

                focus.style.display = 'inline-block';
                try { focusOffset = this._offset(focus); } catch (e) { };
                focus.style.display = 'none';
                // return {
                //     left: focusOffset.left,
                //     top: focusOffset.top,
                //     bottom: focusOffset.bottom
                // };
                return focusOffset
            }
        },

        // 克隆元素样式并返回类  
        _cloneStyle: function (elem, cache) {
            if (!cache && elem['${cloneName}']) return elem['${cloneName}'];
            var className, name, rstyle = /^(number|string)$/;
            var rname = /^(content|outline|outlineWidth)$/; //Opera: content; IE8:outline && outlineWidth  
            var cssText = [], sStyle = elem.style;

            for (name in sStyle) {
                if (!rname.test(name)) {
                    val = this._getStyle(elem, name);
                    if (val !== '' && rstyle.test(typeof val)) { // Firefox 4  
                        name = name.replace(/([A-Z])/g, "-$1").toLowerCase();
                        cssText.push(name);
                        cssText.push(':');
                        cssText.push(val);
                        cssText.push(';');
                    };
                };
            };
            cssText = cssText.join('');
            elem['${cloneName}'] = className = 'clone' + (new Date).getTime();
            this._addHeadStyle('.' + className + '{' + cssText + '}');
            return className;
        },

        // 向页头插入样式  
        _addHeadStyle: function (content) {
            var style = this._style[document];
            if (!style) {
                style = this._style[document] = document.createElement('style');
                document.getElementsByTagName('head')[0].appendChild(style);
            };
            style.styleSheet && (style.styleSheet.cssText += content) || style.appendChild(document.createTextNode(content));
        },
        _style: {},

        // 获取最终样式  
        _getStyle: 'getComputedStyle' in window ? function (elem, name) {
            return getComputedStyle(elem, null)[name];
        } : function (elem, name) {
            return elem.currentStyle[name];
        },

        // 获取光标在文本框的位置  
        _getFocus: function (elem) {
            var index = 0;
            if (document.selection) {// IE Support  
                elem.focus();
                var Sel = document.selection.createRange();
                if (elem.nodeName === 'TEXTAREA') {//textarea  
                    var Sel2 = Sel.duplicate();
                    Sel2.moveToElementText(elem);
                    var index = -1;
                    while (Sel2.inRange(Sel)) {
                        Sel2.moveStart('character');
                        index++;
                    };
                }
                else if (elem.nodeName === 'INPUT') {// input  
                    Sel.moveStart('character', -elem.value.length);
                    index = Sel.text.length;
                }
            }
            else if (elem.selectionStart || elem.selectionStart == '0') { // Firefox support  
                index = elem.selectionStart;
            }
            return (index);
        },

        // 获取元素在页面中位置  
        _offset: function (elem) {
            var box = elem.getBoundingClientRect(), doc = elem.ownerDocument, body = doc.body, docElem = doc.documentElement;
            var clientTop = docElem.clientTop || body.clientTop || 0, clientLeft = docElem.clientLeft || body.clientLeft || 0;
            var top = box.top + (self.pageYOffset || docElem.scrollTop) - clientTop, left = box.left + (self.pageXOffset || docElem.scrollLeft) - clientLeft;

            return {
                left: left,
                top: top,
                right: left + box.width,
                bottom: top + box.height,
                boxHeight: box.height
            };
        }
    };



    /**
     * keycode
     * @type {Object}
     */
    var KEY = {
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40,
        TAB: 9,
        ENTER: 13
    };

    /**
     * 自动完成模块
     * @param {JQuery} $element - dom
     * @param {Object} options - 参数
     */
    var AutoComplete = function ($element, options) {
        this.$element = $element;
        this.options = $.extend(true, {
            url: null,
            zIndex: 1000,
            data: [],
            max: 10,
            width: null,
            height: null,
            isBottom: true,
            highlight: false,
            formatItem: function (item) { return item; },
            formatResult: function (item) {
                if (typeof item === 'object') {
                    return { text: item.text, value: item.value };
                }
                return item;
            },
            bindElement: null,
            callback: {
                setValue: null
            },
            useAt: false,
            atSpace: ' '
        }, options);
        this.tpl = '<div class="k-autocomplete k-pop-panel"></div>';
        this.active = 0;
        this.init();
    };

    /**
     * 初始化
     * @return {Void}
     */
    AutoComplete.prototype.init = function () {
        var self = this;
        this.$bindElement = $(this.options.bindElement);
        this.$listBox = $(this.tpl).hide().appendTo(document.body);
        this.data = this.options.data || [];
        this.$element.on('keyup.autocomplete', function (e) {
            e.preventDefault();
            var $this = $(this),
                val = $this.val(),
                selection = $this.getSelection(),
                moveIndex = val.length, tmpVal;

            self.focusPosition = kingwolfofsky.getInputPositon(this);

            if (self.options.useAt) {
                tmpVal = val.substr(0, selection.start);
                self.atStartIndex = tmpVal.lastIndexOf('@');

                if (self.atStartIndex == -1) {
                    self.hide();
                    return;
                }

                val = val.substr(tmpVal.lastIndexOf('@') + 1);

                self.atLastIndex = val.indexOf('@');

                if (self.atLastIndex != -1) {
                    val = val.substr(0, val.indexOf('@'));
                } else {
                    self.atLastIndex = val.length;
                }
                self.atLastIndex += self.atStartIndex;
            } else {
                val = $.trim(val);
            }


            if (self.options.useAt && !val) {
                val = '$useat$';
            }

            if (self.options.useAt && /\s+/.test(val)) {
                self.hide();
                return;
            }

            if (!self.cache) {
                self.cache = val;
                self.search(val);
                self.active = 0;
            } else if (self.cache != val) {
                self.cache = val;
                self.search(val);
                self.active = 0;
            }


            switch (e.keyCode) {
                case KEY.UP:
                case KEY.LEFT:
                    e.preventDefault();
                    self.prev();
                    break;
                case KEY.DOWN:
                case KEY.RIGHT:
                    self.next();
                    break;
                case KEY.ENTER:
                case KEY.TAB:
                    self.select();
                    break;
                default:
                    break;
            }


        }).on('keydown.autocomplete', function (e) {
            switch (e.keyCode) {
                case KEY.UP:
                case KEY.DOWN:
                case KEY.ENTER:
                    e.preventDefault();
                    break;
                default:
                    break;
            }

        });
        this.$listBox.on('click.autocomplete', 'li', function () {
            $(this).addClass('active').siblings().removeClass('active');
            self.select();
        });
        $(document).on('click.autocomplete', function () {
            self.hide();
        });
        $(window).on('resize.autocomplete', function () {
            self.setCss();
        })
    };

    /**
     * 搜索数据
     * @param  {String} value - 输入值
     * @return {Void}       
     */
    AutoComplete.prototype.search = function (value) {
        var self = this;

        if (this.ajax) {
            this.ajax.abort();
            this.ajax = null;
        }

        if (value.length == 0) {
            this.hide();
            return;
        }

        if (this.options.url) {
            if (this.ajax) {
                this.ajax.abort();
                this.ajax = null;
            }
            this.ajax = $.get(this.options.url, { keyword: value }).done(function (ret) {
                if (typeof ret === 'string') {
                    ret = eval('(0,' + ret + ')');
                }
                if (ret && ret instanceof Array) {
                    var data;
                    self.data = ret;
                    data = self.getData(value);
                    self.build(value, data);
                    self.show();
                }
            });
        } else if (this.options.proxy) {
            this.options.proxy(value, function (data) {
                self.data = data;
                data = self.getData(value);
                self.build(value, data);
                self.show();
            });
        } else {
            var data = this.getData(value);
            this.build(value, data);
            this.show();
        }
    };

    /**
     * 获取数据
     * @param  {String} value - 输入值
     * @return {Array}     
     */
    AutoComplete.prototype.getData = function (value) {
        this.cacheData = [];
        var data = [], flag = 0;
        if (value.length === 0) {
            return data;
        }

        for (var i = 0, formatted, text; i < this.data.length; i++) {
            formatted = this.options.formatItem(this.data[i]);
            if (typeof formatted !== 'object') {
                text = formatted.toString().toLowerCase();
            } else {
                text = formatted.text.toLowerCase();
            }

            if ((value != '$useat$' && text.indexOf(value.toLowerCase()) >= 0)
                || (value == '$useat$' && this.options.useAt)) {
                this.cacheData.push(this.data[i]);
                data.push(this.data[i]);
                if (flag === (this.options.max - 1)) {
                    break;
                }
                flag++;
            }
        }
        return data;
    };

    /**
     * 构造列表
     * @param  {Array} data - 数据
     * @return {Void}    
     */
    AutoComplete.prototype.build = function (keyword, data) {
        this.$listBox.find('ul').remove();
        this.$listItem = null;
        if (data.length === 0) { return; }
        var text = '', value = '';
        var html = '<ul>';

        for (var i = 0, item, resultItem; i < data.length; i++) {
            item = this.options.formatItem(data[i]);
            resultItem = this.options.formatResult(data[i]);
            if (typeof item !== 'object') {
                text = value = item.toString();
            } else {
                text = item.text;
                value = item.value;
            }

            if (typeof resultItem !== 'object') {
                text = resultItem;
                value = resultItem;
                resultItem = { text: resultItem, value: resultItem };
            }

            if (!resultItem.text) {
                resultItem = { text: text, value: value };
            }

            html += '<li class="' + (i == 0 ? "active" : "") + '"  data-index="' + i + '" data-text="' + resultItem.text + '" data-value="' + resultItem.value + '">' + this.highlight(keyword, text) + '</li>';

        }
        html += '</ul>';
        this.$listBox.append(html);
        this.$list = this.$listBox.find('ul');
        this.$listItem = this.$listBox.find('li');
    };

    /**
     * 高亮显示
     * @param  {String} char - 匹配字符
     * @param  {String} str  -  需要高亮的字符串
     * @return {String}      
     */
    AutoComplete.prototype.highlight = function (char, str) {
        if (this.options.highlight) {
            var reg = new RegExp('(' + char + ')', 'ig');
            str = str.replace(reg, '<strong>$1</strong>');
            return str;
        } else {
            return str;
        }
    };

    /**
     * 显示列表
     * @return {Void}
     */
    AutoComplete.prototype.show = function () {
        $('div.k-pop-panel').hide();
        if (!this.hasItem()) { this.hide(); return; }
        this.setCss();
        this.$listBox.show();
    };


    /**
     * 获取样式
     * @return {Object}
     */
    AutoComplete.prototype.getCss = function () {
        var css = {
            left: this.$element.offset().left,
            top: this.$element.outerHeight() + this.$element.offset().top,
            width: this.options.width || this.$element.outerWidth()
        }

        if (this.options.useAt && this.focusPosition) {
            css.left = this.focusPosition.left;
            css.top = this.focusPosition.top + this.focusPosition.boxHeight;
        }

        if (!this.options.isBottom) {
            css.top = this.$element.offset().top - this.$listBox.outerHeight(true);
        }
        return css;
    };

    /**
     * 设置样式
     * @return {Void}
     */
    AutoComplete.prototype.setCss = function () {
        if (!this.$list) {
            return;
        }
        this.$list.css('max-height', this.options.height || "auto");
        var css = this.getCss();
        this.$listBox.css(css);
    }


    /**
     * 隐藏列表
     * @return {Void} 
     */
    AutoComplete.prototype.hide = function () {
        if (this.options.useAt) {
            this.cache = "";
        }
        this.$listBox.hide();
    };

    /**
     * 移动到上一项
     * @return {Void} 
     */
    AutoComplete.prototype.prev = function () {
        this.moveSelect(-1);
    };

    /**
     * 移动下一项
     * @return {Void}
     */
    AutoComplete.prototype.next = function () {
        this.moveSelect(1);
    };

    /**
     * 判断是否有列表项
     * @return {Boolean} 
     */
    AutoComplete.prototype.hasItem = function () {
        return this.$listItem && this.$listItem.length > 0;
    };

    /**
     * 移动到选择项
     * @param  {Number} step - 移动步数
     * @return {Void}    
     */
    AutoComplete.prototype.moveSelect = function (step) {
        if (!this.hasItem()) { return; }
        this.active += step;
        if (this.active < 0) {
            this.active = this.$listItem.length - 1;
        } else if (this.active > this.$listItem.length - 1) {
            this.active = 0;
        }
        var $curItem = this.$listItem.removeClass('active').eq(this.active).addClass('active');
        var offset = 0;
        this.$listItem.each(function () {
            offset += this.offsetHeight;
        });

        var listScrollTop = this.$list.scrollTop(),
            clientHeight = this.$list[0].clientHeight,
            itemHeight = $curItem.height(),
            itemTop = $curItem.position().top;

        if (itemTop > clientHeight) {
            this.$list.scrollTop(itemTop + itemHeight - clientHeight + listScrollTop);
        } else if (itemTop < 0) {
            this.$list.scrollTop(listScrollTop + itemTop)
        }

    };

    /**
     * 选择项
     * @return {Void} 
     */
    AutoComplete.prototype.select = function () {
        var $item = this.$listBox.find('li.active'),
            index = $item.attr('data-index'),
            text = $item.attr('data-text'),
            value = $item.attr('data-value'),
            inputVal = this.$element.val(),
            startStr, endStr, newStr;


        if (this.options.useAt) {
            startStr = inputVal.substr(0, this.atStartIndex + 1);
            endStr = inputVal.substr(this.atLastIndex + 1);
            newStr = startStr + text + endStr + this.options.atSpace;
            this.$element.val(newStr);
        } else {
            this.$element.val(text);
        }

        this.$bindElement.val(value);
        this.hide();

        if ($.isFunction(this.options.callback.setValue)) {
            var item = this.getItem(text, index);
            this.options.callback.setValue.call(this, item);
        }
    };

    //根据值获取数据项
    AutoComplete.prototype.getItem = function (value, index) {
        var data = this.cacheData;
        if (!data || data.length === 0) { return; }

        if (index) {
            return data[index];
        }

        for (var i = 0, formatted, text; i < data.length; i++) {
            formatted = this.options.formatItem(data[i]);
            if (typeof formatted !== 'object') {
                text = formatted.toString();
            } else {
                text = formatted.text;
            }
            if (value == text) {
                return data[i];
            }
        }
        return null;
    };


    return function ($elms, options) {
        $elms = $elms || $('input[data-module="autocomplete"]');
        $elms.each(function () {
            var $el = $(this),
                settings = $el.attr('data-options'),
                obj = $.data($el[0], 'autocomplete');

            if (!obj) {
                if (!options && settings && settings.length > 0) {
                    options = eval('(0,' + settings + ')');
                }
                obj = new AutoComplete($el, options);
                $.data($el[0], 'autocomplete', obj);
            }
        });
    };

});

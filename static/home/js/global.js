/**
 * 提供全局可调用的函数
 * @author linjianwei
 */
// 防抖
function debounce(func, wait) {
    var timeout;
    return function () {
        var context = this;
        var args = arguments;

        if (timeout) clearTimeout(timeout);

        timeout = setTimeout(function () {
            func.apply(context, args)
        }, wait);
    }
}
// 收藏
function f_collect() {
    alert("抱歉，您所使用的浏览器无法完成此操作。\n\n加入收藏失败，请使用Ctrl+D进行添加");
}
var copyTextToClipboard = function(text) {
    if (navigator.clipboard) {
        copyTextToClipboard = function(text) {
            try {
                navigator.clipboard.writeText(text);
                console.log('Text copied to clipboard');
            } catch (err) {
                console.error('Failed to copy: ', err);
            }
        }
    } else {
        copyTextToClipboard = function(text) {
            var textArea = document.createElement("textarea");
            textArea.value = text;
            document.body.prepend(textArea);
            textArea.focus();
            textArea.select();
            try {
                var successful = document.execCommand('copy');
                var msg = successful ? 'successful' : 'unsuccessful';
                console.log('Copying text command was ' + msg);
            } catch (err) {
                console.error('Unable to copy text', err);
            }
            document.body.removeChild(textArea);
        }
    }
    copyTextToClipboard(text)
}
// 分享
function f_share() {
    // console.log(this);
    // window.prompt("请复制以下链接给你的好友吧", location.href)
    copyTextToClipboard(location.href)
    alert('当前网址已经复制到剪切板了，可以粘贴分享给您的好友啦！')
}
// 回到顶部
function moveTop(e) {
    e && e.preventDefault()
    $("html,body").animate({
        scrollTop: "0px"
    }, 500)
}
// 置顶按钮，动态显示
function toggleTopButton() {
    var toggle = function() {
        if ($(document).scrollTop() > $(window).height() / 2) {
            $('.js-top').fadeIn()
        } else {
            $('.js-top').fadeOut()
        }
    }
    toggle()
    $(document).scroll(function() {
        toggle()
    })
}
// 自定义下拉选择列表
function customSelect(options) {
    var el = $(options.el);
    var callBack = options.onChange;
    // 下拉
    el.find('.c-select__hd').on('click', function(){
        var $p = $(this).parent()
        $p.toggleClass('show')
        $('.c-select').each(function(i, e) {
            if (!$(e).is($p)) {
                $(e).removeClass('show')
            }
        })
    })
    el.find('.c-select__option').on('click', function() {
        var val = $(this).data('value')
        var $input = $(this).parents('.c-select').find('input')
        $input.val(val).attr('value', val)
        var $span = $(this).parent().siblings('.c-select__hd').find('span')
        $span.text($(this).text())
        if (val) {
            $span.addClass('has-value')
        } else {
            $span.removeClass('has-value')
        }
        $(this).parents('.c-select').removeClass('show')
        $(this).addClass('on').siblings().removeClass('on')
        if (typeof callBack == 'function') {
            callBack({
                name: $input.attr('name'),
                value: val
            })
        }
    })
    // 点击空白收起
    $(document).on('click', function (e) {
        if ($(e.target).closest('.c-select').length == 0) {
            $('.c-select').removeClass('show')
        }
    })
}
// 图片加载完成
function getSize(el) {
    el.setAttribute('w', el.naturalWidth);
    el.setAttribute('h', el.naturalHeight);
}
// 加载图片
function loadImg(){
    // 懒加载
    function isShow(el) {
        var pos = $(el).offset().top - $(document).scrollTop()
        var winH = $(window).height();
        if (pos < winH) {
            return true
        } else {
            return false
        }
    }
    $('[data-src]').each(function(i, e) {
        var visible = false
        if ($(e).hasClass('swiper-lazy')) { // 忽略swiper要处理的懒加载
            return;
        }
        if ($(e).is(':hidden')) {
            if ($(e).parent().is(':visible')) {
                visible = isShow($(e).parent())
            }
        } else {
            visible = isShow(e)
        }
        if (visible) {
            // $(e).addClass('loaded')
            var src = encodeURI($(e).data('src').trim())
            src = src.replace(/\(/g, "%28");
            src = src.replace(/\)/g, "%29");
            if ($(e).is('img')) {
                $(e).attr('src', src)
            } else {
                $(e).css('background-image', 'url("'+ src +'")')
            }
        }
    })
}
// 元素进场 (Apple-style scroll animations with staggered delays)
function loadElement() {
    $('[data-ani]:not(.ani)').each(function(i, e) {
        if ($(e).offset().top - $(document).scrollTop() <= $(window).height() * 0.85) {
            var $siblings = $(e).parent().children('[data-ani]:not(.ani)');
            var idx = $siblings.index(e);
            if (idx > 0) {
                $(e).css('animation-delay', (idx * 0.06) + 's');
            }
            $(e).addClass('ani');
            $(e).on('animationend', function() {
                $(e).removeAttr('data-ani').removeClass('ani').css('animation-delay', '');
            });
        }
    });
}
// 初始化swiper-slide,一列num个
function f_initSlide(selector, num, pClass){
    try{
        num = Number(num);
    } catch(err){
        return;
    }
    if (!selector) {
        return;
    }
    var classNum = 0;
    var count = 0;
    var $container = $(selector).parent()
    $(selector).each(function(i, e){
        count++;
        if(count > num){
            classNum++;
            count = 1;
        }
        $(e).addClass('col-' + classNum);
    })
    var classList = []
    if (pClass) {
        classList = pClass.split(' ').map(function(el) {
            return el.split('.').join(' ')
        })
    } else {
        classList = ['swiper-slide']
    }
    for (var i = 0; i <= classNum; i++) {
        var $list = $container.find('.col-' + i)
        for (var j = 0; j < classList.length; j++) {
            var name = classList[j]
            var _html = '<div class="' + name + '"></div>'
            $list = $list.wrapAll(_html)
        }
    }
}
// 链接点击，其他页面就直接跳转了，故不判断链接是否当前页面
function hashScroll(selector) {
    $(selector).on('click', function(e) {
        $('.md-header').removeClass('open');
        $('body').removeClass('noscroll');
        // 链接地址
        var targetUrl = $(this).attr('href')
        // 非外链
        if (targetUrl.indexOf('http') == -1) {
            // 获取hash
            let id = targetUrl.split('#')[1]
            moveToEle(id)
        }
    })
}
// 获取当前url的hash
function getUrlHash() {
    return location.hash.split('?')[0].slice(1)
}
// 初始化页面显示位置
function moveToHash() {
    moveToEle(getUrlHash())
}
function moveToEle(hash, dur) {
    if (dur === undefined) {
        dur = 500
    }
    if (hash) {
        var dom = $('#' + hash)
        if (dom.length > 0) {
            var header_height = $('.md-header').outerHeight() || $('.header').outerHeight() || 0
            var _top = dom.offset().top - header_height
            $("html,body").stop(true).animate({
                scrollTop: _top
            }, dur)
        }
    }
}
function moveToElement(el, offsetTop) {
    if (el) {
        var header_height = $('.md-header').outerHeight()
        var _top = $(el).offset().top - header_height
        $("html,body").animate({
            scrollTop: _top - offsetTop
        }, 500)
    }
}
// 获取头部高度
function getHeaderHeight() {
    return $('.md-header').outerHeight()
}
function formatNum(num) {
    let res = String(num)
    if (res.length < 2) {
        res = '0' + res
    }
    return res
}
function f_fixed(num) {
    if (num === '' || num === undefined || num === null) {
        return num
    }
    return num < 10 ? ('0' + num) : num
}
// 证书放大预览
function viewImgList(options){
    var $imgs = options.img
    var $clickItem = options.clickItem
    var gallery;
    var isLoadImg = false
    function view(num) {
        var pswpElement = document.querySelectorAll(".pswp")[0];
        var arr = [];
        $imgs.each(function () {
            var ele = {};
            var img = $(this);
            ele.src = img.attr("src");
            ele.w = parseInt(img.attr("w") || 370);
            ele.h = parseInt(img.attr("h") || 300);
            arr.push(ele);
        });
        var options = {
            index: num,
            shareEl: false,
            fullscreenEl: false,
        };
        gallery = new PhotoSwipe(
            pswpElement,
            PhotoSwipeUI_Default,
            arr,
            options
        );
        gallery.init();
    }
    function loadImg() {
        // 获取图片原始宽高
        $imgs.each(function (idx, item) {
            if (item.src) {
                var img = new Image();
                img.src = item.src;
                img.onload = function () {
                    $(item).attr({
                        w: img.width,
                        h: img.height,
                    });
                };
            } else { // 懒加载
                item.onload = function() {
                    getSize(item)
                }
            }
        });
    }
    loadImg();
    $clickItem.on(
        "click",
        function (e) {
            e.preventDefault()
            // if (!isLoadImg) {
            //     isLoadImg = true
            //     loadImg()
            // }
            view($(this).index());
        }
    );
}
$.fn.toggleClassOn = function () {
    $(this).addClass('on').siblings().removeClass('on')
}
function isFirefox() {
    var res = navigator.userAgent.indexOf('Firefox') != -1
    return res
}

// 播放视频
function playVideo(e) {
    e.preventDefault();
    e.stopPropagation();
    var $el = $(e.currentTarget);
    var src = $el.attr('href') || $el.data('src');
    $(".c-video").addClass("show");
    if (src.indexOf(".mp4") != -1) {
        $(".c-video__video").attr("src", src).css("display", "block").get(0).play()
        $(".c-video__iframe").hide()
    } else {
        if (src.indexOf('<iframe') != -1) {
            src = $(src).attr('src')
        }
        $(".c-video__iframe").attr("src", src).css("display", "block")
        $(".c-video__video").hide()
    }
}

// 弹窗
function openDialog(id) {
    $(id).addClass('show')
    var $form = $(id).find('form')
    if ($form.length > 0) {
        $form.get(0).reset()
    }
}
$(document).on('click', '.m-pop .close, .m-pop .mask', function(e) {
    $(e.target).parents('.m-pop').removeClass('show')
})


/**
 * 封装轮播函数，处理自动播放以及懒加载
 * @param {Element} el swiper-container
 * @param {Object} opt swiper option
 * @returns 
 */
function mySwiper(el, opt) {
    var s = new Swiper(el, {
        // 响应显示隐藏
        observer: true,
        observeParents: true,
        ...opt,
        onInit: function(swiper) {
            swiper.stopAutoplay();
        }
    });
    function handleScroll() {
        if ($(el).offset().top - $(document).scrollTop() < $(window).height()) {
            if (s && s.params) {
                s.params.lazyLoading = true;
                s.params.lazyLoadingInPrevNext = true;
                s.lazy.load();
                s.startAutoplay();
            }
        }
    }
    handleScroll();
    $(document).scroll(handleScroll);
    return s;
}
/**
 * 加载指定容器内的图片
 * @param {*} el 指定容器，css选择器 | jq Element | Element
 * @param {*} attrName 默认 data-src
 */
function loadImgOf(el, attrName) {
    if (!attrName) {
        attrName = 'data-src';
    }
    $(el).find('[' + attrName + ']').each(function(i, e) {
        var src = encodeURI($(e).attr(attrName));
        if ($(e).is('img')) {
            $(e).attr('src', src)
        } else {
            $(e).css('background-image', 'url('+ src +')')
        }
        $(e).removeAttr(attrName)
    })
}


// ===== Smart Sticky Header: hides on scroll-down, shows on scroll-up =====
function initSmartHeader() {
    var header = document.querySelector('.md-header');
    if (!header) return;
    if (window.innerWidth <= 1100) return;
    var lastScrollY = window.scrollY;
    var ticking = false;
    header.style.transition = 'transform 0.4s var(--ease-apple)';

    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(function() {
                var currentScrollY = window.scrollY;
                var headerHeight = header.offsetHeight;
                if (currentScrollY <= headerHeight) {
                    header.style.transform = 'translateY(0)';
                } else if (currentScrollY > lastScrollY + 5) {
                    header.style.transform = 'translateY(-' + (headerHeight + 5) + 'px)';
                } else if (currentScrollY < lastScrollY - 5) {
                    header.style.transform = 'translateY(0)';
                }
                lastScrollY = currentScrollY;
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

// ===== IntersectionObserver: lazy loading + scroll animations =====
function initIntersectionObserver() {
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Lazy load images via IntersectionObserver
    var imgObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                var el = entry.target;
                var raw = el.getAttribute('data-src');
                if (raw) {
                    var src = raw.trim();
                    src = src.replace(/\(/g, "%28");
                    src = src.replace(/\)/g, "%29");
                    if (el.tagName === 'IMG') {
                        el.addEventListener('load', function() {
                            el.classList.add('is-loaded');
                        }, { once: true });
                        el.addEventListener('error', function() {
                            el.classList.add('is-loaded', 'is-load-error');
                        }, { once: true });
                        el.src = src;
                    } else {
                        el.style.backgroundImage = 'url("' + src + '")';
                    }
                }
                el.removeAttribute('data-src');
                imgObserver.unobserve(el);
            }
        });
    }, { rootMargin: '600px 0px' });

    document.querySelectorAll('[data-src]').forEach(function(el) {
        if (el.classList.contains('swiper-lazy')) return;
        if (el.tagName === 'IMG' && el.src) return;
        if (el.tagName === 'IMG') {
            el.classList.add('lazy-media');
        }
        imgObserver.observe(el);
    });

    // Scroll animations
    if (!prefersReducedMotion) {
        var aniObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    var el = entry.target;
                    var siblings = el.parentNode.querySelectorAll('[data-ani]:not(.ani)');
                    var idx = Array.prototype.indexOf.call(siblings, el);
                    if (idx > 0) {
                        el.style.animationDelay = (idx * 0.06) + 's';
                    }
                    el.classList.add('ani');
                    el.addEventListener('animationend', function() {
                        el.removeAttribute('data-ani');
                        el.classList.remove('ani');
                        el.style.animationDelay = '';
                    }, { once: true });
                    aniObserver.unobserve(el);
                }
            });
        }, { rootMargin: '0px 0px -50px 0px', threshold: 0.1 });

        document.querySelectorAll('[data-ani]:not(.ani)').forEach(function(el) {
            aniObserver.observe(el);
        });
    } else {
        document.querySelectorAll('[data-ani]').forEach(function(el) {
            el.removeAttribute('data-ani');
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
    }
}

// ===== Initialize all modern features =====
document.addEventListener('DOMContentLoaded', function() {
    initSmartHeader();
    initIntersectionObserver();
});

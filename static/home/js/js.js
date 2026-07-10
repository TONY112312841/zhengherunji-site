$(document).ready(function () {
    // ---------------------------------------------------------------------
    // 视频 — 委托给 global.js 的 playVideo()
    // ---------------------------------------------------------------------
    $(".js-video").click(function (e) {
        playVideo(e);
    })
    //关闭视频
    $(".c-video__close").click(function () {
        $(".c-video").removeClass("show")
        $(".c-video__video")[0].pause()
        $(".c-video__iframe").attr("src", "")
    })

    
    // ---------------------------------------------------------------------
    // 搜索
    // ---------------------------------------------------------------------
    $('.md-header .h-search').on('click', function() {
        $('.md-search').addClass('show')
        setTimeout(function(){
            $('.md-search .ipt').focus()
        }, 100)
    })
    $('.md-search .mask').on('click', function() {
        $('.md-search').removeClass('show')
    })
    
    
    // ---------------------------------------------------------------------
    // 头部
    // ---------------------------------------------------------------------
    function handleHeader() {
        var h = $('.md-header').outerHeight() || $('.header').outerHeight() || 0;
        $('body').css('padding-top', h);
    }
    handleHeader();
    $(document).scroll(handleHeader);
    $(window).resize(handleHeader);
    window.onload = function() {
        setTimeout(function() {
            moveToHash();
        }, 500)
    }

    // ---------------------------------------------------------------------
    // 导航
    // ---------------------------------------------------------------------
    // 弹窗导航
    $('.nav-btn').on('click', function () {
        $('.md-header').toggleClass('open');
        var isOpen = $('.md-header').hasClass('open');
        $(this).attr({
            'aria-expanded': isOpen ? 'true' : 'false',
            'aria-label': isOpen ? 'Close navigation' : 'Open navigation'
        });
        if (isOpen) {
            $('body').addClass('noscroll');
            // 移动端注入联系方式
            var $nav = $('.md-header .nav');
            if ($nav.find('.nav-contact-mobile').length === 0) {
                $nav.find('.logo-tx').after(
                    '<div class="nav-contact-mobile" style="padding:10px 15px;border-bottom:1px dashed rgba(0,0,0,.2);margin-bottom:8px;">' +
                    '<a href="mailto:zhengherunji@gmail.com" style="display:block;padding:6px 0;color:#333;text-decoration:none;font-size:14px;">Email: zhengherunji@gmail.com</a>' +
                    '<a href="tel:+13802389591" style="display:block;padding:6px 0;color:#333;text-decoration:none;font-size:14px;">Phone: +1(380)238-9591</a>' +
                    '</div>'
                );
            }
        } else {
            $('body').removeClass('noscroll')
        }
    });
    // 手机展示二级导航
    $('.md-header').on('click', '.mbtn', function (e) {
        $(this).parents('.li1').toggleClass('show').siblings().removeClass('show')
    })
    // 蒙版点击收起导航
    $('.md-header .mask').on('click', function () {
        $('.md-header').removeClass('open');
        $('.nav-btn').attr({
            'aria-expanded': 'false',
            'aria-label': 'Open navigation'
        });
        $('body').removeClass('noscroll')
    })

    
    // ---------------------------------------------------------------------
    // 底部
    // ---------------------------------------------------------------------
    // 友情链接
    customSelect({
        el: '.md-footer .friend-link'
    })


    // ---------------------------------------------------------------------
    // 内页二级导航
    // ---------------------------------------------------------------------
    var navLen = $('.md-subnav .swiper-slide').length;
    if (navLen > 0) {
        var swiper_nav = new Swiper('.md-subnav .swiper-container', {
            slidesPerView: navLen,
            observer: true,
            observeParents: true,
            initialSlide: $('.md-subnav .swiper-slide.on').index(),
            breakpoints: {
                900: {
                    slidesPerView: 'auto',
                    spaceBetween: 20
                }
            }
        })
    }


    // 入场、图片懒加载 — 由 global.js 的 IntersectionObserver 统一处理


    // ---------------------------------------------------------------------
    // 锚链接跳转处理
    // ---------------------------------------------------------------------    
    hashScroll('.md-header .nav .a2')
    hashScroll('.md-footer .nav .a-2')
    hashScroll('.md-subnav a')
})

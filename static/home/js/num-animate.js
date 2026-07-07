// 数字累加
function f_num(selector, dura) {
    function getHtml(str) {
        var reg = /[\d\.]+/g;
        var arr = [];
        var res = reg.exec(str);
        while(res) {
            arr.push([res.index, res.index + res[0].length])
            res = reg.exec(str);
        }
        for (let i = 0; i < arr.length; i++) {
            if (i == 0 && arr[i][0] != 0) {
                arr.unshift([0, arr[i][0]])
                continue;
            }
            if (
                i != arr.length - 1 &&
                arr[i][1] != arr[i+1][0]
            ) {
                arr.splice(i+1, 0, [arr[i][1], arr[i+1][0]])
                i++;
            }
        }
        if (arr.length == 0) {
            arr.push([0, str.length])
        }
        if (arr[arr.length - 1][1] != str.length) {
            arr.push([arr[arr.length - 1][1], str.length])
        }
        
        var char = [];
        arr.forEach(item => {
            char.push(str.slice(item[0], item[1]));
        })
        var _html = '';
        char.forEach(el => {
            if (reg.test(el)) {
                _html += '<span data-num="' + parseFloat(el) + '">0</span>'
            } else {
                _html += el
            }
        })
        return _html;
    }
    $(selector).each(function(i, el) {
        var tx = $(el).text()
        $(el).html(getHtml(tx));
    })
    var obj = {
        ele: $(selector),
        play: function() {
            this.ele.each(function(i, el) {
                if ($(el).data('done')) {
                    return;
                }
                $(el).data('done', true);
                $(el).find('span').each(function(ii, ee) {
                    change(ee)
                })
            })
        }
    }
    listen();
    function listen() {
        $(selector).each(function (i, el) {
            if ($(el).data('done')) {
                return;
            }
            if ($(el).offset().top - $(document).scrollTop() < $(window).height()) {
                $(el).data('done', true);
                $(el).find('span').each(function(ii, ee) {
                    change(ee)
                })
            }
        })
    }
    function change(el) {
        var value = $(el).attr('data-num')
        if (value) {
            // 不是数字
            if (isNaN(Number(value))) {
                $(el).text(value);
                return;
            } else {
                value = Number(value);
            }
            var valNow = 0;
            var timer = '';
            var duration = dura || 1500;
            var speed = 0;
            if (value <= duration) {
                speed = Math.ceil(duration / value)
            }
            if (speed < 50) {
                speed = 50
            }
            var num = Math.floor(duration / speed);
            if (num > value) {
                num = value;
            }
            var add = parseInt(value / num);
            var i = 0;
            timer = setInterval(function () {
                if (i >= num) {
                    $(el).html(value);
                    clearInterval(timer)
                } else {
                    valNow += add;
                    $(el).html(valNow);
                    i++;
                }
            }, speed)
        }
    }
    $(document).on('scroll', debounce(listen, 100))
    // $(window).on('scroll', listen)
    return obj;
}
"use strict"

module.exports = {
    "button": [{
        "type": "view",
        "name": "园区详情",
        "url": "http://220.170.155.240:9619/zltzt/sample/page.html?&id=Z130"
    }, {
        "name": "报警日志",
        "sub_button": [{
            "name": "今日日志",
            "type": "click",
            "key": "alarmlog"
        }, {
            "name": "昨日top10",
            "type": "click",
            "key": "alarmlog10"
        }]
    }, {
        "name": "攻略",
        "sub_button": [{
            "type": "click",
            "name": "指令列表",
            "key": "dictatelist"
        }, {
            "type": "click",
            "name": "关于",
            "key": "about"
        }]
    }]
}
"use strict"

var config = require("../config/config")
var Wechat = require("../wechat/wechat")
var csw = require("../csw/csw")
var menu = require("./menu")
var moment = require("moment-timezone")
var rule = require("../csw/rule")
var util = require("util")
const logUtil = require("../utils/log4js/log_utils")
moment.tz.setDefault("Asia/Shanghai")
var keywords = rule.keyword //指令数组

var Reply = {

    reply: async function() {
        var wechatApi = new Wechat(config.wechat)
        var message = this.weixin
        var reply = config.greetings
        if (message.MsgType === "event") {
            if (message.Event === "subscribe") {
                if (message.EventKey) {
                    // console.log("扫二维码进来：" + message.EventKey + " " + message.Ticket)
                }
                logUtil.writeInfo(message.FromUserName + "  事件——关注公众号")
                reply = `${config.greetings}\n请点击菜单栏中：攻略-->指令列表获取当前已支持指令`

            } else if (message.Event === "CLICK") {
                switch (message.EventKey) {
                    case "_alarmlog":
                        logUtil.writeInfo(message.FromUserName + "  菜单——今日告警记录图文")
                        var picData = await wechatApi.uploadMaterial("pic", __dirname + "/2.jpg", {}) //获取url地址 不受素材数目的限制
                        logUtil.writeInfo("上传图文：" + JSON.stringify(picData))
                        reply = picData
                        var news = []
                        news.push({
                            title: "今日告警",
                            description: "查看今日有什么报警",
                            picUrl: picData.url,
                            url: this.origin + "/logs",
                        })
                        reply = news
                        break
                    case "alarmlog":
                        logUtil.writeInfo(message.FromUserName + "  菜单_今日告警记录")
                        var from = moment().format("YYYYMMDD")
                        var end = moment().add(1, "days").format("YYYYMMDD")
                        var logvalue = await csw.getalarmlog(from, end, 1, 1000)
                        reply = "今日告警如下："
                            // Object.prototype.toString.call(logvalue) === "[object Array]"
                        if (util.isArray(logvalue)) {
                            logvalue.forEach(function(item) {
                                reply += "\n" + item.time + " " + item.msg + " " + item.status
                            })
                        } else {
                            reply = "查询无果:" + logvalue
                        }
                        break
                    case "alarmlog10":
                        logUtil.writeInfo(message.FromUserName + "  菜单_昨日告警统计top10")
                        var from_ = moment().add(-1, "days").format("YYYYMMDD")
                        var end_ = moment().format("YYYYMMDD")
                        var logvalue_ = await csw.getalarmlog(from_, end_, 0, 10)
                        reply = "昨日告警top10如下："
                        if (util.isArray(logvalue_)) {
                            logvalue_.forEach(function(item) {
                                reply += "\n" + item.deviceName + " " + item.count + "次"
                            })
                        } else {
                            reply = "查询无果:" + logvalue_
                        }
                        break
                    case "dictatelist":
                        reply = "现支持如下指令："
                        keywords.forEach(function(item, index) {
                            reply += "\n【" + index + "】" + item + " (" + rule.data[item].remark + ")"
                        })
                        break
                    case "about":
                        reply = config.greetings
                        break
                    default:
                        break
                }
            } else if (message.Event === "LOCATION") {
                reply = "定位"
            } else if (message.Event === "unsubscribe") {
                logUtil.writeInfo(message.FromUserName + "  事件——取消公众号")
                reply = "取消关注"
            } else if (message.Event === "MASSSENDJOBFINISH") {
                logUtil.writeInfo("事件——群发结果事件" + JSON.stringify(message))
                reply = ""
            } else if (message.Event === "TEMPLATESENDJOBFINISH") {
                // logUtil.writeInfo("事件——模板结果事件" + JSON.stringify(message))
                logUtil.writeInfo("事件——模板发送结果事件  【" + message.FromUserName + "】结果：" + message.Status)
                reply = ""
            } else {
                logUtil.writeInfo(message.FromUserName + "  事件——无效事件")
                reply = "无效事件"
            }

        } else if (message.MsgType === "text") {
            var content = message.Content
            logUtil.writeInfo(message.FromUserName + "  文本——" + content)
            var order = content.substring(0, 1)
            switch (order) {
                case "#":
                    var r = /^\+?[1-9][0-9]*$/ //正整数 
                    var v = []
                    var num = content.substring(1)
                    if (r.test(num)) {
                        v.push("V_" + num)
                        var lists = "查询结果："
                        var items = await csw.getvarvalue(v)
                        if (items.length === 0) {
                            lists = "查无此变量"
                        }
                        items.forEach(function(item) {
                            lists += "\n" + item.varid + " : " + item.value
                        })
                        reply = lists
                    } else {
                        reply = "该 " + content + " 指令非法\n"
                        keywords.forEach(function(item, index) {
                            reply += "\n【" + index + "】" + item
                        })
                    }
                    break
                case "$":
                    logUtil.writeInfo(message.FromUserName + "  事件查看自身标签")
                    reply = await wechatApi.fetchUserTag(message.FromUserName)
                    reply = JSON.stringify(reply)
                    break
                case "m":
                    logUtil.writeInfo(message.FromUserName + "  重置菜单")
                    var del = await wechatApi.deleteMenu()
                    if (del.errmsg === "ok") {
                        del = await wechatApi.createMenu(JSON.stringify(menu))
                        if (del.errmsg === "ok") {
                            reply = "重置菜单成功"
                        } else {
                            reply = "写入失败：" + del.errmsg + del.errcode
                        }
                    } else {
                        reply = "重置失败" + del.errmsg + del.errcode
                    }
                    break
                case "a":
                    //上传永久图片素材
                    var picData_ = await wechatApi.uploadMaterial("image", __dirname + "/2.jpg", { type: "image" })
                    var meida = {
                        "articles": [{
                            "title": "测试图文",
                            "thumb_media_id": picData_.media_id,
                            "author": "Scott",
                            "digest": "摘要没没写",
                            "show_cover_pic": 0,
                            "content": "未完待续",
                            "content_source_url": "https://www.github.com"
                        }]
                    }

                    //上传永久图文素材
                    var data = await wechatApi.uploadMaterial("news", meida, {})
                    data = await wechatApi.fetchMaterial(data.media_id, "news", {})
                    var items_ = data.news_item
                    var news_ = []
                    items_.forEach(function(item) {
                        news_.push({
                            title: item.title,
                            description: item.digest,
                            picUrl: item.thumb_url,
                            url: item.url,
                        })
                    })
                    reply = news
                    break
                case "b":
                    var picData__ = await wechatApi.uploadMaterial("pic", __dirname + "/2.jpg", {}) //获取url地址 不受素材数目的限制
                    var news__ = []
                    news.push({
                        title: "今日告警",
                        description: "查看今日有什么报警",
                        picUrl: picData__.url,
                        url: this.origin + "/logs",
                    })
                    reply = news__
                    break
                default:
                    reply = await Reply.carryout(content, message.FromUserName) //模糊指令
                    break
            }
        } else if (message.MsgType === "voice") {
            var say = message.Recognition
            logUtil.writeInfo(message.FromUserName + "  语音输入——【" + say + "】")
            if (say.length > 0) {
                reply = (await Reply.carryout(say, message.FromUserName))
            } else {
                reply = "未识别到信息!!!\n请确保语音输入有效.请重试"
            }

        } else {
            reply = "抱歉！ 未添加该类型的回复策略"
        }
        this.body = reply
    },


    /**
     * 匹配指令
     * 
     * @param {String} val 
     * @returns 
     */
    matching: function(val) {
        var result = {
            state: 0,
            val: ""
        }

        for (var i = 0; i < keywords.length; i++) {
            if (val.indexOf(keywords[i]) >= 0) {
                result = {
                    state: 1,
                    val: keywords[i]
                }
                break
            }
        }
        return result
    },

    /**核实用户权限
     * 
     * @param {Array} items 权限组
     * @param {String} val  用户
     * @returns 
     */
    _matching_id: function(items, val) {
        var result = false
        for (var i = 0; i < items.length; i++) {
            if (items[i] === val) {
                result = true
                break
            }
        }
        return result
    },

    /**
     * 
     * 
     * @param {any} _msg  指令
     * @param {any} Uid   用户ID
     * @returns 
     * */
    _command: async function(_msg, Uid) {
        var cswdic = Reply.matching(_msg)
        if (cswdic.state === 1) {
            var policy = rule.data[cswdic.val]
            if (policy.check) {
                if (!Reply._matching_id(policy.openid, Uid)) {
                    return {
                        state: 101,
                        msg: "抱歉！ 您没有执行这条指令的权限"
                    }
                }
            }
            var msg_ = await policy.event()
            try {
                if (msg_ === "ok") {
                    msg_ = "指令已送达"
                    return {
                        state: 1,
                        val: cswdic.val,
                        msg: msg_
                    }
                } else {
                    msg_ = JSON.parse(msg_)
                    if (Object.prototype.toString.call(msg_) === "[object Array]" && msg_.length > 0) {
                        return {
                            state: 2,
                            val: cswdic.val,
                            msg: msg_
                        }
                    } else {
                        return {
                            state: 0,
                            val: cswdic.val,
                            msg: msg_
                        }
                    }
                }
            } catch (error) {
                return {
                    state: 0,
                    val: cswdic.val,
                    msg: msg_
                }
            }

        } else {
            return {
                state: 100,
                msg: "抱歉！ 我无法识别您的指令且不能完成"
            }
        }
    },


    /**处理指令
     * 
     * @param {*} params 
     */
    carryout: async function(order, userid) {
        var res = {
            state: 0,
            msg: ""
        }
        order = keywords[order] || order
        res = await Reply._command(order, userid)
        var result = ""
        if (res.state === 1) { //执行完成
            result = res.val + ":\n" + res.msg
        }
        if (res.state === 2) {
            result = res.val + ":"
            res.msg.forEach(function(item) {
                var dic = []
                var val = item.remark.split(";")
                val.forEach(function(item) {
                    var _v = item.split("=")
                    dic[_v[0]] = _v[1]
                })
                if (dic[item.value] != null || typeof(dic[item.value]) != "undefined") {
                    result += "\n" + item.varid + " " + dic[item.value]
                } else {
                    result += "\n" + item.varid + " 【" + item.value + "】 \t\t" + item.remark
                }

            })

        } else if (res.state === 101) { //权限不足
            result = res.msg
        } else if (res.state === 100) { //未识别指令
            result = "【" + order + "】\n" + res.msg
        } else if (res.state === 0) { //返回结果未识别
            result = res.msg
        } else { //非法指令
        }

        return result
    }
}
module.exports = Reply
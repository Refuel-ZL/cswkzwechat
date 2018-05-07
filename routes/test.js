"use strict"

const router = require("koa-router")()
var Wechat = require("../wechat/wechat")
var config = require("../config/config")
var request = require("request")
var cswapi = require("../csw/csw")
var moment = require("moment-timezone")
var urlencode = require("urlencode")
var reply = require("../wx/reply")
var CryptoJS = require("crypto-js")
const logUtil = require("../utils/log4js/log_utils")

moment.tz.setDefault("Asia/Shanghai")

router.prefix("/test")

var wechatApi = new Wechat(config.wechat)

router.get("/getmold/:val", async function(ctx, next) { //获取素材列表
    // ctx.body = "this is a users response!"
    var val = ctx.params.val
    var form = {
        "type": val,
        "offset": 0,
        "count": 20
    }
    ctx.body = await wechatApi.batchMaterial(form)
    await next()
})

router.get("/clear", async function(ctx, next) { //清零api调用次数 

    var data = await wechatApi.fetchAccessToken()
    var options = {
        url: "https://api.weixin.qq.com/cgi-bin/clear_quota?access_token=" + data.access_token,
        method: "POST",
        JSON: true,
        body: JSON.stringify({
            appid: config.wechat.appID
        })
    }
    var reply = ""
    await request(options, (err, res, body) => {
        if (err) {
            reply = err
            return
        }
        reply = body
    })
    ctx.body = reply
    await next()
})

router.get("/getcount", async function(ctx, next) {
    ctx.body = await wechatApi.countMaterial()
    await next()
})

router.get("/sendAll", async function(ctx, next) {
    var tag_id = 100
    var val = {
        // type: "image",
        // media_id: "e-kE-1ewjSyqA-TY46BTLnMkDBEdrWZUtP1UkZpD9Jg"
        type: "text",
        content: "群发测试文本11111",
    }
    ctx.body = await wechatApi.sendAll(tag_id, val)
    await next()
})

router.get("/getstatus/:id", async(ctx, next) => {
    ctx.body = await wechatApi.getSendStatus(ctx.params.id)
    await next()
})

router.get("/aaaa", async(ctx, next) => {
    ctx.body = await cswapi.setvarvalue()
    await next()
})

router.get("/template", async(ctx, next) => {
    ctx.body = await wechatApi.Getallprivatetemplate()
    await next()
})

router.all("/index.html", async(ctx, next) => {
    // var url = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx8b36bc2fdec5c52b&redirect_uri=http%3a%2f%2frefuel.tunnel.echomod.cn%2ftest%2fdemo&response_type=code&scope=snsapi_base&state=123#wechat_redirect "

    try {
        var order = ctx.query.order
        if (!order) {
            ctx.body = "非法访问"
            return
        }
        order = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf16.parse(order))
        if (order.length > 128) {
            ctx.body = "命令非法"
            return
        }
        var params = {
            url: urlencode("http://refuel.tunnel.echomod.cn/test/demo"),
            scope: "snsapi_base" || "snsapi_userinfo",
            param: order
        }
        var url = config.host
        url = await wechatApi.fetchcode(params)
        ctx.redirect(url) //重定向
    } catch (error) {
        ctx.body = "指令错误"
        logUtil.writeErr("传指令参数", error)
        return
    }




})
router.all("/demo", async(ctx, next) => {
    try {
        var code = ctx.query.code
        var state = ctx.query.state
        var params = {
            code: code
        }
        state = CryptoJS.enc.Utf16.stringify(CryptoJS.enc.Base64.parse(state))
        var data = JSON.parse(await wechatApi.fetchwebaccess_token(params))
        let res = await reply.carryout(state, data.openid) /**指令，apenid */
        ctx.body = res
        logUtil.writeInfo(`【${data.openid}】 执行${state} 返回值${res}`)
    } catch (error) {
        ctx.body = "指令缺损"
        logUtil.writeErr("解析指令异常", error)
    }
})

module.exports = router
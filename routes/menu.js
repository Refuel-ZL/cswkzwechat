"use strict"

const router = require("koa-router")()
var Wechat = require("../wechat/wechat")
var config = require("../config/config")
var menu = require("../wx/menu")


router.prefix("/menu")

var wechatApi = new Wechat(config.wechat)
router.get("/", async function(ctx, next) {
    ctx.body = await wechatApi.getMenu()
    await next()
})
router.get("/reset", async function(ctx, next) {
    // ctx.body = await wechatApi.fetchUserTag(ctx.params.id)
    var reply = ""
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
    ctx.body = reply
    await next()
})
module.exports = router
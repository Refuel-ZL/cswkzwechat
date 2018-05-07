"use strict"
const router = require("koa-router")()
var Wechat = require("../wechat/wechat")
var config = require("../config/config")
router.prefix("/users")

var wechatApi = new Wechat(config.wechat)

router.get("/", async function(ctx, next) {
    // ctx.body = "this is a users response!"
    ctx.body = await wechatApi.getUsers("oKE7GwjF8RScFBw-n5X6159I-UBM")
})


router.get("/fetch/:id", async function(ctx, next) {
    ctx.body = await wechatApi.fetchUserTag(ctx.params.id)
})

router.get("/getinfo/:id", async function(ctx, next) {
    var params = {
        openid: ctx.params.id
    }
    ctx.body = await wechatApi.getUserInfo(params)
})

router.all("/getinfos", async function(ctx, next) {
    var list = ctx.request.body.list || ctx.query.list
    list = JSON.parse(list) || ["oKE7Gwjm79IFB9rppHt_6RbEWdX0", "oKE7Gwt58KL2mBAFLLWpP1YGFyoo"]
    var user_list = []
    for (var i in list) {
        user_list.push({
            openid: list[i],
            "lang": "zh_CN"
        })
    }
    ctx.body = await wechatApi.getUsersInfo(user_list)
})



router.get("/settag/:openid", async function(ctx, next) {
    var openidlist = [ctx.params.openid]
    ctx.body = await wechatApi.taggingUsersTag(100, openidlist)
})
router.get("/untag/:openid", async function(ctx, next) {
    var openidlist = [ctx.params.openid]
    ctx.body = await wechatApi.untaggingUsersTag(100, openidlist)
})

module.exports = router
"use strict"

const router = require("koa-router")()
var Wechat = require("../wechat/wechat")
var config = require("../config/config")
router.prefix("/tags")

var wechatApi = new Wechat(config.wechat)
router.get("/", async function(ctx, next) {
    // ctx.body = "this is a users response!"
    ctx.body = await wechatApi.getTags()
    await next()
})

/**查询某个用户所有标签
 * 
 */

router.get("/fetch/:id", async function(ctx, next) {
    ctx.body = await wechatApi.fetchUserTag(ctx.params.id)
    await next()
})

/**
 * 创建标签
 */
router.get("/create/:name", async function(ctx, next) {
    ctx.body = await wechatApi.createTag(ctx.params.name)
    await next()
})

/**
 * 更新标签
 */
router.post("/update", async function(ctx, next) {
    /**GET  */
    // var tagid = ctx.query.tagid
    // var tagname = ctx.query.tagname
    /**Post */
    var tagid = ctx.request.body.tagid
    var tagname = ctx.request.body.tagname
    ctx.body = await wechatApi.updateTag(tagid, tagname)
    await next
})

/**删除标签 */
router.post("/delete", async(ctx, next) => {
    // var tagid = ctx.query.tagid
    var tagid = ctx.request.body.tagid
    ctx.body = await wechatApi.deleteTag(tagid)
    await next()
})

/**获取标签下粉丝 */
router.all("/getusers", async(ctx, next) => {
    var tagid = ctx.query.tagid || ctx.request.body.tagid
    ctx.body = await wechatApi.fetchTagUsers(tagid)
    await next
})


module.exports = router
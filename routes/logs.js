"use strict"

const router = require("koa-router")()

var csw = require("../csw/csw")
var moment = require("moment-timezone")
moment.tz.setDefault("Asia/Shanghai")
router.prefix("/logs")


router.get("/", async(ctx, next) => {
    var from = moment().format("YYYYMMDD")
    var end = moment().add(1, "days").format("YYYYMMDD")
    var lists = await csw.getalarmlog(from, end, 1, 1000)
    await ctx.render("logs", {
        title: "今日告警",
        logs: lists
    })
    await next()
})


module.exports = router
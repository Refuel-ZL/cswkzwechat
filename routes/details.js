"use strict"

const router = require("koa-router")()
var fsutil = require("../libs/util")
var moment = require("moment-timezone")

var path = require("path")
moment.tz.setDefault("Asia/Shanghai")

router.prefix("/details")

router.get("/prosum/:name", async(ctx, next) => {
    var name = ctx.params.name
    var data = JSON.parse(await fsutil.readFileAsync(path.join(__dirname, "../details/prosum", name)))
    data.T = moment.unix(data.start).format("YYYY-MM-DD HH:mm:ss") + "~" + moment.unix(data.end).format("YYYY-MM-DD HH:mm:ss")
    await ctx.render("details/prosum", {
        title: data.name,
        data: data
    })
})

router.get("/smsreport/:name", async(ctx, next) => {
    var name = ctx.params.name
    try {
        var data = JSON.parse(await fsutil.readFileAsync(path.join(__dirname, "../details/smsreport", name)))
        data.T = moment.unix(data.start).format("YYYY-MM-DD HH:mm:ss") + "~" + moment.unix(data.end).format("YYYY-MM-DD HH:mm:ss")
        var _data = {
            "total": 0,
            "rows": []
        }

        var add = []
        for (let j in data.data["add"]) {
            add[j] = data.data["add"][j]
        }
        for (let j in data.data["sum"]) {
            var re = {
                "type": "汇报项目",
                "name": data.data["sum"][j],
                "remark": "",
                "smsno": j
            }
            if (add[j]) {
                re.remark = "新增"
                _data.rows.unshift(re)
            } else {
                re.remark = "正常"
                _data.rows.push(re)
            }
        }
        for (let j in data.data["lack"]) {
            _data.rows.unshift({
                "type": "未报项目",
                "name": data.data["lack"][j],
                "remark": "未报",
                "smsno": j
            })
        }
        _data.total = _data.rows.length

        await ctx.render("details/smsreport", {
            title: data.name,
            data: {
                data: _data,
                sum: data.msg.sum,
                add: data.msg.add,
                lack: data.msg.lack
            }
        })
    } catch (error) {
        ctx.body = name + JSON.stringify(error)
    }

})

module.exports = router
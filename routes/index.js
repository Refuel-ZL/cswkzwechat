"use strict"
var wechatg = require("../wechat/g")
var Wechat = require("../wechat/wechat")
const router = require("koa-router")()
var config = require("../config/config")
var reply = require("../wx/reply")
var rule = require("../csw/rule")
var moment = require("moment-timezone")
var async = require("async")

const logUtil = require("../utils/log4js/log_utils")

moment.tz.setDefault("Asia/Shanghai")
var wechatApi = new Wechat(config.wechat)

router.get("/", async(ctx, next) => {
    await ctx.render("index", {
        title: "Hello Koa 2!"
    })
})

/**
 * 处理微信事件的路由
 */
router.all("/wx", wechatg(config.wechat, reply.reply))

/**
 * 重置菜单栏
 */
router.post("/loadMenu", async(ctx, next) => {
    var reply = ""
    try {
        var del = await wechatApi.deleteMenu()
        if (del.errmsg === "ok") {
            del = await wechatApi.createMenu(ctx.request.body.text)
            if (del.errmsg === "ok") {
                reply = "重置菜单成功"
            } else {
                reply = "写入失败：" + del
            }
        } else {
            reply = "重置失败" + del
        }

    } catch (error) {
        reply = "重置失败" + JSON.stringify(error)
    }
    ctx.body = reply
})

/**开放群发接口
 * tagid="标签id" 为空 所有关注者
 * content="内容"
 */
router.all("/sendtextall", async function(ctx, next) {
    var tagid = ctx.request.body.tagid || ctx.query.tagid
    var val = {
        type: "text",
        content: ctx.request.body.content || ctx.query.content,
    }
    ctx.body = await wechatApi.sendAll(val, tagid)

})

/**
 * 接收需要发个微信的模版信息
 * msg={"groupType":"名称 根据配置匹配找到模版id","msg":"告警内容"}
 * 
 */
router.all("/sendtemplate", async(ctx, next) => {
    try {
        let parameter_ = ctx.query.msg || ctx.request.body.msg
        logUtil.writeInfo("接收到模板信息" + parameter_)
        let parameter = JSON.parse(parameter_)
        if (rule.SmsTemplate[parameter.groupType] && rule.SmsTemplate[parameter.groupType].form && rule.SmsTemplate[parameter.groupType].group) {
            let template = rule.SmsTemplate[parameter.groupType]
            let SmsTemplate = template.group
            let data_ = template.form
            data_.data.text.value = parameter.msg
            if (template.format) {
                data_.data.text.value = template.format(parameter, data_)
            }
            if (template.details) {
                let suffix = template.details(parameter, data_)
                data_.url = suffix ? ctx.origin + "/" + suffix : ""
            }
            let tasks = []
            for (var index in SmsTemplate) {
                let data__ = JSON.parse(JSON.stringify(data_))
                data__.touser = SmsTemplate[index]
                tasks.push(
                    (callback) => {
                        async function asd(callback) {
                            try {
                                let res = await wechatApi.Sendtemplate(data__)
                                res = JSON.parse(res)
                                if (res.errmsg === "ok") {
                                    callback(null, null, data__, null) /**为避免中断async运行，避免err,回调参数（永远为空，异常信息，内容，非正常返回结果） */
                                } else {
                                    callback(null, null, data__, res)
                                }
                            } catch (error) {
                                callback(null, error, data__, null)
                            }
                        }
                        asd(callback)
                    }
                )
            }
            async.parallelLimit(tasks, 5, function(err, result) { //并发5个请求发送微信模版信息
                for (var i in result) {
                    if (result[i][0] || result[i][2]) {
                        logUtil.writeErr(`【${result[i][1].touser}】此次发送模板信息异常：`, `返回值：${JSON.stringify(result[i][2])}\r\n发送内容：${JSON.stringify(result[i][1])}`)
                    } else {
                        logUtil.writeInfo(`【${result[i][1].touser}】此次发送模板信息结束:\r\n内容：${JSON.stringify(result[i][1])}`)
                    }
                }
            })
            ctx.body = "ok"
        } else {
            logUtil.writeErr(`没有【${parameter.type}】预备的模板格式或没有制定发送用户组`)
            ctx.body = "非合法请求或没找到模板或没有制定发送用户组"
        }
    } catch (error) {
        logUtil.writeErr("微信告警接口异常", error)
        ctx.body = error
    }
})


module.exports = router
"use strict"


var request = require("request")
const logUtil = require("../utils/log4js/log_utils")
const Promise = require("bluebird")
var realm = "http://220.170.155.240:9619/"
var cswapi = {
    getvarvalue: realm + "getvarvalue?",
    getalarmlog: realm + "alarmlog?",
    setvarvalue: realm + "setvarvalue?"
}
var timeout = 3000
module.exports = {
    getvarvalue: function(meterial) {
        var url = cswapi.getvarvalue + "varlist=" + JSON.stringify(meterial)
        logUtil.writeInfo("获取实时数据值  " + url)
        var options = {
            method: "POST",
            url: url,
            JSON: true,
            timeout: timeout
        }
        return new Promise((resolve) => {
            try {
                var t1 = new Date()
                request(options, (err, res, body) => {
                    logUtil.writeInfo("获取实时数据值花费时间 【" + (new Date() - t1) + "ms】")
                    if (err) {
                        logUtil.writeErr("获取实时数据值失败 " + JSON.stringify(err))
                        resolve(err)
                    }
                    resolve(body)
                })
            } catch (error) {
                throw new Error("Get Varvalue ")
            }

        })
    },
    setvarvalue: function(meterial) {
        var url = cswapi.setvarvalue + "varlist=" + JSON.stringify(meterial)
        logUtil.writeInfo("设置数据值  " + url)
        var options = {
            method: "POST",
            url: url,
            JSON: true,
            timeout: timeout

        }

        return new Promise((resolve) => {
            try {
                var t2 = new Date()
                request(options, (err, res, body) => {
                    logUtil.writeInfo("设置数据值花费时间 【" + (new Date() - t2) + "ms】")
                    if (err) {
                        logUtil.writeErr("设置数据值失败 " + err)
                        resolve(err)
                    }
                    resolve(body)
                })
            } catch (error) {
                throw new Error("Set Varvalue ")
            }

        })

    },
    getalarmlog: function(from, end, isLog, size) {
        var url = cswapi.getalarmlog + "from=" + from + "&end=" + end + "&isLog=" + isLog + "&size=" + size
        logUtil.writeInfo("获取告警信息  " + url)
        var options = {
            method: "GET",
            url: url,
            JSON: true,
            timeout: timeout
        }
        var t3 = new Date()
        return new Promise((resolve) => {
            try {
                request(options, (err, res, body) => {
                    logUtil.writeInfo("获取告警信息花费时间 【" + (new Date() - t3) + "ms】")
                    if (err) {
                        logUtil.writeErr("获取日志失败 " + err)
                        resolve(err)
                    }
                    if (body) {
                        resolve(JSON.parse(body))
                    } else {
                        resolve(body)
                    }
                })
            } catch (error) {
                throw new Error("Get Alarmlog ")

            }

        })
    },
}
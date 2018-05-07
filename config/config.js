"use strict"

var path = require("path")
var util = require("../libs/util")
var wechat_flie = path.join(__dirname, "./wechat.json")
const logUtil = require("../utils/log4js/log_utils")

var proconfig = {
    greetings: "您好，欢迎关注湖南康森韦尔科技园",
    //host: " http://66.112.212.6/",
    port: "80",
    wechat: {
        appID: "wxeb05d253a32466a8",
        appSecret: "39b47ebeeead0e5ff09b5c360bf17226",
        token: "Cq8nEQJwIxy7L3K0FP86VMyhETcSUsyE",
        getAccessToken: function() {
            return util.readFileAsync(wechat_flie, "utf-8")
        },
        saveAccessToken: function(data) {
            data = JSON.stringify(data)
            return util.writeFileAsync(wechat_flie, data)
        }
    }
}

 exports = module.exports = proconfig //如果是线上，使用该config
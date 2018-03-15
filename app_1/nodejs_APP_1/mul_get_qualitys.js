/**
 * Created by Administrator on 2017/9/6.
 */
/**
 * 多进程并行
 */
var cluster = require('cluster');
var quality = require("./quality.js")

process.on('message', function (msg) {
    var result = [];
    for(var i=0; i<msg.length; i++)
    {
        var index = msg[i][0];
        var point = msg[i][1];
        var outlying = quality.Outlying(point);
        var cluster = quality.Cluster(point);
        result.push([index, outlying, cluster]);
    }
    process.send(result);
});
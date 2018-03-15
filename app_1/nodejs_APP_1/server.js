const const_http = require("http");
const const_cluster = require("cluster");
const const_cpuNumber = require('os').cpus().length - 1;
const d3 = require("./d3.min.js")

function onRequest(request, response) {
    /**
     * 获得前台POST数据
     * @type {string}
     */
    var postData = "";
    request.on("data", function (chunk) {
        postData += chunk;
    });
    /**
     * 响应头
     */
    response.writeHead(200, {
        "Content-Type": 'text/plain',
        'charset': 'utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS'
    });//可以解决跨域的请求
    /**
     * end 函数
     */
    request.on("end", function () {
        postData = JSON.parse(postData);
        if (postData.TYPE == "#save_data") {
            global.points = postData.points.points;
            global.points_outlying = [];
            global.points_cluster = []; //各个点在每个视图上的贡献
            response.write("ok");
            response.end();
        }
        /**
         * #get_qualitys
         */
        else if (postData.TYPE == "#get_qualitys") {
            console.log(postData.TYPE);
            var view_index = postData.VIEW_INDEX; //服务器计算的视图集
            var dimension = parseInt(postData.DIM);
            const_cluster.setupMaster({
                exec: './mul_get_qualitys.js',
                slient: true
            });
            for (var i = 0; i < const_cpuNumber; i++) {
                var data = [];
                for (var j = i; j < view_index.length; j += const_cpuNumber) {
                    data.push([view_index[j], global.points[view_index[j]]]);
                }
                var wk = const_cluster.fork();
                // data = [dimension, data];
                wk.send(data)
            }
            var numberOfEnd = 0;
            var ret = [];
            Object.keys(const_cluster.workers).forEach(function (id) {
                const_cluster.workers[id].on("message", function (msg) {
                    var t = [];
                    for (var i = 0; i < msg.length; i++) {
                        (global.points_outlying).push([parseInt(msg[i][0]), msg[i][1][1]]);
                        (global.points_cluster).push([parseInt(msg[i][0]), msg[i][2][1]]);
                        t.push([msg[i][0], msg[i][1][0], msg[i][2][0]])
                    }
                    ret = ret.concat(t);
                    numberOfEnd++;
                    if (numberOfEnd == const_cpuNumber) {
                        console.log("finish");
                        ret = {
                            "qualitys": ret,
                            "points_outlying": global.points_outlying,
                            "points_cluster": global.points_cluster
                        }
                        response.write(JSON.stringify(ret));
                        response.end();
                        const_cluster.disconnect();
                    }
                })
            });
        }
        else if (postData.TYPE == "#get_qualitys_2") {
            console.log(postData.TYPE);
            var categoryData = postData.categoryData;
            var view_index = postData.VIEW_INDEX; //服务器计算的视图集
            const_cluster.setupMaster({
                exec: './mul_get_qualitys_2.js',
                slient: true
            });
            for (var i = 0; i < const_cpuNumber; i++) {
                var data = [];
                for (var j = i; j < view_index.length; j += const_cpuNumber) {
                    data.push([view_index[j], global.points[view_index[j]]]);
                }
                var wk = const_cluster.fork();
                data = [categoryData, data];
                wk.send(data)
            }
            var numberOfEnd = 0;
            var ret = [];
            Object.keys(const_cluster.workers).forEach(function (id) {
                const_cluster.workers[id].on("message", function (msg) {
                    var t = [];
                    for (var i = 0; i < msg.length; i++) {
                        (global.points_outlying).push([parseInt(msg[i][0]), msg[i][1][1]]);
                        (global.points_cluster).push([parseInt(msg[i][0]), msg[i][2][1]]);
                        t.push([msg[i][0], msg[i][1][0], msg[i][2][0]])
                    }
                    ret = ret.concat(t);
                    numberOfEnd++;
                    if (numberOfEnd == const_cpuNumber) {
                        console.log("finish");
                        ret = {
                            "qualitys": ret,
                            "points_outlying": global.points_outlying,
                            "points_cluster": global.points_cluster
                        }
                        response.write(JSON.stringify(ret));
                        response.end();
                        const_cluster.disconnect();
                    }
                })
            });
        }
        else if (postData.TYPE == "#get_gdDistanceMatrix") {
            console.log(postData.TYPE);
            var knnGraph = postData.KnnGraph;
            var view_index = postData.VIEW_INDEX; //服务器计算的视图集
            const_cluster.setupMaster({
                exec: './mul_get_gdDistance.js',
                slient: true
            });
            for (var i = 0; i < const_cpuNumber; i++) {
                var data = [];
                for (var j = i; j < view_index.length; j += const_cpuNumber) {
                    data.push(view_index[j]);
                }
                var wk = const_cluster.fork();
                wk.send([data, knnGraph])
            }
            var numberOfEnd = 0;
            var ret = [];
            Object.keys(const_cluster.workers).forEach(function (id) {
                const_cluster.workers[id].on("message", function (msg) {
                    ret = ret.concat(msg);
                    numberOfEnd++;
                    if (numberOfEnd == const_cpuNumber) {
                        console.log("finish");
                        response.write(JSON.stringify(ret));
                        response.end();
                        const_cluster.disconnect();
                    }
                })
            });

        }
        /**
         * #test
         */
        else {
            const_cluster.setupMaster({
                exec: './mul_test.js',
                slient: true
            });
            for (var i = 0; i < const_cpuNumber; i++) {
                var data = [];
                for (var j = i; j < global.points.length; j += const_cpuNumber) {
                    data.push([j, global.points[j]]);
                }
                var wk = const_cluster.fork();
                wk.send(data)
            }
            var numberOfEnd = 0;
            var ret = [];
            Object.keys(const_cluster.workers).forEach(function (id) {
                const_cluster.workers[id].on("message", function (msg) {
                    for (var i = 0; i < msg.length; i++) {
                        ret[msg[i][0]] = msg[i][1];
                    }
                    numberOfEnd++;
                    if (numberOfEnd == const_cpuNumber) {
                        console.log("finish");
                        response.write(JSON.stringify(ret));
                        response.end();
                        const_cluster.disconnect();
                    }
                })
            });
        }

    });
}

const_http.createServer(onRequest).listen(9000);

console.log("Server has started.port on 9000\n");




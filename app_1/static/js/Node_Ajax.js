/**
 *  多个服务器
 */
//const GLOBAL_SERVERS_URL = ["http://192.168.1.28:9000/", "http://192.168.1.74:9000/", "http://192.168.1.19:9000/", "http://192.168.1.221:9000/", "http://127.0.0.1:9000/"];
// const GLOBAL_SERVERS_URL = ["http://192.168.1.220:9000/","http://192.168.1.74:9000/","http://192.168.1.19:9000/","http://127.0.0.1:9000/"];
const GLOBAL_SERVERS_URL = [ "http://127.0.0.1:9000/"];

var mulServer_send_datas = function (datas) {
    var Synchronize = 0;  //同步
    for (var i = 0; i < GLOBAL_SERVERS_URL.length; i++) {
        var data = {"points": datas, "TYPE": "#save_data"};
        var data = JSON.stringify(data);
        $.ajax(
            {
                url: GLOBAL_SERVERS_URL[i],
                type: "POST",
                data: data,
                processData: false,
                contentType: false,
                success: function (data) {
                    Synchronize++;
                    if (Synchronize == GLOBAL_SERVERS_URL.length) {
                        mulServer_get_qualitys_2()
                    }
                },
                error: function (data) {
                    console.log("error");
                }
            });
    }
}
/**
 * 得到 outlying 和 cluster
 * @param nextFuncion
 */
var mulServer_get_qualitys = function () {
    var server_number = GLOBAL_SERVERS_URL.length;
    var points_outlying = [];
    var points_cluster = [];
    var sigmal = 0;
    for (var I = 0; I < GLOBAL_SERVERS_URL.length; I++) {
        var view_index = [];  //分配给服务器的任务
        for (var i = I; i < Globa.Points.length; i += server_number) {
            view_index.push(i);
        }
        var data = {"TYPE": "#get_qualitys", "VIEW_INDEX": view_index, "DIM": Globa.NormlizeData[0].length};
        var data = JSON.stringify(data);
        $.ajax(
            {
                url: GLOBAL_SERVERS_URL[I],
                type: "POST",
                data: data,
                processData: false,
                contentType: false,
                success: function (data) {
                    data = JSON.parse(data);
                    var qualytis = data.qualitys;
                    var p_outlying = data.points_outlying;
                    var p_cluster = data.points_cluster;
                    for (var i = 0; i < qualytis.length; i++) {
                        Globa.Quality[qualytis[i][0]]["OUTLYING"] = qualytis[i][1];
                        Globa.Quality[qualytis[i][0]]["CLUSTER"] = qualytis[i][2];
                        points_outlying[p_outlying[i][0]] = p_outlying[i][1];
                        points_cluster[p_cluster[i][0]] = p_cluster[i][1];
                    }
                    sigmal++;
                    if (sigmal == server_number) {
                        console.log("ok");
                        Globa.Points_Outlying = points_outlying;
                        Globa.Points_Cluster = points_cluster;
                        // var dataName = document.getElementById("selectData").value;  //获取用户选择的文件名
                        // save_data(Globa, dataName); //将数据存在JSON文件中
                        Globa.LastStarplotSelted = [];
                        initBody();
                        initMainBody(20);
                        Globa.LastStarplot = Globa.Vectors[20];
                    }
                },
                error: function (data) {
                    console.log("error");
                }
            });
    }
}

/**
 * 得到 outlying 和 cluster
 * @param nextFuncion
 */
var mulServer_get_qualitys_2 = function () {
    var dataName = document.getElementById("selectData").value;
    dataName = dataName.split("/");
    dataName = dataName[dataName.length - 1];
    dataName = dataName.split(".");
    dataName = dataName[0];
    dataName = "./static/data/categoryData/" + dataName + ".csv"
    d3.csv(dataName, function (error, DATA) {
        if (error) {
            throw  new Error("wdl");
        }
        var categoryData = [];
        for (var i = 0; i < DATA.length; i++) {
            for (var j in DATA[i]) {
                categoryData.push((DATA[i][j]));
            }

        }
        testColor(categoryData);

        var server_number = GLOBAL_SERVERS_URL.length;
        var points_outlying = [];
        var points_cluster = [];
        var sigmal = 0;
        for (var I = 0; I < GLOBAL_SERVERS_URL.length; I++) {
            var view_index = [];  //分配给服务器的任务
            for (var i = I; i < Globa.Points.length; i += server_number) {
                view_index.push(i);
            }
            var data = {
                "TYPE": "#get_qualitys_2",
                "VIEW_INDEX": view_index,
                "DIM": Globa.NormlizeData[0].length,
                "categoryData": categoryData
            };
            var data = JSON.stringify(data);
            $.ajax(
                {
                    url: GLOBAL_SERVERS_URL[I],
                    type: "POST",
                    data: data,
                    processData: false,
                    contentType: false,
                    success: function (data) {
                        data = JSON.parse(data);
                        var qualytis = data.qualitys;
                        var p_outlying = data.points_outlying;
                        var p_cluster = data.points_cluster;
                        for (var i = 0; i < qualytis.length; i++) {
                            Globa.Quality[qualytis[i][0]]["OUTLYING"] = qualytis[i][1];
                            Globa.Quality[qualytis[i][0]]["CLUSTER"] = qualytis[i][2];
                            points_outlying[p_outlying[i][0]] = p_outlying[i][1];
                            points_cluster[p_cluster[i][0]] = p_cluster[i][1];
                        }
                        sigmal++;
                        if (sigmal == server_number) {
                            console.log("ok");
                            Globa.Points_Outlying = points_outlying;
                            Globa.Points_Cluster = points_cluster;
                            // var dataName = document.getElementById("selectData").value;  //获取用户选择的文件名
                            // save_data(Globa, dataName); //将数据存在JSON文件中
                            Globa.LastStarplotSelted = [];
                            initBody();
                            initMainBody(Globa.PcaData);
                            Globa.LastStarplot = Globa.PcaVector;

                            /**
                             * saveData
                             * @type {{}}
                             */
                            var saveData = {};
                            saveData.Points_Outlying = Globa.Points_Outlying;
                            saveData.Points_Cluster = Globa.Points_Cluster;
                            saveData.Quality = Globa.Quality;
                            save_data(saveData, get_file_name() + "_part_2");
                        }
                    },
                    error: function (data) {
                        console.log("error");
                    }
                });
        }
    })
}


var mulServer_get_pointsOutlying = function (seletePoints) {
    if (Globa.Is_ZhiXian) {
        var rect_width = 690;
        var rect_height = 690 - 10;
        var pointQuality = [];
        var g = d3.select("#MainBodySvg");
        var dragLine = Globa.MicDragLine;
        for (var j = 0; j < dragLine.length; j++) {
            dragLine[j][0] /= rect_width;
            dragLine[j][1] /= rect_height;
        }
        g.selectAll("circle").each(function (d, i) {
            var me = d3.select(this);
            var cx = parseFloat(me.attr("cx"));
            var cy = parseFloat(me.attr("cy"));
            cx /= rect_width;
            cy /= rect_height;
            var dis = pointsToLineDis(dragLine, [cx, cy]);
            pointQuality[i] = dis;
        });
        var maxP = d3.max(pointQuality);
        var minP = d3.min(pointQuality);
        var rangeP = maxP - minP;
        for (var i = 0; i < pointQuality.length; i++) {
            pointQuality[i] = parseFloat(pointQuality[i] - minP) / rangeP;
            pointQuality[i] = 1 - pointQuality[i];
        }
        var viewQuality = [];
        for (var i = 0; i < Globa.Points_Outlying.length; i++) {
            var sum = 0;
            for (var j = 0; j < Globa.Points_Outlying[i].length; j++) {
                sum += Globa.Points_Outlying[i][j] * pointQuality[j];
            }
            viewQuality[i] = sum;
        }

        var ret = d3.max(viewQuality);
        return viewQuality.indexOf(ret);
    }
    else {
        var pointQuality = [];
        for (var i = 0; i < Globa.Points_Outlying.length; i++) {
            var sum = 0;
            for (var j = 0; j < seletePoints.length; j++) {
                sum += Globa.Points_Outlying[i][seletePoints[j]];
            }
            pointQuality[i] = sum
        }
        var ret = d3.max(pointQuality);
        return pointQuality.indexOf(ret);
    }
}

var mulServer_get_pointsCluster = function (seletePoints) {
    if (Globa.Is_ZhiXian) {
        var rect_width = 690;
        var rect_height = 690 - 10;
        var pointQuality = [];
        var g = d3.select("#MainBodySvg");
        var dragLine = Globa.MicDragLine;
        for (var j = 0; j < dragLine.length; j++) {
            dragLine[j][0] /= rect_width;
            dragLine[j][1] /= rect_height;
        }
        g.selectAll("circle").each(function (d, i) {
            var me = d3.select(this);
            var cx = parseFloat(me.attr("cx"));
            var cy = parseFloat(me.attr("cy"));
            cx /= rect_width;
            cy /= rect_height;
            var dis = pointsToLineDis(dragLine, [cx, cy]);
            pointQuality[i] = dis;
        });
        var maxP = d3.max(pointQuality);
        var minP = d3.min(pointQuality);
        var rangeP = maxP - minP;
        for (var i = 0; i < pointQuality.length; i++) {
            pointQuality[i] = parseFloat(pointQuality[i] - minP) / rangeP;
            pointQuality[i] = 1 - pointQuality[i];
        }
        var viewQuality = [];
        for (var i = 0; i < Globa.Points_Cluster.length; i++) {
            var sum = 0;
            for (var j = 0; j < Globa.Points_Cluster[i].length; j++) {
                sum += Globa.Points_Cluster[i][j] * pointQuality[j];
            }
            viewQuality[i] = sum;
        }

        var ret = d3.max(viewQuality);
        return viewQuality.indexOf(ret);
    }
    else {
        var pointQuality = [];
        for (var i = 0; i < Globa.Points_Cluster.length; i++) {
            var sum = 0;
            for (var j = 0; j < seletePoints.length; j++) {
                sum += Globa.Points_Cluster[i][seletePoints[j]];
            }
            pointQuality[i] = sum;
        }
        var ret = d3.max(pointQuality)
        return pointQuality.indexOf(ret);
    }
}

var mulServer_get_pointsMic = function (seletePoints) {
    // if (Globa.Is_ZhiXian) {
    //     var rect_width = 690;
    //     var rect_height = 690 - 10;
    //     var pointQuality = [];
    //     var g = d3.select("#MainBodySvg");
    //     var dragLine = Globa.MicDragLine;
    //     for (var j = 0; j < dragLine.length; j++) {
    //         dragLine[j][0] /= rect_width;
    //         dragLine[j][1] /= rect_height;
    //     }
    //     var disArray = [];
    //     g.selectAll("circle").each(function (d, i) {
    //         var me = d3.select(this);
    //         var cx = parseFloat(me.attr("cx")) / rect_width;
    //         var cy = parseFloat(me.attr("cy")) / rect_height;
    //         var dis = pointsToLineDis(dragLine, [cx, cy]);
    //         // dis = Math.exp(-1 * dis)
    //         disArray[i] = dis;
    //     });
    //     var minD = d3.min(disArray);
    //     var maxD = d3.max(disArray);
    //     var range = maxD - minD;
    //    var opu = [1, 1, 0.0, 0.0, 0.0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.000, 0.000, 0.000, 0.000, 0.000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000]
    //     for (var i = 0; i <  Globa.Points_Mic[0].length; i++) {
    //         var opa = ((disArray[i] - minD) / range);
    //         opa = parseInt(opa / 0.05);
    //         opa = opu[opa];
    //         pointQuality[i] = opa;
    //     }
    //     var viewQuality = [];
    //     for (var i = 0; i < Globa.Points_Mic.length; i++) {
    //         var sum = 0;
    //         for (var j = 0; j < Globa.Points_Mic[i].length; j++) {
    //             sum += Globa.Points_Mic[i][j] * pointQuality[j];
    //         }
    //         viewQuality[i] = sum;
    //     }
    //
    //     var ret = d3.max(viewQuality);
    //     return viewQuality.indexOf(ret);
    // }
    // else {
    seletePoints = Globa.StarplotSelted;
    var pointQuality = [];
    for (var i = 0; i < Globa.Points_Mic.length; i++) {
        var sum = 0;
        for (var j = 0; j < seletePoints.length; j++) {
            sum += Globa.Points_Mic[i][seletePoints[j]];
        }
        pointQuality[i] = sum;
    }
    var ret = d3.max(pointQuality)
    return pointQuality.indexOf(ret);
    // }

}

/**
 * 得到 outlying 和 cluster
 * @param nextFuncion
 */
var mulServer_get_qualitys_X = function () {
    var dataName = document.getElementById("selectData").value;
    dataName = dataName.split("/");
    dataName = dataName[dataName.length - 1];
    dataName = dataName.split(".");
    dataName = dataName[0];
    dataName = "./static/data/categoryData/" + dataName + ".csv"
    d3.csv(dataName, function (error, DATA) {
        if (error) {
            throw  new Error("wdl");
        }
        var categoryData = [];
        for (var i = 0; i < DATA.length; i++) {
            for (var j in DATA[i]) {
                categoryData.push((DATA[i][j]));
            }

        }
        // testColor(categoryData);

        var server_number = GLOBAL_SERVERS_URL.length;
        var sigmal = 0;
        var tempData = [];


        for (var I = 0; I < GLOBAL_SERVERS_URL.length; I++) {
            var view_index = [];  //分配给服务器的任务
            for (var i = I; i < 1000; i += server_number) {
                view_index.push(i);
            }
            var data = {
                "TYPE": "#get_qualitys_2",
                "VIEW_INDEX": view_index,
                "DIM": Globa.NormlizeData[0].length,
                "categoryData": categoryData
            };
            var data = JSON.stringify(data);
            $.ajax(
                {
                    url: GLOBAL_SERVERS_URL[I],
                    type: "POST",
                    data: data,
                    processData: false,
                    contentType: false,
                    success: function (data) {
                        tempData.push(data);
                        sigmal++;
                        if (sigmal == server_number) {
                            var dataName = get_file_name() + "_part_2_5";
                            save_data(tempData, dataName);
                        }
                    },
                    error: function (data) {
                        console.log("error");
                    }
                });
        }
    })
}


var testColor = function (cote) {
    var count = 3;
    var index = [];
    var color_array = [];
    var color = Globa.Color[count];
    for (var i = 0; i < cote.length; i++) {
        var cotegory = cote[i];
        var p = index.indexOf(cotegory)
        if (p >= 0) {
            Globa.Points_Color[i] = color_array[p];
        }
        else {
            index.push(cotegory);
            color_array.push(color);
            Globa.Points_Color[i] = color;
            count++;
            color = Globa.Color[count % Globa.Color.length];

        }
    }
}

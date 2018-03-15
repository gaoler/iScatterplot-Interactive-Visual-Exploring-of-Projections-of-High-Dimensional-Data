/**
 * Created by Administrator on 2017/8/16.
 */

var Globa = null

var Init = function () {
    delAll();
    Globa = globalVariable();
    var dataName = document.getElementById("selectData").value;  //获取用户选择的文件名
    // loadJsonData_part1()
    //loadData(dataName);
    loadData_919();

}

var loadData_919 = function () {
    var fileName = get_file_name();
    if (fileName == "auto-mpg") {
        var name = "./static/data/jsonData/" + "auto-mpg-end-9 19" + ".json";
        d3.json(name, function (error, data) {
            if (error) {
                throw new Error("haha");
            }
            Globa = data;
            Globa.LastStarplotSelted = [];
            initBody();
            initMainBody(Globa.PcaData);
            Globa.LastStarplot = Globa.PcaVector;
            document.getElementById("DataSize").value = Globa.NormlizeData.length;
            document.getElementById("Dimension").value = Globa.NormlizeData[0].length;
        });
    }
    else if (fileName == "Syn data") {
        var dataName = get_file_name()
        dataName = "./static/data/jsonData/" + dataName + "_part_1" + ".json";
        d3.json(dataName, function (error, data) {
            if (error) {
                throw new Error("haha");
            }
            Globa = data;
            loadJsonDataX();
            document.getElementById("DataSize").value = Globa.NormlizeData.length;
            document.getElementById("Dimension").value = Globa.NormlizeData[0].length;
        })
    }
    else if (fileName == "Quality of Life Index-clean") {
        var dataName = get_file_name()
        dataName = "./static/data/jsonData/" + dataName + "_part_1" + ".json";
        d3.json(dataName, function (error, data) {
            if (error) {
                throw new Error("haha");
            }
            Globa = data;
            loadJsonData_part2();
            document.getElementById("DataSize").value = Globa.NormlizeData.length;
            document.getElementById("Dimension").value = Globa.NormlizeData[0].length;
        })
    }
    else if (fileName == "iris") {
        var dataName = get_file_name()
        dataName = "./static/data/jsonData/" + dataName + "_part_1" + ".json";
        d3.json(dataName, function (error, data) {
            if (error) {
                throw new Error("haha");
            }
            Globa = data;
            loadJsonData_part2();
            document.getElementById("DataSize").value = Globa.NormlizeData.length;
            document.getElementById("Dimension").value = Globa.NormlizeData[0].length;
        })
    }
    else {
    }
}

var loadData = function (dataName) {
    d3.csv(dataName, function (error, data) {
        if (error) {
            console.log(error);
        }
        for (var i = 0; i < data.length; i++) {
            var tem = [];
            for (var j in data[i]) {
                tem.push(Number(data[i][j]));
            }
            Globa.originData.push(tem);
        }
        var normData = normlize(Globa.originData);
        Globa.NormlizeData = normData;
        document.getElementById("DataSize").value = normData.length;
        document.getElementById("Dimension").value = normData[0].length;

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
            Globa.CategoryData = categoryData;
            getSampleingData(normData)
        });
    });
}

var loadJsonData_part1 = function () {
    var dataName = get_file_name()
    dataName = "./static/data/jsonData/" + dataName + "_part_1" + ".json";
    d3.json(dataName, function (error, data) {
        if (error) {
            throw new Error("haha");
        }
        Globa = data;

        // var points = [];
        // for (var i = 4000; i < 5001; i++) {
        //     points.push(Globa.Points[i]);
        // }

        mulServer_send_datas({
            "points": Globa.Points,
        })

        //loadJsonData_part2();

        // loadJsonDataX();
    })
}
var loadJsonData_part2 = function () {
    var dataName = get_file_name();
    dataName = "./static/data/jsonData/" + dataName + "_part_2" + ".json";
    d3.json(dataName, function (error, data) {
        if (error) {
            throw new Error("haha");
        }
        Globa.Points_Outlying = data.Points_Outlying;
        Globa.Points_Cluster = data.Points_Cluster;
        Globa.Quality = data.Quality;
        Globa.LastStarplotSelted = [];
        initBody();
        initMainBody(Globa.PcaData);
        Globa.LastStarplot = Globa.PcaVector;
    })
}

var loadJsonDataX = function () {
    var dataName = "./static/data/jsonData/" + get_file_name() + "_part_2_";
    var name = [];
    for (var i = 1; i <= 5; i++) {
        name.push(dataName + i + ".json");
    }
    var points_outlying = [];
    var points_cluster = [];
    var sim = 0;


    d3.json(name[0], function (error, data) {
        if (error) {
            throw new Error("haha");
        }
        sim++;
        for (var k = 0; k < data.length; k++) {
            var data_ = JSON.parse(data[k]);
            var qualytis = data_.qualitys;
            var p_outlying = data_.points_outlying;
            var p_cluster = data_.points_cluster;
            var start = 0 * 1000;
            for (var j = 0; j < qualytis.length; j++) {
                Globa.Quality[qualytis[j][0] + start]["OUTLYING"] = qualytis[j][1];
                Globa.Quality[qualytis[j][0] + start]["CLUSTER"] = qualytis[j][2];
                points_outlying[p_outlying[j][0] + start] = p_outlying[j][1];
                points_cluster[p_cluster[j][0] + start] = p_cluster[j][1];
            }
        }
        if (sim >= 5) {
            console.log("ok");
            Globa.Points_Outlying = points_outlying;
            Globa.Points_Cluster = points_cluster;
            // var dataName = document.getElementById("selectData").value;  //获取用户选择的文件名
            // save_data(Globa, dataName); //将数据存在JSON文件中
            Globa.LastStarplotSelted = [];
            initBody();
            initMainBody(Globa.PcaData);
            Globa.LastStarplot = Globa.PcaVector;
        }
    })

    d3.json(name[1], function (error, data) {
        if (error) {
            throw new Error("haha");
        }
        sim++;
        for (var k = 0; k < data.length; k++) {
            var data_ = JSON.parse(data[k]);
            var qualytis = data_.qualitys;
            var p_outlying = data_.points_outlying;
            var p_cluster = data_.points_cluster;
            var start = 1 * 1000;
            for (var j = 0; j < qualytis.length; j++) {
                Globa.Quality[qualytis[j][0] + start]["OUTLYING"] = qualytis[j][1];
                Globa.Quality[qualytis[j][0] + start]["CLUSTER"] = qualytis[j][2];
                points_outlying[p_outlying[j][0] + start] = p_outlying[j][1];
                points_cluster[p_cluster[j][0] + start] = p_cluster[j][1];
            }
        }
        if (sim >= 5) {
            console.log("ok");
            Globa.Points_Outlying = points_outlying;
            Globa.Points_Cluster = points_cluster;
            // var dataName = document.getElementById("selectData").value;  //获取用户选择的文件名
            // save_data(Globa, dataName); //将数据存在JSON文件中
            Globa.LastStarplotSelted = [];
            initBody();
            initMainBody(Globa.PcaData);
            Globa.LastStarplot = Globa.PcaVector;
        }
    })

    d3.json(name[2], function (error, data) {
        if (error) {
            throw new Error("haha");
        }
        sim++;
        for (var k = 0; k < data.length; k++) {
            var data_ = JSON.parse(data[k]);
            var qualytis = data_.qualitys;
            var p_outlying = data_.points_outlying;
            var p_cluster = data_.points_cluster;
            var start = 2 * 1000;
            for (var j = 0; j < qualytis.length; j++) {
                Globa.Quality[qualytis[j][0] + start]["OUTLYING"] = qualytis[j][1];
                Globa.Quality[qualytis[j][0] + start]["CLUSTER"] = qualytis[j][2];
                points_outlying[p_outlying[j][0] + start] = p_outlying[j][1];
                points_cluster[p_cluster[j][0] + start] = p_cluster[j][1];
            }
        }
        if (sim >= 5) {
            console.log("ok");
            Globa.Points_Outlying = points_outlying;
            Globa.Points_Cluster = points_cluster;
            // var dataName = document.getElementById("selectData").value;  //获取用户选择的文件名
            // save_data(Globa, dataName); //将数据存在JSON文件中
            Globa.LastStarplotSelted = [];
            initBody();
            initMainBody(Globa.PcaData);
            Globa.LastStarplot = Globa.PcaVector;
        }
    })

    d3.json(name[3], function (error, data) {
        if (error) {
            throw new Error("haha");
        }
        sim++;
        for (var k = 0; k < data.length; k++) {
            var data_ = JSON.parse(data[k]);
            var qualytis = data_.qualitys;
            var p_outlying = data_.points_outlying;
            var p_cluster = data_.points_cluster;
            var start = 3 * 1000;
            for (var j = 0; j < qualytis.length; j++) {
                Globa.Quality[qualytis[j][0] + start]["OUTLYING"] = qualytis[j][1];
                Globa.Quality[qualytis[j][0] + start]["CLUSTER"] = qualytis[j][2];
                points_outlying[p_outlying[j][0] + start] = p_outlying[j][1];
                points_cluster[p_cluster[j][0] + start] = p_cluster[j][1];
            }
        }
        if (sim >= 5) {
            console.log("ok");
            Globa.Points_Outlying = points_outlying;
            Globa.Points_Cluster = points_cluster;
            // var dataName = document.getElementById("selectData").value;  //获取用户选择的文件名
            // save_data(Globa, dataName); //将数据存在JSON文件中
            Globa.LastStarplotSelted = [];
            initBody();
            initMainBody(Globa.PcaData);
            Globa.LastStarplot = Globa.PcaVector;
        }
    })

    d3.json(name[4], function (error, data) {
        if (error) {
            throw new Error("haha");
        }
        sim++;
        for (var k = 0; k < data.length; k++) {
            var data_ = JSON.parse(data[k]);
            var qualytis = data_.qualitys;
            var p_outlying = data_.points_outlying;
            var p_cluster = data_.points_cluster;
            var start = 4 * 1000;
            for (var j = 0; j < qualytis.length; j++) {
                Globa.Quality[qualytis[j][0] + start]["OUTLYING"] = qualytis[j][1];
                Globa.Quality[qualytis[j][0] + start]["CLUSTER"] = qualytis[j][2];
                points_outlying[p_outlying[j][0] + start] = p_outlying[j][1];
                points_cluster[p_cluster[j][0] + start] = p_cluster[j][1];
            }
        }
        if (sim >= 5) {
            console.log("ok");
            Globa.Points_Outlying = points_outlying;
            Globa.Points_Cluster = points_cluster;
            // var dataName = document.getElementById("selectData").value;  //获取用户选择的文件名
            // save_data(Globa, dataName); //将数据存在JSON文件中
            Globa.LastStarplotSelted = [];
            initBody();
            initMainBody(Globa.PcaData);
            Globa.LastStarplot = Globa.PcaVector;
        }
    })


}


var getSampleingData = function (normData) {
    var data = {"number": Globa.Number, "dimension": normData[0].length, "points": normData, "Globa": Globa}//
    var jsonData = JSON.stringify(data)
    var formData = new FormData();
    formData.append("id", "requestSampledata");
    formData.append("csrfmiddlewaretoken", token);
    formData.append("Data", jsonData);
    $.ajaxSetup({
        data: {csrfmiddlewaretoken: '{{ csrf_token }}'},
    });

    $.ajax(
        {
            url: "/",
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function (data) {
                Globa.Vectors = data.vectors;
                Globa.Points = data.datas;
                Globa.Quality = data.qualitys;
                Globa.Points_Mic = data.mic_curve;
                Globa.Curve_Line = data.curve_line;
                Globa.PcaData = data.pcaData;
                Globa.PcaVector = data.pcaVector;

                Globa.Vectors.push(Globa.PcaVector);
                Globa.Points.push(Globa.PcaData)
                Globa.Quality.push({"MIC": 0});
                var temp = [];
                for (var i = 0; i < Globa.Points.length; i++) {
                    temp[i] = 0;
                }
                Globa.Points_Mic.push(temp);

                //save_data(Globa, get_file_name() + "_part_1")
                //
                // // clumpy(Globa.Points[10]);

                Globa.LastStarplotSelted = [];
                initBody();
                initMainBody(Globa.PcaData);
                Globa.LastStarplot = Globa.PcaVector;
                // mulServer_send_datas({
                //     "points": Globa.Points,
                // })
            },
            error: function (data) {
            }
        });
}


var save_data = function (data, fileName) {
    data = {"data": data, "fileName": fileName}
    var jsonData = JSON.stringify(data)
    var formData = new FormData();
    formData.append("id", "requestSaveData");
    formData.append("csrfmiddlewaretoken", token);
    formData.append("Data", jsonData);
    $.ajaxSetup({
        data: {csrfmiddlewaretoken: '{{ csrf_token }}'},
    });

    $.ajax(
        {
            url: "/",
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function (data) {
                console.log(data);
            },
            error: function (data) {
            }
        });
}

var delAll = function () {
    var svg_subspace = d3.select("#subPlot").select("svg").remove();
    var svg_subspace = d3.select("#starPlot").select("svg").remove();
    var svg_subspace = d3.select("#selectPlot").select("svg").remove();
    var svg_subspace = d3.select("#threePlot").select("svg").remove();
    var svg_subspace = d3.selectAll(".selectedBodySvg").remove();
    for (var i in Globa) {
        Globa[i] = null;
        delete Globa[i];
    }
    Globa = null;
    delete Globa;
}

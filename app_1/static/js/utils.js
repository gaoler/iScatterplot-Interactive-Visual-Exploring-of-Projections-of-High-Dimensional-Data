/**
 * Created by Administrator on 2017/8/11.
 */

/**
 * 全局类
 */
var globalVariable = function () {
    var ret = {};
    ret.originData = [];    //原始数据集
    ret.Vectors = [];   //采样基向量集合
    ret.Points = [];    //采样投影数据集合
    ret.Number = 1000;   //采样个数
    ret.NormlizeData = [];  //归一化数据
    ret.Quality = [];  //度量数据
    ret.SelectQuality = "MIC"; //当前展示的度量
    ret.Color = ["#4682B4", "#CA312E", "#BBD35E", "#A67C52", "#764698", "#8dd3c7", "#2CA02C", "#FEC852", "#3E54A0", "#1EB0EE"]; //
    //#FF7F0E
    ret.StarplotSelted = [];  //Starplot 视图选择点集
    ret.LastStarplotSelted = [];
    ret.Points_Mic = null //mic度量，每个点贡献
    ret.Curve_Line = null //curve度量,每个子空间模拟曲线
    ret.Points_Outlying = null;
    ret.Points_Cluster = null;
    ret.Color_index = 0;
    ret.MicDragLine = null;
    ret.CategoryData = null;

    ret.Points_Color = [];  //每个数据点的颜色
    ret.Points_BaseColor = "#018571"; //数据点出初始颜色
    ret.Points_SeleteColor = "#fc8d62"; //数据点选中颜色
    ret.Is_ZhiXian = false; //是否绘制直线
    ret.Is_Point = false; //点击事件
    ret.LastStarplot = null; //
    ret.PcaData = null;
    ret.PcaVector = null;

    ret.SaveProjection = [];//保存的视图
    ret.isCanSave = true;

    return ret
}

/**
 * 线性正交基
 * @param dimension维度数
 * @returns {Array}线性正交基
 */
var testVector = function (dimension) {
    var vectors = []
    for (var i = 0; i < dimension; i++) {
        for (var j = 0; j < dimension; j++) {
            if (i == j) continue;
            var vectorX = zeroArray(dimension);
            var vectorY = zeroArray(dimension);
            vectorX[i] = 1;
            vectorY[j] = 1;
            vectors.push([vectorX, vectorY]);
        }
    }
    return vectors
}

var zeroArray = function (len) {
    var ret = [];
    for (var i = 0; i < len; i++) {
        ret.push(0)
    }
    return ret;
}

//施密特正交化函数
function caculateOrth(a, b) {
    var vk = [];
    var moda = 0;
    for (var i = 0; i < a.length; i++) {
        moda += a[i] * a[i];
    }
    var lena = Math.sqrt(moda);
    for (var i = 0; i < a.length; i++) {
        vk.push(a[i] / lena);
    }
    var wk = [];
    var dot = 0;
    for (var i = 0; i < b.length; i++) {
        dot += b[i] * vk[i];
    }
    var temwk = [];
    for (var i = 0; i < b.length; i++) {
        temwk.push(b[i] - dot * vk[i]);
    }
    var modtem = 0;
    for (var i = 0; i < temwk.length; i++) {
        modtem += temwk[i] * temwk[i];
    }
    var lentem = Math.sqrt(modtem);
    for (var i = 0; i < temwk.length; i++) {
        wk.push(temwk[i] / lentem);
    }
    var orth = [];
    orth.push(vk);
    orth.push(wk);
    return orth;
}

var paintBarChart = function (data, svg) {
    var margin = {top: 20, right: 20, bottom: 80, left: 40},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;

    var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
        y = d3.scaleLinear().rangeRound([height, 0]);

    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x.domain(data.map(function (d) {
        return d.name;
    }));
    y.domain([0, d3.max(data, function (d) {
        return d.value;
    })]);

    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    g.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y).ticks(10, "%"))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Frequency");

    g.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function (d) {
            return x(d.name);
        })
        .attr("y", function (d) {
            return y(d.value);
        })
        .attr("width", x.bandwidth())
        .attr("height", function (d) {
            return height - y(d.value);
        });
}

//原始数据归一化函数
//原始数据归一化函数
function normlize(data) {
    var ret = []
    for (var i = 0; i < data[0].length; i++) {
        var max = d3.max(data, function (d) {
            return d[i];
        });
        var min = d3.min(data, function (d) {
            return d[i];
        });
        var range = parseFloat(max - min);
        for (var j = 0; j < data.length; j++) {
            if(range == 0)
            {
                data[j][i] = 0;
                continue;
            }
            data[j][i] = parseFloat((data[j][i] - min)) / range;
        }
    }
    return data;
}
/**
 * 判断点在哪个三角形内， 并计算向量插值
 * @param cx
 * @param cy
 * @returns {*} 向量插值或null
 */
var selectTriangle = function (cx, cy) {
    var points = Globa.MdsData;
    for (var tri in Globa.Triangle) {
        tri = Globa.Triangle[tri];
        var a = points[tri[0]],
            b = points[tri[1]],
            c = points[tri[2]];
        var v0 = [c[0] - a[0], c[1] - a[1]];
        var v1 = [b[0] - a[0], b[1] - a[1]];
        var v2 = [cx - a[0], cy - a[1]];

        var v00 = v0[0] * v0[0] + v0[1] * v0[1];
        var v01 = v0[0] * v1[0] + v0[1] * v1[1];
        var v02 = v0[0] * v2[0] + v0[1] * v2[1];
        var v11 = v1[0] * v1[0] + v1[1] * v1[1];
        var v12 = v1[0] * v2[0] + v1[1] * v2[1];
        var v22 = v2[0] * v2[0] + v2[1] * v2[1];

        var u = (v11 * v02 - v01 * v12) / (v00 * v11 - v01 * v01);
        if (u > 1 || u < 0) continue;

        var v = (v00 * v12 - v01 * v02) / (v00 * v11 - v01 * v01)
        if (v > 1 || v < 0) continue

        if (u + v <= 1) {
            var p1 = Globa.Vectors[tri[0]];
            var p2 = Globa.Vectors[tri[1]];
            var p3 = Globa.Vectors[tri[2]];
            var c = 1 - u - v;
            var p = [];
            for (var i = 0; i < p1.length; i++) {
                var temp = []
                for (var j = 0; j < p1[i].length; j++) {
                    var t = c * p1[i][j] + u * p2[i][j] + v * p3[i][j];
                    temp.push(t);
                }
                p.push(temp)
            }
            return p;
        }
    }
    return null;
}

var projection = function (vector) {
    var data = {"vector": vector, "points": Globa.NormlizeData}
    var jsonData = JSON.stringify(data)
    var formData = new FormData();
    formData.append("id", "requestDot");
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
                paintStarplot(-1, data);
            },
            error: function (data) {
            }
        });

}


/**
 * 得到一维数组的最大最小值
 * @param data
 * @returns {[*,*]}
 */
var rangeData = function (data, i) {
    var max = d3.max(data, function (d) {
        return d[i];
    });
    var min = d3.min(data, function (d) {
        return d[i]
    });
    return [min, max]
}
/**
 * 最大值之间的最短路径函数
 * @param dismatrix
 * @param qualitys
 * @param j
 * @returns {Array}
 */
var djskl_max = function (dismatrix, j, maxs) {
    if (maxs.length <= 1) {
        return [];
    }
    var path = [];
    var dis = [];
    var flag = [];
    for (var i = 0; i < dismatrix.length; i++) {
        dis.push(dismatrix[j][i]);
        flag.push(false);
        if (dismatrix[j][i] < 100) {
            path.push(j)
        }
        else {
            path.push(-1)
        }
    }
    path[j] = -1;
    dis[j] = 100;
    flag[j] = true;
    while (true) {
        var min_ = d3.min(dis);
        var index_min_ = dis.indexOf(min_);
        if (maxs.indexOf(index_min_) != -1) {
            var ret = [];
            ret.push([index_min_, Globa.Quality[index_min_][Globa.SelectQuality]]);
            var f = index_min_;
            while (path[f] != -1) {
                ret.push([path[f], Globa.Quality[path[f]][Globa.SelectQuality]]);
                f = path[f];
            }
            ret.reverse()
            return ret;
        }
        for (var t = 0; t < dismatrix[index_min_].length; t++) {
            if (dismatrix[index_min_][t] < 100) {
                if (dis[t] >= 100 && !flag[t]) {
                    dis[t] = min_ + dismatrix[index_min_][t];
                    path[t] = index_min_;
                    continue;
                }
                if (dis[t] < 100 && dis[t] < min_ + dismatrix[index_min_][t]) {
                    dis[t] = min_ + dismatrix[index_min_][t];
                    path[t] = index_min_;
                    continue;
                }
            }
        }
        dis[index_min_] = 100;
        flag[index_min_] = true;
    }

    return [];
}

/**
 * 绘制折线图
 * @param data
 * @param div
 */
var paintLineChart_temp1 = function (data, div) {
    var width = 600;
    var height = 300;
    var padding = 10;
    var points = [];//圆形

    var temp = [];
    for (var i = 0; i < data.length; i++) {
        temp.push([i, data[i][1]]);
    }
    d3.select(document.getElementById(div)).select("svg").remove();
    var svg = d3.select(document.getElementById(div)).append("svg")
        .attr("width", width)
        .attr("height", height);
    var x_scale = d3.scale.linear()
        .domain(rangeData(temp, 0))
        .range([70, width - padding]);
    var y_scale = d3.scale.linear()
        .domain([0, 1])
        .range([height - padding - padding, padding]);
    var xAxis = d3.svg.axis()
        .scale(x_scale)
        .orient("bottom");
    var yAxis = d3.svg.axis()
        .scale(y_scale)
        .orient("left");
    svg.append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(0,' + (height - padding - padding) + ')')
        .call(xAxis);
    svg.append('g')
        .attr('class', 'axis')
        .attr("transform", "translate(" + 35 * 2 + "," + 0 + ")")
        .call(yAxis);

    for (var i = 0; i < temp.length; i++) {
        points.push([x_scale(temp[i][0]), y_scale(temp[i][1]), data[i][0]]);
    }
    var line = d3.svg.line()
        .x(function (d, i) {
            return x_scale(d[0])
        })
        .y(function (d, i) {
            return y_scale(d[1]);
        })
        .interpolate('linear');
    svg.append('path')
        .attr('class', 'line')
        .attr('d', line(temp))
        .attr("fill", "none")
        .attr("stroke-width", 3)
        .attr("stroke", "red");
    svg.selectAll("circle")
        .data(points)
        .enter()
        .append("circle")
        .attr("cx", function (d) {
            return d[0];
        })
        .attr("cy", function (d) {
            return d[1];
        })
        .attr("r", 3)
        .attr("fill", "yellow")
        .on("mouseover", function (d, i) {
            d3.select("#detailData").select("svg").remove();
            paintStarplot(d[2]);
            paintDetial(Globa.Quality[d[2]]);
            console.log(d);
        })

}

//8.29
//######################################################################################
/**
 * 根据树图的邻接矩阵构建,d3 tree
 * @param treeRoot
 * @param mstMatrix
 * @returns {{}}
 */
var build_Radial_data = function (treeRoot, mstMatrix) {
    var ret = {};
    var flag = [];
    for (var i = 0; i < mstMatrix.length; i++) {
        flag.push(false);
    }
    ret = Recursive_build_Radial_data(treeRoot, flag, mstMatrix);
    return ret;
}
/**
 * 递归函数
 * @param treeRoot
 * @param flag
 * @param graphMatrix
 * @returns {{name: *, children: Array}}
 * @constructor
 */
var Recursive_build_Radial_data = function (treeRoot, flag, graphMatrix) {
    var ret = {"name": treeRoot, "children": []};
    var childCount = 0;
    for (var i = 0; i < graphMatrix[treeRoot].length; i++) {
        if (graphMatrix[treeRoot][i] < 100 && !flag[i]) {
            childCount++;
            flag[i] = true;
            var child = Recursive_build_Radial_data(i, flag, graphMatrix);
            ret.children.push(child);
        }
    }
    if (childCount == 0) {
        ret = {"name": treeRoot, "size": treeRoot};
    }
    return ret;
}

//判断点是否在多边形中
var pointInPolygon = function (point, vs) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
    var xi, xj, i, intersect,
        x = point[0],
        y = point[1],
        inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        xi = vs[i][0],
            yi = vs[i][1],
            xj = vs[j][0],
            yj = vs[j][1],
            intersect = ((yi > y) != (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
};
/**
 * 合并两个集合（去重）
 * @param arr1
 * @param arr2
 * @returns {Array}
 */
var concatArray = function (arr1, arr2) {
    var ret = arr1;
    for (var i = 0; i < arr2.length; i++) {
        if (arr1.indexOf(arr2[i]) < 0) {
            ret.push(arr2[i]);
        }
    }
    return ret;
}

/**
 * 构建测地矩阵的MST树
 * @param gdDistance
 * @returns {Array}
 */
var mst_gdDistance = function (gdDistance) {
    var ret = []
    var sets = {}; //顶点所在集合
    var sides = []; //边集
    for (var i = 0; i < gdDistance.length; i++) {
        sets[i] = [i];  //设置每个顶点的所在集合为自己
        for (var j = i + 1; j < gdDistance[i].length; j++) {
            sides.push([i, j, gdDistance[i][j]]);  //边集列表
        }
    }
    sides = sides.sort(function (a, b) {  //排序
        return a[2] - b[2];
    });
    var mstMatrix = [];
    for (var i = 0; i < gdDistance.length; i++) {
        mstMatrix[i] = [];
        for (var j = 0; j < gdDistance[i].length; j++) {
            mstMatrix[i][j] = 100;
        }
    }
    var count = 0;
    for (var i = 0; i < sides.length; i++) {
        var side_x = sides[i][0];
        var side_y = sides[i][1];
        var side_dis = sides[i][2];
        var set_x = -1;  //顶点x所在集合
        var set_y = -1;  //顶点y所在集合
        for (var j in sets) {
            var sets_j = sets[j];
            if (sets_j.indexOf(side_x) != -1) {
                set_x = parseInt(j);
            }
            if (sets_j.indexOf(side_y) != -1) {
                set_y = parseInt(j);
            }
        }
        if (set_x != set_y) {
            sets[set_x] = sets[set_x].concat(sets[set_y]);
            delete sets[set_y];
            mstMatrix[side_x][side_y] = side_dis;
            mstMatrix[side_y][side_x] = side_dis;
            count++;
            if (count == gdDistance.length - 1) {
                return mstMatrix;
            }
        }

    }
    return ret;
}
/**
 * 图中亲近中心性最大的点
 * @param distanceMatrix
 * @returns {number}
 */
var graph_CenterPoint = function (distanceMatrix) {
    var ret = -1;
    var centers = [];
    for (var i = 0; i < distanceMatrix.length; i++) {
        var sum = 0;
        for (var j = 0; j < distanceMatrix[i].length; j++) {
            sum += distanceMatrix[i][j];
        }
        var center = 1.0 / sum;
        centers[i] = center;
    }
    ret = centers.indexOf(d3.max(centers));
    return ret;
}
/**
 * fx 函数
 * @param x
 * @param fx
 * @returns {number}
 */
var Fx = function (x, fx) {
    var ret = 0;
    for (var i = 0; i < fx.length; i++) {
        ret += fx[i] * Math.pow(x, i);
    }
    return ret;
}
/**
 * 点到直线的距离
 * @param line
 * @param point
 * @returns {number}
 */
var pointsToLineDis = function (line, point) {
    var ret = -1;
    var A = line[1][1] - line[0][1]; //y2 - y1
    var B = line[1][0] - line[0][0]; //x2 - x1
    if(B != 0)
    {
        var C = B*line[0][1] - A*line[0][0]; // By1-Ax1
        //直线方程 Ax-By+C=0
        ret = A*point[0] + -1*B*point[1]+C;
        ret /= Math.sqrt(A*A + B*B);
        ret = Math.abs(ret)
    }
    else
    {
        ret = Math.abs(point[0] - line[1][0]);
    }
    return ret;
}
/**
 * 得到中间视图
 * @param t
 * @param k
 * @param begin
 * @param end
 * @returns {Array}
 */
function getMiddleplot(t, k, begin, end) {
    var a = [];
    var b = [];
    for (var i = 0; i < begin.length; i++) {
        var tem = [];
        for (var j = 0; j < begin[0].length; j++) {
            tem.push(begin[i][j] * (1 - t / k) + end[i][j] * (t / k));
        }
        if (i == 0) {
            a = tem;
        } else {
            b = tem;
        }
    }
    var middlePlot = [];
    middlePlot.push(a);
    middlePlot.push(b);
    return middlePlot;
}
/**
 * 数组转置
 * @param arr
 * @returns {Array}
 */
function transform(arr) {
    var newarr = [];
    for (var i = 0; i < arr[0].length; i++) {
        var temarr = [];
        for (var j = 0; j < arr.length; j++) {
            temarr.push(arr[j][i]);
        }
        newarr.push(temarr);
    }
    return newarr;
}
/**
 * 两个子空间相等比较
 * @param vec1
 * @param vec2
 */
var subDY = function (vec1, vec2) {
    for(var i=0; i<vec1.length; i++)
    {
        for(var j=0; j<vec1[i].length; j++)
        {
            if(vec1[i][j] != vec2[i][j])
            {
                return false;
            }
        }
    }
    return true;
}
/**
 * 获取当前文件名
 */
var get_file_name = function () {
    var fileName = document.getElementById("selectData").value;
    fileName = fileName.split("/");
    fileName = fileName[fileName.length-1];
    fileName = fileName.split(".");
    return fileName[0];
}
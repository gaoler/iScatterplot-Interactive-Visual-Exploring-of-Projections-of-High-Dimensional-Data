/**
 * Created by Administrator on 2017/8/18.
 */

var TEST = {};
TEST.data = [];
TEST.subdis = 0;
TEST.gddis = 0;
TEST.pointId = []
var shouDimensionInfo = function (divId) {
    var div = document.getElementById(divId);
    var html = "";
    html += "<p>" + "子空间1" + "</p>";
    html += "<p>" + (TEST.data[0][0]).toString() + "</p>";
    html += "<p>" + (TEST.data[0][1]).toString() + "</p>";
    if (TEST.data.length === 2) {
        html += "<p>" + "子空间2" + "</p>";
        html += "<p>" + (TEST.data[1][0]).toString() + "</p>";
        html += "<p>" + (TEST.data[1][1]).toString() + "</p>";
    }
    html += "<p>" + "子空间距离=" + (TEST.subdis).toString() + "</p>";
    html += "<p>" + "子空间测地距离=" + (TEST.gddis).toString() + "</p>";
    div.innerHTML = html;
}

var addDimensionInfo = function (data, divId) {
    for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < data[i].length; j++) {
            var t = (parseFloat(data[i][j])).toFixed(3)
            data[i][j] = parseFloat(t)
        }
    }

    if (TEST.data.length == 0) {
        TEST.data.push(data);
        TEST.subdis = 0;
        TEST.gddis = 0;
        shouDimensionInfo(divId);
    }
    else if (TEST.data.length == 1) {
        TEST.data.push(data);
        var jsonData = JSON.stringify(TEST.data)
        var formData = new FormData();
        formData.append("id", "requestOneSubspaceDistance");
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
                    TEST.subdis = data.subDis;
                    TEST.gddis = Globa.GdMatrix[TEST.pointId[TEST.pointId.length-1]][TEST.pointId[TEST.pointId.length-2]]
                    shouDimensionInfo(divId);
                },
                error: function (data) {
                }
            });
    }
    else {
        TEST.data = [];
        addDimensionInfo(data, divId);
    }
}

var addPointId = function (id) {
    TEST.pointId.push(id);
    if(TEST.pointId.length > 100)
    {
        TEST.pointId.splice(0, 90);
    }
}



var test1 = function () {
    for(var i=0; i<Globa.Quality.length; i++)
    {
        console.log(("#" + i + "," + Globa.Quality[i]["MIC"]));
    }

    for(var i=0; i<Globa.Points_Cluster[0].length; i++)
    {
        var a = (Globa.Points_Cluster[395][i])/0.04;
        var ab = (Globa.Points_Cluster[575][i])/0.667;
        console.log(("#" + a + "," + ab));
    }
}

var test2 = function () {
     var data = {"TYPE": "#get_d3Test"};
        var data = JSON.stringify(data);
        $.ajax(
            {
                url: "http://127.0.0.1:9000/",
                type: "POST",
                data: data,
                processData: false,
                contentType: false,
                success: function (data) {
                    console.log("ok");
                },
                error: function (data) {
                    console.log("error");
                }
            });
}

/**
 * clumpy 度量
 * @param points
 * @returns {[*,*]}
 */
var clumpy = function (points) {
    /**
     * 得到全联通图的所有边
     * @type {Array}
     */
    var graphSide = [];
    for (var i = 0; i < points.length; i++) {
        for (var j = i + 1; j < points.length; j++) {
            var dis_x = points[i][0] - points[j][0];
            var dis_y = points[i][1] - points[j][1];
            dis_x *= dis_x;
            dis_y *= dis_y;
            var dis = dis_x + dis_y;
            if(dis == 0)
            {
                graphSide.push([i, j, Math.sqrt(0.000000001)]);
                continue;
            }
            graphSide.push([i, j, Math.sqrt(dis)]);
        }
    }
    /**
     * 排序
     */
    graphSide.sort(function (a, b) {
        return parseFloat(a[2]) - parseFloat(b[2]);
    });
    /**
     * 连通域
     * @type {{}}
     */
    var mst_tree = [];
    var mst_side = [];
    var flag = {};
    for (var i = 0; i < points.length; i++) {
        flag[i] = [i];
        mst_tree[i] = {};
    }
    /**
     * mst
     */
    var count = 0;
    var flag_x = -1;
    var flag_y = -1;
    var side_x = -1;
    var side_y = -1;
    for (var i = 0; i < graphSide.length; i++) {
        flag_x = -1;
        flag_y = -1;
        side_x = graphSide[i][0];
        side_y = graphSide[i][1];
        for (var j in flag) {
            if (flag[j].indexOf(side_x) != -1) {
                flag_x = parseInt(j);
            }
            if (flag[j].indexOf(side_y) != -1) {
                flag_y = parseInt(j);
            }
            if (flag_y >= 0 && flag_x >= 0) {
                break;
            }
        }
        if (flag_x != flag_y) {
            flag[flag_x] = (flag[flag_x]).concat(flag[flag_y]);
            delete flag[flag_y];
            var dis = graphSide[i][2];

            mst_tree[side_x][side_y] = dis;
            mst_tree[side_y][side_x] = dis;
            mst_side.push([side_x, side_y, dis]);

            count++;
            if (count == points.length - 1) {
                break;
            }
        }
        else {
            continue;
        }
    }
    delete flag;
    delete graphSide;
    /**
     * 每个点的贡献
     */
    var points_qua = [];
    for (var i = 0; i < points.length; i++) {
        points_qua[i] = [0, 0];
    }
    /**
     * 求每个边的度量
     */
    var side_clumpy = [];
    for (var i = 0; i < mst_side.length; i++) {
        var root_x = mst_side[i][0];
        var root_y = mst_side[i][1];
        var dis = mst_side[i][2];
        /**
         * 删除i边
         */
        delete mst_tree[root_x][root_y]
        delete mst_tree[root_y][root_x]
        /**
         * 遍历每个子树
         */
        var rootX = readTree(root_x, mst_tree, dis);
        var rootY = readTree(root_y, mst_tree, dis);
        /**
         * 得到度量
         */
        var qua = -1;
        if (rootX[0] != rootY[0]) {
            qua = rootX[0] < rootY[0] ? rootX[1] : rootY[1];
            side_clumpy[i] = qua;
        }
        else {
            qua = rootX[1] < rootY[1] ? rootX[1] : rootY[1];
        }
        side_clumpy[i] = 1 - qua / dis;
        /**
         * 顶点贡献
         */
        points_qua[root_x][0] += side_clumpy[i]==0? 1:side_clumpy[i];
        points_qua[root_y][0] += side_clumpy[i]==0? 1:side_clumpy[i];
        points_qua[root_x][1]++;
        points_qua[root_y][1]++;
        /**
         * 回填i边
         */
        mst_tree[root_x][root_y] = dis;
        mst_tree[root_y][root_x] = dis;
    }
    /**
     * 视图度量
     * @type {*}
     */
    var clumpy_qua = d3.max(side_clumpy);
    /**
     * 每个点的度量
     */
    for (var i = 0; i < points_qua.length; i++) {
        var qua = points_qua[i][0] / points_qua[i][1];
        qua *= clumpy_qua;
        points_qua[i] = qua;
    }

    return [clumpy_qua, points_qua];


}
/**
 * 遍历树
 * @param root
 * @param tree
 * @param sideDis
 * @returns {[*,*]}
 */
var readTree = function (root, tree, sideDis) {
    var n = 0;
    var maxlength = -1;
    var flag = [];
    for (var i = 0; i < tree.length; i++) {
        flag[i] = false;
    }
    var que = [];
    flag[root] = true;
    for (var i in tree[root]) {
        var dis = tree[root][i];
        if (dis <= sideDis) {
            n++;
            maxlength = dis > maxlength ? dis : maxlength;
        }
        que.push(parseInt(i));
        flag[parseInt(i)] = true;
    }
    while (que.length > 0) {
        var me = que.pop();
        for (var i in tree[me]) {
            if(flag[parseInt(i)])
            {
                continue;
            }
            var dis = tree[me][i];
            if (dis <= sideDis) {
                n++;
                maxlength = dis > maxlength ? dis : maxlength;
            }
            que.push(parseInt(i));
            flag[parseInt(i)] = true;
        }
    }
    if(maxlength == -1)
    {
        maxlength = sideDis;
    }
    return [n, maxlength];
}

var tese3 = function (index) {
    var str = "";
    for(var i=0; i<Globa.Points[100].length; i++)
    {
        str += "["+Globa.Points[100][i][0] + "," + Globa.Points[100][i][1]+"],"
    }
    console.log(str);

    d3.max(Globa.Quality, function (d) {
        return d.CLUSTER;
    })
}

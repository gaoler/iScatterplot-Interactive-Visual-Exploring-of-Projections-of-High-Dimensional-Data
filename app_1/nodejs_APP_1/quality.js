const d3 = require("./d3.min.js")

/**
 * Created by Administrator on 2017/9/6.
 */
/**
 * 聚类度量
 * @param points
 * @param dimension 维度个数
 * @returns {[*,*]}
 */
var cluster2 = function (points, dimension) {
    var knn = [];
    var K = 2 * dimension;
    var pointsConvexArea = [];
    for (var i = 0; i < points.length; i++) {
        knn[i] = [];
    }
    for (var i = 0; i < points.length; i++) {
        for (var j = 0; j < points.length; j++) {
            var dis_x = points[i][0] - points[j][0];
            var dis_y = points[i][1] - points[j][1];
            dis_x *= dis_x;
            dis_y *= dis_y;
            var dis = Math.sqrt(dis_x + dis_y);
            knn[i].push([j, dis]);
            knn[j].push([i, dis]);
        }
    }
    var vor = d3.geom.voronoi()
        .x(function (d) {
            return d[0];
        })
        .y(function (d) {
            return d[1];
        });
    /**
     * 求每个点的凸包面积
     */
    for (var i = 0; i < knn.length; i++) {
        knn[i].sort(function (d) {
            return d[1];
        });
        var temp = [];
        for (var j = 0; j < K; j++) {
            temp.push(points[knn[i][j][0]])
        }
        var tri = vor.triangles(temp);
        var area = 0;
        for (var k = 0; k < tri.length; k++) {
            area += areaTri(tri[k]);
        }
        pointsConvexArea[i] = area;
    }
    /**
     *
     */
    var sum = 0;
    for (var i = 0; i < pointsConvexArea.length; i++) {
        sum += pointsConvexArea[i];
    }
    sum /= points.length;
    /**
     * 度量
     */
    var quality = Math.exp(-1 * sum);
    /**
     * 每个点的贡献
     */
    var pointsQua = [];
    for (var i = 0; i < pointsConvexArea.length; i++) {
        pointsQua[i] = quality * (Math.exp(-1 * pointsConvexArea[i]));
    }
    return [quality, pointsQua];
}
/**
 * 三角形面积
 * @param tri
 * @returns {number}
 */
var areaTri = function (tri) {
    var A = tri[0];
    var B = tri[1];
    var C = tri[2];
    var AB = [B[0] - A[0], B[1] - A[1]];
    var AC = [C[0] - A[0], C[1] - A[1]];
    var AB_X_AC = AB[0] * AC[1] - AB[1] * AC[0]; //向量叉乘
    AB_X_AC = Math.abs(AB_X_AC);
    return (1 / 2) * AB_X_AC;
}


/**
 * 计算聚类度量值
 * @param points->点集（x,y）
 * @returns {number}
 */

var cluster = function (points) {
    var point_sim = [];
    var ret = [];
    var dim_1 = [];
    var dim_2 = [];
    for (var i = 0; i < points.length; i++) {
        dim_1.push(points[i][0]);
        dim_2.push(points[i][1]);
    }
    var h_1 = H(dim_1);
    var h_2 = H(dim_2);
    var similary = 0;
    for (var i = 0; i < dim_1.length; i++) {
        var pSim = (h_1[i] < h_2[i] ? h_1[i] : h_2[i]);
        similary += pSim;
        point_sim[i] = pSim;
    }
    var sim = similary / (dim_1.length * dim_1.length);   //similary |DB|////
    // sim = sim - 1;
    // if(sim <0)
    // {
    //     console.log(sim);
    // }
    // sim = sim < 0 ? 0 : sim;
    // sim = Math.exp(-(sim));
    // sim = 1 - parseFloat(sim)

    for (var i = 0; i < point_sim.length; i++) {
        point_sim[i] *= sim;
    }

    ret = [sim, point_sim];  //[当前视图的聚类程度度量， 当前视图下每个点对聚类的贡献]
    return ret;
}

/**
 *得到指定维度上所有点的局部密度  h(p,d)
 * @param dimension:维度
 * @returns {Array}:每个点的局部密度值
 * @constructor
 */
var H = function (dimension) {
    var wWHOLEK = 20;
    var res = [];
    var point = [];  //保存点集
    var e = 1.0 / Math.pow(dimension.length, 3)
    for (var i = 0; i < dimension.length; i++) {
        point.push([dimension[i], parseInt(i)]);  //点的坐标 和 索引值
    }
    point.sort(function (a, b) {
        return a[0] - b[0]
    });  //将点按坐标进行排序
    for (var i = 0; i < dimension.length; i++)  //初始化res
    {
        res.push(0);
    }

    for (var i = 0; i < point.length; i++) {
        var index = point[i][1];   //点的ID
        var j1 = i, j2 = i + 1;
        var count = 0;
        var X = point[i][0];//当前点坐标
        while (count < wWHOLEK) {
            if (j1 >= 0 && j2 < point.length) {
                var flag = (point[j2][0] - X) >= (X - point[j1][0]);
                if (flag) {
                    j1--;
                }
                else {
                    j2++;
                }
                count++;
            }
            else if (j1 < 0 && j2 < point.length) {
                j2++;
                count++;
            }
            else if (j1 >= 0 && j2 >= point.length) {
                j1--;
                count++;
            }
            else {
                break;
            }
        }

        var tempDataj = (point[(j2 - 1)][0] - point[(j1 + 1)][0]);
        tempDataj = tempDataj <= e ? e : tempDataj;
        res[point[i][1]] = (wWHOLEK - 1) / (tempDataj);  //保存距离
    }
    return res;
}

var cluster3 = function (points, category) {
    var disMatrix = [];
    for (var i = 0; i < points.length; i++) {
        disMatrix[i] = [];
    }
    for (var i = 0; i < points.length; i++) {
        disMatrix[i][i] = 0;
        for (var j = i + 1; j < points.length; j++) {
            var dx = points[i][0] - points[j][0];
            var dy = points[i][1] - points[j][1];
            var dis = Math.sqrt(dx * dx + dy * dy);
            disMatrix[i][j] = dis;
            disMatrix[j][i] = dis;
        }
    }
    var pointsQua = [];
    for (var i = 0; i < points.length; i++) {
        var temp = [0, 0, 0, 0];
        var categoryI = category[i];
        for (var j = 0; j < points.length; j++) {
            if (category[j] == categoryI) {
                temp[0] += disMatrix[i][j];
                temp[1] += 1;
            }
            else {
                temp[2] += disMatrix[i][j];
                temp[3] += 1;
            }
        }
        // console.log(temp);
        var similarQua = temp[0] / temp[1];
        var noSimilarQua = temp[2] / temp[3];
        noSimilarQua *= 10;
        pointsQua[i] = noSimilarQua / similarQua;
        //console.log([categoryI, similarQua, noSimilarQua]);
    }
    delete disMatrix
    var qua = 0;
    for (i = 0; i < pointsQua.length; i++) {
        qua += pointsQua[i];
    }
    return [qua / pointsQua.length, pointsQua];
}

var cluster4 = function (points, pointsCategory) {
    var disMatrix = [];
    var bfb = 0.1;
    for (var i = 0; i < points.length; i++) {
        disMatrix[i] = [];
    }
    for (var i = 0; i < points.length; i++) {
        disMatrix[i][i] = 0;
        for (var j = i + 1; j < points.length; j++) {
            var dx = points[i][0] - points[j][0];
            var dy = points[i][1] - points[j][1];
            var dis = Math.sqrt(dx * dx + dy * dy);
            disMatrix[i][j] = dis;
            disMatrix[j][i] = dis;
        }
    }
    var points_sim = [];
    var points_out = [];
    for(var i=0; i<disMatrix.length; i++)
    {
        var cate = pointsCategory[i];
        points_out[i] = [];
        var sum_sim = 0;
        var count_sim = 0;
        for(var j=0; j<disMatrix[i].length; j++)
        {
            if(pointsCategory[j] == cate)
            {
                sum_sim += disMatrix[i][j];
                count_sim += 1;
            }
            else
            {
                points_out[i].push(disMatrix[i][j]);
            }
        }
        points_sim[i] = sum_sim/count_sim;
    }
    for(var i=0; i<points_out.length; i++)
    {
        points_out[i].sort();
        var numbser = parseInt(bfb*points_out[i].length);
        var sum_ot = 0;
        for(var j=0; j<numbser; j++)
        {
            sum_ot += points_out[i][j];
        }
        points_out[i] = sum_ot/numbser;
    }
    var pointQua = [];
    for(var i=0; i<points.length; i++)
    {
        pointQua[i] = points_out[i]/points_sim[i];
    }
    delete disMatrix;
    delete points_out;
    delete points_sim;
    return [1, pointQua];
}

/**
 * 求得异常度量
 * @param points 点集->(x,y)
 * @returns {number}
 */
var outlying = function (points) {
    var ret = 0;
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
            graphSide.push([i, j, Math.sqrt(dis_x + dis_y)]);
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
    var flag = {};
    var mst_side_sorted = {};
    for (var i = 0; i < points.length; i++) {
        flag[i] = [i];
        mst_side_sorted[i] = [10000, -1]; //(min, max) side
    }
    /**
     * mst
     */
    var mst_side_ = [];
    var sum_mst_side = 0;
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
            mst_side_sorted[side_x][0] = dis < mst_side_sorted[side_x][0] ? dis : mst_side_sorted[side_x][0];
            mst_side_sorted[side_y][0] = dis < mst_side_sorted[side_y][0] ? dis : mst_side_sorted[side_y][0];
            mst_side_sorted[side_x][1] = dis > mst_side_sorted[side_x][1] ? dis : mst_side_sorted[side_x][1];
            mst_side_sorted[side_y][1] = dis > mst_side_sorted[side_y][1] ? dis : mst_side_sorted[side_y][1];
            mst_side_.push(dis);
            sum_mst_side += dis;

            count++;
            if (count == points.length - 1) {
                break;
            }
        }
        else {
            continue;
        }

    }
    /**
     * 得到异常点
     */
    mst_side_.sort();
    var side_outlying = []; //当前视图下每个点对异常的贡献
    var out_point = []; //异常点
    var outlyer = 0;
    var q75 = parseInt((mst_side_.length) * 0.75);
    var q25 = parseInt((mst_side_.length) * 0.25);
    q75 = mst_side_[q75];
    q25 = mst_side_[q25];
    var w = q75 + 1.5 * (q75 - q25);
    for (var i in mst_side_sorted) {
        if (mst_side_sorted[i][0] >= w) {
            out_point.push(parseInt(i));
            outlyer += mst_side_sorted[i][1];
        }
        side_outlying[parseInt(i)] = mst_side_sorted[i][0] / sum_mst_side;
    }
    outlyer = parseFloat(outlyer) / sum_mst_side;

    // for (var i = 0; i < side_outlying.length; i++) {
    //     side_outlying[i] *= outlyer;
    // }

    ret = [outlyer, side_outlying];
    return ret;
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
            if (dis == 0) {
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
        var n1 = rootX[0];
        var n2 = rootY[0];
        var nn = n1 < n2 ? n1 : n2;
        nn *= 2;
        nn /= (n1 + n2);
        side_clumpy[i] = 1 - qua / dis;
        side_clumpy[i] *= nn;
        /**
         * 顶点贡献
         */
        points_qua[root_x][0] += side_clumpy[i] == 0 ? 1 : side_clumpy[i];
        points_qua[root_y][0] += side_clumpy[i] == 0 ? 1 : side_clumpy[i];
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
            if (flag[parseInt(i)]) {
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
    if (maxlength == -1) {
        maxlength = sideDis;
    }
    return [n, maxlength];
}


/**
 * util
 */

var min_array = function (array) {
    var min = array[0];
    for (var i = 0; i < array.length; i++) {
        min = min < array[i] ? min : array[i];
    }
    return min;
}

var sum_array = function (array) {
    var sum = 0;
    for (var i = 0; i < array.length; i++) {
        sum += array[i];
    }
    return sum;
}

var paintArraqy = function (data) {
    for (var i in data) {
        console.log(data[i]);
    }
}

exports.Cluster = cluster
exports.Cluster2 = cluster2
exports.Cluster3 = cluster3
exports.Cluster4 = cluster4
exports.Outlying = outlying
exports.Clumpy = clumpy
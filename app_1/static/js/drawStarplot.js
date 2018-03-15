/**
 * Created by Administrator on 2017/1/4.
 */
//画星状图函数
var LastStarplot = null;
//画星状图
function drawStarplot(vector) {
    LastStarplot = vector;
    var anchorCoor = transform(vector);
    var width = 400;
    var height = 400;

    var svg = d3.select("#starPlot").append("svg")
        .attr("width", width)
        .attr("height", height);

    var xScale = d3.scale.linear()
        .domain([-1, 1])
        .range([0, width]);

    var yScale = d3.scale.linear()
        .domain([-1, 1])
        .range([height, 0]);


    var arcData = [];               //弧半径数据
    var offset = width / 2;           //偏移量
    var center = [offset, offset];   //圆心点

    for (var i = 0; i < anchorCoor.length; i++) {
        arcData[i] = Math.sqrt((xScale(anchorCoor[i][0]) - offset) * (xScale(anchorCoor[i][0]) - offset) + (yScale(anchorCoor[i][1]) - offset) * (yScale(anchorCoor[i][1]) - offset));
    }

    var lineData = [];              //直线数据
    for (var i = 0; i < anchorCoor.length; i++) {
        lineData.push(anchorCoor[i]);
    }

    var arc = d3.svg.arc()          //创建弧生成器
        .startAngle(0)
        .endAngle(Math.PI * 2)
        .innerRadius(function (d) {
            return d;
        })
        .outerRadius(function (d) {
            return d;
        });

    for (var i = 0; i < arcData.length; i++) {
        drawArc(arcData[i], i);
    }
    for (var i = 0; i < lineData.length; i++) {
        drawLine(xScale(lineData[i][0]), yScale(lineData[i][1]), offset, offset, i);
    }
    for (var i = 0; i < anchorCoor.length; i++) {
        drawText(xScale(anchorCoor[i][0]), yScale(anchorCoor[i][1]), i);
    }
    drawCircle(anchorCoor);
    //绘制圆弧
    function drawArc(data, i) {
        svg.append("path")
            .attr("d", arc(data))
            .attr("transform", "translate(" + offset + "," + offset + ")")
            .attr("stroke", "gray")
            .attr("stroke-width", "1px")
            .attr("id", "arcpath" + i);
    }

    //绘制线段
    function drawLine(x1, y1, x2, y2, i) {
        svg.append("line")
            .attr("x1", x1)
            .attr("y1", y1)
            .attr("x2", x2)
            .attr("y2", y2)
            .attr("stroke", "pink")
            .attr("stroke-width", "3px")
            .attr("fill", "none")
            .attr("id", "linepath" + i);
    }

    //绘制锚点
    function drawCircle(data) {
        var circleColor = "#7DFFA1";
        var cr = 5;
        var dragcr = 8;
        var circle = svg.append("circle").attr("cx", center[0]).attr("cy", center[1]).attr("r", cr).attr("fill", circleColor);
        var drag = d3.behavior.drag()
            .on("dragstart", function () {
                d3.select(this).attr("r", dragcr);
            })
            .on("drag", ondrag)
            .on("dragend", function (d, i) {
                d3.select(this).attr("r", cr);
            });
        var circles = svg.selectAll("anchor")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "anchor")
            .attr("fill", circleColor)
            .attr("cx", function (d) {
                return xScale(d[0]);
            })
            .attr("cy", function (d) {
                return yScale(d[1]);
            })
            .attr("r", cr)
            .call(drag);
        //拖拽函数
        function ondrag(d, i) {
            d[0] = d3.event.x;
            d[1] = d3.event.y;
            d3.select("#linepath" + i).attr("x1", d[0]).attr("y1", d[1]).attr("x2", offset).attr("y2", offset);
            var newarcData = Math.sqrt((d[0] - offset) * (d[0] - offset) + (d[1] - offset) * (d[1] - offset));
            d3.select("#arcpath" + i).attr("d", arc(newarcData));
            d3.select(this).attr("cx", d[0]).attr("cy", d[1]);
            d3.select("#anchortext" + i).attr("x", d[0]).attr("y", d[1]);
            var anchorx = (d[0] - offset) / offset;
            var anchory = -(d[1] - offset) / offset;
            var newanchorCoor = [];
            for (var j = 0; j < anchorCoor.length; j++) {
                newanchorCoor.push(anchorCoor[j])
            }
            newanchorCoor[i][0] = anchorx;
            newanchorCoor[i][1] = anchory;
            var resanchorCoor = transform(newanchorCoor);
        }
    }

    //绘制文字
    function drawText(x, y, i) {
        svg.append("text")
            .attr("fill", "black")
            .attr("x", x)
            .attr("y", y)
            .attr("dy", ".3em")
            .attr("dx", ".3em")
            .attr("font-size", "12px")
            .text(i + 1).attr("id", "anchortext" + i);
    }

}

//初始视图到最终视图之间的过渡
function transStarplot(endStarplot) {
    var beginStarplot = LastStarplot;
    var pointsData = [];
    var newanchorCoor = [];          //插值过程中的中间视图
    var k = 100;                     //正交均匀插值过程中的采样数
    for (var i = 0; i <= k; i++) {
        var temStarplot = getMiddleplot(i, k, beginStarplot, endStarplot);
        newanchorCoor.push(temStarplot)
    }
    var t0 = Date.now();
    var Interval = 10;

    /**
     * guang
     */
    var points = Globa.NormlizeData;
    var vector = newanchorCoor;
    var delytime = Interval;
    var data = {"vector": vector, "points": points}
    var jsonData = JSON.stringify(data)
    var formData = new FormData();
    formData.append("id", "requestDotSSS");
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
                pointsData = data;
                var timeid = setInterval(redrawStarplot, Interval);

                function redrawStarplot() {  //------------------------------------------------------
                    d3.select("#starPlot").select('svg').remove();
                    var t1 = Date.now();
                    var dt = t1 - t0;
                    var dk = newanchorCoor.length;
                    var di = parseInt(dt / Interval);
                    drawStarplot(newanchorCoor[di]);  //------------------------------------------
                    animationMainG(pointsData[di],  Interval);
                    if (di == dk - 1) {
                        clearInterval(timeid);
                    }
                }
            },
            error: function (data) {
            }
        });

}
//得到中间视图
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
//对数组进行转置
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
//施密特正交化
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








    

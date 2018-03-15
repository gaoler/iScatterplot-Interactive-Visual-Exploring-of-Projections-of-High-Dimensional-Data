var initMainBody = function (points) {
    d3.select("#MainView").select("svg").selectAll("circle").remove();//这里需要删除上次的视图来更新
    var width = 890;
    var height = 890;
    var x_padding = 50;
    var y_padding = 50;
    var svg = d3.select("#MainView")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("id", "MainBodySvg_");
    var g1 = svg.append("g")
        .attr("id", "MainBodySvg");
    var g2 = svg.append("g")
        .attr("id", "MainBodySvg_2");
    var g3 = svg.append("g")
        .attr("id", "MainBodySvg_3");
    var g4 = svg.append("g")
        .attr("id", "MainBodySvg_4");
    /**
     * 绘制图形
     */
    paintSvg(svg);
    paintMianG(g1, points);
    paintProG(g2);
    paintRecG(g3, g4, Globa.PcaVector);
    g1.attr("transform", "translate(0,25)");
    g2.attr("transform", "translate(-1,717 )");

}

var initBody = function () {
    qualityCheck();
    IsLine();

    Globa.Points_BaseColor = "steelblue";
    Globa.Color = ["#b2df8a", "#33a02c", "#fb9a99", "#e31a1c", "#fdbf6f", "#cab2d6", "#6a3d9a", "#b15928"];
    Globa.Points_Color = [];
}

var paintMianG = function (g, circledata) {

    var points_name = ["Afghanistan", "Albania", "Algeria", "Angola", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Belarus", "Belgium", "Belize", "Bermuda", "Bhutan", "Bolivia", "Bosnia And Herzegovina", "Botswana", "Brazil", "Bulgaria", "Cambodia", "Cameroon", "Canada", "Chile", "China", "Colombia", "Costa Rica", "Croatia", "Cuba", "Curacao", "Cyprus", "Czech Republic", "Denmark", "Dominican Republic", "Ecuador", "Egypt", "EI Salvador", "Estonia", "Ethiopia", "Fiji", "Finland", "France", "Georgia", "Germany", "Ghana", "Greece", "Greenland", "Guam", "Guatemala", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kosovo (Disputed Territory)", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Libya", "Luxembourg", "Macao", "Macedonia", "Malaysia", "Maldives", "Malta", "Mexico", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Namibia", "Nepal", "Netherlands", "New Zealand", "Nigeria", "Norway", "Oman", "Pakistan", "Palestinian Territory", "Panama", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Puerto Rico", "Qatar", "Romania", "Russia", "Rwanda", "Saudi Arabia", "Serbia", "Singapore", "Slovakia", "Slovenia", "South Africa", "South Korea", "Spain", "Sri Lanka", "Sweden", "Switzerland", "Syria", "Taiwan", "Tanzania", "Thailand", "Trinidad And Tobago", "Tunisia", "Turkey", "Turkmenistan", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"];

    var rect_width = 690;
    var rect_height = 690 - 10;
    var x_padding = 50;
    var y_padding = 50;
    var cr = 5;
    var xMax = d3.max(circledata, function (d) {
        return d[0];
    });
    var xMin = d3.min(circledata, function (d) {
        return d[0];
    });
    var yMax = d3.max(circledata, function (d) {
        return d[1];
    });
    var yMin = d3.min(circledata, function (d) {
        return d[1];
    });
    var xScale = d3.scale.linear()//定义X轴比例尺
        .domain([xMin, xMax])
        .range([x_padding, rect_width - x_padding]);

    var yScale = d3.scale.linear()//定义Y轴比例尺
        .domain([yMin, yMax])
        .range([rect_height - y_padding, y_padding]);

    g.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("fill", "white")
        .attr("height", rect_height)
        .attr("width", rect_width)
        .attr("stroke-width", "1")
        .attr("stroke", "#FFFFFF")

    g.selectAll("circle")
        .data(circledata)
        .enter()
        .append("circle")
        .attr("cx", function (d) {
            return xScale(d[0]);
        })
        .attr("cy", function (d) {
            return yScale(d[1]);
        })
        .attr("r", cr)
        .attr("p_id", function (d, i) {
            return i;
        })
        .attr("fill", function (d, i) {
            if (Globa.LastStarplotSelted.indexOf(i) != -1) {
                return Globa.Points_SeleteColor;
            }
            if (Globa.Points_Color[i] == undefined) {
                return Globa.Points_BaseColor;
            }
            return Globa.Points_Color[i];
        })
        .on("click", function (d, i) {
            if (!Globa.Is_Point) {
                return
            }
            var seleted = [i];
            g.selectAll("circle").attr("opacity", 1);
            Globa.StarplotSelted = concatArray(Globa.StarplotSelted, seleted);
            d3.select(this).attr("fill", Globa.Points_SeleteColor);
            DragEndReaction();
        })
        .append("title")
        .attr("id", function (d, i) {
            return "id" + i;
        })
        .text(function (d, i) {
            if (get_file_name() == "Quality of Life Index-clean") {
                return points_name[i];
            }
            return "";
        })
    /**
     * 添加圈选事件
     */
    var dragLine = [];
    var line = d3.svg.line()
        .x(function (d) {
            return d[0];
        })
        .y(function (d) {
            return d[1];
        });
    var drag = d3.behavior.drag();
    drag.on("dragstart", function () {
        if (Globa.Is_Point) {
            return
        }
        g.select("#Drag_line").remove();
        g.selectAll("circle").attr("opacity", 1);
        var cx = d3.event.sourceEvent.offsetX;
        var cy = d3.event.sourceEvent.offsetY - 25;
        dragLine = [[cx, cy]];
    });
    drag.on("drag", function () {
        if (Globa.Is_Point) {
            return
        }
        var cx = d3.event.sourceEvent.offsetX;
        var cy = d3.event.sourceEvent.offsetY - 25;
        dragLine.push([cx, cy]);
        if (Globa.Is_ZhiXian) {
            dragLine = [dragLine[0], [cx, cy]];
            Globa.MicDragLine = dragLine;
        }
        g.select("#Drag_line").remove();
        g.append("path")
            .attr("d", line(dragLine))
            .attr("id", "Drag_line")
            .attr("fill", "none")
            .attr("stroke", "#8da0cb")
            .attr("stroke-width", 2);
        var rect_width = 690;
        var rect_height = 690 - 10;
        if (Globa.Is_ZhiXian) {
            var disArray = [];
            Globa.StarplotSelted = [];
            var tempDragLine = [[], []];
            for (var jj = 0; jj < dragLine.length; jj++) {
                tempDragLine[jj][0] = dragLine[jj][0]/rect_width;
                tempDragLine[jj][1] = dragLine[jj][1]/rect_height;
            }
            g.selectAll("circle").each(function (d, i) {
                var me = d3.select(this);
                var cx = parseFloat(me.attr("cx")) / rect_width;
                var cy = parseFloat(me.attr("cy")) / rect_height;
                var dis = pointsToLineDis(tempDragLine, [cx, cy]);
                // dis = Math.exp(-1 * dis)
                disArray[i] = dis;
            });
            var minD = d3.min(disArray);
            var maxD = d3.max(disArray);
            var range = maxD - minD;
            var opu = [1, 1, 0.0, 0.0, 0.0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.000, 0.000, 0.000, 0.000, 0.000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000]
            g.selectAll("circle").each(function (d, i) {
                var me = d3.select(this);
                me.attr("fill", Globa.Points_BaseColor);
                me.attr("opacity", function () {
                    // var opa = ((disArray[i] - minD) / range);
                    // opa = parseInt(opa / 0.05);
                    // opa = opu[opa];
                    // if(opa == 1)
                    // {
                    //     Globa.StarplotSelted.push(i);
                    // }
                    // return opa;
                    if (disArray[i] <= 0.05) {
                        Globa.StarplotSelted.push(i);
                        me.attr("fill", Globa.Points_SeleteColor)
                        return 1;
                    }
                    else {
                        return 0;
                    }
                })
            });

        }
    });
    drag.on("dragend", function (event) {
        if (Globa.Is_Point) {
            return
        }
        if (Globa.Is_ZhiXian) {
            g.select("#Drag_line").remove();
        }
        if (dragLine.length > 5) {
            var seleted = [];
            g.selectAll("circle").each(function (d, i) {
                var me = d3.select(this);
                var px = parseFloat(me.attr("cx"));
                var py = parseFloat(me.attr("cy"));
                if (pointInPolygon([px, py], dragLine)) {
                    seleted.push(i);
                    me.attr("fill", function () {
                        return Globa.Points_SeleteColor;
                    })
                }
            })
            Globa.StarplotSelted = concatArray(Globa.StarplotSelted, seleted);
        }
        if (dragLine.length > 5 || Globa.Is_ZhiXian) {
            if (Globa.Is_ZhiXian) {
                g.selectAll("circle")
                    .attr("opacity", 1);
            }

            DragEndReaction();
        }
    })
    g.call(drag);
}

var paintRecG = function (gx, gy, histogramdata) {
    var numberRec = histogramdata[0].length;
    var width = 460;
    var tail = 15; //尾端长度
    var recWidth = (width - 2 * tail) / (1.4 * numberRec - 0.4); //矩形长度
    var rectHeight = 45; //矩形最大高度
    var interval = 0.4 * recWidth;  //矩形间隔

    var rectData = [];
    for (var i = 0; i < numberRec; i++) {
        var startPoint = tail;
        tail += (recWidth + interval);
        rectData.push(startPoint);
    }

    /***
     * 绘制x轴边框矩形
     */
    // gx.append("rect")
    //     .attr("x", 0)
    //     .attr("y", 0)
    //     .attr("width", width)
    //     .attr("height", 150)
    //     .attr("fill", "#fff")
    //     .attr("stroke-width", 1)
    //     .attr("stroke", "#ccc");

    /**
     * 绘制x轴中线
     * @type {number}
     */
    var xLineY = 50 + 5;  //中线位置
    gx.append("line")
        .attr("x1", 0)
        .attr("y1", xLineY)
        .attr("x2", width)
        .attr("y2", xLineY)
        .attr("stroke", "#6D6D6D")
        .attr("stroke-width", "1px")
        .attr("fill", "none")
        .attr("shape-rendering", "crispEdges")

    /**
     * 绘制x轴边线
     */
    gx.append("line")
        .attr("x1", 0)
        .attr("y1", xLineY - rectHeight)
        .attr("x2", 0)
        .attr("y2", xLineY + rectHeight)
        .attr("stroke", "#6D6D6D")
        .attr("stroke-width", "1px")
        .attr("fill", "none")
        .attr("shape-rendering", "crispEdges")
    gx.append("g")
        .attr("transform", function (d, i) {
            var x = -10;
            var y = xLineY - rectHeight + 13;
            return "translate(" + x + "," + y + ")";
        })
        .append("text")
        .text(1)
        .attr("font-size", "15px")
    gx.append("g")
        .attr("transform", function (d, i) {
            var x = -18;
            var y = xLineY + rectHeight - 1;
            return "translate(" + x + "," + y + ")";
        })
        .append("text")
        .text(-1)
        .attr("font-size", "15px")
    var all_text = ["Purchasing Power Index", "Safety Index", "Health Care Index", "Cost of Living Index", "Property Price to Income Ratio", "Traffic Commute Time Index", "Pollution Index"];
    /**
     * 绘制x轴矩形
     */
    gx.selectAll(".xrect")
        .data(rectData)
        .enter()
        .append("rect")
        .attr("class", "xrect")
        .attr("x", function (d, i) {
            return d
        })
        .attr("y", function (d, i) {
            var h = histogramdata[0][i] * rectHeight;
            return h > 0 ? xLineY - h : xLineY;
        })
        .attr("width", recWidth)
        .attr("height", function (d, i) {
            var h = histogramdata[0][i] * rectHeight;
            return Math.abs(h);
        })
        .attr("fill", function (d, i) {
            var h = histogramdata[0][i];
            var color = 0;
            if (h >= 0) {
                color = "#CA312E";
            }
            else {
                color = "#4682B4"
            }
            return color;
        })
        .append("title")
        .text(function (d, i) {
            if (get_file_name() == "Quality of Life Index-clean") {
                return all_text[i];
            }
            return "Dim" + parseInt(i + 1);
        });
    /**
     * 绘制x轴文字
     */
    gx.selectAll(".text2")
        .data(rectData)
        .enter()
        .append("g")
        .attr("transform", function (d, i) {
            var x = d + recWidth / 2;
            var y = xLineY + rectHeight + 5;
            return "translate(" + x + "," + y + ")";
        })
        .append("text")
        .attr("class", "text2")
        .attr("fill", "black")
        // .attr("font-weight", "bold")
        .attr("font-size", "16px")
        .style("text-anchor", "end")
        .text(function (d, i) {
            var str = "Dim" + (i + 1);
            return str;
        })
        .attr("transform", "rotate(-45)");

    /**
     * 绘制y轴边框矩形
     */
    // gy.append("rect")
    //     .attr("x", 0)
    //     .attr("y", 0)
    //     .attr("height", width)
    //     .attr("width", 150)
    //     .attr("fill", "#fff")
    //     .attr("stroke-width", 1)
    //     .attr("stroke", "#ccc");
    /**
     * 绘制y轴中线
     */
    var yLineX = 50 + 5;
    gy.append("line")
        .attr("x1", yLineX)
        .attr("y1", 0)
        .attr("x2", yLineX)
        .attr("y2", width)
        .attr("stroke", "#6D6D6D")
        .attr("stroke-width", "1px")
        .attr("fill", "none")
        .attr("shape-rendering", "crispEdges")

    /**
     * 绘制y轴边线
     */
    gy.append("line")
        .attr("x1", yLineX - rectHeight)
        .attr("y1", 0)
        .attr("x2", yLineX + rectHeight)
        .attr("y2", 0)
        .attr("stroke", "#6D6D6D")
        .attr("stroke-width", "1px")
        .attr("fill", "none")
        .attr("shape-rendering", "crispEdges")
    gy.append("g")
        .attr("transform", function (d, i) {
            var x = yLineX - rectHeight;
            var y = -3;
            return "translate(" + x + "," + y + ")";
        })
        .append("text")
        .text(-1)
        .attr("font-size", "15px")
    gy.append("g")
        .attr("transform", function (d, i) {
            var x = yLineX + rectHeight - 7;
            var y = -3;
            return "translate(" + x + "," + y + ")";
        })
        .append("text")
        .text(1)
        .attr("font-size", "15px")

    /**
     * 绘制y轴矩形
     */
    gy.selectAll(".yrect")
        .data(rectData)
        .enter()
        .append("rect")
        .attr("class", "yrect")
        .attr("x", function (d, i) {
            var h = histogramdata[1][i] * rectHeight;
            return h < 0 ? yLineX + h : yLineX;
        })
        .attr("y", function (d, i) {
            return d;
        })
        .attr("width", function (d, i) {
            var h = histogramdata[1][i] * rectHeight;
            return Math.abs(h);
        })
        .attr("height", recWidth)
        .attr("fill", function (d, i) {
            return histogramdata[1][i] > 0 ? "#CA312E" : "#4682B4"
        })
        .append("title")
        .text(function (d, i) {
            if (get_file_name() == "Quality of Life Index-clean") {
                return all_text[i];
            }
            return "Dim" + parseInt(i + 1);
        });
    /**
     * 绘制y轴文字
     */
    gy.selectAll(".text2")
        .data(rectData)
        .enter()
        .append("g")
        .attr("transform", function (d, i) {
            var x = yLineX + rectHeight + 5;
            var y = d + recWidth / 2;
            return "translate(" + x + "," + y + ")";
        })
        .append("text")
        .attr("class", "text2")
        .attr("fill", "black")
        // .attr("font-weight", "bold")
        .attr("font-size", "16px")
        .text(function (d, i) {
            return "Dim" + parseInt(i + 1);
        })

    gy.attr("transform", "translate(719, 140)");
    gx.attr("transform", "translate(140, 739)");


}

var paintSvg = function (svg) {
    // svg.append("line")
    //     .attr("x1", 00)
    //     .attr("y1", 740)
    //     .attr("x2", 892)
    //     .attr("y2", 740)
    //     .attr("stroke", "#6D6D6D")
    //     .attr("stroke-width", "1px")
    //     .attr("fill", "none")
    //     .attr("shape-rendering", "crispEdges")
    // svg.append("line")
    //     .attr("x1", 00)
    //     .attr("y1", 734)
    //     .attr("x2", 741)
    //     .attr("y2", 734)
    //     .attr("stroke", "#6D6D6D")
    //     .attr("stroke-width", "1px")
    //     .attr("fill", "none")
    //     .attr("shape-rendering", "crispEdges")
    //     .attr("fill", "none")
    svg.append("line")
        .attr("x1", 721)
        .attr("y1", 00)
        .attr("x2", 721)
        .attr("y2", 879)
        .attr("stroke", "#6D6D6D")
        .attr("stroke-width", "1px")
        .attr("fill", "none")
        .attr("shape-rendering", "crispEdges")
}

var paintProG = function () {
    var g = d3.select("#MainBodySvg_2");
    var drag = d3.behavior.drag()
        .on("drag", dragmove);

    g.append("rect")
        .attr("x", 0)
        .attr("y", 16)
        .attr("width", 721)
        .attr("height", 6)
        .attr("fill", "#ccc")

    g.append("rect")
        .attr("x", 0)
        .attr("y", 10)
        .attr("id", "huakuai")
        .attr("width", 10)
        .attr("height", 20)
        .attr("fill", "#6D6D6D")
        .call(drag);

    function dragmove(d) {
        var nowX = parseInt(d3.select(this).attr("x"));
        var count = parseInt((nowX / 712) * Globa.anchorCoor.length);

        if (count >= Globa.anchorCoor.length) {
            count = Globa.anchorCoor.length - 1;
        }
        if (count < 0) {
            count = 0;
        }

        animationMainG(Globa.anchorCoorPoinsData[count], 0.1, Globa.anchorCoor[count]);
        Globa.LastStarplot = Globa.anchorCoor[count];
        d3.select(this)
            .attr("x", function () {
                var x = d3.event.sourceEvent.offsetX;
                console.log(x);
                if (x <= 1) {
                    x = 0;
                }
                if (x > 712) {
                    x = 712;
                }
                // d3.select("#PROGRESS")
                //     .attr("width", x);
                return x;
            })
    }

    // g.append("rect")
    //     .attr("x", 0)
    //     .attr("y", 17)
    //     .attr("id", "PROGRESS")
    //     .attr("width", 0)
    //     .attr("height", 6)
    //     .attr("fill", "#ccc")
    // .attr("stroke-width", "0.5px")
    // .attr("stroke", "#ffffff");
}

var setProG = function (number) {
    number = number > 100 ? 100 : number;
    number = number < 0 ? 0 : number;
    var width = 712;
    var x = number * width / 100;
    d3.select("#huakuai")
        .attr("x", x);
    d3.select("#PROGRESS")
        .attr("width", x);


}


var seletedColor = function (g) {
    var color = Globa.Color[Globa.Color_index % Globa.Color.length];
    Globa.Color_index++;
    var g = d3.select("#MainBodySvg");
    if (Globa.LastStarplotSelted.length > 0) {
        g.selectAll("circle").each(function (d, i) {
            if (Globa.LastStarplotSelted.indexOf(i) >= 0) {
                var me = d3.select(this);
                me.attr("fill", color);
                Globa.Points_Color[i] = color;
            }
        })
    }
}

var clearColot = function () {
    Globa.Points_Color = [];
    var g = d3.select("#MainBodySvg");
    g.selectAll("circle").attr("fill", Globa.Points_BaseColor);
}

/**
 * 动画效果
 * @param circle
 */
var animationMainG = function (circledata, delyTime, histogramdata) {
    var g = d3.select("#MainBodySvg");
    g.select("#Drag_line").remove();
    var rect_width = 690;
    var rect_height = 690 - 10;
    var x_padding = 50;
    var y_padding = 50;
    var cr = 5;
    var xMax = d3.max(circledata, function (d) {
        return d[0];
    });
    var xMin = d3.min(circledata, function (d) {
        return d[0];
    });
    var yMax = d3.max(circledata, function (d) {
        return d[1];
    });
    var yMin = d3.min(circledata, function (d) {
        return d[1];
    });
    var xScale = d3.scale.linear()//定义X轴比例尺
        .domain([xMin, xMax])
        .range([x_padding, rect_width - x_padding]);

    var yScale = d3.scale.linear()//定义Y轴比例尺
        .domain([yMin, yMax])
        .range([rect_height - y_padding, y_padding]);
    g.selectAll("circle").data(circledata)
        .transition()
        .duration(delyTime)
        .attr("cx", function (d) {
            return xScale(d[0]);
        })
        .attr("cy", function (d) {
            return yScale(d[1]);
        })
        .attr("fill", function (d, i) {
            if (Globa.LastStarplotSelted.indexOf(i) != -1) {
                return Globa.Points_SeleteColor;
            }
            if (Globa.Points_Color[i] == undefined) {
                return Globa.Points_BaseColor;
            }
            return Globa.Points_Color[i];
        });
    /**
     * 矩形区域
     * @type {*}
     */
    var gx = d3.select("#MainBodySvg_3");
    var gy = d3.select("#MainBodySvg_4");
    var numberRec = histogramdata[0].length;
    var width = 460;
    var tail = 15; //尾端长度
    var recWidth = (width - 2 * tail) / (1.4 * numberRec - 0.4); //矩形长度
    var rectHeight = 45; //矩形最大高度
    var interval = 0.4 * recWidth;  //矩形间隔
    var yLineX = 50 + 5;
    var xLineY = 50 + 5;  //中线位置
    gx.selectAll(".xrect")
        .data(histogramdata[0])
        .attr("y", function (d, i) {
            var h = d * rectHeight;
            return h > 0 ? xLineY - h : xLineY;
        })
        .attr("height", function (d, i) {
            var h = d * rectHeight;
            return Math.abs(h);
        })
        .attr("fill", function (d, i) {
            var h = d;
            var color = 0;
            if (h >= 0) {
                color = "#CA312E";
            }
            else {
                color = "#4682B4"
            }
            return color;
        });
    gy.selectAll(".yrect")
        .data(histogramdata[1])
        .attr("x", function (d, i) {
            var h = d * rectHeight;
            return h < 0 ? yLineX + h : yLineX;
        })
        .attr("width", function (d, i) {
            var h = d * rectHeight;
            return Math.abs(h);
        })
        .attr("fill", function (d, i) {
            return d > 0 ? "#CA312E" : "#4682B4"
        })
}
/**
 *
 * @param circle
 */
var animationMainG_2 = function (circledata, histogramdata) {
    var g = d3.select("#MainBodySvg");
    g.select("#Drag_line").remove();
    var rect_width = 690;
    var rect_height = 690 - 10;
    var x_padding = 50;
    var y_padding = 50;
    var cr = 5;
    var xMax = d3.max(circledata, function (d) {
        return d[0];
    });
    var xMin = d3.min(circledata, function (d) {
        return d[0];
    });
    var yMax = d3.max(circledata, function (d) {
        return d[1];
    });
    var yMin = d3.min(circledata, function (d) {
        return d[1];
    });
    var xScale = d3.scale.linear()//定义X轴比例尺
        .domain([xMin, xMax])
        .range([x_padding, rect_width - x_padding]);

    var yScale = d3.scale.linear()//定义Y轴比例尺
        .domain([yMin, yMax])
        .range([y_padding, rect_height - y_padding]);
    g.selectAll("circle").data(circledata)
        .attr("cx", function (d) {
            return xScale(d[0]);
        })
        .attr("cy", function (d) {
            return yScale(d[1]);
        })
        .attr("fill", function (d, i) {
            if (Globa.LastStarplotSelted.indexOf(i) != -1) {
                return Globa.Points_SeleteColor;
            }
            if (Globa.Points_Color[i] == undefined) {
                return Globa.Points_BaseColor;
            }
            return Globa.Points_Color[i];
        });
    /**
     * 矩形区域
     * @type {*}
     */
    var gx = d3.select("#MainBodySvg_3");
    var gy = d3.select("#MainBodySvg_4");
    var numberRec = histogramdata[0].length;
    var width = 460;
    var tail = 15; //尾端长度
    var recWidth = (width - 2 * tail) / (1.4 * numberRec - 0.4); //矩形长度
    var rectHeight = 45; //矩形最大高度
    var interval = 0.4 * recWidth;  //矩形间隔
    var yLineX = 50 + 5;
    var xLineY = 50 + 5;  //中线位置
    gx.selectAll(".xrect")
        .data(histogramdata[0])
        .attr("y", function (d, i) {
            var h = d * rectHeight;
            return h > 0 ? xLineY - h : xLineY;
        })
        .attr("height", function (d, i) {
            var h = d * rectHeight;
            return Math.abs(h);
        })
        .attr("fill", function (d, i) {
            var h = d;
            var color = 0;
            if (h >= 0) {
                color = "#CA312E";
            }
            else {
                color = "#4682B4"
            }
            return color;
        });
    gy.selectAll(".yrect")
        .data(histogramdata[1])
        .attr("x", function (d, i) {
            var h = d * rectHeight;
            return h < 0 ? yLineX + h : yLineX;
        })
        .attr("width", function (d, i) {
            var h = d * rectHeight;
            return Math.abs(h);
        })
        .attr("fill", function (d, i) {
            return d > 0 ? "#CA312E" : "#4682B4"
        })
}
var qualityCheck = function () {
    var value = $('input[name="Quality"]:checked').val();
    Globa.SelectQuality = value;
    console.log(value);
}
var IsLine = function (i) {
    if (i == -1) {
        Globa.Is_Point = true;
        return
    }
    Globa.Is_Point = false;
    var value = $('input[name="Line"]:checked').val();
    Globa.Is_ZhiXian = value == "1";
}

var DragEndReaction = function () {
    if (Globa.StarplotSelted.length > 0 || Globa.Is_ZhiXian) {
        var index = -1;
        switch (Globa.SelectQuality) {
            case "MIC":
                index = mulServer_get_pointsMic(Globa.StarplotSelted);
                break;
            case "CLUSTER":
                index = mulServer_get_pointsCluster(Globa.StarplotSelted);
                break;
            case "OUTLYING":
                index = mulServer_get_pointsOutlying(Globa.StarplotSelted);
                break;
            default:
                break;
        }
        console.log(index);
        Globa.Color_index++;
        Globa.LastStarplotSelted = Globa.StarplotSelted;
        Globa.StarplotSelted = [];
        //animationMainG(Globa.Points[index], 500);
        subInterpolation(Globa.Vectors[index]);
        Globa.LastStarplot = Globa.Vectors[index];
    }
    else {
        var g = d3.select("#MainBodySvg")
        g.select("#Drag_line").remove();
        g.selectAll("circle")
            .attr("fill", function (d, i) {
                if (Globa.LastStarplotSelted.indexOf(i) != -1) {
                    return Globa.Points_SeleteColor;
                }
                if (Globa.Points_Color[i] == undefined) {
                    return Globa.Points_BaseColor;
                }
                return Globa.Points_Color[i];
            });
    }
}

var subInterpolation = function (endStarplot) {
    var beginStarplot = Globa.LastStarplot;
    if (subDY(beginStarplot, endStarplot)) {
        var g = d3.select("#MainBodySvg")
        g.select("#Drag_line").remove();
        g.selectAll("circle")
            .attr("fill", function (d, i) {
                if (Globa.LastStarplotSelted.indexOf(i) != -1) {
                    return Globa.Points_SeleteColor;
                }
                if (Globa.Points_Color[i] == undefined) {
                    return Globa.Points_BaseColor;
                }
                return Globa.Points_Color[i];
            });
        return;
    }
    var pointsData = [];
    var newanchorCoor = [];          //插值过程中的中间视图
    var k = 100;                     //正交均匀插值过程中的采样数
    for (var i = 0; i <= k; i++) {
        console.log(beginStarplot);
        console.log(endStarplot);
        var temStarplot = getMiddleplot(i, k, beginStarplot, endStarplot);
        console.log(temStarplot);
        newanchorCoor.push(temStarplot)
    }
    var t0 = Date.now();
    var Interval = 20;

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
                var count = 0;
                setProG(0);
                Globa.anchorCoor = newanchorCoor;
                Globa.anchorCoorPoinsData = pointsData;
                var timeid = setInterval(redrawStarplot, Interval);
                Globa.isCanSave = false;
                function redrawStarplot() {
                    count++;
                    animationMainG(pointsData[count], Interval, newanchorCoor[count]);
                    setProG(count * 100 / k);
                    if (count >= k) {
                        clearInterval(timeid);
                        Globa.isCanSave = true;
                    }
                }
            },
            error: function (data) {
            }
        });
}

var saveProjection = function () {
    if (!Globa.isCanSave) return;
    var g = d3.select("#MainBodySvg");
    var points = [];
    g.selectAll("circle")
        .each(function (d, i) {
            var me = d3.select(this);
            var cx = parseFloat(me.attr("cx"));
            var cy = parseFloat(me.attr("cy"));
            var id = parseInt(me.attr("p_id"));
            var color = me.attr("fill");
            points[id] = [cx, cy, color];
        });
    Globa.SaveProjection.push(Globa.LastStarplot);
    var svg_width = 220;
    var svg_height = 220;
    var x_padding = 20, y_padding = 20;
    var svg = d3.select("#selectedBody").append("svg")
        .attr("width", svg_width)
        .attr("height", svg_height)
        .attr("id", Globa.SaveProjection.length - 1)
        .attr("class", "selectedBodySvg")
        .attr("transform", "translate(5, 5)")
        .on("dblclick", function () {
            var me = d3.select(this);
            var ID = parseInt(me.attr("id"));

            var points = [];
            svg.selectAll("circle")
                .each(function (d, i) {
                    var me = d3.select(this);
                    var cx = parseFloat(me.attr("cx"));
                    var cy = parseFloat(me.attr("cy"));
                    var id = parseInt(me.attr("pp_id"));
                    var color = me.attr("fill");
                    points[id] = [cx, cy, color];
                });
            var pointsColor = [];
            var selectPoint = [];
            for (var i = 0; i < points.length; i++) {
                if (points[i][2] != Globa.Points_BaseColor && points[i][2] != Globa.Points_SeleteColor) {
                    pointsColor[i] = points[i][2];
                }
                if (points[i][2] == Globa.Points_SeleteColor) {
                    selectPoint.push(i);
                }
            }
            // Globa.Points_Color = pointsColor;
            Globa.LastStarplot = Globa.SaveProjection[ID];
            // Globa.LastStarplotSelted = selectPoint;
            Globa.LastStarplotSelted = [];
            Globa.anchorCoorPoinsData = null;
            Globa.anchorCoor = null;
            setProG(0);
            animationMainG_2(points, Globa.LastStarplot);
        })
    var max_x = d3.max(points, function (d) {
        return d[0];
    });
    var max_y = d3.max(points, function (d) {
        return d[1];
    });
    var min_x = d3.min(points, function (d) {
        return d[0];
    });
    var min_y = d3.min(points, function (d) {
        return d[1];
    });
    var xScale = d3.scale.linear()//定义X轴比例尺
        .domain([min_x, max_x])
        .range([x_padding, svg_width - x_padding]);

    var yScale = d3.scale.linear()//定义Y轴比例尺
        .domain([min_y, max_y])
        .range([y_padding, svg_height - y_padding]);
    svg.append("rect")
        .attr("x", 1)
        .attr("y", 1)
        .attr("width", svg_width - 1)
        .attr("height", svg_height - 1)
        .attr("fill", "#fff")
        .attr("stroke", "#6D6D6D")
        .attr("stroke-width", "1px")
        .attr("fill", "none")
        .attr("shape-rendering", "crispEdges")
    svg.selectAll("circle")
        .data(points)
        .enter()
        .append("circle")
        .attr("cx", function (d, i) {
            return xScale(d[0]);
        })
        .attr("cy", function (d, i) {
            return yScale(d[1]);
        })
        .attr("fill", function (d, i) {
            // return d[2];
            return Globa.Points_BaseColor;
        })
        .attr("r", 2)
        .attr("pp_id", function (d, i) {
            return i;
        });

}







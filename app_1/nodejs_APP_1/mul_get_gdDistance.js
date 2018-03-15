/**
 * Created by Administrator on 2017/9/7.
 */
var cluster = require('cluster');

process.on('message', function (msg) {
    var result = [];
    var knnGraph = msg[1];
    var viewIndex = msg[0];
    var dataLength = knnGraph.length;

    for(var i=0; i<viewIndex.length; i++)
    {
        var id = viewIndex[i];
        var dis = [];
        var flag = [];
        for(var j in knnGraph[id])
        {
            dis[parseInt(j)] = knnGraph[id][j];
        }
        for(var j=0; j<dataLength; j++)
        {
            flag[j] = false;
        }
        dis[id] = 0;
        //循环n次
        for(var o=0; o<dataLength; o++)
        {
            var min = 1000;
            var minIndex = -1;
            /**
             * 最小距离所在位置
             */
            for(var j=0; j<dataLength; j++)
            {
                if (!flag[j] && dis[j]!=undefined) {
                    if (dis[j] < min)
                    {
                        min = dis[j];
                        minIndex = j;
                    }
                }
            }
            /**
             * 得到最小距离，做值更新
             */
            if(minIndex != -1)
            {
                flag[minIndex] = true;
                for(var j in knnGraph[minIndex])
                {
                    if(!flag[parseInt(j)])
                    {
                        if(dis[parseInt(j)] == undefined)
                        {
                            dis[parseInt(j)] = min + knnGraph[minIndex][j];
                        }
                        else
                        {
                            dis[parseInt(j)] = Math.min(dis[parseInt(j)], min + knnGraph[minIndex][j])
                        }
                    }
                }
            }

        }
        result.push([id, dis])
    }

    process.send(result);
});
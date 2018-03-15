#!/usr/bin/python
# -*- coding: utf-8 -*-

from django.shortcuts import render
from django.shortcuts import render_to_response, RequestContext
from django.http import HttpResponse
import json
import heapq
from heapq import heappush, heappop
import numpy
from sklearn import manifold
import copy
import os

from minepy import MINE
import numpy as np
import math
from scipy.spatial import ConvexHull
from scipy.spatial import Delaunay
from scipy import stats
import gc
import object_models
import utils
import time


import parallel
import json
import csv

from django.core import serializers


# Create your views here.
def home(request):
    if request.method == 'POST' and request.is_ajax():
        if request.POST['id'] == 'requestSampledata':
            jsonData = request.POST.get("Data")
            jsonData = jsonData.encode("utf-8")
            data = json.loads(jsonData)

            productManager = object_models.ProductManager(data)
            ret = productManager.product_mamager_906()
            #ret = serializers.serialize("json", ret)
            ret = json.dumps(ret)

            jsonFileName = "special.json"
            # path = os.path.join(os.getcwd(), os.path("/static/data/jsonData/"), jsonFileName)
            path = str(os.getcwd()) + "\\app_1\static\data\jsonData\\" + jsonFileName
            print path
            utils.storeJson(ret, path)

            del productManager
            del data
            gc.collect()
            return HttpResponse("ok", content_type="application/json")
        elif request.POST['id'] == 'requestDot':
            print "requestDot"
            jsonData = request.POST.get("Data")
            jsonData = jsonData.encode("utf-8")
            data = json.loads(jsonData)
            vector = np.array(data["vector"])
            points = np.array(data["points"])
            points = np.transpose(points)
            ret = np.dot(vector, points)
            ret = np.transpose(ret)
            ret = np.array(ret).tolist()
            ret = json.dumps(ret)
            return HttpResponse(ret, content_type="application/json")
        elif request.POST['id'] == 'requestDotSSS':
            print "requestDotSSS"
            ret = []
            jsonData = request.POST.get("Data")
            jsonData = jsonData.encode("utf-8")
            data = json.loads(jsonData)
            vector = data["vector"]
            points = np.array(data["points"])
            points = np.transpose(points)
            for i in vector:
                i = np.array(i)
                d = np.dot(i, points)
                d = np.transpose(d)
                d = d.tolist()
                ret.append(d)
            ret = json.dumps(ret)
            return HttpResponse(ret, content_type="application/json")
        elif request.POST['id'] == 'requestOneData':  # 度量单个数据集的特征
            jsonData = request.POST.get("Data")
            jsonData = jsonData.encode("utf-8")
            data = json.loads(jsonData)
            quality = object_models.Quality(data)
            quality.get_All_Qualitys()
            ret = {"outlier": quality.Outlier, "OUTLYING": quality.Outlying, "MIC": quality.Mic,
                   "SKEWED": quality.Skewed, "mstside": quality.Mst_Side, "points": quality.Points,
                   "CLUMPY": quality.Clumpy}
            ret = json.dumps(ret)
            return HttpResponse(ret, content_type="application/json")
        elif request.POST['id'] == 'requestOneSubspaceDistance':  # 度量两个子空间距离
            jsonData = request.POST.get("Data")
            jsonData = jsonData.encode("utf-8")
            data = json.loads(jsonData)
            subDis = utils.subsapceDis(data)
            ret = {"subDis": subDis}
            ret = json.dumps(ret)
            return HttpResponse(ret, content_type="application/json")
        elif request.POST['id'] == 'requestSaveData':  # 保存数据
            jsonData = request.POST.get("Data")
            jsonData = jsonData.encode("utf-8")
            data = json.loads(jsonData)
            jsonFileName = data["fileName"]
            jsonFileName += ".json"
            data = data["data"]
            data = json.dumps(data)
            #path = os.path.join(os.getcwd(), os.path("/static/data/jsonData/"), jsonFileName)
            path = str(os.getcwd()) + "\\app_1\static\data\jsonData\\" + jsonFileName
            print path
            utils.storeJson(data, path)
            return HttpResponse(jsonFileName)
    return render_to_response('home.html', {'handler': []}, context_instance=RequestContext(request))


##test by jiangguang 8.10
################################################################################
def test(request):
    if request.method == "POST" and request.is_ajax():
        id = request.POST.get("id")
        if id == "SAVE":
            jsonData = request.POST.get("Data")
            jsonData = jsonData.encode("utf-8")
            data = json.loads(jsonData)
            fileName = write_csv(data)
            return HttpResponse("file save as " + fileName)
        elif id == "DIST":
            file_dist = open("d:/temp/dist.txt")
            data = file_dist.readline()
            return HttpResponse(data, content_type="application/json")
        elif id == "MIC":
            jsonData = request.POST.get("Data")
            jsonData = jsonData.encode("utf-8")
            data = json.loads(jsonData)
            mine = MINE()
            x = np.array(data[0])
            y = np.array(data[1])
            mine.compute_score(x, y)
            ret = mine.mic()
            print ret
            return HttpResponse(ret)
        elif request.POST['id'] == 'requestOneData':  # 度量单个数据集的特征
            jsonData = request.POST.get("Data")
            jsonData = jsonData.encode("utf-8")
            data = json.loads(jsonData)
            quality = object_models.Quality(data)
            quality.get_All_Qualitys()
            ret = {"outlier": quality.Outlier, "OUTLYING": quality.Outlying, "MIC": quality.Mic,
                   "SKEWED": quality.Skewed, "mstside": quality.Mst_Side, "points": quality.Points,
                   "CLUMPY": quality.Clumpy}
            ret = json.dumps(ret)
            return HttpResponse(ret, content_type="application/json")
    return render_to_response('test.html', {'handler': []}, context_instance=RequestContext(request))


# 将数组写到csv文件中
def write_csv(data):
    fileName = "d:/temp/" + str(time.clock()) + ".csv"
    csv_writer = csv.writer(file(fileName, 'wb'))
    first_line = range(len(data[0]))
    csv_writer.writerow(first_line)
    csv_writer.writerows(data)
    print "file save as " + fileName
    return fileName

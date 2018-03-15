#!/usr/bin/python
# -*- coding:utf8 -*-

from django.shortcuts import render
from django.shortcuts import render_to_response, RequestContext
from django.http import HttpResponse
import json
import heapq
from heapq import heappush, heappop
import numpy
from sklearn import manifold
import copy
import gc
import numpy as np
import utils
import math
from scipy.spatial import ConvexHull
from scipy.spatial import Delaunay
from scipy import stats

import multiprocessing
import time

import object_models

# 距离矩阵函数
def mul_quality(datas):
    cores = multiprocessing.cpu_count()
    pool = multiprocessing.Pool(processes=cores)
    qualitys = pool.map(do_quality, datas)
    del datas
    gc.collect()
    return qualitys


def do_quality(points):
    quality = utils.pearsonr(points)
    ret = {"MIC":quality}
    del points
    return ret



# 求子空间距离矩阵函数
def mul_subspaceMatrix(subdata, n):
    dist = np.zeros((n, n))
    dataList = []
    cores = multiprocessing.cpu_count()
    pool = multiprocessing.Pool(processes=cores)
    for i in range(n):
        for j in range(i + 1, n):
            dataList.append([i, j, [subdata[i], subdata[j]]])  # return dist
    for ret in pool.imap_unordered(do_subspaceMatrix, dataList):
        i = ret[0]
        j = ret[1]
        dist[i][j] = ret[2]
        dist[j][i] = ret[2]
    del dataList
    del subdata
    gc.collect()
    return dist


def do_subspaceMatrix(data):
    i = data[0]
    j = data[1]
    subdata = data[2]
    Vi = subdata[0]
    Vj = subdata[1]
    Vi = np.matrix(Vi)
    Vj = np.matrix(Vj)
    Vjt = np.transpose(Vj)
    V = Vi * Vjt
    [u, s, v] = np.linalg.svd(V)
    sn = len(s)
    temlast = 0
    for k in range(sn):
        temlast = temlast + s[k] * s[k]
    last = 1 - np.sqrt(temlast / sn)
    del data
    gc.collect()
    return [i, j, last]

#相关性度量
def mul_curve(data, category):
    # mic 度量贡献
    mics_curve = []
    # curve度量参数曲线
    curve_line = []

    rundata = []
    for i in data:
        rundata.append((i, category))

    cores = multiprocessing.cpu_count()
    pool = multiprocessing.Pool(processes=cores)
    ret = pool.map(do_curve, rundata)

    for i in range(len(ret)):
        curve = ret[i]
        curve = np.array(curve).tolist()
        mics_curve.append(np.array(curve[1]).tolist())
        curve_line.append(np.array(curve[0]).tolist())
    return [mics_curve, curve_line]

def do_curve(data):
    points = data[0]
    pointsCata = data[1]

    catePoint = {}
    for i in range(len(pointsCata)):
        if catePoint.has_key(pointsCata[i]):
            catePoint[pointsCata[i]][0].append(points[i])
            catePoint[pointsCata[i]][1].append(i)
        else:
            catePoint[pointsCata[i]] = [0,0]
            catePoint[pointsCata[i]][0] = [points[i]]
            catePoint[pointsCata[i]][1] = [i]

    temp1 = []
    for i in range(len(points)):
        temp1.append(0)
    ret = [[], temp1]

    for i in catePoint.keys():
        pointsData = catePoint[i][0]
        cateData = catePoint[i][1]
        curve = utils.calculateCurveQuality(pointsData)
        curve = np.array(curve).tolist()
        mics_curve = np.array(curve[1]).tolist()
        # curve_line = np.array(curve[0]).tolist()
        # sumdis = 0
        # for j in range(len(mics_curve)):
        #     sumdis += mics_curve[j]
        # sumdis /= len(mics_curve)
        # sumdis = math.exp(-1 * sumdis)
        for j in range(len(mics_curve)):
            index = cateData[j]
            ret[1][index] = mics_curve[j]
    return ret

#!/usr/bin/python
# -*- coding:utf8 -*-
import json
import numpy as np
import math
from minepy import MINE
from  scipy import  stats

###皮尔逊相关系数
def pearsonr(points):
    points = np.array(points)
    points = np.transpose(points)
    x = points[0]
    y = points[1]
    ret = stats.pearsonr(x, y)
    return math.fabs(ret[0])

###mic度量函数
def mic(points):
    points = np.transpose(points)
    mine = MINE()
    mine.compute_score(points[0], points[1])
    Mic =  mine.mic()
    del points
    return Mic
###存储JSON数据到文件
def storeJson(jsonData, fileName):
    with open(fileName, "w") as jsonFile:
        jsonFile.write(jsonData)

###从文件加载JSON格式数据
def loadJson(fileName):
    with open(fileName) as jsonData:
        data = json.load(jsonData)
        return data

###获取相关性度量
def calculateCurveQuality(dataset):
    dataset = np.array(dataset)
    #计算Beta系数
    def calculateBeta(m,n,x,y):
        X=[]
        for i in range(m):
            temX=[]
            for j in range(n+1):
                temX.append(x[i]**j)
            X.append(temX)
        X=np.matrix(X)
        y=np.matrix(y)
        y=y.T
        Beta=(X.T*X).I*X.T*y
        Beta=np.array(Beta)
        return Beta
    x=dataset[:,0]
    y=dataset[:,1]
    n=1                                         #多项式函数模型的阶数 #保存所有系数值
    m=len(dataset)                              #原始数据大小
    coff=calculateBeta(m,n,x,y)                 #保存所有系数值
    A=coff[1][0]
    C=coff[0][0]
    B=-1
    dist=[]
    for i in range(len(x)):
        tem1=abs(x[i]*A+y[i]*B+C)
        tem2=np.sqrt(A*A+B*B)
        dist.append(tem1/tem2)
    return [coff,dist]

###子空间距离
def subsapceDis(subdata):
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
    return last
##pca
def Pca(tem):
    tem = np.array(tem)
    length=2
    row=np.shape(tem)[0]
    col=np.shape(tem)[1]
    mat=[]
    for i in range(row):
        for j in range(col):
            mat.append(float(tem[i][j]))
    mat=np.array(mat)
    mat=mat.reshape((row,col))
    mat=np.mat(mat)
    meanval=np.mean(mat,axis=0)
    rmmeanMat=mat-meanval
    covMat=np.cov(rmmeanMat,rowvar=0)
    eigval,eigevc=np.linalg.eig(covMat)
    tfMat=eigevc[:,0:length]
    result = []
    for i in range(tfMat.shape[0]):
        result.append([tfMat[i][0],tfMat[i][1]])
    return result


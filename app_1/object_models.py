#!/usr/bin/python
# -*- coding:utf8 -*-
import gc
import numpy
import numpy as np
import math
import parallel
import utils


################################################################################################class Sampling
class Sampling:
    def __init__(self, number, dimension, points):
        self.Number = number  # 采样个数
        self.Dimension = dimension  # 维度个数
        self.Points = points  # 数据集

    def get_Rotation_matrix(self):
        S = np.random.randn(self.Dimension, self.Dimension)
        Q, R = np.linalg.qr(S)
        w = numpy.diag(numpy.sign(numpy.diag(R)))
        T = np.dot(Q, w)
        return T

    def get_Base_Vector(self):
        ret = np.ones((self.Dimension, 1))
        return ret

    def get_Sampling_Vector(self):  # 采样得到基向量集合
        base_vector = self.get_Base_Vector()
        ret = []
        for i in range(self.Number):
            T1 = self.get_Rotation_matrix()
            vector1 = np.dot(T1, base_vector)
            T2 = self.get_Rotation_matrix()
            vector2 = np.dot(T2, base_vector)
            vector = numpy.hstack((vector1, vector2))
            q, r = np.linalg.qr(vector)
            vector = np.transpose(q)
            ret.append(vector)
        self.Vectors = ret  # 基向量集合

    def get_Sampling_Data(self):  # 采样得到投影数据集合
        ret = []
        points = np.array(self.Points)
        for i in self.Vectors:
            i = np.transpose(i)
            data = np.dot(points, i)
            ret.append(data)
        self.Datas = ret  # 投影数据集合

    def do_All(self):
        self.get_Sampling_Vector()
        self.get_Sampling_Data()


###########################################################################################ProductManager
class ProductManager:
    def __init__(self, data):
        self.Ori_Data = data

    def product_mamager_906(self):
        data = self.Ori_Data
        # 采样集合
        print "sampling"
        sampling = Sampling(data["number"], data["dimension"], data["points"])
        sampling.do_All()

        print "qualitys"
        # mic度量集合
        # qualitys = parallel.mul_quality(np.array(sampling.Datas).tolist())
        qualitys = []

        # #mic 度量贡献
        # mics_curve = []
        # #curve度量参数曲线
        # curve_line = []
        print "curve"
        Globa = data["Globa"]
        category = Globa["CategoryData"]
        for i in range(len(category)):
            category[i] = category[i].encode("utf-8")
        [mics_curve, curve_line] = parallel.mul_curve(np.array(sampling.Datas).tolist(), category)

        for i in range(len(mics_curve)):
            mics = mics_curve[i]
            sum = 0
            for j in range(len(mics)):
                sum += mics[j]
            sum /= len(mics)
            sum = math.exp(-1 * sum)
            qualitys.append({"MIC": sum})
            for j in range(len(mics)):
                # mics[j] = sum * math.exp(-1 * mics[j])
                mics[j] = math.exp(-1 * mics[j])
        print "pca"
        pcaVector = utils.Pca(data["points"])
        pcaData = np.dot(np.array(data["points"]), pcaVector)

        # sampling.Vectors.append(pcaVector)
        # sampling.Datas.append(pcaData)



        print "ret"
        ret = {}
        ret["vectors"] = np.array(sampling.Vectors).tolist()
        ret["datas"] = np.array(sampling.Datas).tolist()
        ret["qualitys"] = qualitys
        ret["mic_curve"] = np.array(mics_curve).tolist()
        ret["curve_line"] = np.array(curve_line).tolist()
        ret["pcaData"] = np.array(pcaData).tolist()
        ret["pcaVector"] = np.array(np.transpose(pcaVector)).tolist()

        for i in range(len(ret["pcaData"])):
            for j in range(len(ret["pcaData"][i])):
                ret["pcaData"][i][j] = complex(ret["pcaData"][i][j]).real
        for i in range(len(ret["pcaVector"])):
            for j in range(len(ret["pcaVector"][i])):
                ret["pcaVector"][i][j] = complex(ret["pcaVector"][i][j]).real

        Globa["Vectors"] = ret["vectors"]
        Globa["Points"] = ret["datas"]
        Globa["Quality"] = ret["qualitys"]
        Globa["Points_Mic"] = ret["mic_curve"]
        Globa["Curve_Line"] = ret["curve_line"]
        Globa["PcaData"] = ret["pcaData"]
        Globa["PcaVector"] = ret["pcaVector"]

        Globa["Vectors"].append(Globa["PcaVector"])
        Globa["Points"].append(Globa["PcaData"])
        Globa["Quality"].append({"MIC": 0})
        temp = [];
        for i in range(len(Globa["Points"])):
            temp.append(0)

        Globa["Points_Mic"].append(temp)

        del sampling
        del mics_curve
        del data
        gc.collect()

        return Globa

    # 度量矩阵
    def _quality_matrix(self, quality):
        ret = np.zeros((len(quality), len(quality)))
        for i in range(len(quality)):
            for j in range(i + 1, len(quality)):
                dis = quality[i] - quality[j]
                dis = math.fabs(dis)
                ret[i][j] = dis
                ret[j][i] = dis
        return ret

    def _normal_matrix(self, matrix):
        temp = []
        for i in matrix:
            temp.append(max(i))
        maxV = max(temp)
        for i in range(len(matrix)):
            for j in range(i + 1, len(matrix)):
                t = matrix[i][j] / maxV
                matrix[i][j] = t
                matrix[j][i] = t
        return matrix


###########################################################################################function
def compare_knnClass_1(d):
    return d[1]


def Clustering(self):
    points = self.Points
    points = np.array(points)
    points_x = points[:, 0]
    points_y = points[:, 1]
    points_x = self._local_density(points_x)
    points_y = self._local_density(points_y)
    sum = 0
    for i in range(len(points_x)):
        sum += min([points_x[i], points_y[i]])
    self.Cluster = float(sum) / (len(points_x) * len(points_x))


def _local_density(self, data):
    # 归一化
    temp = []
    max_data = max(data)
    min_data = min(data)
    ran = max_data - min_data
    for i in data:
        i = (i - min_data) / ran
        temp.append(i)
    data = temp

    k = 9
    e = 1.0 / len(data)
    points = {}
    ret = np.zeros(len(data))
    for i in range(len(data)):
        points[i] = data[i]
    points = sorted(points.iteritems(), key=lambda asd: asd[1])
    for i in range(len(data)):
        index = i
        i_ = i
        while (i - i_) <= k:
            if i < len(data) and i_ >= 0:
                if math.fabs(points[i][1] - points[index][1]) <= math.fabs(points[i_][1] - points[index][1]):
                    i += 1
                else:
                    i_ -= 1
            elif i < len(data) and i_ < 0:
                i += 1
            elif i >= len(data) and i_ >= 0:
                i_ -= 1
            else:
                break
        if i_ < 0:
            i_ = 0
        if i >= len(data):
            i = len(data) - 1
        ret[points[index][0]] = (k - 1) / max([points[i][1] - points[i_][1], e])
    return ret

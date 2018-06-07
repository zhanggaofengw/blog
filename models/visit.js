const {success, error} = require('./config')
const {MongoClient, url}= require('./db');
const express = require('express');
const router = express();
router.get('/query', function (req, res) {
    //打开数据库
    MongoClient.connect(url, function (err, db) {
        if (err) {
            return res.send(err);//错误，返回 err 信息
        }
        //读取 articles 集合
        db.collection('visits', function (err, collection) {
            if (err) {
                db.close();
                return res.send({statueCode: error.code, msg: err});//错误，返回 err 信息
            }
            //统计
            collection.aggregate([
                {
                    $group: {
                        _id: "$cid",
                        visitCount: {$sum: 1},
                        cname: {'$first': "$cname"},
                        cid: {'$first': "$cid"},
                        lng: {'$first': "$lng"},
                        lat: {'$first': "$lat"}
                    }
                }
            ]).toArray(function (err, visits) {
                db.close();
                if (err) {
                    return res.send({statueCode: error.code, msg: err});//错误，返回 err 信息
                }
                return res.send({statueCode: success.code, visits: visits});//成功
            })
        });
    });
});
router.post('/add', (req, res) => {
    const ip = req.body.ip;
    const cid = req.body.cid;
    const cname = req.body.cname;
    const lng = req.body.lng;
    const lat = req.body.lat;
    if (!cname) {
        return res.send({statueCode: error.code, msg: '城市不能为空'});
    } else if (!lng) {
        return res.send({statueCode: error.code, msg: '经度不能为空'});
    } else if (!lat) {
        return res.send({statueCode: error.code, msg: '纬度不能为空'});
    }
    //打开数据库
    MongoClient.connect(url, function (err, db) {
        if (err) {
            return res.send(err);//错误，返回 err 信息
        }
        //读取 visits 集合
        db.collection('visits', function (err, collection) {
            if (err) {
                db.close();
                return res.send({statueCode: error.code, msg: err});//错误，返回 err 信息
            }
            //ip唯一标识
            collection.findOne({
                ip: ip
            }, function (err, visit) {
                if (err) {
                    db.close();
                    return res.send({statueCode: error.code, msg: err});//失败！返回 err 信息
                }
                if (visit) {
                    collection.update(
                        {ip: ip},
                        {
                            $set: {
                                visitCount: visit.visitCount + 1
                            }
                        }, function (err) {
                            db.close();
                            if (err) {
                                return res.send({statueCode: error.code, msg: err});//错误，返回 err 信息
                            }
                            res.send({statueCode: success.code, msg: '成功'});//成功！
                        });
                } else {
                    //将用户数据插入  集合
                    collection.insert({
                        ip: ip,
                        cid: cid,
                        cname: cname,
                        lng: lng,
                        lat: lat,
                        visitCount: 1 //第一次为0
                    }, {
                        safe: true
                    }, function (err) {
                        db.close();
                        if (err) {
                            return res.send({statueCode: error.code, msg: err});//错误，返回 err 信息
                        }
                        res.send({statueCode: success.code, msg: '成功'});//成功
                    });
                }
            })
        });
    });
});
module.exports = router;


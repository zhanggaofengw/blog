const express = require('express');
const router = express();
const mongodb = require('./db');
const {success, error} = require('./config');
const ObjectId = require('mongodb').ObjectId

router.get('/add', function (req, res) {
    const category = req.query.category
    const name = req.query.sortOrTagName
    const color = req.query.color
    if (!category) {
        return res.send({statueCode: error.code, msg: '请选择类别'})
    } else if (!name) {
        return res.send({statueCode: error.code, msg: '名称不能为空'})
    } else if (!color) {
        return res.send({statueCode: error.code, msg: '颜色不能为空'})
    }
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return res.send(err);//错误，返回 err 信息
        }
        //读取 tags 集合
        db.collection('tags', function (err, collection) {
            if (err) {
                mongodb.close();
                return res.send({statueCode: error.code, msg: err});//错误，返回 err 信息
            }
            //查找用户名（name键）值为 name 一个文档
            collection.findOne({
                name: name
            }, function (err, tag) {
                if (err) {
                    mongodb.close();
                    return res.send({statueCode: error.code, msg: err});//失败！返回 err 信息
                }
                if (tag) {
                    mongodb.close();
                    return res.send({statueCode: error.code, msg: '该名称已存在'})
                } else {
                    //将用户数据插入 tags 集合
                    collection.insert({
                        name: name,
                        category: category,
                        color: color
                    }, {
                        safe: true
                    }, function (err, tag) {
                        mongodb.close();
                        if (err) {
                            return res.send({statueCode: error.code, msg: err});//错误，返回 err 信息
                        }
                        res.send({statueCode: success.code, msg: '新增成功'});//成功！
                    });
                }
            })
        });
    });
});
router.get('/select', function (req, res) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return res.send(err);//错误，返回 err 信息
        }
        //读取 tags 集合
        db.collection('tags', function (err, collection) {
            if (err) {
                mongodb.close();
                return res.send({statueCode: error.code, msg: err});//错误，返回 err 信息
            }
            //查询所有
            collection.find({}).toArray(function (err, tags) {
                mongodb.close();
                if (err) {
                    return res.send({statueCode: error.code, msg: err});//错误，返回 err 信息
                }
                return res.send({statueCode: success.code, tagList: tags});//成功
            });
        });
    });
});
router.get('/update', function (req, res) {
    const id = req.query._id
    const name = req.query.name
    const color = req.query.color
    if (!name) {
        return res.send({statueCode: error.code, msg: '名称不能为空'})
    } else if (!color) {
        return res.send({statueCode: error.code, msg: '颜色不能为空'})
    }
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return res.send(err);//错误，返回 err 信息
        }
        //读取 tags 集合
        db.collection('tags', function (err, collection) {
            if (err) {
                mongodb.close();
                return res.send({statueCode: error.code, msg: err});//错误，返回 err 信息
            }
            //更新
            collection.update(
                {_id: ObjectId(id)},
                {
                    $set: {name: name, color: color}
                }, (function (err) {
                    mongodb.close();
                    if (err) {
                        return res.send({statueCode: error.code, msg: err});//错误，返回 err 信息
                    }
                    return res.send({statueCode: success.code, msg: '修改成功'});//成功
                }));
        });
    });
});
router.get('/delete', function (req, res) {
    const id = req.query.id
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return res.send(err);//错误，返回 err 信息
        }
        //读取 tags 集合
        db.collection('tags', function (err, collection) {
            if (err) {
                mongodb.close();
                return res.send({statueCode: error.code, msg: err});//错误，返回 err 信息
            }
            //更新
            collection.deleteOne({_id: ObjectId(id)}, (function (err) {
                mongodb.close();
                if (err) {
                    return res.send({statueCode: error.code, msg: err});//错误，返回 err 信息
                }
                return res.send({statueCode: success.code, msg: '删除成功'});//成功
            }));
        });
    });
});
module.exports = router

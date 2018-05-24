const express = require('express');
const router = express();
const {MongoClient, url}= require('./db');
const {success, error} = require('./config');
const ObjectId = require('mongodb').ObjectId
const SORT = 1
const TAG = 2
router.post('/add', function (req, res) {
    const category = req.body.category
    const name = req.body.sortOrTagName
    const color = req.body.color
    if (!category) {
        return res.send({statueCode: error.code, msg: '请选择类别'})
    } else if (!name) {
        return res.send({statueCode: error.code, msg: '名称不能为空'})
    } else if (!color) {
        return res.send({statueCode: error.code, msg: '颜色不能为空'})
    }
    //打开数据库
    MongoClient.connect(url, function (err, db) {
        if (err) {
            return res.send(err);//错误，返回 err 信息
        }
        //读取 tags 集合
        db.collection('tags', function (err, collection) {
            if (err) {
                db.close();
                return res.send({statueCode: error.code, msg: err});//错误，返回 err 信息
            }
            //查找用户名（name键）值为 name 一个文档
            collection.findOne({
                name: name
            }, function (err, tag) {
                if (err) {
                    db.close();
                    return res.send({statueCode: error.code, msg: err});//失败！返回 err 信息
                }
                if (tag) {
                    db.close();
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
                        db.close();
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
    MongoClient.connect(url, function (err, db) {
        if (err) {
            return res.send(err);//错误，返回 err 信息
        }
        //读取 tags 集合
        db.collection('tags', function (err, collection) {
            if (err) {
                db.close();
                return res.send({statueCode: error.code, msg: err});//错误，返回 err 信息
            }
            //查询所有
            collection.find({}).toArray(function (err, tags) {
                db.close();
                if (err) {
                    return res.send({statueCode: error.code, msg: err});//错误，返回 err 信息
                }
                return res.send({statueCode: success.code, tagList: tags});//成功
            });
        });
    });
});
router.post('/update', function (req, res) {
    const id = req.body._id
    const name = req.body.name
    const color = req.body.color
    const category = req.body.category
    if (!name) {
        return res.send({statueCode: error.code, msg: '名称不能为空'})
    } else if (!color) {
        return res.send({statueCode: error.code, msg: '颜色不能为空'})
    }
    //打开数据库
    MongoClient.connect(url, function (err, db) {
        if (err) {
            return res.send(err);//错误，返回 err 信息
        }
        //读取 tags 集合
        db.collection('tags', function (err, collection) {
            if (err) {
                db.close();
                return res.send({statueCode: error.code, msg: err});//错误，返回 err 信息
            }
            collection.findOne({
                name: name,
                _id: {"$ne": ObjectId(id)}
            }, function (err, tag) {
                if (err) {
                    db.close();
                    return res.send({statueCode: error.code, msg: err});//失败！返回 err 信息
                }
                if (tag) {
                    db.close();
                    return res.send({statueCode: error.code, msg: '该名称已存在'})
                } else {
                    //更新
                    collection.update(
                        {_id: ObjectId(id)},
                        {
                            $set: {name: name, color: color}
                        }, (function (err) {
                            if (err) {
                                db.close();
                                return res.send({statueCode: error.code, msg: err});//错误，返回 err 信息
                            }
                            //
                            db.collection('articles', function (err, collection) {
                                if (err) {
                                    db.close();
                                    return res.send({statueCode: error.code, msg: err});//错误，返回 err 信息
                                }
                                let query = {}
                                let set = {}
                                if (category == 1) {
                                    query = {"articleSorts._id": id}
                                    set = {"articleSorts.$.name": name, "articleSorts.$.color": color}
                                } else {
                                    query = {"articleTags._id": id}
                                    set = {"articleTags.$.name": name, "articleTags.$.color": color}
                                }
                                //更新
                                collection.update(
                                    query,
                                    {
                                        $set: set
                                    }, {multi: true}, (function (err) {
                                        db.close();
                                        if (err) {
                                            return res.send({statueCode: error.code, msg: err});//错误，返回 err 信息
                                        }
                                        return res.send({statueCode: success.code, msg: '修改成功'});//成功
                                    }));
                            });
                        }));
                }
            })
        });
    });
});
router.get('/delete', function (req, res) {
    const id = req.query.id
    //打开数据库
    MongoClient.connect(url, function (err, db) {
        if (err) {
            return res.send(err);//错误，返回 err 信息
        }
        //读取 tags 集合
        db.collection('tags', function (err, collection) {
            if (err) {
                db.close();
                return res.send({statueCode: error.code, msg: err});//错误，返回 err 信息
            }
            //更新
            collection.deleteOne({_id: ObjectId(id)}, (function (err) {
                db.close();
                if (err) {
                    return res.send({statueCode: error.code, msg: err});//错误，返回 err 信息
                }
                return res.send({statueCode: success.code, msg: '删除成功'});//成功
            }));
        });
    });
});
module.exports = router

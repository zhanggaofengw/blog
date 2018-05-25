const express = require('express');
const router = express();
const {MongoClient, url}= require('./db');
const {success, error} = require('./config');
const ObjectId = require('mongodb').ObjectId;
router.get('/query', function (req, res) {
    const param = req.query.param
    const currentPage = parseInt(req.query.currentPage)
    const pageSize = parseInt(req.query.pageSize)
    //打开数据库
    MongoClient.connect(url, function (err, db) {
        if (err) {
            return res.send(err);//错误，返回 err 信息
        }
        //读取 articles 集合
        db.collection('users', function (err, collection) {
            if (err) {
                db.close();
                return res.send({statueCode: error.code, msg: err});//错误，返回 err 信息
            }
            let query = {}
            query = {
                name: {$regex: param, $options: "$i"}
                //$or: [
                //    {articleTitle: {$regex: param, $options: "$i"}},
                //    {articleContent: {$regex: param, $options: "$i"}}
                //]
            }
            //查询所有
            collection.count(query, function (err, total) {
                if (err) {
                    db.close();
                    return res.send({statueCode: error.code, msg: err});//错误，返回 err 信息
                }
                collection.find(query).skip((currentPage - 1) * pageSize).sort("createdAt", 1).limit(pageSize).toArray(function (err, userList) {
                    db.close();
                    if (err) {
                        return res.send({statueCode: error.code, msg: err});//错误，返回 err 信息
                    }
                    return res.send({statueCode: success.code, userList: userList, rows: total});//成功
                });
            })
        });
    });
});
router.get('/queryOne', function (req, res) {
    const id = req.query.id
    //打开数据库
    MongoClient.connect(url, function (err, db) {
        if (err) {
            return res.send(err);//错误，返回 err 信息
        }
        //读取 users 集合
        db.collection('users', function (err, collection) {
            if (err) {
                db.close();
                return res.send({statueCode: error.code, msg: err});//错误，返回 err 信息
            }
            //查询所有
            collection.findOne({
                _id: ObjectId(id)
            }, function (err, user) {
                if (err) {
                    db.close();
                    return res.send({statueCode: error.code, msg: err});//错误，返回 err 信息
                }
                return res.send({statueCode: success.code, user: user});//成功
            })
        });
    });
});
router.post('/add', function (req, res) {
    const name = req.body.name
    let password = req.body.password
    if (!name) {
        return res.send({statueCode: error.code, msg: '用户名不能为空'})
    } else if (!password) {
        return res.send({statueCode: error.code, msg: '密码不能为空'})
    }
    //打开数据库
    MongoClient.connect(url, function (err, db) {
        if (err) {
            return res.send(err);//错误，返回 err 信息
        }
        //读取 users 集合
        db.collection('users', function (err, collection) {
            if (err) {
                db.close();
                return res.send({statueCode: error.code, msg: err});//错误，返回 err 信息
            }
            //查找用户名（name键）值为 name 一个文档
            collection.findOne({
                name: name
            }, function (err, user) {
                if (err) {
                    db.close();
                    return res.send({statueCode: error.code, msg: err});//失败！返回 err 信息
                }
                if (user) {
                    db.close();
                    return res.send({statueCode: error.code, msg: '该用户已存在'})
                } else {
                    const createdAt = new Date().toLocaleString()
                    //将用户数据插入 users 集合
                    collection.insert({
                        name: name,
                        password: password,
                        createdAt: createdAt,
                        lastVisit: '', //上次登录时间
                        loginCount: 0 //登录次数默认为0
                    }, {
                        safe: true
                    }, function (err, user) {
                        db.close();
                        if (err) {
                            return res.send({statueCode: error.code, msg: err});//错误，返回 err 信息
                        }
                        res.send({statueCode: success.code, msg: '添加成功'});//成功！err 为 null，并返回存储后的用户文档
                    });
                }
            })
        });
    });
});
router.post('/update', function (req, res) {
    const id = req.body.id
    const name = req.body.name
    if (!name) {
        return res.send({statueCode: error.code, msg: '用户名不能为空'})
    }
    //打开数据库
    MongoClient.connect(url, function (err, db) {
        if (err) {
            return res.send(err);//错误，返回 err 信息
        }
        //读取 users 集合
        db.collection('users', function (err, collection) {
            if (err) {
                db.close();
                return res.send({statueCode: error.code, msg: err});//错误，返回 err 信息
            }
            //查找用户名（name键）值为 name 一个文档
            collection.findOne({
                name: name,
                _id: {"$ne": ObjectId(id)}
            }, function (err, user) {
                if (err) {
                    db.close();
                    return res.send({statueCode: error.code, msg: err});//失败！返回 err 信息
                }
                if (user) {
                    db.close();
                    return res.send({statueCode: error.code, msg: '该用户已存在'})
                } else {
                    //修改
                    collection.update(
                        {_id: ObjectId(id)},
                        {
                            $set: {
                                name: name
                            }
                        }, function (err) {
                            db.close();
                            if (err) {
                                return res.send({statueCode: error.code, msg: err});//错误，返回 err 信息
                            }
                            res.send({statueCode: success.code, msg: '修改成功'});//成功！err 为 null
                        });
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
        db.collection('users', function (err, collection) {
            if (err) {
                db.close();
                return res.send({statueCode: error.code, msg: err});//错误，返回 err 信息
            }
            //删除
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
router.get('/resetPassword', function (req, res) {
    const id = req.query.id
    const password = req.query.password
    if (!password) {
        return res.send({statueCode: error.code, msg: '密码不能为空'})
    }
    //打开数据库
    MongoClient.connect(url, function (err, db) {
        if (err) {
            return res.send(err);//错误，返回 err 信息
        }
        //读取 users 集合
        db.collection('users', function (err, collection) {
            if (err) {
                db.close();
                return res.send({statueCode: error.code, msg: err});//错误，返回 err 信息
            }
            //修改
            collection.update(
                {_id: ObjectId(id)},
                {
                    $set: {
                        password: password
                    }
                }, function (err) {
                    db.close();
                    if (err) {
                        return res.send({statueCode: error.code, msg: err});//错误，返回 err 信息
                    }
                    res.send({statueCode: success.code, msg: '修改成功'});//成功！err 为 null
                });
        });
    });
});
router.get('/updatePassword', function (req, res) {
    const name = req.query.name
    const password = req.query.password
    if (!name) {
        return res.send({statueCode: error.code, msg: '用户名不能为空'})
    } else if (!password) {
        return res.send({statueCode: error.code, msg: '密码不能为空'})
    }
    //打开数据库
    MongoClient.connect(url, function (err, db) {
        if (err) {
            return res.send(err);//错误，返回 err 信息
        }
        //读取 users 集合
        db.collection('users', function (err, collection) {
            if (err) {
                db.close();
                return res.send({statueCode: error.code, msg: err});//错误，返回 err 信息
            }
            //修改
            collection.update(
                {name: name},
                {
                    $set: {
                        password: password
                    }
                }, function (err) {
                    db.close();
                    if (err) {
                        return res.send({statueCode: error.code, msg: err});//错误，返回 err 信息
                    }
                    res.send({statueCode: success.code, msg: '密码修改成功'});//成功！err 为 null
                });
        });
    });
});
module.exports = router;
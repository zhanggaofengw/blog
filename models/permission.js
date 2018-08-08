const express = require('express');
const router = express();
const {MongoClient, url}= require('./db');
const {success, error} = require('./config');
const ObjectId = require('mongodb').ObjectId;
const newId = require('./newId');
const queryMenuList = require('./queryMenu');

router.get('/select', function (req, res) {
    //打开数据库
    MongoClient.connect(url, function (err, db) {
        if (err) {
            return res.send(err);//错误，返回 err 信息
        }
        //读取 menu 集合
        db.collection('menu', function (err, collection) {
            if (err) {
                db.close();
                return res.send({statueCode: error.code, msg: err});//错误，返回 err 信息
            }
            //查询所有
            collection.find({}).sort({"sort": 1}).toArray(function (err, menuList) {
                db.close();
                if (err) {
                    return res.send({statueCode: error.code, msg: err});//错误，返回 err 信息
                }
                return res.send({statueCode: success.code, menuList: menuList});//成功
            })
        });
    });
});
router.get('/query', function (req, res) {
    const param = req.query.param;
    const currentPage = parseInt(req.query.currentPage);
    const pageSize = parseInt(req.query.pageSize);
    //打开数据库
    MongoClient.connect(url, function (err, db) {
        if (err) {
            return res.send(err);//错误，返回 err 信息
        }
        //读取 roles 集合
        db.collection('roles', function (err, collection) {
            if (err) {
                db.close();
                return res.send({statueCode: error.code, msg: err});//错误，返回 err 信息
            }
            let query = {};
            query = {
                name: {$regex: param, $options: "$i"} //模糊查询，不区分大小写
            };
            //查询所有
            if (!currentPage) {
                collection.find({}).toArray(function (err, roleList) {
                    db.close();
                    if (err) {
                        return res.send({statueCode: error.code, msg: err});//错误，返回 err 信息
                    }
                    return res.send({statueCode: success.code, roleList: roleList});//成功
                })
            } else {
                collection.count(query, function (err, total) {
                    if (err) {
                        db.close();
                        return res.send({statueCode: error.code, msg: err});//错误，返回 err 信息
                    }
                    collection.find(query).skip((currentPage - 1) * pageSize).sort("createdAt", 1).limit(pageSize).toArray(function (err, roleList) {
                        db.close();
                        if (err) {
                            return res.send({statueCode: error.code, msg: err});//错误，返回 err 信息
                        }
                        return res.send({statueCode: success.code, roleList: roleList, rows: total});//成功
                    });
                })
            }
        });
    });
});
router.get('/queryMenu', function (req, res) {
    const id = req.query.id;
    //打开数据库
    queryMenuList(id, function(result) {
        res.send(result);
    });
});
router.get('/queryOne', function (req, res) {
    const id = req.query.id;
    //打开数据库
    MongoClient.connect(url, function (err, db) {
        if (err) {
            return res.send(err);//错误，返回 err 信息
        }
        //读取 roles 集合
        db.collection('roles', function (err, collection) {
            if (err) {
                db.close();
                return res.send({statueCode: error.code, msg: err});//错误，返回 err 信息
            }
            //查询
            collection.findOne({
                _id: ObjectId(id)
            }, function (err, role) {
                if (err) {
                    db.close();
                    return res.send({statueCode: error.code, msg: err});//错误，返回 err 信息
                }
                return res.send({statueCode: success.code, role: role});//成功
            })
        });
    });
});
router.post('/add', function (req, res) {
    const name = req.body.name;
    const permissionIds = req.body.permissionIds;
    const roleId = req.body.roleId;
    if (!name) {
        return res.send({statueCode: error.code, msg: '角色名称不能为空'});
    } else if (!permissionIds) {
        return res.send({statueCode: error.code, msg: '角色菜单不能为空'});
    }
    //打开数据库
    MongoClient.connect(url, function (err, db) {
        if (err) {
            return res.send(err);//错误，返回 err 信息
        }
        //读取 roles 集合
        db.collection('roles', function (err, collection) {
            if (err) {
                db.close();
                return res.send({statueCode: error.code, msg: err});//错误，返回 err 信息
            }
            //查找角色名（name键）值为 name 一个文档
            collection.findOne({
                name: name
            }, function (err, user) {
                if (err) {
                    db.close();
                    return res.send({statueCode: error.code, msg: err});//失败！返回 err 信息
                }
                if (user) {
                    db.close();
                    return res.send({statueCode: error.code, msg: '该角色已存在'})
                } else {
                    const createdAt = new Date().toLocaleString();
                    newId('role', function (result) {
                        if (result.statueCode === error.code) {
                            db.close();
                            return res.send({statueCode: error.code, msg: result.msg});//错误，返回 err 信息
                        } else {
                            collection.insert({
                                id: result.id,
                                name: name,
                                permissionIds: permissionIds,
                                roleId: roleId,
                                createdAt: createdAt
                            }, {
                                safe: true
                            }, function (err) {
                                db.close();
                                if (err) {
                                    return res.send({statueCode: error.code, msg: err});//错误，返回 err 信息
                                }
                                res.send({statueCode: success.code, msg: '添加成功'});//成功
                            });
                        }
                    });
                }
            })
        });
    });
});
router.post('/update', function (req, res) {
    const id = req.body._id;
    const name = req.body.name;
    const permissionIds = req.body.permissionIds;
    const roleId = req.body.roleId;
    if (!name) {
        return res.send({statueCode: error.code, msg: '角色名不能为空'});
    } else if (!permissionIds) {
        return res.send({statueCode: error.code, msg: '角色菜单不能为空'});
    }
    //打开数据库
    MongoClient.connect(url, function (err, db) {
        if (err) {
            return res.send(err);//错误，返回 err 信息
        }
        //读取 roles 集合
        db.collection('roles', function (err, collection) {
            if (err) {
                db.close();
                return res.send({statueCode: error.code, msg: err});//错误，返回 err 信息
            }
            //查找用户名（name键）值为 name 一个文档
            collection.findOne({
                name: name,
                _id: {"$ne": ObjectId(id)}
            }, function (err, role) {
                if (err) {
                    db.close();
                    return res.send({statueCode: error.code, msg: err});//失败！返回 err 信息
                }
                if (role) {
                    db.close();
                    return res.send({statueCode: error.code, msg: '该角色已存在'})
                } else {
                    //修改
                    collection.update(
                        {_id: ObjectId(id)},
                        {
                            $set: {
                                name: name,
                                roleId: roleId,
                                permissionIds: permissionIds
                            }
                        }, function (err) {
                            db.close();
                            if (err) {
                                return res.send({statueCode: error.code, msg: err});//错误，返回 err 信息
                            }
                            res.send({statueCode: success.code, msg: '修改成功, 重新登录后生效'});//成功
                        });
                }
            })
        });
    });
});
router.get('/delete', function (req, res) {
    const id = req.query.id;
    //打开数据库
    MongoClient.connect(url, function (err, db) {
        if (err) {
            return res.send(err);//错误，返回 err 信息
        }
        //读取 tags 集合
        db.collection('roles', function (err, collection) {
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
module.exports = router;
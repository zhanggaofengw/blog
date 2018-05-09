const {success, error} = require('./config')
const crypto = require('crypto');
const mongodb = require('./db');
const express = require('express')
const router = express()
//读取用户信息
router.get('/', (req, res) => {
    const name = req.query.name
    let password = req.query.password
    if (!name) {
        return res.send({statueCode: error.code, msg: '用户名不能为空'})
    } else if (!password) {
        return res.send({statueCode: error.code, msg: '密码不能为空'})
    }
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return res.send(err);//错误，返回 err 信息
        }
        //读取 users 集合
        db.collection('users', function (err, collection) {
            if (err) {
                mongodb.close();
                return res.send({statueCode: error.code, msg: err});//错误，返回 err 信息
            }
            //查找用户名（name键）值为 name 一个文档
            collection.findOne({
                name: name
            }, function (err, user) {
                if (err) {
                    mongodb.close();
                    return res.send({statueCode: error.code, msg: err});//失败！返回 err 信息
                }
                if (user) {
                    mongodb.close();
                    return res.send({statueCode: error.code, msg: '该用户已存在'})
                } else {
                    //将用户数据插入 users 集合
                    collection.insert({
                        name: name,
                        password: password
                    }, {
                        safe: true
                    }, function (err, user) {
                        mongodb.close();
                        if (err) {
                            return res.send({statueCode: error.code, msg: err});//错误，返回 err 信息
                        }
                        res.send({statueCode: success.code, msg: '注册成功'});//成功！err 为 null，并返回存储后的用户文档
                    });
                }
            })
        });
    });
})
module.exports = router

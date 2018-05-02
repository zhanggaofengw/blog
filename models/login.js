const {success, error} = require('./config');
const crypto = require('crypto');
const { createWebAPIRequest } = require('../util/util');
const mongodb = require('./db');
const express = require('express');
const router = express();
//读取用户信息
router.get('/', (req, res) => {
    const name = req.query.name
    let password = req.query.password
    if (!name) {
        return res.send({statueCode: error.code, msg: '用户名不能为空'})
    } else if (!password) {
        return res.send({statueCode: error.code, msg: '密码不能为空'})
    }
    const cookie = req.get('Cookie') ? req.get('Cookie') : ''
    const md5sum = crypto.createHash('md5')
    password = md5sum.update(password).digest('hex')
    const data = {
        name: name,
        password: password
    }
    createWebAPIRequest(
        '192.168.1.6',
        '/login',
        'POST',
        data,
        cookie,
        (req, cookie) => {
             console.log(req)
            res.set({
                'Set-Cookie': cookie
            })
            res.send(req)
        },
        err => res.status(502).send('fetch error')
    )
    //打开数据库
    mongodb.open((err, db) => {
        if (err) {
            return res.send({statueCode: error.code, msg: err});//错误，返回 err 信息
        }
        //读取 users 集合
        db.collection('users', function (err, collection) {
            if (err) {
                mongodb.close();
                return res.send({statueCode: error.code, msg: err});//错误，返回 err 信息
            }
            //查找用户名（name键）值为 name 一个文档
            collection.findOne({
                name: req.query.name
            }, function (err, user) {
                mongodb.close();
                if (err) {
                    return res.send({statueCode: error.code, msg: err});//失败！返回 err 信息
                }
                if (!user) {
                    res.send({statueCode: error.code, msg: '该用户不存在'});//失败！返回 err 信息
                } else if(user.password === password){
                    res.send({statueCode: success.code, msg: '登录成功'});//成功！返回查询的用户信息
                } else if(user.password !== password){
                    res.send({statueCode: success.code, msg: '用户名或密码错误'});
                }
            });
        });
    })
})
module.exports = router
const {success, error} = require('./config');
const {MongoClient, url}= require('./db');
const express = require('express');
const session = require('express-session');
const router = express();
const ObjectId = require('mongodb').ObjectId;
const queryMenuList = require('./queryMenu');

//读取用户信息
router.get('/', (req, res) => {
    const name = req.query.name;
    const password = req.query.password;
    let captcha;
    if (req.query.captcha) {
        captcha = req.query.captcha.toLowerCase();
    }
    const captchaTime = req.query.time;
    if (!name) {
        return res.send({statueCode: error.code, msg: '用户名不能为空'});
    } else if (!password) {
        return res.send({statueCode: error.code, msg: '密码不能为空'});
    } else if (!captcha) {
        return res.send({statueCode: error.code, msg: '验证码不能为空'});
    } else if (captcha !== req.session[captchaTime]) {
        return res.send({statueCode: error.code, msg: '验证码错误'});
    }
    //打开数据库
    MongoClient.connect(url,(err, db) => {
        if (err) {
            return res.send({statueCode: error.code, msg: '1'});//错误，返回 err 信息
        }
        //读取 users 集合
        db.collection('users', function (err, collection) {
            if (err) {
                db.close();
                return res.send({statueCode: error.code, msg: '2'});//错误，返回 err 信息
            }
            //查找用户名（name键）值为 name 一个文档
            collection.findOne({
                name: name
            }, function (err, user) {
                if (err) {
                    db.close();
                    return res.send({statueCode: error.code, msg: err});//失败！返回 err 信息
                }
                if (!user) {
                    db.close();
                    res.send({statueCode: error.code, msg: '该用户不存在'});//失败！返回 err 信息
                } else if (user.password === password) {
                    req.session.isLogin = true;
                    req.session.cookie.expires = 1000 * 60 * 30;
                    const loginCount = user.loginCount + 1;
                    const id = user._id;
                    const lastVisit = new Date().toLocaleString();
                    queryMenuList(id, function(result) {
                        delete user.password;
                        user.menuList = result.menuList;
                        res.send({statueCode: success.code, msg: '登录成功', user: user});//成功！返回查询的用户信息
                    });
                    // 更新登录次数
                    collection.update(
                        {_id: ObjectId(id)},
                        {
                            $set: {
                                loginCount: loginCount,
                                lastVisit: lastVisit
                            }
                        }, function (err) {
                            db.close();
                            if (err) {

                            }
                        });
                } else if (user.password !== password) {
                    res.send({statueCode: error.code, msg: '用户名或密码错误'});
                }
            });
        });
    })
});
module.exports = router
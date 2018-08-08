const {MongoClient, url}= require('./db');
const {success, error} = require('./config');
const ObjectId = require('mongodb').ObjectId;

module.exports = function queryMenuList(id, callback) {
    //打开数据库
    MongoClient.connect(url, function (err, db) {
        if (err) {
            callback({statueCode: error.code, msg: err});//错误，返回 err 信息
        }
        //读取 users 集合
        db.collection('users', function (err, collection) {
            if (err) {
                callback({statueCode: error.code, msg: err});//错误，返回 err 信息
            }
            collection.aggregate([
                {
                    $match: {_id: ObjectId(id)}
                },
                {
                    $unwind: "$checkedRole"
                },
                {
                    $lookup: { // 左连接
                        from: "roles", // roles
                        localField: "checkedRole", // user 表关联的字段
                        foreignField: "id", // roles 表关联的字段
                        as: "role"
                    }
                }
            ]).toArray(function (err, menu) {
                if (err) {
                    callback({statueCode: error.code, msg: err});//错误，返回 err 信息
                }
                let list = [];
                menu.forEach(function (item) {
                    list = list.concat(item.role[0].permissionIds)
                });
                // let menuList = new Set(list);
                db.collection('menu', function (err, collection) {
                    if (err) {
                        db.close();
                        callback({statueCode: error.code, msg: err});//错误，返回 err 信息
                    }
                    collection.find({
                        id: {$in: list} //只要符合list条件的都会被查出来
                    }).sort({"sort": 1}).toArray(function (err, menuList) {
                        if (err) {
                            db.close();
                            callback({statueCode: error.code, msg: err});//错误，返回 err 信息
                        }
                        callback({statueCode: success.code, menuList: menuList});
                    })
                });
            });
        });
    });
};

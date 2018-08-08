const {MongoClient, url}= require('./db');
const {success, error} = require('./config');

 // id自增长
module.exports = function newId(name, callback) {
    MongoClient.connect(url, function (err, db) {
        if (err) {
            callback({statueCode: error.code, msg: err});//错误，返回 err 信息
        }
        //读取 ids 集合
        db.collection('ids', function (err, collection) {
            if (err) {
                callback({statueCode: error.code, msg: err});//错误，返回 err 信息
            }
            collection.findAndModify(  // 参数为query, sort, doc, options, callback
                {name: name},
                [],
                {
                    $inc: {
                        id: 1
                    }
                },
                {
                    new: true,
                    upsert: true // 没有的时候自动插入，但不能自定义开始值
                },
                function (err, result) {
                    if (err) {
                        db.close();
                        callback({statueCode: error.code, msg: err});  //错误，返回 err 信息
                    }
                    callback({statueCode: success.code, id: result.value.id});
                })
        });
    });
};



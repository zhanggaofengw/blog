const express = require('express');
const router = express();
const {MongoClient, url}= require('./db');
const {success, error} = require('./config');
const ObjectId = require('mongodb').ObjectId
router.post('/add', function (req, res) {
    const articleType = req.body.type //1为保存文章，0为草稿
    const articleTitle = req.body.articleTitle
    const articleSorts = req.body.articleSorts
    const articleTags = req.body.articleTags
    const articleComment = req.body.comment //1、开启评论 0、关闭评论
    const articleContent = req.body.content
    if (articleType == 1) {
        if (!articleTitle) {
            return res.send({statueCode: error.code, msg: '请输入文章标题'})
        } else if (!articleSorts) {
            return res.send({statueCode: error.code, msg: '请至少选择一项文章文类'})
        } else if (!articleTags) {
            return res.send({statueCode: error.code, msg: '请至少选择一项文章标签'})
        } else if (!articleContent) {
            return res.send({statueCode: error.code, msg: '请输入文章内容'})
        }
    }
    //打开数据库
    MongoClient.connect(url, function (err, db) {
        if (err) {
            return res.send(err);//错误，返回 err 信息
        }
        //读取 articles 集合
        db.collection('articles', function (err, collection) {
            if (err) {
                db.close();
                return res.send({statueCode: error.code, msg: err});//错误，返回 err 信息
            }
            //查找文章名（articleTitle）值为 articleTitle 一个文档
            collection.findOne({
                articleTitle: articleTitle
            }, function (err, article) {
                if (err) {
                    db.close();
                    return res.send({statueCode: error.code, msg: err});//失败！返回 err 信息
                }
                if (article) {
                    db.close();
                    return res.send({statueCode: error.code, msg: '该文章名已存在'})
                } else {
                    const createdAt = new Date().toLocaleString()
                    //将数据插入 articles 集合
                    collection.insert({
                        articleTitle: articleTitle,
                        articleSorts: articleSorts,
                        articleTags: articleTags,
                        articleContent: articleContent,
                        articleComment: articleComment,
                        createdAt: createdAt,
                        updatedAt: createdAt,
                        articleType: articleType,
                        pageViews: 0 //浏览量初始默认为0
                    }, {
                        safe: true
                    }, function (err) {
                        db.close();
                        if (err) {
                            return res.send({statueCode: error.code, msg: err});//错误，返回 err 信息
                        }
                        let msg = ''
                        articleType == 1 ? msg = '新增文章成功' : msg = '成功保存为草稿'
                        res.send({statueCode: success.code, msg: msg});//成功！
                    });
                }
            })
        });
    });
});
router.get('/query', function (req, res) {
    const id = req.query.id
    //打开数据库
    MongoClient.connect(url, function (err, db) {
        if (err) {
            return res.send(err);//错误，返回 err 信息
        }
        //读取 articles 集合
        db.collection('articles', function (err, collection) {
            if (err) {
                db.close();
                return res.send({statueCode: error.code, msg: err});//错误，返回 err 信息
            }
            let query = {}
            if (id) {
                query = {
                    _id: ObjectId(id)
                }
            }
            //查询所有
            collection.find(query).toArray(function (err, articles) {
                db.close();
                if (err) {
                    return res.send({statueCode: error.code, msg: err});//错误，返回 err 信息
                }
                return res.send({statueCode: success.code, articleList: articles});//成功
            });
        });
    });
});
router.post('/update', function (req, res) {
    const id = req.body._id
    const articleType = req.body.type //1为保存文章，0为草稿
    const articleTitle = req.body.articleTitle
    const articleSorts = req.body.articleSorts
    const articleTags = req.body.articleTags
    const articleComment = req.body.comment //1、开启评论 0、关闭评论
    const articleContent = req.body.content
    if (articleType == 1) {
        if (!articleTitle) {
            return res.send({statueCode: error.code, msg: '请输入文章标题'})
        } else if (!articleSorts) {
            return res.send({statueCode: error.code, msg: '请至少选择一项文章文类'})
        } else if (!articleTags) {
            return res.send({statueCode: error.code, msg: '请至少选择一项文章标签'})
        } else if (!articleContent) {
            return res.send({statueCode: error.code, msg: '请输入文章内容'})
        }
    }
    //打开数据库
    MongoClient.connect(url, function (err, db) {
        if (err) {
            return res.send(err);//错误，返回 err 信息
        }
        //读取 articles 集合
        db.collection('articles', function (err, collection) {
            if (err) {
                db.close();
                return res.send({statueCode: error.code, msg: err});//错误，返回 err 信息
            }
            //查找文章名（articleTitle）值为 articleTitle 一个文档
            collection.findOne({
                articleTitle: articleTitle,
                _id: {"$ne": ObjectId(id)}
            }, function (err, article) {
                if (err) {
                    db.close();
                    return res.send({statueCode: error.code, msg: err});//失败！返回 err 信息
                }
                if (article) {
                    db.close();
                    return res.send({statueCode: error.code, msg: '该文章名已存在'})
                } else {
                    const updatedAt = new Date().toLocaleString()
                    //更新
                    collection.update(
                        {_id: ObjectId(id)},
                        {
                            $set: {
                                articleTitle: articleTitle,
                                articleSorts: articleSorts,
                                articleTags: articleTags,
                                articleContent: articleContent,
                                articleComment: articleComment,
                                updatedAt: updatedAt,
                                articleType: articleType
                            }
                        }, function (err) {
                            db.close();
                            if (err) {
                                return res.send({statueCode: error.code, msg: err});//错误，返回 err 信息
                            }
                            let msg = ''
                            articleType == 1 ? msg = '修改文章成功' : msg = '成功保存为草稿'
                            res.send({statueCode: success.code, msg: msg});//成功！
                        });
                }
            })
        });
    });
});
module.exports = router

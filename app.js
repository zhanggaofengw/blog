const express = require("express");
const session = require('express-session');
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo')(session);
const http = require("http");
const path = require("path");
const settings = require('./settings');
const app = express();
app.use(cookieParser())
// 跨域设置
app.all('*', function (req, res, next) {
    if (req.path !== '/' && !req.path.includes('.')) {
        res.header('Access-Control-Allow-Credentials', true);
        // 这里获取 origin 请求头 而不是用 *
        res.header('Access-Control-Allow-Origin', req.headers['origin'] || '*');
        res.header('Access-Control-Allow-Headers', 'X-Requested-With');
        res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
        res.header('Content-Type', 'application/json;charset=utf-8');
    }
    //if (req.path !== '/login' && req.path !== '/captcha' && req.path !== '/register') {
    //    if (!req.session) {
    //        return res.send({msg: '登录超时'})
    //    } else {
    //        req.session.cookie.expires = 1000 * 60 * 30;
    //    }
    //}
    next()
})
//注册
app.use("/register", require("./models/register"));

app.use(session({
    secret: settings.cookieSecret,
    key: settings.db,//cookie name
    cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days
    saveUninitialized: true,  // 是否自动保存未初始化的会话，建议false
    resave: false,  // 是否每次都重新保存会话，建议false
    store: new MongoStore({
        url: `mongodb://${settings.host}:${settings.port}/${settings.db}`
    })
}));

//验证码
app.use("/captcha", require("./models/captcha"));
//登录
app.use("/login", require("./models/login"));

//分类/标签
app.use("/tag", require("./models/tag"));

const port = process.env.PORT || 8888;

app.listen(port, () => {
    console.log(`server running @${port}`);
});

module.exports = app;

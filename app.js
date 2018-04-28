const express = require("express");
const http = require("http");
const path = require("path");
const settings = require('./settings');
const app = express();
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

// 跨域设置
app.all('*', function (req, res, next) {
    if (req.path !== '/' && !req.path.includes('.')) {
        res.header('Access-Control-Allow-Credentials', true)
        // 这里获取 origin 请求头 而不是用 *
        res.header('Access-Control-Allow-Origin', req.headers['origin'] || '*')
        res.header('Access-Control-Allow-Headers', 'X-Requested-With')
        res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
        res.header('Content-Type', 'application/json;charset=utf-8')
    }
    next()
})
app.use(session({
    secret: settings.cookieSecret,
    key: settings.db,//cookie name
    cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days
    store: new MongoStore({
        url: `mongodb://${settings.host}/${settings.db}`
    })
}));
app.use(express.static(path.resolve(__dirname, "public")));

//登录
app.use("/login", require("./models/login"));
//注册
app.use("/register", require("./models/register"));

const port = process.env.PORT || 8888;

app.listen(port, () => {
    console.log(`server running @${port}`);
});

module.exports = app;

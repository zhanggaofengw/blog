/**
 * Created by zgf on 2018/5/7.
 */
const express = require('express');
const session = require('express-session')
const router = express();
const svgCaptcha = require('svg-captcha');

router.get('/', function (req, res) {
    let t = req.query._t;
    const captcha = svgCaptcha.create(
        {
            noise: 6,
            height: 40
        }
    );
    // 保存到session,忽略大小写
    req.session[t] = captcha.text.toLowerCase();
    req.session.cookie.expires = 1000 * 60;
    res.type('svg'); // 使用ejs等模板时如果报错 res.type('html')
    res.status(200).send(captcha.data);
    res.end();
});
module.exports = router;
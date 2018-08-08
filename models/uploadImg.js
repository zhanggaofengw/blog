const express = require('express');
const router = express();
const formidable = require('formidable');
router.post('/', function (req, res) {
    const form = new formidable.IncomingForm();
    form.keepExtensions = true;     //设置该属性为true可以使得上传的文件保持原来的文件的扩展名。
    // 文件将要上传到哪个文件夹下面
    form.uploadDir = __dirname + '/../public/upload';//设置上传文件存放的文件夹，默认为系统的临时文件夹
    const assitUrl = '//139.224.235.171:8888/upload/';
    //form.parse(request, [callback]) 该方法会转换请求中所包含的表单数据，callback会包含所有字段域和文件信息
    form.parse(req, function (err, fields, files) {
        if (err) {
            throw err;
        }
        var image = files['uploadImg'];  //这是整个files流文件对象,是转换成有利于传输的数据格式
        var path = image.path;      //从本地上传的资源目录加文件名:如E:\\web\\blog\\upload\\upload_0a14.jpg
        /*下面这里是通过分割字符串来得到文件名*/
        var arr = path.split('\/');  //注split可以用字符或字符串分割
        var name = arr[arr.length - 1];
        /*上面这里是通过分割字符串来得到文件名*/
        var url = assitUrl + name;
        let info = {
            "errno": 0,
            "data": [url]
        };
        //info是用来返回页面的图片地址
        res.send(info);

    });
});

module.exports = router;
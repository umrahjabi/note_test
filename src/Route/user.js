var user = require('../Controller/UserController');
var multer = require ('multer');
var md5 =require('md5');
var path = require('path');
var auth = require('../Modules/auth')

module.exports = function(app){
    let storage = multer.diskStorage({
        destination: function(req, file, callback) {
            console.log("multer")
            console.log(file)
            callback(null, './src/Upload/User');
        },
        filename: function(req, file, callback) {
            let fileUniqueName = md5(Date.now());
            callback(null, fileUniqueName + path.extname(file.originalname));
        }
    });
    let upload = multer({ storage: storage });
    app.get('/user', (req, res) => {
        res.send('Hello USER!')
      });
      
    app.route("/api/signup").post(upload.any(),user.singup);
    app.route("/api/login").post(user.login)   
    app.route("/api/getUserData").get( auth.requiresLogin,user.getUserData)
    app.route("/api/getCityData").get( auth.requiresLogin,user.getCityData)
    app.route("/api/test-notification").get(user.testNotification);
    //other routes..
}
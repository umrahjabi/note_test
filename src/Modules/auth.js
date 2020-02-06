var connection = require( './connection');
var responses  = require('./responses');
const { UserModel} =  require('../Models/userModel');
// const { RestaurantModel}=require('../Models/restaurantModel');
// const { AdminModel } = require('../Models/adminModel')
var jwt = require('jsonwebtoken');
// const { driverModel} =  require('../Model/driver_model');
// const { adminModel} =  require('../Model/admin_model');
exports.requiresLogin = async (req, res, next) => {
    console.log("auth calling")
    let { access_token } = req.headers;
   if(access_token){
    jwt.verify(access_token, 'nodeTest',async function (err, decoded) {
        console.log(decoded) // bar
        if (!err) {
            let user = await UserModel.findOne({ access_token })
            if (!user) {
                (responses.authenticationErrorResponse(res));
                return;
            }
            //console.log(user)
            req.userData = user;
            next();
        } else {
            (responses.authenticationErrorResponse(res));
            return;
        }
    })
   }else{
    let response = {
        "message": "Access Token required"
    };
    res.status(422).json(response);
   }
}




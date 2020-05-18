var mongoose = require('mongoose');
var Joi = require ('joi');
var md5 = require('md5');
var {UserModel} = require ('../Models/user_model');
const {store_models} = require ('../Models/store_model')
const {food_models} = require ('../Models/food_model')
const {foodcategory_models} = require ('../Models/food_category_model')

var status = require('../Modules/status');
var common = require ('../Modules/commonFunctions');
var country = require('country-state-city').default



exports.userSignup = async (req ,res) => {

   
    console.log("data");
    try{
        const schema = Joi.object().keys({
            mobile_number: Joi.string().required(),
            country_code : Joi.string().required(),
            password : Joi.string().required(),
            referral_code : Joi.string().optional(),
            device_token : Joi.string(),
            device_type : Joi.string(),
            latitude : Joi.string(),
            longitude: Joi.string(),
            
        })

        const result = Joi.validate(req.body, schema, {abortEarly: true});
        if(result.error) {
            if (result.error.details && result.error.details[0].message) {
                res.status(status.BAD_REQUEST).json({ message: result.error.details[0].message });
            } else {
                res.status(status.BAD_REQUEST).json({ message: result.error.message });
            }
            return;
        }


        let location = { type: 'Point', "coordinates": [req.body.longitude, req.body.latitude] }

        var {
        mobile_number,
        country_code,
        password,
        referral_code,
        device_token,
        device_type,
        latitude,
        longitude,
    } = req.body;


    let userData = await UserModel.findOne({ $and : [{"mobile_number" : mobile_number},{"country_code" : country_code}]})
    if(userData){
     return  res.status(status.ALREADY_EXIST).json({message:'This user already exist'});
    }
    var access_token = md5(new Date());
    var verificationCode = common.generateRandomString()

 //   let sendTo = country_code+ mobile_number;
   // common.sendotp(verificationCode,sendTo)

    let Data = { mobile_number, country_code,access_token,verificationCode,referral_code, device_token, device_type, password: md5(password), latitude, longitude,location};

    let user = new UserModel(Data);
    let userDetails = await user.save();
            if (!userDetails) {
                throw new Error('Unable to add details.')
            }

            res.status(200).json({response: user, message:'Signup Successfully'});

    
            }catch( error ){
                console.log(error)
                res.status(403).json({message:error.message});
            }
            
        } 

// ************************************************************************************************
  exports.userLogin = async (req,res) => {
      console.log("hello")
            try{
                let { password, device_type, mobile_number,country_code, device_token, latitude, longitude } = req.body;
                const schema = Joi.object().keys({
                    mobile_number: Joi.string().required(),
                    country_code : Joi.string().required(),
                    password: Joi.string().required(),
                    device_type: Joi.string().required(),
                    device_token: Joi.string().required(),
                    latitude: Joi.string().required(),
                    longitude: Joi.string().required(),
                   
                })
                const result = Joi.validate(req.body, schema, {abortEarly: true});
                if(result.error) {
                    if (result.error.details && result.error.details[0].message) {
                        res.status(status.BAD_REQUEST).json({ message: result.error.details[0].message });
                    } else {
                        res.status(status.BAD_REQUEST).json({ message: result.error.message });
                    }
                    return;
                }


                var access_token = md5(new Date());

                let  data= await UserModel.findOne({mobile_number,country_code},{},{lean:true});
                
                if(!data)
                    throw new Error("User not found");
                
                if (md5(password)!=data.password)
                        throw new Error("invalid credentials")

                        if(data.isBlock ==1){
                            throw new Error("User have been blocked by admin")
                            }
                if(data.is_verified==0)
                 return res.status(200).json({response:data  ,message:"Mobile number is not verified"});
              


                 data= await UserModel.findByIdAndUpdate(data._id,{access_token:access_token},{new:true}).lean(true)
                    res.status(200).json({response: data, message:'Login Successful'});

            }catch(error){
                res.status(403).json({message:error.message});
            }

        }



      


        exports.verify = async (req, res) => {
            try {
        
                var { verificationCode, mobile_number, country_code } = req.body;
                console.log(req.body)
               // var { access_token } = req.headers
                //console.log(access_token)
                let userData = await UserModel.findOne({ $and: [{ "mobile_number": mobile_number }, { "country_code": country_code }] }).lean(true)
        
                if (!userData) {
                    throw new Error('user not found')
                }
        
                if (userData.verificationCode != verificationCode)
                    throw new Error('Invalid verification code.')
        
                let updateData = await UserModel.findOneAndUpdate({ $and: [{ "mobile_number": mobile_number }, { "country_code": country_code }] }, { verificationCode: '', is_verified: 1 },{new:true})
        
                if (!updateData) {
                    throw new Error('Unable to verify account.')
                }
        
                res.status(200).json({response: updateData, message:''});
            } catch (error) {
                res.status(403).json({message:error.message});
            }
        }
        





exports.changePassord = async (req,res)=>{
console.log("data")
    try{
        let {oldpassword, password} = req.body;
        const schema = Joi.object().keys({
            oldpassword: Joi.string().required(),
            password: Joi.string().required(),
        })
        const result = Joi.validate(req.body, schema, {abortEarly: true});
        if(result.error) {
            if (result.error.details && result.error.details[0].message) {
                res.status(status.BAD_REQUEST).json({ message: result.error.details[0].message });
            } else {
                res.status(status.BAD_REQUEST).json({ message: result.error.message });
            }
            return;
        }

        let data = await UserModel.findById(req.data._id,{},{lean:true})
        if(!data)
            throw new Error("User not found");

                if(data.password !=  md5(oldpassword))
                     throw new Error("old Password is Wrong");
             
            let encryptPassword = md5(password)
            
            let update = await UserModel.findByIdAndUpdate(req.data._id, {$set:{password:encryptPassword}}, {new : true});
            if(!update)
                throw new Error("unable to update");
            responses.success2(res,"Password reset successful")
        }
        catch(error){
            res.status(403).json({message:error.message});
        }

    }



        exports.resend_otp = async (req, res)=> {
            try{
                var { mobile_number, country_code } = req.body
                    let userData = await UserModel.findOne({ $and: [{ "mobile_number" : mobile_number},{ "country_code" : country_code}]})
                    if(userData) {
                
                        let verificationCode = common.generateRandomString()
                        let to = country_code + mobile_number
        
                       userData =  await UserModel.findOneAndUpdate({$and: [{ "mobile_number" : mobile_number},{ "country_code" : country_code}]},{
                        verificationCode:verificationCode
                        },{new:true})
                        //send OTP
                      //  common.sendotp(verificationCode,to);
        
                                
        
                        res.status(200).json({message : "OTP sent successfully", response : userData})
                    } else {
                        res.status(403).json({ message : "Invalid mobile number"})
                    }
                }catch(error){
                    res.status(403).json({message:error.message});
            }
            
        }





exports.reset_password = async(req, res) => {
    try{
        const schema = Joi.object().keys({
            password: Joi.string().required(),
        })
        const result = Joi.validate(req.body, schema, {abortEarly: true});
        if(result.error) {
            if (result.error.details && result.error.details[0].message) {
                res.status(status.BAD_REQUEST).json({ message: result.error.details[0].message });
            } else {
                res.status(status.BAD_REQUEST).json({ message: result.error.message });
            }
            return;
        }

        var { password } = req.body;
        console.log(req.body)
        let { access_token } = req.headers;

            let userResult = await UserModel.findOneAndUpdate({access_token}, { $set : {password : md5(password)}}, {new : true})
            if(userResult){
                res.status(200).json({message : "Reset password successfully",response : userResult})
            }else{
                res.status(403).json({message : 'Data not found'})
            }
    }catch(error){
        res.status(403).json({message:error.message});
    }
}






exports.profileCreation = async function (req, res) {
    console.log("data")
    try {
    
        let {full_name, gender, birthday, address,country} = req.body;
        const schema = Joi.object().keys({
            full_name: Joi.string().required(),
            gender: Joi.string().required(),
            birthday: Joi.string().required(),
            address: Joi.string().required(),
           
            country: Joi.string().required(),
            // state: Joi.string().required(),
            // pincode: Joi.string().required(),
            // city: Joi.string().required(),

        })
        const result = Joi.validate(req.body, schema, {abortEarly: true});
        if(result.error) {
            if (result.error.details && result.error.details[0].message) {
                res.status(status.BAD_REQUEST).json({ message: result.error.details[0].message });
            } else {
                res.status(status.BAD_REQUEST).json({ message: result.error.message });
            }
            return;
        }


        let data = req.body;
        data.isProfileCreated = 1;
        // if(req.body.profileImage){
        if (req.files && req.files.profile_image && req.files.profile_image.length ) {
            data.profile_image = req.files && req.files.profile_image[0].location
            // req.files.forEach(file => {
            //     data[file.fieldname] = `/user/${file.filename}`;
            // })
        }

        
        console.log("data", data.profileImage)
        let profileData = await UserModel.findByIdAndUpdate(req.user._id,{ $set: data }, { new: true });
        if (!profileData) {
            throw new Error("User not found")
        }
        res.status(200).json({message : "Profile  sent successfully", response : profileData})
    }
    catch (error) {
        res.status(403).json({message:error.message});
    }
}



exports.getCountryList =  async (req,res) => {
console.log("data");
    try{


    let {key,id} = req.body;
    


    // if (key == 'countries') {
	// 	data = country.getAllCountries()
	// 	res.status(200).json({message : "", response : data})
    // }
    // let userData = await UserModel.findOne({ $and : [{"countries" : bahrain},{"countries" : emirates},{"countries":saudiarabia}]})
    // if(userData){
    //  return  res.status(200).json({message:'selected country'});
    // }

    if (key == 'countries') {
        data = country.getAllCountries()
        
        data = data.filter((coun)=> coun.sortname == 'BH' || coun.sortname == 'AE' || coun.sortname == 'SA')

		res.status(200).json({message : "", response : data})
	}
	else if (id && key == 'states') {

		data = country.getStatesOfCountry(id)
		res.status(200).json({message : "", response : data})
	}
	else if (id && key == 'cities') {
		data = country.getCitiesOfState(id)
        res.status(200).json({message : "", response : data})
	} 
}
    catch (error) {
        res.status(403).json({message:error.message});
    }
}

exports.getRestaurentByCusineandDistance = async (req, res)=>{
try{

    let {priceRange,cuisine,distance, latitude,longitude} = req.body
    if(!priceRange){
       throw new Error ("Please select Price Range")
    }
    // if(cuisine && typeof cuisine == "string" ){
    //     cuisine = JSON.parse(cuisine)
    // }else {
    //     cuisine =cuisine || []
    // }
    // if(cuisine){
    //     cuisine = JSON.parse(cuisine)
    // }else{
    //     cuisine =[]
    // }
    if(cuisine.length>0){
        var data = await store_models.find({

            location: {
                $near: {
                  $geometry: {
                    type: "Point",
                    coordinates: [latitude,longitude ]
                  },
                  $maxDistance: Number(distance) * 1000,
                  $minDistance: 0
                }
              },
              'storeDetails.cuisine': { $in:  cuisine  } ,
              'storeDetails.priceRange' :priceRange,
              isStore_approved: 1, isBlock: 0
        
        }).populate('storeDetails.cuisine')
    }else{
        var data = await store_models.find({

            location: {
                $near: {
                  $geometry: {
                    type: "Point",
                    coordinates: [latitude,longitude ]
                  },
                  $maxDistance: Number(distance) * 1000,
                  $minDistance: 0
                }
              },
                priceRange :priceRange,
                isStore_approved: 1, isBlock: 0
        
        }).populate('storeDetails.cuisine')
    }
console.log(data.length, "length")
if(data.length == 0) {
    res.status(200).json({response: [], message: "No Data Found"})
    return
}
 let sendData = [data[Math.floor(Math.random()*data.length)]]

res.status(200).json({response:sendData, message:"Restaurent List"})

} catch (error) {
    res.status(403).json({message:error.message})
}
}


exports.filterRestaurentByCusineandDistance = async (req, res)=>{
    try{
    
        let {priceRange,cuisine,distance, latitude,longitude} = req.body
        if(!priceRange){
            throw new Error ("Please select a Price Range")
        }
        // if(cuisine && typeof cuisine == "string" ){
        //     cuisine = JSON.parse(cuisine)
        // }else {
        //     cuisine =cuisine || []
        // }
        // if(cuisine){
        //     cuisine = JSON.parse(cuisine)
        // }else{
        //     cuisine =[]
        // }
        if(cuisine.length>0){
            var data = await store_models.find({
    
                location: {
                    $near: {
                      $geometry: {
                        type: "Point",
                        coordinates: [latitude,longitude ]
                      },
                      $maxDistance: Number(distance) * 1000,
                      $minDistance: 0
                    }
                  },
                  'storeDetails.cuisine': { $in:  cuisine  } ,
                  'storeDetails.priceRange' :priceRange,
                  isStore_approved: 1
            
            }).populate('storeDetails.cuisine')
        }else{
            var data = await store_models.find({
    
                location: {
                    $near: {
                      $geometry: {
                        type: "Point",
                        coordinates: [latitude,longitude ]
                      },
                      $maxDistance: Number(distance) * 1000,
                      $minDistance: 0
                    }
                  },
                    priceRange :priceRange,
                    isStore_approved: 1
            
            }).populate('storeDetails.cuisine')
        }

    
    res.status(200).json({response:data, message:"Restaurent List"})
    
    } catch (error) {
        res.status(403).json({message:error.message})
    }
    }

exports.getFoodOfSingleStore = async (req,res) =>{
    try{
  
  let {storeId} = req.body
  let data = await food_models.find({storeId: storeId})
//   console.log(data[0].is_block)
  
  res.status(200).json({response: data, message:"Success"})
  
  
  
    } catch (error) {
      res.status(403).json({message:error.message
      })
    }
  }
  
  
  exports.getFoodByCategory = async (req, res) => {
    try {
      let { storeId, categoryId } = req.body;
      let data = await food_models.find(
        { storeId, categoryId},
        {},
        { lean: true }
      );

      if(data.length == 0) {
        res.status(200).json({response: [], message: "No Data Found"})
        return
    }
  
      res.status(200).json({ response: data, message: "Success" });
    } catch (error) {
      res.status(403).json({ message: error.message });
    }
  };

  exports.getStoreDetailsById = async (req, res) => {
    try {
    
      let data = await store_models.findById(req.body.storeId);
  
      res.status(200).json({ response: data, message: "Store Details" });
    } catch (error) {
      res.status(403).json({ message: error.message });
    }
  };
  











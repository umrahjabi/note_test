var{mongoose, conn} = require("../Modules/connection");
let  userSchema  = mongoose.Schema(
    {
        access_token : {
            type : String,
            require : true
        },   
        
        full_name : {
            type : String,
            require : true,
            default : "N/A"  
        },

        email_id : {
            type: String,
            require:true
        },
        country_code : {
            type : String,
            require:true
        },
        mobile_number : {
            type : String,
            require:true
        },
        profile_image:{
            type: String,
            default : "N/A",
        },
        image:{
            type: String,
            default : "N/A",
        },
        city_id:{
            type: mongoose.Schema.ObjectId,
            ref: "city",
            require: true,
            default:null
        },
        
        password:{
            type:String,
            require:true
        },
        status:{
            type:Number,
            default:0
        },
        created_on : {
            type : String,
            require : true
        }
    },
    {
        strict: true,
        collection: 'User',
        versionKey: false
    }
    
);

userSchema.index({ location: '2dsphere' })

exports.UserModel = conn.model('User', userSchema); 

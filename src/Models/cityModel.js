var { mongoose, conn } = require("../Modules/connection");
let citySchema = mongoose.Schema(
    {
        name: {
            type: String,
            require: true
        },
        data: {
            type: Date,
            require: true
        },

    },
    {
        strict: true,
        collection: 'city',
        versionKey: false
    }

);

exports.CityModel = conn.model('city', citySchema); 

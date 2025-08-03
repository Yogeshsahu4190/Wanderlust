const mongoose = require("mongoose"); // include mongoose for db connectivity
const Schema = mongoose.Schema; // include for desining the schemas 
const passportLocalmongoose=require("passport-local-mongoose");

const userSchema = new Schema({
    email:{
        type:String,
        required:true
    }
});

userSchema.plugin(passportLocalmongoose);  //it implement username,hashing ,salting automatically

module.exports = mongoose.model("User",userSchema);  // Export the user schema
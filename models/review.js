// Making a review Schema
const mongoose = require("mongoose"); // include mongoose for db connectivity
const Schema = mongoose.Schema; // include for desining the schemas 

const reviewSchema = new Schema({
    comment:String,
    rating:{
        type:Number,
        min:1,
        max:5
    },
    createdAt:{
        type:Date,
        default:Date.now(),
    },
    author:{
        type:Schema.Types.ObjectId,
        ref:"User",
    }
});

module.exports = mongoose.model("Review",reviewSchema);  // Export the review schema
const Listing = require("../models/listing");
const Review= require("../models/review");


module.exports.createReview=async(req,res)=>{
        let listing=await Listing.findById(req.params.id);
        let newReview=new Review(req.body.review);
        newReview.author=req.user._id;
        listing.reviews.push(newReview);

        await newReview.save();
        await listing.save();

        console.log("new review saved");
         req.flash("success","new review created");
        res.redirect(`/listings/${listing._id}`);

};

module.exports.destroyReview=async(req,res)=>{
    let {id,reviewId}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
     req.flash("success","review deleted");
    res.redirect(`/listings/${id}`);
};
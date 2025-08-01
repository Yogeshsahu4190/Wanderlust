const Listing=require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken=process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken:mapToken });


module.exports.index=async(req,res)=>{   
    const allListings=await Listing.find({});
    res.render("listings/index.ejs",{allListings});

};

module.exports.renderNewForm=(req,res)=>{
    res.render("listings/new.ejs");
};

module.exports.showListing=async(req,res)=>{
  let{id}=req.params;
  const listing =await Listing.findById(id)
  .populate({
    path:"reviews",
    populate:{
        path:"author",
    },
  })
  .populate("owner");
    if(!listing){
        req.flash("error","listing you requested for does not exist");
        res.redirect("/Listings"); 
    }
  res.render("listings/show.ejs",{listing});
};

module.exports.createListing=async (req,res,next)=>{ 
  
  
  let response=await geocodingClient.forwardGeocode({
  query: req.body.listing.location,
  limit:1,
})
  .send()
  
  
  let url=req.file.path;
    let filename=req.file.filename;
    const newListing=new Listing(req.body.listing);
    newListing.owner=req.user._id;
    newListing.image={url,filename}; 

    newListing.geometry=response.body.features[0].geometry;

    let savedListing=await newListing.save();
    console.log(savedListing);
    req.flash("success","new listing created");
    res.redirect("/Listings");                                       
};

module.exports.renderEditForm=async(req,res)=>{      //
    let{id}=req.params;      //extrat id from form
    const listing =await Listing.findById(id);
    if(!listing){
        req.flash("error","listing you are requested for does not exist");
        res.redirect("/listings");
    }
    let originalImageUrl=listing.image.url;
   originalImageUrl =originalImageUrl.replace("/upload","/upload/w_250");
    res.render("listings/edit.ejs",{listing,originalImageUrl});
};

module.exports.updateListing=async(req,res)=>{
        let {id}=req.params;
        let listing= await Listing.findByIdAndUpdate(id,{...req.body.listing});    //...req.body.listing  it is a javascript object that store 
         
        if(typeof req.file !=="undefined"){
        let url=req.file.path;
        let filename=req.file.filename;
        listing.image={url,filename};
        await listing.save();
        }
        req.flash("success","listing updated");
        res.redirect(`/listings/${id}`);                                                      // parameter and we deconstrut it into individual value and pass it into new updated value
};

module.exports.destroyListing=async(req,res)=>{
        let {id}=req.params;
        console.log(id);
        let deletedListing=await Listing.findByIdAndDelete(id);    //...req.body.listing  it is a javascript object that store 
          console.log(deletedListing);
           req.flash("success","listing deleted");
        res.redirect("/listings");                                                      // parameter and we deconstrut it into individual value and pass it into new updated value
};
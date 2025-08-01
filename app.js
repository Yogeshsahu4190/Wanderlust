 if(process.env.NODE_ENV!="production"){
    require("dotenv").config();
 }


const express= require("express");
const app=express();
const mongoose=require("mongoose");
const path =require("path");
const methodOverride =require("method-override");                //package
const ejsMate=require("ejs-mate");                               //it is a package that help us to create tempelating
const ExpressError=require("./utils/ExpressError.js");
const session=require("express-session");
const MongoStore=require('connect-mongo');
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");

const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");

// const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";
 
const dbUrl=process.env.ATLASDB_URL;
main()
.then(()=>{
    console.log("connected to db");
    })
    .catch((err)=>{
        console.log(err);
    });

async function main(){
    await mongoose.connect(dbUrl);
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const store=MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*3600,
});

store.on("error",()=>{
    console.log("ERROR IN MONGO SESSION STORE",err)
});

const sessionOptions={
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now() + 1000*60*60*24*7,
        maxAge:1000*60*60*24*7,
        httpOnly:true,
    },
};

// app.get("/",(req,res)=>{
//     res.send("hi, i am root node");
// });



app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
});


app.use("/listings",listingRouter);                       //to write listing code on another page ad fetch 
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);


// app.all("*",(req,res,next)=>{
//  next(new ExpressError(404,"page not found"));
// // res.render("error.ejs",{message});
// });

app.all("*",(req,res,next)=>{
console.log("404 for:", req.originalUrl); // add this line
 next(new ExpressError(404,"page not found"));
// res.render("error.ejs",{message});
});


app.listen(8080,() =>{
    console.log("server is listening on port 8080");

});
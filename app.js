 if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}
console.log(process.env.secret);

const express = require("express"); // include express
const app = express();  // all express thing inside the app
const mongoose = require("mongoose");   // include mongoose for connect with node

const dbUrl = process.env.ATLASDB_URL;   // build database connection Wonderlust is our database
//const dbUrl = 'mongodb://127.0.0.1:27017/Wonderlust'
const path = require('path'); //Include pata for views
const methodOverride = require("method-override");  // for PUT request (when we edit listing)
const ejsMate = require("ejs-mate");  // for creating boilerplates(layout)
const ExpressError = require("./utils/ExpressError.js");    // custom ExpressErrors
const session = require("express-session"); // using express-session (temprary memory storage inside cookie in development jurney)
const MongoStore = require('connect-mongo');    //for mongo session store
const flash = require("connect-flash"); // include for using flash messages
const passport = require("passport");   // include passport
const LocalStrategy = require("passport-local");    // require passport-local?
const User = require("./models/user.js");   //  require user.js of signup schema

const listingRouter = require("./routes/listing.js");    // require listing routes
const reviewRouter = require("./routes/review.js");      // require review routes
const userRouter = require("./routes/user.js");     //  include user route

//error handling if occurs (when we make connection with database)
main().
    then(()=>{
        console.log("connected to DB"); // connect successfully with db
    })      
    .catch((err)=>{
        console.log(err);   // when occurs any problems with database connection 
    })
    
// Database connection async function
async function main(){
   await mongoose.connect(dbUrl);    //dbUrl
}



app.set("view engine","ejs");   // set view engine for templating
app.set("views",path.join(__dirname,"views"));  //set so that we no need to include view its by deafult search templating inside view
app.use(express.urlencoded({extended:true}));   //request data parsing
app.use(methodOverride("_method")); // for PUT and Delete route
app.engine('ejs', ejsMate); // templating or layouts 
app.use(express.static(path.join(__dirname,"/public")));    // use for static file changes (html css etc.)

// root rout (it execute when not found individual routs)
// app.get("/",(req,res)=>{
//     res.send("hi i'm root");
// })

// creating mongo session
const store = MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret: process.env.SECRET,
    },
    touchAfter: 24*3600,    // for 14 days
});

// for mongo store error detection
store.on("error",()=>{
    console.log("ERROR IN MONGO SESSION STORE",err)
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,  // expire session in 1week
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly:true,  // secure from Cross scripting attack
    }
};



app.use(session(sessionOptions));   // express-session middleware
app.use(flash());   // flash middleware for showing message once when new listings created

// thease are for user authentication
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// middleware for running flash
app.use((req,res,next)=>{
    res.locals.success = req.flash("success");  // success flash
    res.locals.error = req.flash("error");  // error flash
    res.locals.currUser = req.user; //current user information which currently logged in
    next();
})

// technique for using route
app.use("/listings",listingRouter);      // ("/listings") is common in all listing route thats why we replace it with "/"
app.use("/listings/:id/reviews",reviewRouter);   // ("/listings/:id/reviews") is common in all review routes thats why we replace it with "/"
app.use("/",userRouter);    //  "/" is common for user user route

app.get('/search', (req, res) => {
  res.render('search.ejs');
});


// // route for all requests which we dont matchs on my route
app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"page not found!")); // throw custom ExpressError
})

//Error handling middleware
app.use((err,req,res,next)=>{
    let {status=500,message="SOME ISSUE"} = err;    // take status and message from err if not have that's why we set default 
    //res.render("error.ejs",message);
    res.status(status).render("error.ejs",{message});   //only messege send as a response status show only on page inspect and error show on error.ejs page
})



// for running the nodejs server 
app.listen(8080,()=>{
    console.log("server is listing");
});
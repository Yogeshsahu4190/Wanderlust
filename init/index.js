const mongoose=require("mongoose");
const initData=require("./data.js");
const Listing=require("../models/listing.js");

const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";

main()
.then(()=>{
    console.log("connected to db");
    })
    .catch((err)=>{
        console.log(err);
    });

async function main(){
    await mongoose.connect(MONGO_URL);
}

const initDB =async ()=>{
   await Listing.deleteMany({});
   initData.data = initData.data.map((obj)=>({...obj,owner:"686b9ee55f68f1d07eca8fca"}));
    await Listing.insertMany(initData.data);
    console.log("data was intilized");
};

initDB();
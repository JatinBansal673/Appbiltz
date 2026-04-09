const express=require('express')
const mongoose=require('mongoose')
const cors=require('cors')

require('dotenv').config({path: './.env'});

const dns = require('node:dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);   // to resolve dns issue with mongo db srv

const PORT = process.env.PORT || 4000;

const app=express();

app.use(cors());
app.use(express.json())

const dbConnect=require('./config/database')
dbConnect();


app.use("/api/v1/auth", require("./routes/authRoutes"));
app.use("/api/v1/meeting", require("./routes/meetingRoutes"));
app.use("/api/v1/booking", require("./routes/bookingRoutes"));

app.get('/',(req,res) => {
    return res.json({
        success:true,
        message:"Your server is Up.",
    })
});

app.listen(PORT,() => {
    console.log("App is running at port:", PORT);
});